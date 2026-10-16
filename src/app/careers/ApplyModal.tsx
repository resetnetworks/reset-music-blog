"use client";

import { useState, useRef } from "react";
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Briefcase, 
  Loader2, 
  HelpCircle,
  FileText,
  Check,
  Star,
  CircleDot
} from "lucide-react";

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

export interface ApplyModalJob {
  id: string;
  mongoId?: string;
  title: string;
  department: string;
  location: string;
  type: string;
  customQuestions?: JobQuestion[];
}

interface ApplyModalProps {
  job: ApplyModalJob;
  onClose: () => void;
}

export default function ApplyModal({ job, onClose }: ApplyModalProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedName, setSubmittedName] = useState<string>("");
  const [alreadyApplied, setAlreadyApplied] = useState<{ message: string; candidateName?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setError("Please upload your resume in PDF format.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit. Please choose a smaller PDF.");
        return;
      }
      setError(null);
      setResumeFile(file);
    }
  };

  const handleAnswerChange = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!resumeFile) {
      setError("Please attach your resume in PDF format to apply.");
      return;
    }

    // Validate required questions
    if (job.customQuestions && job.customQuestions.length > 0) {
      for (const q of job.customQuestions) {
        if (q.required && (!answers[q.id] || answers[q.id].trim() === "")) {
          setError(`Please answer the required question: "${q.question}"`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("jobId", job.mongoId || job.id);
      formData.append("resume", resumeFile);

      // Format answers as array
      const formattedAnswers = (job.customQuestions || []).map((q) => ({
        questionId: q.id,
        question: q.question,
        answer: answers[q.id] || "",
      }));
      formData.append("answers", JSON.stringify(formattedAnswers));

      const res = await fetch("/api/jobs/apply", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      // Handle duplicate application gracefully
      if (data.alreadyApplied) {
        setAlreadyApplied({
          message: data.error || `You have already applied for ${job.title}. Our talent team has your resume on file!`,
          candidateName: data.candidateName || "",
        });
        return;
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit application. Please try again.");
      }

      setSubmittedName(data.candidateName || "");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const hasQuestions = job.customQuestions && job.customQuestions.length > 0;

  return (
    <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-background w-full max-w-2xl rounded-2xl border border-border shadow-2xl relative max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/60 flex items-start justify-between bg-secondary/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-500 rounded uppercase tracking-wider">
                {job.type}
              </span>
              <span className="text-xs text-muted-foreground">{job.department}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold mt-1 text-foreground">
              Apply for {job.title}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Reset Music &bull; {job.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {alreadyApplied ? (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 mx-auto flex items-center justify-center border border-blue-500/20 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Application Already Submitted</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {alreadyApplied.candidateName ? `Hello ${alreadyApplied.candidateName}, ` : ""}
                {alreadyApplied.message}
              </p>
              <div className="p-4 bg-secondary/30 rounded-xl text-xs text-muted-foreground border border-border/40 text-left space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Status Information:
                </p>
                <p>&bull; Your previous submission and resume are already active in our candidate evaluation pipeline.</p>
                <p>&bull; To ensure fairness, we accept one application per candidate per role.</p>
                <p>&bull; If your qualifications match our requirements, our hiring team will reach out directly.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Understood / Close
              </button>
            </div>
          ) : submitted ? (
            <div className="py-10 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Application Received!</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {submittedName ? `Thank you, ${submittedName}! ` : "Thank you! "}
                Your application and resume for <strong>{job.title}</strong> have been submitted to the Reset Music talent team.
              </p>
              <div className="p-3.5 bg-secondary/30 rounded-xl text-xs text-muted-foreground border border-border/40 text-left space-y-1.5">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> What happens next?
                </p>
                <p>&bull; Our team will review your qualifications and responses.</p>
                <p>&bull; If your profile aligns with our requirements, our hiring team will reach out directly.</p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step 1: Resume Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-foreground" />
                    1. Upload Resume / CV <span className="text-red-500">*</span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-mono">PDF only (max 10MB)</span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    resumeFile
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-border hover:border-foreground/40 bg-secondary/15 hover:bg-secondary/25"
                  }`}
                >
                  {resumeFile ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{resumeFile.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB &bull; <span className="text-emerald-500 font-medium">Ready to submit</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-red-500 hover:bg-secondary rounded transition-colors"
                      >
                        Change PDF
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-full bg-secondary/80 flex items-center justify-center mx-auto text-muted-foreground">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">
                        Click or drag &amp; drop your resume (PDF)
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        PDF format only (Max 10MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Role-Specific Screening Questions */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                    2. Role-Specific Screening Questions
                  </h4>
                  {hasQuestions && (
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {job.customQuestions?.length} {job.customQuestions?.length === 1 ? "question" : "questions"}
                    </span>
                  )}
                </div>

                {hasQuestions ? (
                  <div className="space-y-3.5">
                    {job.customQuestions?.map((q, idx) => (
                      <div 
                        key={q.id || idx} 
                        className="p-4 rounded-xl bg-secondary/20 border border-border/60 space-y-2.5 transition-colors focus-within:border-foreground/40"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <label className="text-xs font-semibold text-foreground leading-snug flex items-start gap-1.5">
                            <span className="text-muted-foreground font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded shrink-0">
                              Q{idx + 1}
                            </span>
                            <span>
                              {q.question} {q.required && <span className="text-red-500">*</span>}
                            </span>
                          </label>
                        </div>

                        {q.type === "textarea" ? (
                          <textarea
                            rows={3}
                            required={q.required}
                            placeholder="Type your answer here..."
                            value={answers[q.id] || ""}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs sm:text-sm outline-none focus:ring-1 focus:ring-foreground transition-all leading-relaxed placeholder:text-muted-foreground/60"
                          />
                        ) : q.type === "boolean" ? (
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              onClick={() => handleAnswerChange(q.id, "Yes")}
                              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                                answers[q.id] === "Yes"
                                  ? "bg-foreground text-background border-foreground shadow-sm"
                                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                              }`}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAnswerChange(q.id, "No")}
                              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                                answers[q.id] === "No"
                                  ? "bg-foreground text-background border-foreground shadow-sm"
                                  : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                              }`}
                            >
                              No
                            </button>
                            {answers[q.id] && (
                              <span className="text-[11px] text-muted-foreground ml-2">
                                Selected: <strong>{answers[q.id]}</strong>
                              </span>
                            )}
                          </div>
                        ) : q.type === "radio" ? (
                          /* Multiple Choice (Single Select: e.g. 25%, 50%, 75%, 100%) */
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(q.options && q.options.length > 0 ? q.options : ["25%", "50%", "75%", "100%"]).map((opt, optIdx) => {
                                const isSelected = answers[q.id] === opt;
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => handleAnswerChange(q.id, opt)}
                                    className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                                      isSelected
                                        ? "bg-foreground text-background border-foreground shadow-sm"
                                        : "bg-background border-border text-foreground hover:bg-secondary/50 hover:border-foreground/30"
                                    }`}
                                  >
                                    <span className="flex items-center gap-2.5">
                                      <span
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                          isSelected ? "border-background bg-background text-foreground" : "border-muted-foreground/40"
                                        }`}
                                      >
                                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-foreground" />}
                                      </span>
                                      <span>{opt}</span>
                                    </span>
                                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                            {answers[q.id] && (
                              <p className="text-[11px] text-muted-foreground px-0.5">
                                Selected: <span className="font-semibold text-foreground">{answers[q.id]}</span>
                              </p>
                            )}
                          </div>
                        ) : q.type === "scale" ? (
                          /* Linear Rating Scale (e.g. 1 to 5 or 1 to 10) */
                          <div className="space-y-2 pt-1">
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              {Array.from({ length: q.scaleMax || 5 }, (_, i) => i + 1).map((num) => {
                                const stepDesc = q.options && q.options[num - 1] ? q.options[num - 1] : "";
                                const isSelected = answers[q.id]?.startsWith(`${num} `) || answers[q.id]?.startsWith(`${num}/`) || answers[q.id] === String(num);
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => {
                                      const fullAns = `${num} / ${q.scaleMax || 5}${
                                        stepDesc
                                          ? ` – ${stepDesc}`
                                          : num === 1 && q.scaleMinLabel
                                          ? ` (${q.scaleMinLabel})`
                                          : num === (q.scaleMax || 5) && q.scaleMaxLabel
                                          ? ` (${q.scaleMaxLabel})`
                                          : ""
                                      }`;
                                      handleAnswerChange(q.id, fullAns);
                                    }}
                                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center ${
                                      isSelected
                                        ? "bg-foreground text-background border-foreground shadow-sm scale-105"
                                        : "bg-background border-border text-foreground hover:bg-secondary hover:border-foreground/40"
                                    }`}
                                  >
                                    {num}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
                              <span>1: {q.scaleMinLabel || "Beginner"}</span>
                              <span>{q.scaleMax || 5}: {q.scaleMaxLabel || "Expert"}</span>
                            </div>

                            {answers[q.id] && (
                              <p className="text-[11px] text-emerald-500 font-medium px-0.5 flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5" />
                                <span>
                                  Selected: <strong className="text-foreground">{answers[q.id]}</strong>
                                </span>
                              </p>
                            )}
                          </div>
                        ) : q.type === "checkbox" ? (
                          /* Multi-Select Checkboxes */
                          <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {(q.options || []).map((opt, optIdx) => {
                                const currentList = answers[q.id] ? answers[q.id].split(", ").map((s) => s.trim()) : [];
                                const isChecked = currentList.includes(opt);
                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    onClick={() => {
                                      let nextList: string[];
                                      if (isChecked) {
                                        nextList = currentList.filter((item) => item !== opt);
                                      } else {
                                        nextList = [...currentList, opt];
                                      }
                                      handleAnswerChange(q.id, nextList.join(", "));
                                    }}
                                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                                      isChecked
                                        ? "bg-secondary text-foreground border-foreground/50 shadow-sm"
                                        : "bg-background border-border text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                    }`}
                                  >
                                    <span
                                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                        isChecked ? "bg-foreground border-foreground text-background" : "border-border"
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </span>
                                    <span>{opt}</span>
                                  </button>
                                );
                              })}
                            </div>
                            {answers[q.id] && (
                              <p className="text-[11px] text-muted-foreground px-0.5">
                                Selected: <span className="font-semibold text-foreground">{answers[q.id]}</span>
                              </p>
                            )}
                          </div>
                        ) : q.type === "select" && q.options && q.options.length > 0 ? (
                          <select
                            required={q.required}
                            value={answers[q.id] || ""}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs sm:text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
                          >
                            <option value="">Select an option...</option>
                            {q.options.map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            required={q.required}
                            placeholder="Type your answer, handle, or URL..."
                            value={answers[q.id] || ""}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs sm:text-sm outline-none focus:ring-1 focus:ring-foreground transition-all placeholder:text-muted-foreground/60"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-border/80 bg-secondary/15 text-center space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      No additional screening questions for this position
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Simply upload your resume PDF above and click &quot;Submit Application&quot; below.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-3 sticky bottom-0 bg-background/95 backdrop-blur py-2">
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  {resumeFile ? "Resume ready to submit" : "Resume upload required"}
                </span>
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-medium hover:bg-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !resumeFile}
                    className="px-6 py-2.5 bg-foreground text-background rounded-lg text-xs font-semibold hover:bg-foreground/90 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Resume &amp; Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Application</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
