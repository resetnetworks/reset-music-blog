"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  X, 
  Trash2, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  HelpCircle,
  FileCheck,
  Save,
  MessageSquare,
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
    score?: number;
  }[];
  atsScore: number;
  resumeScore?: number;
  screeningScore?: number;
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
    customQuestions?: Array<{
      id: string;
      question: string;
      type: string;
      options?: string[];
      required?: boolean;
    }>;
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
      source: newApp.source || "Careers Portal",
      answers: [],
      atsScore: newApp.atsScore ?? 0,
      resumeScore: newApp.atsScore ?? 0,
      screeningScore: 0,
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
      (app.notes && app.notes.toLowerCase().includes(q)) ||
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

  const stageCounts = useMemo(() => {
    return {
      all: apps.length,
      new: apps.filter((a) => a.status === "new").length,
      shortlisted: apps.filter((a) => a.status === "shortlisted").length,
      interview: apps.filter((a) => a.status === "interview").length,
      hired: apps.filter((a) => a.status === "hired").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    };
  }, [apps]);

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

  const [savingNotesId, setSavingNotesId] = useState<string | null>(null);
  const [savedNotesId, setSavedNotesId] = useState<string | null>(null);

  const handleInlineNotesUpdate = async (appId: string, newNotes: string) => {
    const currentApp = apps.find((a) => a.id === appId);
    if (!currentApp || (currentApp.notes || "") === newNotes.trim()) {
      return;
    }
    setSavingNotesId(appId);
    try {
      const res = await updateApplicationNotesAction(appId, newNotes.trim(), job.id);
      if (res.success) {
        setApps((prev) =>
          prev.map((a) => (a.id === appId ? { ...a, notes: newNotes.trim() } : a))
        );
        if (selectedApp && selectedApp.id === appId) {
          setSelectedApp({ ...selectedApp, notes: newNotes.trim() });
          setNotesInput(newNotes.trim());
        }
        setSavedNotesId(appId);
        setTimeout(() => setSavedNotesId(null), 2000);
      }
    } finally {
      setSavingNotesId(null);
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
      {/* Top Header - Simple & Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="p-2 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{job.department}</span>
              <span>&bull;</span>
              <span>{job.type}</span>
              <span>&bull;</span>
              <span>{job.location}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mt-0.5">
              {job.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 bg-foreground text-background rounded-lg text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center gap-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Resume</span>
          </button>
          <Link
            href={`/admin/jobs/${job.id}/edit`}
            className="px-3.5 py-2 border border-border rounded-lg text-xs font-medium hover:bg-secondary transition-colors"
          >
            Edit Job
          </Link>
        </div>
      </div>

      {/* Target ATS Keywords - Clean Muted Row */}
      {job.atsKeywords && job.atsKeywords.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">ATS Keywords:</span>
          {job.atsKeywords.map((kw) => (
            <span
              key={kw}
              className="px-2 py-0.5 rounded bg-secondary text-foreground text-xs font-normal"
            >
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Summary Metrics - Minimal & Crisp */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground">Total Applicants</p>
          <p className="text-xl font-semibold mt-1 text-foreground">{totalCount}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground">High Match (≥ 70%)</p>
          <p className="text-xl font-semibold mt-1 text-foreground">{highMatchCount}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground">In Pipeline</p>
          <p className="text-xl font-semibold mt-1 text-foreground">{shortlistedCount}</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <p className="text-xs text-muted-foreground">Average Score</p>
          <p className="text-xl font-semibold mt-1 text-foreground">{avgScore}%</p>
        </div>
      </div>

      {/* Status Stage Navigation - Clean Minimal Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-border">
        {[
          { id: "all", label: "All", count: stageCounts.all },
          { id: "new", label: "New", count: stageCounts.new },
          { id: "shortlisted", label: "Shortlisted", count: stageCounts.shortlisted },
          { id: "interview", label: "Interview", count: stageCounts.interview },
          { id: "hired", label: "Hired", count: stageCounts.hired },
          { id: "rejected", label: "Rejected", count: stageCounts.rejected },
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[11px] opacity-70">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate, skill, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground"
          >
            <option value="all">All Scores</option>
            <option value="high">High Match (≥ 70%)</option>
            <option value="mid">Mid Match (40% - 69%)</option>
            <option value="low">Low Match (&lt; 40%)</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/30 border-b border-border text-muted-foreground text-[11px]">
              <tr>
                <th className="px-4 py-3 font-medium w-12 text-center">#</th>
                <th className="px-4 py-3 font-medium min-w-[220px]">Candidate</th>
                <th className="px-4 py-3 font-medium min-w-[140px]">ATS Score</th>
                <th className="px-4 py-3 font-medium min-w-[200px]">Matched Skills</th>
                <th className="px-4 py-3 font-medium min-w-[120px]">Status</th>
                <th className="px-4 py-3 font-medium min-w-[220px]">Remarks</th>
                <th className="px-4 py-3 font-medium min-w-[100px]">Applied</th>
                <th className="px-4 py-3 font-medium text-right min-w-[90px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    {apps.length === 0
                      ? "No candidates have applied for this position yet."
                      : "No applicants found matching your search filters."}
                  </td>
                </tr>
              ) : (
                filteredApps.map((app, idx) => {
                  return (
                    <tr
                      key={app.id}
                      className="hover:bg-secondary/20 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(app)}
                    >
                      {/* Rank Number - Completely Uniform, No 1st Place Highlight */}
                      <td className="px-4 py-3 text-center text-muted-foreground font-mono text-xs">
                        {idx + 1}
                      </td>

                      {/* Candidate Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground text-xs">
                            {app.candidate.name}
                          </span>
                          {app.source && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground border border-border">
                              {app.source}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {app.candidate.email || "No email"} {app.candidate.phone ? `• ${app.candidate.phone}` : ""}
                        </p>
                      </td>

                      {/* ATS Score */}
                      <td className="px-4 py-3">
                        <span className="font-semibold text-xs text-foreground">
                          {app.atsScore}%
                        </span>
                      </td>

                      {/* Matched Keywords */}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-sm">
                          {app.matchedKeywords.length === 0 ? (
                            <span className="text-[11px] text-muted-foreground italic">None matched</span>
                          ) : (
                            app.matchedKeywords.slice(0, 3).map((kw) => (
                              <span
                                key={kw}
                                className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-foreground"
                              >
                                {kw}
                              </span>
                            ))
                          )}
                          {app.matchedKeywords.length > 3 && (
                            <span className="text-[10px] text-muted-foreground px-1">
                              +{app.matchedKeywords.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className="px-2 py-1 bg-background border border-border rounded text-xs capitalize outline-none focus:ring-1 focus:ring-foreground"
                        >
                          <option value="new">New</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="hired">Hired</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      {/* Remarks / HR Notes */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="relative flex items-center gap-1.5">
                          <input
                            type="text"
                            defaultValue={app.notes || ""}
                            key={app.id + (app.notes || "")}
                            placeholder="Add remark..."
                            onBlur={(e) => handleInlineNotesUpdate(app.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            className="w-full px-2.5 py-1 bg-background border border-border/60 hover:border-border rounded text-xs outline-none focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/60 text-foreground"
                          />
                          {savingNotesId === app.id ? (
                            <div className="w-3 h-3 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin shrink-0" />
                          ) : savedNotesId === app.id ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : null}
                        </div>
                      </td>

                      {/* Date Applied */}
                      <td className="px-4 py-3 text-muted-foreground text-[11px] whitespace-nowrap" suppressHydrationWarning>
                        {formatDate(app.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {app.resumeUrl && (
                            <a
                              href={app.resumeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors"
                              title="View Resume"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenDetail(app)}
                            className="px-2 py-1 rounded bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                            title="Delete"
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-background w-full max-w-3xl rounded-xl border border-border shadow-xl relative max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedApp.candidate.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground border border-border">
                    {selectedApp.source || "Careers Portal"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                  {selectedApp.candidate.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {selectedApp.candidate.email}
                    </span>
                  )}
                  {selectedApp.candidate.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {selectedApp.candidate.phone}
                    </span>
                  )}
                  <span className="text-[11px]" suppressHydrationWarning>
                    Applied: {formatDate(selectedApp.createdAt)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* ATS Score Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-lg border border-border bg-card">
                  <p className="text-[11px] text-muted-foreground">Overall ATS Score</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{selectedApp.atsScore}%</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Weighted composite rating</p>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-card">
                  <p className="text-[11px] text-muted-foreground">Screening Q&amp;A Score</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {selectedApp.screeningScore ?? selectedApp.atsScore}%
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Based on answered questions</p>
                </div>
                <div className="p-3.5 rounded-lg border border-border bg-card">
                  <p className="text-[11px] text-muted-foreground">Resume Keywords Match</p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {selectedApp.resumeScore ?? selectedApp.atsScore}%
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {selectedApp.matchedKeywords.length} skills matched
                  </p>
                </div>
              </div>

              {/* Matched & Missing Skills */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                <div>
                  <p className="text-[11px] font-medium text-foreground mb-1.5">
                    Matched Skills ({selectedApp.matchedKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedApp.matchedKeywords.length === 0 ? (
                      <span className="text-muted-foreground italic text-xs">None matched</span>
                    ) : (
                      selectedApp.matchedKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded bg-secondary text-foreground text-xs"
                        >
                          {kw}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {selectedApp.missingKeywords.length > 0 && (
                  <div>
                    <p className="text-[11px] font-medium text-muted-foreground mb-1.5">
                      Missing Keywords ({selectedApp.missingKeywords.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {selectedApp.missingKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded bg-secondary/50 text-muted-foreground text-xs"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Answers to Screening Questions */}
              {selectedApp.answers && selectedApp.answers.length > 0 && (
                <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      Candidate Screening Answers ({selectedApp.answers.length})
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {selectedApp.answers.map((ans, i) => {
                      const isUrl = /^https?:\/\//i.test(ans.answer.trim());
                      return (
                        <div key={i} className="p-3 rounded-md bg-secondary/30 border border-border/50 space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-foreground">
                              {i + 1}. {ans.question}
                            </p>
                            {typeof ans.score === "number" && ans.score > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-muted-foreground shrink-0">
                                {ans.score}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                            {isUrl ? (
                              <a
                                href={ans.answer.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline break-all inline-flex items-center gap-1"
                              >
                                {ans.answer.trim()} <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : ans.answer ? (
                              ans.answer
                            ) : (
                              <em className="text-muted-foreground italic">No answer provided</em>
                            )}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Links & Resume PDF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground text-xs">Resume PDF</p>
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
                      className="px-3 py-1.5 rounded bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors flex items-center gap-1"
                    >
                      View PDF <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="p-3.5 rounded-lg border border-border bg-card flex flex-col justify-center space-y-1">
                  {selectedApp.candidate.linkedinUrl ? (
                    <a
                      href={selectedApp.candidate.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1.5 truncate"
                    >
                      <Linkedin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedApp.candidate.linkedinUrl}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 shrink-0" /> No LinkedIn provided
                    </span>
                  )}

                  {selectedApp.candidate.portfolioUrl ? (
                    <a
                      href={selectedApp.candidate.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-foreground hover:underline flex items-center gap-1.5 truncate"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedApp.candidate.portfolioUrl}</span>
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 shrink-0" /> No portfolio link provided
                    </span>
                  )}
                </div>
              </div>

              {/* Remarks / HR Notes */}
              <div className="p-4 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" /> Remarks &amp; Notes
                  </h4>
                  {notesSuccess && (
                    <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Saved!
                    </span>
                  )}
                </div>

                <textarea
                  rows={2}
                  placeholder="Add evaluation remarks..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-background border border-border rounded text-xs outline-none focus:ring-1 focus:ring-foreground transition-all leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    <span>{isSavingNotes ? "Saving..." : "Save Notes"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer / Pipeline Buttons */}
            <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-secondary/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Current Stage:</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-secondary text-foreground border border-border">
                  {selectedApp.status}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedApp.id, "shortlisted")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedApp.status === "shortlisted"
                      ? "bg-foreground text-background"
                      : "border border-border bg-background hover:bg-secondary text-foreground"
                  }`}
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp.id, "interview")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedApp.status === "interview"
                      ? "bg-foreground text-background"
                      : "border border-border bg-background hover:bg-secondary text-foreground"
                  }`}
                >
                  Interview
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp.id, "rejected")}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
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
