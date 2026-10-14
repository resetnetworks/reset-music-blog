import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { uploadBufferToS3 } from "@/services/s3";
import { extractTextFromPdfBuffer, calculateAtsScore } from "@/lib/ats";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const formData = await req.formData();
    const jobId = formData.get("jobId") as string;
    const manualName = (formData.get("name") as string)?.trim();
    const manualEmail = (formData.get("email") as string)?.trim();
    const manualPhone = (formData.get("phone") as string)?.trim();
    const manualPortfolioUrl = (formData.get("portfolioUrl") as string)?.trim() || "";
    const manualLinkedinUrl = (formData.get("linkedinUrl") as string)?.trim() || "";
    const rawAnswers = formData.get("answers") as string;
    const resumeFile = formData.get("resume") as File | null;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid Job ID is required." },
        { status: 400 }
      );
    }

    if (!resumeFile) {
      return NextResponse.json(
        { success: false, error: "Please upload your resume in PDF format." },
        { status: 400 }
      );
    }

    // 1. Validate File Size (Max 10MB)
    if (resumeFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Resume file size exceeds the 10MB limit. Please upload a smaller PDF." },
        { status: 400 }
      );
    }

    // 2. Validate File Extension
    const fileName = resumeFile.name || "";
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Invalid file type. Only PDF resumes are accepted." },
        { status: 400 }
      );
    }

    // Read resume buffer
    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Validate Magic Bytes (%PDF-) to prevent malicious files disguised as PDF
    const magicBytes = buffer.subarray(0, 5).toString("ascii");
    if (!magicBytes.startsWith("%PDF-")) {
      return NextResponse.json(
        { success: false, error: "The uploaded file is not a valid PDF document. Please upload a legitimate PDF file." },
        { status: 400 }
      );
    }

    // Find the job safely
    const mongoose = (await import("mongoose")).default;
    let job = null;
    if (mongoose.isValidObjectId(jobId)) {
      job = await Job.findById(jobId).lean();
    }
    if (!job) {
      job = await Job.findOne({ slug: jobId.trim().toLowerCase(), status: "active" }).lean();
    }

    if (!job) {
      return NextResponse.json(
        { success: false, error: "The position you are applying for was not found or is closed." },
        { status: 404 }
      );
    }

    // Parse & sanitize answers JSON if provided
    let parsedAnswers: { questionId: string; question: string; answer: string }[] = [];
    if (rawAnswers) {
      try {
        const raw = JSON.parse(rawAnswers);
        if (Array.isArray(raw)) {
          parsedAnswers = raw.map((item: any) => ({
            questionId: String(item.questionId || "").slice(0, 80),
            question: String(item.question || "").slice(0, 500),
            answer: String(item.answer || "").slice(0, 4000),
          }));
        }
      } catch (e) {
        console.warn("Failed to parse answers JSON:", e);
      }
    }

    // Upload strictly to AWS S3
    let resumeUrl = "";
    try {
      const uploadRes = await uploadBufferToS3(
        buffer,
        resumeFile.name || "resume.pdf",
        resumeFile.type || "application/pdf"
      );
      resumeUrl = uploadRes.fileUrl;
    } catch (s3Error: any) {
      console.error("AWS S3 upload failed:", s3Error);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to upload resume to S3 storage. Please check your AWS S3 bucket configuration or try again." 
        },
        { status: 500 }
      );
    }

    // Extract text from PDF for ATS & Contact parsing
    const resumeText = await extractTextFromPdfBuffer(buffer);

    // Auto-extract candidate contact info from resume text & file name
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i);
    const extractedEmail = manualEmail || (emailMatch ? emailMatch[0].toLowerCase().trim() : "applicant@musicreset.com");

    const phoneMatch = resumeText.match(/(?:\+?91[\s.-]?)?[6-9]\d{9}\b/) || 
                       resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    const extractedPhone = manualPhone || (phoneMatch ? phoneMatch[0].trim() : "Not provided in resume");

    const linkedinMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const extractedLinkedin = manualLinkedinUrl || (linkedinMatch 
      ? (linkedinMatch[0].startsWith("http") ? linkedinMatch[0] : `https://${linkedinMatch[0]}`) 
      : "");

    // Name Extraction from top lines of resume or filename
    let extractedName = manualName || "";
    if (!extractedName) {
      const lines = resumeText.split("\n").map(l => l.trim()).filter(Boolean);
      const stopWords = ["resume", "cv", "curriculum", "vitae", "profile", "bio", "portfolio", "contact", "summary", "experience", "education", "skills", "about"];
      
      for (const line of lines.slice(0, 8)) {
        if (line.includes("@") || line.includes("http") || line.includes("www") || /\d{4,}/.test(line)) continue;
        const clean = line.replace(/[^a-zA-Z\s]/g, "").trim();
        const words = clean.split(/\s+/).filter(Boolean);
        const lower = clean.toLowerCase();
        if (stopWords.some(sw => lower.startsWith(sw) || lower === sw)) continue;
        
        if (words.length >= 2 && words.length <= 4 && clean.length <= 35) {
          extractedName = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
          break;
        }
      }

      // If text didn't yield a name, extract from file name (e.g. Rahul_Sharma_Resume.pdf)
      if (!extractedName && resumeFile.name) {
        const cleanBase = resumeFile.name
          .replace(/\.pdf$/i, "")
          .replace(/[_-]/g, " ")
          .replace(/\b(resume|cv|latest|new|updated|profile|final|copy|doc|document)\b/gi, "")
          .trim();
        if (cleanBase.length >= 2) {
          extractedName = cleanBase
            .split(/\s+/)
            .filter(w => !/\d/.test(w))
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        }
      }

      if (!extractedName) {
        extractedName = "Applicant";
      }
    }

    // Calculate ATS Score & Keyword Matches
    const atsResult = calculateAtsScore(resumeText, job.atsKeywords || []);

    // Save Application
    const newApplication = await Application.create({
      job: job._id,
      candidate: {
        name: extractedName,
        email: extractedEmail,
        phone: extractedPhone,
        portfolioUrl: manualPortfolioUrl,
        linkedinUrl: extractedLinkedin,
      },
      resumeUrl,
      resumeFileName: resumeFile.name || "resume.pdf",
      resumeText: resumeText.slice(0, 50000), // preserve text for searching
      answers: parsedAnswers,
      atsScore: atsResult.score,
      matchedKeywords: atsResult.matchedKeywords,
      missingKeywords: atsResult.missingKeywords,
      status: "new",
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
      applicationId: newApplication._id.toString(),
      candidateName: extractedName,
      atsScore: atsResult.score,
    });
  } catch (error: any) {
    console.error("Error in job application submission:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process application." },
      { status: 500 }
    );
  }
}
