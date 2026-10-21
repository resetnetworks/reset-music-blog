import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";
import { ensureJobsSeeded } from "@/lib/seedJobs";
import JobsTableClient from "./JobsTableClient";

import Application from "@/models/Application";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Job Postings CRM | Reset Music Admin",
};

export default async function AdminJobsPage() {
  await dbConnect();

  const [jobs, appCounts] = await Promise.all([
    Job.find({}).sort({ createdAt: -1 }).lean(),
    Application.aggregate([
      { $group: { _id: "$job", count: { $sum: 1 } } }
    ]),
  ]);

  const countMap: Record<string, number> = {};
  for (const a of appCounts) {
    if (a._id) countMap[a._id.toString()] = a.count;
  }

  const mappedJobs = jobs.map((j: any) => ({
    id: j._id.toString(),
    title: j.title,
    slug: j.slug,
    department: j.department,
    type: j.type,
    locationType: j.locationType,
    location: j.location,
    experience: j.experience,
    description: j.description,
    applyUrl: j.applyUrl || "",
    status: j.status || "active",
    atsKeywords: j.atsKeywords || [],
    applicantCount: countMap[j._id.toString()] || 0,
    createdAt: j.createdAt?.toISOString() || new Date().toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Job Postings CRM</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage vacancies, HR recruitment pipelines, application links, and Google Jobs indexing.
          </p>
        </div>
      </div>

      <JobsTableClient jobs={mappedJobs} />
    </div>
  );
}
