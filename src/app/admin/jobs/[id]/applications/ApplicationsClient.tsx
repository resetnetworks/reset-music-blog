"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  UserCheck, 
  Trash2, 
  Tag, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  HelpCircle,
  FileCheck,
  ChevronRight,
  Filter,
  Save,
  MessageSquare,
  AlertCircle,
  UploadCloud
} from "lucide-react";
import AdminUploadResumeModal from "../../AdminUploadResumeModal";
import { 
  updateApplicationStatusAction, 
  updateApplicationNotesAction, 
  deleteApplicationAction 
} from "../../actions";

interface ApplicationItem {
  id: string;
  candidate: {
    name: string;
    email: string;
    phone: string;
    portfolioUrl?: string;
    linkedinUrl?: string;
  };
  resumeUrl: string;
  resumeFileName?: string;
  source?: string;
  answers: {
    questionId: string;
    question: string;
    answer: string;
  }[];
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  status: "new" | "reviewed" | "shortlisted" | "interview" | "rejected" | "hired";
  notes?: string;
  createdAt: string;
}

interface ApplicationsClientProps {
  job: {
    id: string;
    title: string;
    department: string;
    type: string;
    location: string;
    atsKeywords?: string[];
  };
  applications: ApplicationItem[];
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

export default function ApplicationsClient({ job, applications: initialApps }: ApplicationsClientProps) {
  const [apps, setApps] = useState<ApplicationItem[]>(initialApps);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [notesInput, setNotesInput] = useState("");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSuccess, setNotesSuccess] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleUploadSuccess = (newApp: any) => {
    const formatted: ApplicationItem = {
      id: newApp.id,
      candidate: {
        name: newApp.candidate.name,
        email: newApp.candidate.email,
        phone: newApp.candidate.phone,
        portfolioUrl: newApp.candidate.portfolioUrl,
        linkedinUrl: newApp.candidate.linkedinUrl,
      },
      resumeUrl: newApp.resumeUrl,
      resumeFileName: newApp.resumeFileName || "resume.pdf",
      source: newApp.source || "LinkedIn",
      answers: [],
      atsScore: newApp.atsScore ?? 0,
      matchedKeywords: newApp.matchedKeywords || [],
      missingKeywords: newApp.missingKeywords || [],
      status: newApp.status || "new",
      notes: newApp.notes || "",
      createdAt: newApp.createdAt || new Date().toISOString(),
    };

    setApps((prev) => {
      const idx = prev.findIndex((a) => a.id === formatted.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = formatted;
      } else {
        updated = [formatted, ...prev];
      }
      return updated.sort((a, b) => b.atsScore - a.atsScore);
    });

    // Auto-open review modal for immediate ATS feedback
    setSelectedApp(formatted);
    setNotesInput(formatted.notes || "");
  };

  // Filter & Search
  const filteredApps = apps.filter((app) => {
    const q = search.toLowerCase();
    const matchesSearch =
      app.candidate.name.toLowerCase().includes(q) ||
      app.candidate.email.toLowerCase().includes(q) ||
      app.candidate.phone.includes(q) ||
      app.matchedKeywords.some((k) => k.toLowerCase().includes(q));

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;

    let matchesScore = true;
    if (scoreFilter === "high") matchesScore = app.atsScore >= 70;
    else if (scoreFilter === "mid") matchesScore = app.atsScore >= 40 && app.atsScore < 70;
    else if (scoreFilter === "low") matchesScore = app.atsScore < 40;

    return matchesSearch && matchesStatus && matchesScore;
  });

  const totalCount = apps.length;
  const highMatchCount = apps.filter((a) => a.atsScore >= 70).length;
  const shortlistedCount = apps.filter((a) => a.status === "shortlisted" || a.status === "interview").length;
  const avgScore = totalCount > 0 ? Math.round(apps.reduce((acc, a) => acc + a.atsScore, 0) / totalCount) : 0;

  const handleStatusChange = async (appId: string, newStatus: string) => {
    const res = await updateApplicationStatusAction(appId, newStatus, job.id);
    if (res.success) {
      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus as any } : a))
      );
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status: newStatus as any });
      }
    }
  };

  const handleOpenDetail = (app: ApplicationItem) => {
    setSelectedApp(app);
    setNotesInput(app.notes || "");
    setNotesSuccess(false);
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setIsSavingNotes(true);
    try {
      const res = await updateApplicationNotesAction(selectedApp.id, notesInput, job.id);
      if (res.success) {
        setApps((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, notes: notesInput } : a))
        );
        setSelectedApp({ ...selectedApp, notes: notesInput });
        setNotesSuccess(true);
        setTimeout(() => setNotesSuccess(false), 2500);
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    const res = await deleteApplicationAction(appId, job.id);
    if (res.success) {
      setApps((prev) => prev.filter((a) => a.id !== appId));
      if (selectedApp?.id === appId) setSelectedApp(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/jobs"
            className="p-2 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-500 rounded uppercase tracking-wider">
                {job.type}
              </span>
              <span className="text-xs text-muted-foreground">{job.department}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mt-1">
              Applicants for {job.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ranked automatically by ATS Keyword Match and role screening criteria
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 bg-foreground text-background rounded-md text-xs font-semibold hover:bg-foreground/90 transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Resume (ATS)</span>
          </button>
          <Link
            href={`/admin/jobs/${job.id}/edit`}
            className="px-3 py-1.5 border border-border rounded-md text-xs font-medium hover:bg-secondary transition-colors"
          >
            Edit Keywords
          </Link>
        </div>
      </div>

      {/* Target ATS Keywords Bar */}
      {job.atsKeywords && job.atsKeywords.length > 0 && (
        <div className="p-3.5 bg-secondary/30 rounded-xl border border-border/60 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Target ATS Keywords:
          </span>
          {job.atsKeywords.map((kw) => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded-md bg-secondary text-foreground text-[11px] font-mono border border-border/50"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground font-medium">Total Applicants</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{totalCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground font-medium">Top Match (70%+ ATS)</p>
          <p className="text-2xl font-bold mt-1 text-emerald-500">{highMatchCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground font-medium">Shortlisted / Interview</p>
          <p className="text-2xl font-bold mt-1 text-blue-500">{shortlistedCount}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground font-medium">Average ATS Match</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{avgScore}%</p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, email, phone, or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-background border border-border rounded-md text-xs outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-md text-xs outline-none focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview">Interview</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>

          {/* ATS Score Filter */}
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-md text-xs outline-none focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All ATS Scores</option>
            <option value="high">High Match (≥ 70%)</option>
            <option value="mid">Mid Match (40% - 69%)</option>
            <option value="low">Low Match (&lt; 40%)</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="border border-border rounded-xl overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3 font-semibold">Rank &amp; Candidate</th>
                <th className="px-4 py-3 font-semibold">ATS Match Score</th>
                <th className="px-4 py-3 font-semibold">Matched Keywords</th>
                <th className="px-4 py-3 font-semibold">Status Stage</th>
                <th className="px-4 py-3 font-semibold">Date Applied</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    {apps.length === 0
                      ? "No candidates have applied for this position yet."
                      : "No applicants found matching your search filters."}
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, idx) => {
                  const isHigh = app.atsScore >= 70;
                  const isMid = app.atsScore >= 40 && app.atsScore < 70;

                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-secondary/20 transition-colors group cursor-pointer"
                      onClick={() => handleOpenDetail(app)}
                    >
                      {/* Rank & Candidate Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0 && app.atsScore > 0
                                ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground text-sm">
                                {app.candidate.name}
                              </p>
                              {app.source && (
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${
                                  app.source === "LinkedIn"
                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                    : app.source === "Indeed"
                                    ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                    : app.source === "Referral"
                                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                    : "bg-secondary text-muted-foreground border-border"
                                }`}>
                                  {app.source}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground font-mono">
                              {app.candidate.email || "No email"} &bull; {app.candidate.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ATS Score */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2.5 py-1 rounded-md font-bold text-xs flex items-center gap-1 ${
                              isHigh
                                ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                                : isMid
                                ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                                : "bg-secondary text-muted-foreground border border-border"
                            }`}
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>{app.atsScore}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Matched Keywords */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {app.matchedKeywords.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">None matched</span>
                          ) : (
                            app.matchedKeywords.slice(0, 3).map((kw) => (
                              <span
                                key={kw}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              >
                                {kw}
                              </span>
                            ))
                          )}
                          {app.matchedKeywords.length > 3 && (
                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                              +{app.matchedKeywords.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="px-2 py-1 bg-background border border-border rounded text-[11px] font-medium outline-none focus:ring-1 focus:ring-foreground capitalize"
                        >
                          <option value="new">New</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </td>

                      {/* Date Applied */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[11px]" suppressHydrationWarning>
                        {formatDate(app.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-muted-foreground hover:text-foreground rounded hover:bg-secondary transition-colors"
                              title="Download / View Resume"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenDetail(app)}
                            className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground text-[11px] font-medium transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"
                            title="Delete Application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Detailed Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-background w-full max-w-3xl rounded-2xl border border-border shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-border/60 flex items-start justify-between bg-secondary/20">
              <div className="flex items-start gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    selectedApp.atsScore >= 70
                      ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                      : selectedApp.atsScore >= 40
                      ? "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  {selectedApp.atsScore}%
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-foreground">
                      {selectedApp.candidate.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-secondary border border-border text-foreground">
                      Lead Source: {selectedApp.source || "Careers Portal"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedApp.candidate.email || "No email provided"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedApp.candidate.phone || "No phone provided"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              {/* ATS Score & Keyword Breakdown */}
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" /> ATS Keyword Match Breakdown
                  </h4>
                  <span className="text-xs font-bold text-foreground">
                    {selectedApp.matchedKeywords.length} of{" "}
                    {selectedApp.matchedKeywords.length + selectedApp.missingKeywords.length} Skills Matched
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      selectedApp.atsScore >= 70
                        ? "bg-emerald-500"
                        : selectedApp.atsScore >= 40
                        ? "bg-amber-500"
                        : "bg-muted-foreground"
                    }`}
                    style={{ width: `${selectedApp.atsScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-emerald-500">
                      ✓ Skills Found in Resume ({selectedApp.matchedKeywords.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedApp.matchedKeywords.length === 0 ? (
                        <span className="text-muted-foreground italic text-xs">No keywords found</span>
                      ) : (
                        selectedApp.matchedKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-medium"
                          >
                            {kw}
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      ✗ Skills Missing from Resume ({selectedApp.missingKeywords.length}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedApp.missingKeywords.length === 0 ? (
                        <span className="text-muted-foreground italic text-xs">None missing</span>
                      ) : (
                        selectedApp.missingKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border/50 text-xs"
                          >
                            {kw}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Links & Resume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Resume Download Box */}
                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-foreground text-xs">Resume PDF</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">
                        {selectedApp.resumeFileName || "Candidate_Resume.pdf"}
                      </p>
                    </div>
                  </div>
                  {selectedApp.resumeUrl && (
                    <a
                      href={selectedApp.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center gap-1"
                    >
                      View PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Profiles & Links */}
                <div className="p-4 rounded-xl border border-border bg-card flex flex-col justify-center space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <Linkedin className="w-3.5 h-3.5 text-blue-500" />
                    {selectedApp.candidate.linkedinUrl ? (
                      <a
                        href={selectedApp.candidate.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline truncate"
                      >
                        {selectedApp.candidate.linkedinUrl}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">No LinkedIn provided</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedApp.candidate.portfolioUrl ? (
                      <a
                        href={selectedApp.candidate.portfolioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-500 hover:underline truncate"
                      >
                        {selectedApp.candidate.portfolioUrl}
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic">No portfolio provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Answers to Dynamic Screening Questions */}
              {selectedApp.answers && selectedApp.answers.length > 0 && (
                <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-500" /> Role-Specific Answers
                  </h4>

                  <div className="space-y-3">
                    {selectedApp.answers.map((ans, i) => (
                      <div key={i} className="p-3 rounded-lg bg-secondary/30 border border-border/40 space-y-1">
                        <p className="text-xs font-semibold text-foreground">
                          {i + 1}. {ans.question}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                          {ans.answer ? ans.answer : <em className="italic">No answer provided</em>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HR Private Notes */}
              <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" /> HR Internal Notes
                  </h4>
                  {notesSuccess && (
                    <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Saved!
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  placeholder="Add private evaluation notes, interview schedules, compensation discussions..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-xs outline-none focus:ring-1 focus:ring-foreground transition-all leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-md hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isSavingNotes ? "Saving..." : "Save Notes"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer / Stage Pipeline */}
            <div className="p-4 sm:p-5 border-t border-border/60 bg-secondary/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Current Stage:</span>
                <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-foreground text-background">
                  {selectedApp.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedApp.id, "shortlisted")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedApp.status === "shortlisted"
                      ? "bg-blue-600 text-white"
                      : "border border-border bg-background hover:bg-secondary text-foreground"
                  }`}
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp.id, "interview")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedApp.status === "interview"
                      ? "bg-emerald-600 text-white"
                      : "border border-border bg-background hover:bg-secondary text-foreground"
                  }`}
                >
                  Interview
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp.id, "rejected")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedApp.status === "rejected"
                      ? "bg-red-600 text-white"
                      : "border border-border bg-background hover:bg-secondary text-red-500"
                  }`}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Resume Modal */}
      <AdminUploadResumeModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialJobId={job.id}
        fixedJob={true}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
