"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Linkedin,
  Globe,
  Mail,
  Phone,
  User,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  ArrowRight
} from "lucide-react";
import { getJobsListAction } from "./actions";

interface JobOption {
  id: string;
  title: string;
  department: string;
  type?: string;
  atsKeywords?: string[];
  slug?: string;
}

interface AdminUploadResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (application: any) => void;
  initialJobId?: string;
  jobsList?: JobOption[];
  fixedJob?: boolean;
}

const SOURCE_OPTIONS = [
  { label: "LinkedIn", icon: "💼" },
  { label: "Indeed", icon: "🌐" },
  { label: "Referral", icon: "🤝" },
  { label: "Email Lead", icon: "📧" },
  { label: "Naukri", icon: "📄" },
  { label: "Agency / Campus", icon: "🏢" },
  { label: "Other Platform", icon: "🏷️" },
];

export default function AdminUploadResumeModal({
  isOpen,
  onClose,
  onSuccess,
  initialJobId,
  jobsList: initialJobs,
  fixedJob = false,
}: AdminUploadResumeModalProps) {
  const [jobs, setJobs] = useState<JobOption[]>(initialJobs || []);
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId || "");
  const [source, setSource] = useState<string>("LinkedIn");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Optional manual overrides
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [status, setStatus] = useState<string>("new");
  const [notes, setNotes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Submission & state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync initialJobId
  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId);
    }
  }, [initialJobId]);

  // Fetch jobs if not provided
  useEffect(() => {
    if (isOpen && (!jobs || jobs.length === 0)) {
      getJobsListAction().then((res) => {
        if (res.success && res.jobs) {
          setJobs(res.jobs);
          if (!selectedJobId && res.jobs.length > 0) {
            setSelectedJobId(res.jobs[0].id);
          }
        }
      });
    } else if (isOpen && !selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [isOpen, jobs, selectedJobId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setDuplicateWarning(null);
      setUploadResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentJob = jobs.find((j) => j.id === selectedJobId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.toLowerCase().endsWith(".pdf")) {
        setError("Only PDF files are supported.");
        return;
      }
      setFile(selected);
      setError(null);
      setDuplicateWarning(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (!dropped.name.toLowerCase().endsWith(".pdf")) {
        setError("Please drop a valid PDF resume file.");
        return;
      }
      setFile(dropped);
      setError(null);
      setDuplicateWarning(null);
    }
  };

  const handleUpload = async (forceOverwrite = false) => {
    if (!selectedJobId) {
      setError("Please select a target job position.");
      return;
    }
    if (!file) {
      setError("Please select or drop a PDF resume file to upload.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setDuplicateWarning(null);

    try {
      const formData = new FormData();
      formData.append("jobId", selectedJobId);
      formData.append("resume", file);
      formData.append("source", source);
      if (name.trim()) formData.append("name", name.trim());
      if (email.trim()) formData.append("email", email.trim());
      if (phone.trim()) formData.append("phone", phone.trim());
      if (linkedinUrl.trim()) formData.append("linkedinUrl", linkedinUrl.trim());
      if (portfolioUrl.trim()) formData.append("portfolioUrl", portfolioUrl.trim());
      if (status) formData.append("status", status);
      if (notes.trim()) formData.append("notes", notes.trim());
      if (forceOverwrite) formData.append("overwrite", "true");

      const response = await fetch("/api/admin/jobs/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.status === 409 && data.duplicate) {
        setDuplicateWarning(data);
        setIsSubmitting(false);
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to upload resume.");
        setIsSubmitting(false);
        return;
      }

      setUploadResult(data.application);
      if (onSuccess) {
        onSuccess(data.application);
      }
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setError(err.message || "Network error while uploading resume.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForAnother = () => {
    setFile(null);
    setName("");
    setEmail("");
    setPhone("");
    setLinkedinUrl("");
    setPortfolioUrl("");
    setNotes("");
    setUploadResult(null);
    setError(null);
    setDuplicateWarning(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-2xl rounded-2xl border border-border shadow-2xl relative my-8 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/60 bg-secondary/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                Upload Candidate Resume &amp; ATS Score
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Screen external candidates from LinkedIn, Indeed, or referrals through our ATS engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* DUPLICATE WARNING DIALOG */}
          {duplicateWarning && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
              <div className="flex items-start gap-2.5 text-amber-500">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-500">Candidate Already on File</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    A candidate matching <strong>{duplicateWarning.candidateName}</strong> (
                    {duplicateWarning.existingEmail || duplicateWarning.existingPhone}) already exists in{" "}
                    <strong>{currentJob?.title}</strong> with an existing ATS score of{" "}
                    <strong>{duplicateWarning.existingAtsScore}%</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-amber-500/20">
                <button
                  type="button"
                  onClick={() => setDuplicateWarning(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpload(true)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  {isSubmitting ? "Updating..." : "Overwrite Resume & Re-Score ATS"}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {uploadResult ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${
                        uploadResult.atsScore >= 70
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : uploadResult.atsScore >= 40
                          ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20"
                          : "bg-secondary text-foreground border border-border"
                      }`}
                    >
                      {uploadResult.atsScore}%
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-foreground">
                          {uploadResult.candidate?.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {uploadResult.source}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {uploadResult.jobTitle} &bull; Added to candidate pipeline
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Processed
                  </span>
                </div>

                {/* ATS Match Highlights */}
                <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    ATS Skill Match Breakdown ({uploadResult.matchedKeywords.length} matched):
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {uploadResult.matchedKeywords.length === 0 ? (
                      <span className="text-xs text-muted-foreground italic">No target keywords found</span>
                    ) : (
                      uploadResult.matchedKeywords.map((kw: string) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                        >
                          ✓ {kw}
                        </span>
                      ))
                    )}
                  </div>

                  {uploadResult.missingKeywords.length > 0 && (
                    <div className="pt-1.5">
                      <p className="text-[11px] text-muted-foreground">Missing keywords:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {uploadResult.missingKeywords.slice(0, 8).map((kw: string) => (
                          <span
                            key={kw}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-secondary text-muted-foreground border border-border/60"
                          >
                            ✗ {kw}
                          </span>
                        ))}
                        {uploadResult.missingKeywords.length > 8 && (
                          <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">
                            +{uploadResult.missingKeywords.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Candidate Contact */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-emerald-500/20 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-foreground" />
                    <span className="truncate">{uploadResult.candidate?.email || "No email parsed"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-foreground" />
                    <span>{uploadResult.candidate?.phone || "No phone parsed"}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                {uploadResult.resumeUrl && (
                  <a
                    href={uploadResult.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Uploaded PDF in New Tab
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={handleResetForAnother}
                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3 h-3" /> Upload Another Resume
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors inline-flex items-center gap-1"
                  >
                    Done &amp; View Pipeline <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* UPLOAD FORM */
            <div className="space-y-4">
              {/* Target Job Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Target Job Position *</span>
                  {currentJob?.department && (
                    <span className="text-[11px] text-muted-foreground font-normal">
                      Dept: {currentJob.department}
                    </span>
                  )}
                </label>

                <div className="relative">
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    disabled={fixedJob}
                    className="w-full px-3 py-2 bg-background border border-border rounded-xl text-xs font-medium outline-none focus:ring-1 focus:ring-foreground transition-all disabled:opacity-75 appearance-none pr-8"
                  >
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.department})
                      </option>
                    ))}
                  </select>
                  {!fixedJob && (
                    <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  )}
                </div>

                {/* Target Keywords Preview */}
                {currentJob?.atsKeywords && currentJob.atsKeywords.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/40 text-[11px] text-muted-foreground space-y-1 mt-1.5">
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <Sparkles className="w-3 h-3 text-emerald-500" /> Screening Criteria Keywords (
                      {currentJob.atsKeywords.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {currentJob.atsKeywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-1.5 py-0.5 rounded bg-background border border-border/50 text-[10px] font-mono text-foreground"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Source Platform Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Candidate Lead Source Platform *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SOURCE_OPTIONS.map((opt) => {
                    const isSelected = source === opt.label;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => setSource(opt.label)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
                            : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <span>{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Drag and Drop PDF File Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Candidate Resume (PDF) *
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                    isDragging
                      ? "border-emerald-500 bg-emerald-500/10 scale-[0.99]"
                      : file
                      ? "border-foreground bg-secondary/30"
                      : "border-border hover:border-foreground/40 bg-secondary/10 hover:bg-secondary/20"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {file ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-foreground truncate max-w-[240px] sm:max-w-xs">
                          {file.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB &bull; Ready for ATS extraction
                        </p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-500 ml-2">Change</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          Click to select or drag &amp; drop candidate resume
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          PDF files only (up to 15MB). Contact &amp; skills are automatically parsed.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Advanced / Optional Candidate Info Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showAdvanced ? "rotate-180" : ""
                    }`}
                  />
                  <span>
                    {showAdvanced ? "Hide manual details (auto-extract from PDF)" : "Customize candidate contact info & notes"}
                  </span>
                </button>

                {showAdvanced && (
                  <div className="space-y-3 mt-3 p-4 rounded-xl border border-border/80 bg-secondary/15 animate-in fade-in duration-200 text-xs">
                    <p className="text-[11px] text-muted-foreground">
                      * Leave empty to automatically extract candidate name, email, phone, and LinkedIn from the PDF resume.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Candidate Full Name
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Auto-extracted if blank"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            placeholder="Auto-extracted if blank"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Auto-extracted if blank"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Initial Stage
                        </label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-foreground capitalize"
                        >
                          <option value="new">New Lead</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          LinkedIn URL
                        </label>
                        <div className="relative">
                          <Linkedin className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            placeholder="https://linkedin.com/in/username"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Portfolio / Website URL
                        </label>
                        <div className="relative">
                          <Globe className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            placeholder="https://github.com/..."
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Recruiter Evaluation Notes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Sourced via LinkedIn recruiter outreach. Has 4+ years of relevant experience."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-3.5 py-2 rounded-xl border border-border text-xs font-medium hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpload(false)}
                  disabled={isSubmitting || !file || !selectedJobId}
                  className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                      <span>Screening &amp; Scoring ATS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Upload &amp; Calculate ATS</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
