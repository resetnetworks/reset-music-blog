"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Building,
  Clock,
  Link2,
  Users,
  ChevronRight,
  UploadCloud
} from "lucide-react";
import AdminUploadResumeModal from "./AdminUploadResumeModal";
import { deleteJobAction, toggleJobStatusAction } from "./actions";

interface JobItem {
  id: string;
  title: string;
  slug: string;
  department: string;
  type: string;
  locationType: string;
  location: string;
  experience: string;
  description: string;
  applyUrl?: string;
  status: "active" | "draft" | "closed";
  applicantCount?: number;
  atsKeywords?: string[];
  createdAt?: string;
}

interface JobsTableClientProps {
  jobs: JobItem[];
}

export default function JobsTableClient({ jobs: initialJobs }: JobsTableClientProps) {
  const [jobs, setJobs] = useState<JobItem[]>(initialJobs);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedUploadJobId, setSelectedUploadJobId] = useState<string>("");

  const handleUploadSuccess = (newApp: any) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === newApp.jobId
          ? { ...j, applicantCount: (j.applicantCount || 0) + 1 }
          : j
      )
    );
  };

  const departments = ["all", ...Array.from(new Set(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.description.toLowerCase().includes(search.toLowerCase()) ||
      job.department.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesDept = deptFilter === "all" || job.department === deptFilter;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const totalActive = jobs.filter((j) => j.status === "active").length;
  const totalDraft = jobs.filter((j) => j.status === "draft").length;
  const totalClosed = jobs.filter((j) => j.status === "closed").length;

  const handleToggleStatus = async (job: JobItem) => {
    const res = await toggleJobStatusAction(job.id, job.status);
    if (res.success && res.newStatus) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: res.newStatus as any } : j))
      );
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await deleteJobAction(deletingId);
      if (res.success) {
        setJobs((prev) => prev.filter((j) => j.id !== deletingId));
        setDeletingId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
        <div className="p-5 rounded-xl border border-border bg-card shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium">Total Positions</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-foreground">{jobs.length}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium">Active (Public &amp; Google)</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-emerald-500">{totalActive}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium">Draft Positions</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-amber-500">{totalDraft}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card shadow-2xs">
          <p className="text-xs text-muted-foreground font-medium">Closed Positions</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1 text-muted-foreground">{totalClosed}</p>
        </div>
      </div>

      {/* Status Stage Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-border/60">
        {[
          { id: "all", label: "All Positions", count: jobs.length },
          { id: "active", label: "Active Only", count: totalActive },
          { id: "draft", label: "Drafts", count: totalDraft },
          { id: "closed", label: "Closed", count: totalClosed },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-foreground text-foreground bg-secondary/50 font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/25"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Department Select */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3.5 py-2 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground capitalize font-medium"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d === "all" ? "All Departments" : d}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setSelectedUploadJobId(jobs[0]?.id || "");
              setUploadModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-border bg-background hover:bg-secondary text-foreground text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shadow-xs ml-auto sm:ml-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload Resume (ATS)
          </button>

          <Link
            href="/admin/jobs/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Job
          </Link>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5 font-semibold min-w-[260px]">Position &amp; Department</th>
                <th className="px-4 py-3.5 font-semibold min-w-[150px]">Applicants &amp; ATS</th>
                <th className="px-4 py-3.5 font-semibold min-w-[140px]">Type &amp; Workplace</th>
                <th className="px-4 py-3.5 font-semibold min-w-[140px]">Application Mode</th>
                <th className="px-4 py-3.5 font-semibold min-w-[110px]">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right min-w-[110px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No jobs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-secondary/20 transition-colors group">
                    {/* Title & Department */}
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-foreground text-sm flex items-center gap-2">
                        <span>{job.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {job.department} &bull; <span className="font-mono text-[10px]">{job.location}</span>
                      </div>
                    </td>

                    {/* Applicants & ATS Ranking */}
                    <td className="px-4 py-3.5">
                      <Link
                        href={`/admin/jobs/${job.id}/applications`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground transition-colors border border-border group-hover:border-foreground/30 shadow-xs"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>{job.applicantCount || 0}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Rankings</span>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </Link>
                    </td>

                    {/* Type & Workplace */}
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-500 uppercase">
                        {job.type}
                      </span>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {job.locationType}
                      </div>
                    </td>

                    {/* Application Mode */}
                    <td className="px-4 py-3.5">
                      {job.applyUrl ? (
                        <a
                          href={job.applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-500 hover:underline max-w-[150px] truncate"
                          title={job.applyUrl}
                        >
                          <Link2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">External URL</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-medium flex items-center gap-1 w-fit">
                          Native ATS Portal
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          job.status === "active"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : job.status === "draft"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            job.status === "active"
                              ? "bg-emerald-500"
                              : job.status === "draft"
                              ? "bg-amber-500"
                              : "bg-muted-foreground"
                          }`}
                        />
                        {job.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUploadJobId(job.id);
                            setUploadModalOpen(true);
                          }}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-colors"
                          title="Upload Resume to Test ATS for this Role"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(job)}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-colors"
                          title={job.status === "active" ? "Mark as Closed" : "Mark as Active"}
                        >
                          {job.status === "active" ? (
                            <XCircle className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <Link
                          href={`/admin/jobs/${job.id}/edit`}
                          className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-colors"
                          title="Edit Job"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeletingId(job.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"
                          title="Delete Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background max-w-sm w-full rounded-xl border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-semibold text-foreground text-sm">Delete Job Posting?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to delete this job posting? This action cannot be undone and will remove it from Google Jobs.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Resume Modal */}
      <AdminUploadResumeModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        initialJobId={selectedUploadJobId}
        jobsList={jobs.map((j) => ({
          id: j.id,
          title: j.title,
          department: j.department,
          type: j.type,
          atsKeywords: j.atsKeywords || [],
          slug: j.slug,
        }))}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
