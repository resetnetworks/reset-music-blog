"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Globe, 
  Briefcase, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  HelpCircle,
  Tag,
  Sliders,
  Check,
  FileText,
  X,
  CircleDot,
  Star,
  CheckSquare
} from "lucide-react";
import { createJobAction, updateJobAction } from "./actions";

export interface JobQuestion {
  id: string;
  question: string;
  type: "text" | "textarea" | "select" | "radio" | "scale" | "boolean" | "checkbox";
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  required: boolean;
}

interface JobFormProps {
  initialData?: {
    _id?: string;
    title?: string;
    department?: string;
    type?: string;
    locationType?: string;
    location?: string;
    experience?: string;
    description?: string;
    responsibilities?: string[];
    requirements?: string[];
    applyUrl?: string;
    customQuestions?: JobQuestion[];
    atsKeywords?: string[];
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
      period?: string;
    };
    status?: "active" | "draft" | "closed";
    validThrough?: string;
  };
  isEdit?: boolean;
}

const DEPARTMENT_KEYWORD_SUGGESTIONS: Record<string, string[]> = {
  Creative: ["Premiere Pro", "After Effects", "Photoshop", "Illustrator", "Blender", "DaVinci Resolve", "Motion Graphics", "Color Grading", "Video Editing", "Sound Design"],
  Marketing: ["Meta Ads", "Google Ads", "Instagram Reels", "Content Strategy", "SEO", "Google Analytics", "Social Media Management", "Copywriting", "Campaigns"],
  Engineering: ["React", "Next.js", "TypeScript", "Node.js", "AWS", "Docker", "CI/CD", "MongoDB", "REST APIs", "TailwindCSS"],
  Hardware: ["Altium Designer", "KiCad", "PCB Layout", "Schematics", "Soldering", "SMD Assembly", "Microcontrollers", "Hardware Testing"],
  "Hardware Production": ["PCB Assembly", "Soldering", "Pick and Place", "Reflow Oven", "Electronics Testing", "Quality Control", "ESD Safety"],
  "AI & Research": ["Python", "PyTorch", "TensorFlow", "Audio Processing", "Machine Learning", "Recommendation Systems", "Deep Learning"],
  Finance: ["Accounting", "GST", "Tally", "QuickBooks", "Taxation", "Financial Statements", "Auditing", "Bookkeeping"],
  "Human Resources": ["Recruitment", "Talent Acquisition", "Employee Engagement", "HR Policies", "Onboarding", "Payroll", "Interviewing"],
  Operations: ["Lean Manufacturing", "Workflow Optimization", "Quality Assurance", "Supply Chain", "Vendor Coordination", "CAD"],
  "Talent Management": ["Artist Management", "Music Licensing", "Contracts", "Artist Relations", "Release Planning", "Coordination"],
};

export default function JobForm({ initialData, isEdit }: JobFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [department, setDepartment] = useState(initialData?.department || "Creative");
  const [type, setType] = useState(initialData?.type || "Full-time");
  const [locationType, setLocationType] = useState(initialData?.locationType || "On-site");
  const [location, setLocation] = useState(initialData?.location || "Malviya Nagar, New Delhi");
  const [experience, setExperience] = useState(initialData?.experience || "Fresher");
  const [description, setDescription] = useState(initialData?.description || "");
  const [applyUrl, setApplyUrl] = useState(initialData?.applyUrl || "");
  const [status, setStatus] = useState<"active" | "draft" | "closed">(initialData?.status || "active");
  const [salaryMin, setSalaryMin] = useState<number | string>(initialData?.salary?.min ?? 20000);
  const [salaryMax, setSalaryMax] = useState<number | string>(initialData?.salary?.max ?? "");
  const [currency, setCurrency] = useState(initialData?.salary?.currency || "INR");
  const [salaryPeriod, setSalaryPeriod] = useState(initialData?.salary?.period || "MONTH");

  // Dynamic Bullet Lists
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities && initialData.responsibilities.length > 0
      ? initialData.responsibilities
      : [""]
  );

  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements && initialData.requirements.length > 0
      ? initialData.requirements
      : [""]
  );

  // Dynamic Screening Questions
  const [customQuestions, setCustomQuestions] = useState<JobQuestion[]>(
    initialData?.customQuestions && initialData.customQuestions.length > 0
      ? initialData.customQuestions
      : []
  );

  // ATS Target Keywords
  const [atsKeywords, setAtsKeywords] = useState<string[]>(
    initialData?.atsKeywords && initialData.atsKeywords.length > 0
      ? initialData.atsKeywords
      : []
  );
  const [keywordInput, setKeywordInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Responsibilities Handlers
  const handleAddResponsibility = () => setResponsibilities([...responsibilities, ""]);
  const handleUpdateResponsibility = (index: number, val: string) => {
    const updated = [...responsibilities];
    updated[index] = val;
    setResponsibilities(updated);
  };
  const handleRemoveResponsibility = (index: number) => {
    if (responsibilities.length === 1) setResponsibilities([""]);
    else setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  // Requirements Handlers
  const handleAddRequirement = () => setRequirements([...requirements, ""]);
  const handleUpdateRequirement = (index: number, val: string) => {
    const updated = [...requirements];
    updated[index] = val;
    setRequirements(updated);
  };
  const handleRemoveRequirement = (index: number) => {
    if (requirements.length === 1) setRequirements([""]);
    else setRequirements(requirements.filter((_, i) => i !== index));
  };

  // Custom Questions Handlers
  const handleAddQuestion = (type: JobQuestion["type"] = "text") => {
    const newQuestion: JobQuestion = {
      id: "q_" + Date.now().toString().slice(-6),
      question: "",
      type,
      options: type === "radio" || type === "select" || type === "checkbox" ? ["25%", "50%", "75%", "100%"] : [],
      scaleMin: 1,
      scaleMax: 5,
      scaleMinLabel: "Beginner",
      scaleMaxLabel: "Expert",
      required: true,
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  const handleUpdateQuestion = (index: number, fields: Partial<JobQuestion>) => {
    const updated = [...customQuestions];
    const current = updated[index];
    const newType = fields.type ?? current.type;

    let options = fields.options ?? current.options;
    if ((newType === "radio" || newType === "select" || newType === "checkbox") && (!options || options.length === 0)) {
      options = ["25%", "50%", "75%", "100%"];
    }

    updated[index] = {
      ...current,
      ...fields,
      type: newType,
      options,
      scaleMin: fields.scaleMin ?? current.scaleMin ?? 1,
      scaleMax: fields.scaleMax ?? current.scaleMax ?? 5,
      scaleMinLabel: fields.scaleMinLabel ?? current.scaleMinLabel ?? "Beginner",
      scaleMaxLabel: fields.scaleMaxLabel ?? current.scaleMaxLabel ?? "Expert",
    };
    setCustomQuestions(updated);
  };

  const handleRemoveQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...customQuestions];
    const currentOpts = updated[questionIndex].options || [];
    updated[questionIndex] = {
      ...updated[questionIndex],
      options: [...currentOpts, `Option ${currentOpts.length + 1}`],
    };
    setCustomQuestions(updated);
  };

  const handleUpdateOption = (questionIndex: number, optIndex: number, val: string) => {
    const updated = [...customQuestions];
    const currentOpts = [...(updated[questionIndex].options || [])];
    currentOpts[optIndex] = val;
    updated[questionIndex] = {
      ...updated[questionIndex],
      options: currentOpts,
    };
    setCustomQuestions(updated);
  };

  const handleRemoveOption = (questionIndex: number, optIndex: number) => {
    const updated = [...customQuestions];
    const currentOpts = (updated[questionIndex].options || []).filter((_, i) => i !== optIndex);
    updated[questionIndex] = {
      ...updated[questionIndex],
      options: currentOpts,
    };
    setCustomQuestions(updated);
  };

  const handleSetPresetOptions = (questionIndex: number, presetOptions: string[]) => {
    const updated = [...customQuestions];
    updated[questionIndex] = {
      ...updated[questionIndex],
      options: presetOptions,
    };
    setCustomQuestions(updated);
  };

  const handleAddPresetQuestion = (
    presetText: string,
    type: JobQuestion["type"] = "text",
    options?: string[],
    scale?: { min: number; max: number; minLabel?: string; maxLabel?: string }
  ) => {
    const newQuestion: JobQuestion = {
      id: "q_" + Date.now().toString().slice(-6),
      question: presetText,
      type,
      options: options || (type === "radio" || type === "select" || type === "checkbox" ? ["25%", "50%", "75%", "100%"] : []),
      scaleMin: scale?.min ?? 1,
      scaleMax: scale?.max ?? 5,
      scaleMinLabel: scale?.minLabel ?? "Beginner",
      scaleMaxLabel: scale?.maxLabel ?? "Expert",
      required: true,
    };
    setCustomQuestions([...customQuestions, newQuestion]);
  };

  // ATS Keywords Handlers - Supports single, comma-separated, and multi-line bulk paste
  const addKeywordsFromText = (text: string) => {
    if (!text || !text.trim()) return;
    
    // Split by newlines, commas, semicolons, tabs
    const rawItems = text.split(/[\r\n,;]+/);
    const newKeywords: string[] = [];
    const currentSet = new Set(atsKeywords.map((k) => k.toLowerCase()));

    for (const item of rawItems) {
      // Remove leading bullet numbers, dashes, asterisks e.g. "1. ", "- ", "* "
      const cleaned = item.replace(/^[\s\d\.\-\*•]+/, "").trim();
      if (cleaned && !currentSet.has(cleaned.toLowerCase())) {
        newKeywords.push(cleaned);
        currentSet.add(cleaned.toLowerCase());
      }
    }

    if (newKeywords.length > 0) {
      setAtsKeywords((prev) => [...prev, ...newKeywords]);
    }
    setKeywordInput("");
  };

  const handleAddKeyword = () => {
    addKeywordsFromText(keywordInput);
  };

  const handleRemoveKeyword = (kw: string) => {
    setAtsKeywords(atsKeywords.filter((k) => k !== kw));
  };

  const handleToggleKeyword = (kw: string) => {
    if (atsKeywords.includes(kw)) {
      setAtsKeywords(atsKeywords.filter((k) => k !== kw));
    } else {
      setAtsKeywords([...atsKeywords, kw]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const payload = {
        title,
        department,
        type,
        locationType,
        location,
        experience,
        description,
        responsibilities: responsibilities.filter((r) => r.trim() !== ""),
        requirements: requirements.filter((r) => r.trim() !== ""),
        applyUrl,
        customQuestions: customQuestions.filter((q) => q.question.trim() !== ""),
        atsKeywords: atsKeywords.filter((k) => k.trim() !== ""),
        salaryMin,
        salaryMax,
        currency,
        salaryPeriod,
        status,
      };

      if (isEdit && initialData?._id) {
        const res = await updateJobAction(initialData._id, payload);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess("Job updated successfully!");
          setTimeout(() => router.push("/admin/jobs"), 1200);
        }
      } else {
        const res = await createJobAction(payload);
        if (res.error) {
          setError(res.error);
        } else {
          setSuccess("Job created successfully! It will now appear on Google Jobs.");
          setTimeout(() => router.push("/admin/jobs"), 1200);
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const suggestedKeywords = DEPARTMENT_KEYWORD_SUGGESTIONS[department] || [
    "Problem Solving",
    "Communication",
    "Project Management",
    "Team Collaboration",
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="p-2 rounded-lg border border-border bg-background hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {isEdit ? "Edit Job Posting" : "Create New Job Posting"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ATS keywords scanning, dynamic questions, and Google Jobs indexing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/jobs"
            className="px-4 py-2 border border-border rounded-md text-xs font-medium hover:bg-secondary transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-foreground text-background rounded-md text-xs font-medium hover:bg-foreground/90 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Publish Job"}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Google Jobs & ATS Badge */}
      <div className="p-4 rounded-xl bg-secondary/30 border border-border/60 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-medium text-foreground">ATS Resume Scoring &amp; Google Jobs Automation Active</p>
          <p className="text-muted-foreground leading-relaxed">
            Candidates submitting resumes are automatically parsed and scored against your target keywords. Candidates will also answer your role-specific screening questions.
          </p>
        </div>
      </div>

      {/* Section 1: Core Details */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> Role Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-medium text-foreground">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Video Editor & Graphic Designer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Department <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Creative, Marketing, Engineering, Operations"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Employment Type <span className="text-red-500">*</span>
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            >
              <option value="Full-time">Full-time</option>
              <option value="Intern / Full-time">Intern / Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Workplace Setting <span className="text-red-500">*</span>
            </label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            >
              <option value="On-site">On-site</option>
              <option value="Remote">Remote (Telecommute)</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Location Address / City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Malviya Nagar, New Delhi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Experience Level <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fresher, 1+ years, 2+ years"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            >
              <option value="active">Active (Visible on Careers &amp; Google)</option>
              <option value="draft">Draft (Hidden)</option>
              <option value="closed">Closed (Applications Stopped)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: ATS Target Keywords (Resume Ranking Engine) */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" /> ATS Keywords for Resume Scoring
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Add key software, skills, or certifications. When candidates upload their resume (PDF), the ATS scans for these terms and scores the applicant from 0% to 100%.
            </p>
          </div>
        </div>

        {/* Keyword Input & Add Button */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a skill, or paste multiple keywords (separated by commas or new lines)..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (pasted.includes("\n") || pasted.includes(",") || pasted.includes(";") || pasted.includes("\r")) {
                e.preventDefault();
                addKeywordsFromText(pasted);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddKeyword();
              }
            }}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
          <button
            type="button"
            onClick={handleAddKeyword}
            className="px-4 py-2 bg-foreground text-background rounded-md text-xs font-medium hover:bg-foreground/90 transition-colors shrink-0"
          >
            Add Skills
          </button>
        </div>

        {/* Selected Keywords Tags Header */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>Active ATS Keywords ({atsKeywords.length})</span>
          {atsKeywords.length > 0 && (
            <button
              type="button"
              onClick={() => setAtsKeywords([])}
              className="text-muted-foreground hover:text-red-500 transition-colors text-[11px]"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Selected Keywords Tags */}
        <div className="min-h-[42px] p-3 rounded-lg border border-border/60 bg-secondary/20 flex flex-wrap gap-2 items-center">
          {atsKeywords.length === 0 ? (
            <span className="text-xs text-muted-foreground italic">
              No keywords added yet. Resumes won&apos;t be filtered by skill match until you add keywords.
            </span>
          ) : (
            atsKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-foreground text-background shadow-sm"
              >
                <span>{kw}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(kw)}
                  className="hover:opacity-75 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Suggested Keywords based on department */}
        {suggestedKeywords.length > 0 && (
          <div className="pt-2">
            <p className="text-[11px] font-medium text-muted-foreground mb-2">
              💡 Suggested for {department}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedKeywords.map((kw) => {
                const isSelected = atsKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => handleToggleKeyword(kw)}
                    className={`px-2 py-0.5 rounded text-[11px] border transition-colors flex items-center gap-1 ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-medium"
                        : "bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5" />}
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Dynamic Screening Questions */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-500" /> Role-Specific Screening Questions
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Ask custom questions when candidates apply (e.g. portfolio links, software proficiency, availability).
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleAddQuestion("text")}
            className="px-3 py-1.5 bg-foreground text-background rounded-md text-xs font-medium hover:bg-foreground/90 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Add Question
          </button>
        </div>

        {/* Quick presets */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground bg-secondary/20 p-2.5 rounded-lg border border-border/40">
          <span className="font-medium text-foreground text-[11px]">Quick Add:</span>
          <button
            type="button"
            onClick={() => handleAddPresetQuestion(
              "How proficient are you in Adobe Photoshop / Premiere Pro?", 
              "radio", 
              ["25% (Beginner)", "50% (Intermediate)", "75% (Proficient)", "100% (Expert)"]
            )}
            className="px-2 py-1 rounded bg-secondary/80 hover:bg-secondary text-[11px] transition-colors border border-border/40 flex items-center gap-1"
          >
            <CircleDot className="w-3 h-3 text-blue-500" /> + Photoshop / Tool (25%-100%)
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetQuestion(
              "Rate your overall expertise for this role on a scale of 1 to 5",
              "scale",
              [],
              { min: 1, max: 5, minLabel: "Beginner", maxLabel: "Expert" }
            )}
            className="px-2 py-1 rounded bg-secondary/80 hover:bg-secondary text-[11px] transition-colors border border-border/40 flex items-center gap-1"
          >
            <Star className="w-3 h-3 text-amber-500" /> + Linear Skill Rating (1-5)
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetQuestion(
              "Which software and tools do you use regularly?",
              "checkbox",
              ["Photoshop", "Illustrator", "Premiere Pro", "After Effects", "Figma", "Blender"]
            )}
            className="px-2 py-1 rounded bg-secondary/80 hover:bg-secondary text-[11px] transition-colors border border-border/40 flex items-center gap-1"
          >
            <CheckSquare className="w-3 h-3 text-emerald-500" /> + Tools Checklist
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetQuestion("Link to your portfolio / showreel / Behance (Google Drive or web link)", "text")}
            className="px-2 py-1 rounded bg-secondary/80 hover:bg-secondary text-[11px] transition-colors border border-border/40"
          >
            + Portfolio Link
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetQuestion("What is your current notice period / earliest joining date?", "text")}
            className="px-2 py-1 rounded bg-secondary/80 hover:bg-secondary text-[11px] transition-colors border border-border/40"
          >
            + Notice Period
          </button>
          <button
            type="button"
            onClick={() => handleAddPresetQuestion("Are you available to work on-site at our studio in Malviya Nagar, New Delhi?", "boolean")}
            className="px-2 py-1 rounded bg-secondary/80 hover:bg-secondary text-[11px] transition-colors border border-border/40"
          >
            + On-site Availability (Yes/No)
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {customQuestions.length === 0 ? (
            <div className="text-center py-8 rounded-lg border border-dashed border-border/60 bg-secondary/10">
              <p className="text-xs text-muted-foreground">
                No custom questions configured. Candidates will only submit their basic info and resume PDF.
              </p>
              <button
                type="button"
                onClick={() => handleAddQuestion("text")}
                className="mt-2 text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Question
              </button>
            </div>
          ) : (
            customQuestions.map((q, idx) => (
              <div
                key={q.id || idx}
                className="p-4 rounded-lg border border-border bg-secondary/10 space-y-3.5 relative group"
              >
                {/* Question Header & Title */}
                <div className="flex items-start justify-between gap-3">
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                    Q{idx + 1}
                  </span>
                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. How much are you able to use Photoshop? or Rate your skills..."
                      value={q.question}
                      onChange={(e) => handleUpdateQuestion(idx, { question: e.target.value })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-2 text-muted-foreground hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Answer Type Selector & Required Checkbox */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Answer Type:</span>
                    <select
                      value={q.type}
                      onChange={(e) => handleUpdateQuestion(idx, { type: e.target.value as any })}
                      className="px-2.5 py-1 bg-background border border-border rounded text-xs outline-none focus:ring-1 focus:ring-foreground font-medium"
                    >
                      <option value="text">Short Text (Single Line)</option>
                      <option value="textarea">Long Answer (Paragraph)</option>
                      <option value="radio">Multiple Choice (Single Select: e.g. 25%, 50%, 75%, 100%)</option>
                      <option value="scale">Linear Rating Scale (Rate 1 to 5 or 1 to 10)</option>
                      <option value="checkbox">Multi-Select (Check all that apply)</option>
                      <option value="select">Dropdown Menu</option>
                      <option value="boolean">Yes / No Toggle</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => handleUpdateQuestion(idx, { required: e.target.checked })}
                      className="rounded border-border text-foreground focus:ring-foreground w-3.5 h-3.5"
                    />
                    <span>Required to answer</span>
                  </label>
                </div>

                {/* Options Manager (for Multiple Choice / Radio / Dropdown / Checkboxes) */}
                {(q.type === "radio" || q.type === "select" || q.type === "checkbox") && (
                  <div className="p-3.5 rounded-lg bg-background/80 border border-border/70 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <CircleDot className="w-3.5 h-3.5 text-blue-500" /> Options (Choice Items):
                      </span>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-muted-foreground mr-1">Presets:</span>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOptions(idx, ["25%", "50%", "75%", "100%"])}
                          className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-[10px] text-muted-foreground hover:text-foreground border border-border/50"
                        >
                          25% | 50% | 75% | 100%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOptions(idx, ["Beginner", "Intermediate", "Advanced", "Expert"])}
                          className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-[10px] text-muted-foreground hover:text-foreground border border-border/50"
                        >
                          Skill Levels
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPresetOptions(idx, ["Immediate", "15 Days", "30 Days", "60+ Days"])}
                          className="px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-[10px] text-muted-foreground hover:text-foreground border border-border/50"
                        >
                          Notice Periods
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {(q.options || []).map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-[11px] text-muted-foreground font-mono w-5 text-right shrink-0">
                            {optIdx + 1}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            placeholder={`e.g. ${optIdx === 0 ? "25%" : optIdx === 1 ? "50%" : "Option"}`}
                            onChange={(e) => handleUpdateOption(idx, optIdx, e.target.value)}
                            className="flex-1 px-2.5 py-1.5 bg-background border border-border rounded text-xs outline-none focus:ring-1 focus:ring-foreground"
                          />
                          {(q.options || []).length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(idx, optIdx)}
                              className="p-1.5 text-muted-foreground hover:text-red-500 rounded hover:bg-red-500/10 transition-colors"
                              title="Delete option"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddOption(idx)}
                      className="px-2.5 py-1 border border-border/80 bg-secondary/50 hover:bg-secondary rounded text-[11px] font-medium flex items-center gap-1 transition-colors text-foreground"
                    >
                      <Plus className="w-3 h-3" /> Add Choice
                    </button>
                  </div>
                )}

                {/* Linear Scale / Rating Configuration */}
                {q.type === "scale" && (
                  <div className="p-3.5 rounded-lg bg-background/80 border border-border/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-500" /> Linear Rating Scale Configuration:
                      </span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground text-[11px]">Scale Range:</span>
                        <select
                          value={q.scaleMax || 5}
                          onChange={(e) => handleUpdateQuestion(idx, { scaleMax: Number(e.target.value) })}
                          className="px-2 py-1 bg-background border border-border rounded text-xs outline-none focus:ring-1 focus:ring-foreground"
                        >
                          <option value={5}>1 to 5 (Standard Rating)</option>
                          <option value={10}>1 to 10 (Detailed Rating)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">Label for 1 (Min / Lowest):</label>
                        <input
                          type="text"
                          placeholder="e.g. Beginner or Poor"
                          value={q.scaleMinLabel ?? "Beginner"}
                          onChange={(e) => handleUpdateQuestion(idx, { scaleMinLabel: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-xs outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">
                          Label for {q.scaleMax || 5} (Max / Highest):
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Expert or Pro"
                          value={q.scaleMaxLabel ?? "Expert"}
                          onChange={(e) => handleUpdateQuestion(idx, { scaleMaxLabel: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-background border border-border rounded text-xs outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                    </div>

                    {/* Scale Live Preview for HR */}
                    <div className="pt-2 border-t border-border/40">
                      <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">Candidate Preview:</p>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {Array.from({ length: q.scaleMax || 5 }, (_, i) => i + 1).map((num) => (
                          <span
                            key={num}
                            className="w-8 h-8 rounded-lg border border-border bg-secondary/50 text-xs font-semibold flex items-center justify-center text-foreground"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1 px-1">
                        <span>1: {q.scaleMinLabel || "Beginner"}</span>
                        <span>{q.scaleMax || 5}: {q.scaleMaxLabel || "Expert"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Section 4: Compensation & Google Jobs Indexing */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Globe className="w-4 h-4" /> Compensation (Google Jobs Search Ranking)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-foreground">Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all uppercase"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-foreground">Base / Min Salary</label>
            <input
              type="number"
              placeholder="e.g. 25000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-foreground">Max Salary (Optional)</label>
            <input
              type="number"
              placeholder="e.g. 40000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-1">
            <label className="text-xs font-medium text-foreground">Pay Period</label>
            <select
              value={salaryPeriod}
              onChange={(e) => setSalaryPeriod(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
            >
              <option value="MONTH">Per Month</option>
              <option value="YEAR">Per Year</option>
              <option value="HOUR">Per Hour</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section 5: Job Description */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground block">
          Role Summary / Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          required
          placeholder="Brief overview explaining what this role entails, team mission, and expectations..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all leading-relaxed"
        />
      </div>

      {/* Section 6: Core Responsibilities */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Core Responsibilities
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Specific duties and day-to-day deliverables.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddResponsibility}
            className="px-2.5 py-1.5 border border-border bg-secondary hover:bg-secondary/80 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Duty
          </button>
        </div>

        <div className="space-y-2.5">
          {responsibilities.map((resp, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono w-5 text-right shrink-0">
                {i + 1}.
              </span>
              <input
                type="text"
                placeholder="e.g. Edit promotional videos, event recaps, and short-form content..."
                value={resp}
                onChange={(e) => handleUpdateResponsibility(i, e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
              <button
                type="button"
                onClick={() => handleRemoveResponsibility(i)}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 7: Key Requirements */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Key Requirements &amp; Qualifications
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Educational background, skills, software proficiency, or experience requirements.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddRequirement}
            className="px-2.5 py-1.5 border border-border bg-secondary hover:bg-secondary/80 rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Requirement
          </button>
        </div>

        <div className="space-y-2.5">
          {requirements.map((req, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono w-5 text-right shrink-0">
                {i + 1}.
              </span>
              <input
                type="text"
                placeholder="e.g. 2+ years professional experience in graphic design and video editing..."
                value={req}
                onChange={(e) => handleUpdateRequirement(i, e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
              />
              <button
                type="button"
                onClick={() => handleRemoveRequirement(i)}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 8: External Application Link (Optional Override) */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-muted-foreground" /> External Application Link (Optional Override)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Leave this <strong>blank</strong> to use the <strong>Native Portal with ATS Resume Ranking &amp; Dynamic Questions</strong>. If you specify an external link (like Google Forms or LinkedIn), candidates will be redirected there instead.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Leave blank for Native ATS Application Portal (Recommended)"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all font-mono text-xs"
            />
            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-md border border-border bg-secondary hover:bg-secondary/80 text-xs flex items-center gap-1 transition-colors"
              >
                Test Link <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Save Bar */}
      <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
        <Link
          href="/admin/jobs"
          className="px-4 py-2 border border-border rounded-md text-xs font-medium hover:bg-secondary transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-foreground text-background rounded-md text-xs font-semibold hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-sm"
        >
          {loading ? "Saving Posting..." : isEdit ? "Update Job Posting" : "Publish Job Posting"}
        </button>
      </div>
    </form>
  );
}
