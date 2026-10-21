import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";
import Application from "@/models/Application";
import { getSession } from "@/lib/auth";
import { uploadBufferToS3 } from "@/services/s3";
import { extractTextFromPdfBuffer, calculateAtsScore } from "@/lib/ats";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate Admin Session
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required." },
        { status: 401 }
      );
    }

    await dbConnect();

    // 2. Parse Form Data
    const formData = await req.formData();
    const jobId = (formData.get("jobId") as string)?.trim();
    const source = (formData.get("source") as string)?.trim() || "LinkedIn";
    const manualName = (formData.get("name") as string)?.trim();
    const manualEmail = (formData.get("email") as string)?.trim();
    const manualPhone = (formData.get("phone") as string)?.trim();
    const manualPortfolioUrl = (formData.get("portfolioUrl") as string)?.trim() || "";
    const manualLinkedinUrl = (formData.get("linkedinUrl") as string)?.trim() || "";
    const manualNotes = (formData.get("notes") as string)?.trim() || "";
    const initialStatus = (formData.get("status") as string)?.trim() || "new";
    const overwrite = formData.get("overwrite") === "true";
    const resumeFile = formData.get("resume") as File | null;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Please select a job role." },
        { status: 400 }
      );
    }

    if (!resumeFile) {
      return NextResponse.json(
        { success: false, error: "Please upload a candidate resume in PDF format." },
        { status: 400 }
      );
    }

    // 3. File validation (Max 15MB for admin uploads)
    if (resumeFile.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Resume file exceeds the 15MB size limit." },
        { status: 400 }
      );
    }

    const fileName = resumeFile.name || "";
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, error: "Only PDF resumes are supported for ATS screening." },
        { status: 400 }
      );
    }

    const arrayBuffer = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate PDF magic bytes (%PDF-)
    const magicBytes = buffer.subarray(0, 5).toString("ascii");
    if (!magicBytes.startsWith("%PDF-")) {
      return NextResponse.json(
        { success: false, error: "The uploaded file is not a valid PDF document." },
        { status: 400 }
      );
    }

    // 4. Find the Target Job Position
    let job = null;
    if (mongoose.isValidObjectId(jobId)) {
      job = await Job.findById(jobId).lean();
    }
    if (!job) {
      job = await Job.findOne({ slug: jobId.toLowerCase() }).lean();
    }

    if (!job) {
      return NextResponse.json(
        { success: false, error: "The selected job role was not found." },
        { status: 404 }
      );
    }

    // 5. Extract Text from PDF
    const resumeText = await extractTextFromPdfBuffer(buffer);

    // 6. Contact and Name Auto-Extraction
    const emailMatch = resumeText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/i);
    const extractedEmail = manualEmail || (emailMatch ? emailMatch[0].toLowerCase().trim() : "");

    const phoneMatch =
      resumeText.match(/(?:\+?91[\s.-]?)?[6-9]\d{9}\b/) ||
      resumeText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/);
    const extractedPhone = manualPhone || (phoneMatch ? phoneMatch[0].trim() : "");

    const linkedinMatch = resumeText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
    const extractedLinkedin =
      manualLinkedinUrl ||
      (linkedinMatch
        ? linkedinMatch[0].startsWith("http")
          ? linkedinMatch[0]
          : `https://${linkedinMatch[0]}`
        : "");

    // Name Extraction fallback
    let extractedName = manualName || "";
    if (!extractedName) {
      const lines = resumeText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      const stopWords = [
        "resume",
        "cv",
        "curriculum",
        "vitae",
        "profile",
        "bio",
        "portfolio",
        "contact",
        "summary",
        "experience",
        "education",
        "skills",
        "about",
      ];

      for (const line of lines.slice(0, 8)) {
        if (line.includes("@") || line.includes("http") || line.includes("www") || /\d{4,}/.test(line)) continue;
        const clean = line.replace(/[^a-zA-Z\s]/g, "").trim();
        const words = clean.split(/\s+/).filter(Boolean);
        const lower = clean.toLowerCase();
        if (stopWords.some((sw) => lower.startsWith(sw) || lower === sw)) continue;

        if (words.length >= 2 && words.length <= 4 && clean.length <= 35) {
          extractedName = words
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
          break;
        }
      }

      if (!extractedName && resumeFile.name) {
        const cleanBase = resumeFile.name
          .replace(/\.pdf$/i, "")
          .replace(/[_-]/g, " ")
          .replace(/\b(resume|cv|latest|new|updated|profile|final|copy|doc|document)\b/gi, "")
          .trim();
        if (cleanBase.length >= 2) {
          extractedName = cleanBase
            .split(/\s+/)
            .filter((w) => !/\d/.test(w))
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        }
      }

      if (!extractedName) {
        extractedName = "Candidate Lead";
      }
    }

    // 7. Duplicate Detection Check
    let existingApplication: any = null;
    const duplicateOrConditions: any[] = [];
    if (extractedEmail && extractedEmail.includes("@")) {
      duplicateOrConditions.push({ "candidate.email": extractedEmail.toLowerCase() });
    }
    const cleanDigits = extractedPhone ? extractedPhone.replace(/\D/g, "") : "";
    if (cleanDigits.length >= 7) {
      const last10 = cleanDigits.slice(-10);
      duplicateOrConditions.push({ "candidate.phone": { $regex: last10 + "$" } });
    }

    if (duplicateOrConditions.length > 0) {
      existingApplication = await Application.findOne({
        job: job._id,
        $or: duplicateOrConditions,
      });

      if (existingApplication && !overwrite) {
        return NextResponse.json(
          {
            success: false,
            duplicate: true,
            existingId: existingApplication._id.toString(),
            candidateName: existingApplication.candidate?.name || extractedName,
            existingSource: existingApplication.source || "Careers Portal",
            existingEmail: existingApplication.candidate?.email || extractedEmail,
            existingPhone: existingApplication.candidate?.phone || extractedPhone,
            existingAtsScore: existingApplication.atsScore,
            appliedDate: existingApplication.createdAt,
            message: `A candidate matching ${extractedName} (${extractedEmail || extractedPhone}) already exists in "${job.title}". Overwrite with this new resume?`,
          },
          { status: 409 }
        );
      }
    }

    // 8. Upload to AWS S3
    let resumeUrl = "";
    try {
      const uploadRes = await uploadBufferToS3(
        buffer,
        resumeFile.name || "resume.pdf",
        resumeFile.type || "application/pdf",
        "resumes"
      );
      resumeUrl = uploadRes.fileUrl;
    } catch (s3Error: any) {
      console.error("S3 upload failed during admin resume upload:", s3Error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to upload resume to S3 storage. Check AWS configuration.",
        },
        { status: 500 }
      );
    }

    // 9. Calculate ATS Keyword Matches & Score
    const atsResult = calculateAtsScore(resumeText, job.atsKeywords || []);

    // 10. Save or Update Application
    let appDoc: any;
    const finalNotes = manualNotes
      ? manualNotes
      : `Sourced via ${source} (Uploaded manually by Admin)`;

    if (existingApplication && overwrite) {
      existingApplication.resumeUrl = resumeUrl;
      existingApplication.resumeFileName = resumeFile.name || "resume.pdf";
      existingApplication.resumeText = resumeText.slice(0, 50000);
      existingApplication.source = source;
      existingApplication.atsScore = atsResult.score;
      existingApplication.matchedKeywords = atsResult.matchedKeywords;
      existingApplication.missingKeywords = atsResult.missingKeywords;
      if (manualName) existingApplication.candidate.name = manualName;
      if (manualEmail) existingApplication.candidate.email = manualEmail;
      if (manualPhone) existingApplication.candidate.phone = manualPhone;
      if (manualLinkedinUrl) existingApplication.candidate.linkedinUrl = manualLinkedinUrl;
      if (manualPortfolioUrl) existingApplication.candidate.portfolioUrl = manualPortfolioUrl;
      if (initialStatus) existingApplication.status = initialStatus;
      if (manualNotes) {
        existingApplication.notes = existingApplication.notes
          ? `${existingApplication.notes}\n[Updated via ${source}]: ${manualNotes}`
          : manualNotes;
      }
      await existingApplication.save();
      appDoc = existingApplication;
    } else {
      appDoc = await Application.create({
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
        resumeText: resumeText.slice(0, 50000),
        source,
        answers: [],
        atsScore: atsResult.score,
        matchedKeywords: atsResult.matchedKeywords,
        missingKeywords: atsResult.missingKeywords,
        status: initialStatus,
        notes: finalNotes,
      });
    }

    // Revalidate paths for instant CRM updates
    revalidatePath(`/admin/jobs/${job._id}/applications`);
    revalidatePath("/admin/jobs");

    return NextResponse.json({
      success: true,
      message: "Candidate resume uploaded and analyzed successfully!",
      application: {
        id: appDoc._id.toString(),
        jobId: job._id.toString(),
        jobTitle: job.title,
        jobDepartment: job.department,
        candidate: {
          name: appDoc.candidate?.name || extractedName,
          email: appDoc.candidate?.email || extractedEmail,
          phone: appDoc.candidate?.phone || extractedPhone,
          portfolioUrl: appDoc.candidate?.portfolioUrl || manualPortfolioUrl,
          linkedinUrl: appDoc.candidate?.linkedinUrl || extractedLinkedin,
        },
        resumeUrl: appDoc.resumeUrl,
        resumeFileName: appDoc.resumeFileName,
        source: appDoc.source,
        atsScore: appDoc.atsScore,
        matchedKeywords: appDoc.matchedKeywords,
        missingKeywords: appDoc.missingKeywords,
        status: appDoc.status,
        notes: appDoc.notes,
        createdAt: appDoc.createdAt ? new Date(appDoc.createdAt).toISOString() : new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Admin resume upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process resume upload." },
      { status: 500 }
    );
  }
}
