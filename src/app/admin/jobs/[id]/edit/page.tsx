import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";
import JobForm from "../../JobForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Job Posting | Reset Music Admin",
};

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await dbConnect();
  const { id } = await params;

  const job = await Job.findById(id).lean();

  if (!job) {
    notFound();
  }

  const initialData = {
    _id: job._id.toString(),
    title: job.title || "",
    department: job.department || "",
    type: job.type || "Full-time",
    locationType: job.locationType || "On-site",
    location: job.location || "",
    experience: job.experience || "Fresher",
    description: job.description || "",
    responsibilities: Array.isArray(job.responsibilities) ? [...job.responsibilities] : [],
    requirements: Array.isArray(job.requirements) ? [...job.requirements] : [],
    applyUrl: job.applyUrl || "",
    customQuestions: (job.customQuestions || []).map((q: any) => ({
      id: q.id || (q._id ? q._id.toString() : ""),
      question: q.question || "",
      type: q.type || "text",
      options: Array.isArray(q.options) ? [...q.options] : [],
      required: Boolean(q.required),
    })),
    atsKeywords: Array.isArray(job.atsKeywords) ? [...job.atsKeywords] : [],
    salary: job.salary ? {
      min: job.salary.min ?? 20000,
      max: job.salary.max ?? undefined,
      currency: job.salary.currency || "INR",
      period: job.salary.period || "MONTH",
    } : { min: 20000, currency: "INR", period: "MONTH" },
    status: (job.status as "active" | "draft" | "closed") || "active",
    validThrough: job.validThrough ? new Date(job.validThrough).toISOString() : undefined,
  };

  return (
    <div>
      <JobForm initialData={initialData} isEdit />
    </div>
  );
}
