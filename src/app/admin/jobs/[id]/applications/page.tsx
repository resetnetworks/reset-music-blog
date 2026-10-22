import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";
import Application from "@/models/Application";
import ApplicationsClient from "./ApplicationsClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Candidate Applications & ATS Ranking | Reset Music Admin",
};

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await dbConnect();
  const { id } = await params;

  const job = await Job.findById(id).lean() || await Job.findOne({ slug: id }).lean();

  if (!job) {
    notFound();
  }

  // Fetch applications for this job, sorted by ATS Score descending (highest match first!)
  const applications = await Application.find({ job: job._id })
    .sort({ atsScore: -1, createdAt: -1 })
    .lean();

  const mappedApps = applications.map((a: any) => ({
    id: a._id.toString(),
    candidate: {
      name: a.candidate.name,
      email: a.candidate.email,
      phone: a.candidate.phone,
      portfolioUrl: a.candidate.portfolioUrl || "",
      linkedinUrl: a.candidate.linkedinUrl || "",
    },
    resumeUrl: a.resumeUrl || "",
    resumeFileName: a.resumeFileName || "resume.pdf",
    source: a.source || "Careers Portal",
    answers: (a.answers || []).map((ans: any) => ({
      questionId: ans.questionId,
      question: ans.question,
      answer: ans.answer,
      score: ans.score ?? 0,
    })),
    atsScore: a.atsScore ?? 0,
    resumeScore: a.resumeScore ?? 0,
    screeningScore: a.screeningScore ?? 0,
    matchedKeywords: a.matchedKeywords || [],
    missingKeywords: a.missingKeywords || [],
    status: a.status || "new",
    notes: a.notes || "",
    createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
  }));

  const mappedJob = {
    id: job._id.toString(),
    title: job.title,
    department: job.department,
    type: job.type,
    location: job.location,
    atsKeywords: job.atsKeywords || [],
    customQuestions: (job.customQuestions || []).map((q: any) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      options: q.options || [],
      required: !!q.required,
      scaleMin: q.scaleMin,
      scaleMax: q.scaleMax,
    })),
  };

  return (
    <div>
      <ApplicationsClient job={mappedJob} applications={mappedApps} />
    </div>
  );
}
