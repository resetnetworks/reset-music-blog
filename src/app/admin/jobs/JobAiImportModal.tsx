"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Briefcase,
  Layers,
  ArrowRight,
  RotateCcw,
  ListPlus,
  CheckCircle2,
  HelpCircle,
  Zap
} from "lucide-react";
import { parseFullJobDescription, ParsedJobData } from "@/lib/jdParser";

interface JobAiImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: ParsedJobData) => void;
  currentTitle?: string;
  currentDepartment?: string;
}

const PRESET_ROLES: {
  title: string;
  department: string;
  type: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  responsibilities: string[];
  requirements: string[];
  atsKeywords: string[];
}[] = [
  {
    title: "Video Editor & Graphic Designer",
    department: "Creative",
    type: "Full-time",
    experience: "1-3 years",
    salaryMin: 25000,
    salaryMax: 45000,
    description:
      "We are looking for an energetic and imaginative Video Editor & Graphic Designer to produce compelling visual content, music event aftermovies, artist interviews, and engaging social media creatives for Reset Music.",
    responsibilities: [
      "Edit dynamic, high-energy music videos, artist interviews, and festival recaps for YouTube and social media.",
      "Design captivating digital posters, album artworks, Instagram carousels, and promotional banners.",
      "Perform precision color grading, audio leveling, and sync sound design for short-form Reels and Shorts.",
      "Work closely with our talent and marketing teams to produce campaign visual assets under tight deadlines.",
      "Maintain brand visual aesthetics and archive project media efficiently.",
    ],
    requirements: [
      "Proven portfolio demonstrating modern video editing and graphic design aesthetics.",
      "High proficiency in Adobe Premiere Pro, After Effects, Photoshop, and Illustrator.",
      "Deep understanding of music culture, visual rhythm, pacing, and modern short-form video trends.",
      "Ability to handle multiple project deliverables in a fast-paced creative studio environment.",
      "Based in or willing to work on-site at our studio in Malviya Nagar, New Delhi.",
    ],
    atsKeywords: [
      "Premiere Pro",
      "After Effects",
      "Photoshop",
      "Illustrator",
      "Video Editing",
      "Motion Graphics",
      "Color Grading",
      "Sound Design",
      "Visual Design",
      "Reels",
    ],
  },
  {
    title: "Social Media & Content Growth Strategist",
    department: "Marketing",
    type: "Full-time",
    experience: "1-3 years",
    salaryMin: 25000,
    salaryMax: 40000,
    description:
      "Drive Reset Music's digital voice and community growth across Instagram, YouTube, and TikTok. You will strategize, script, and distribute organic and paid campaigns that resonate with electronic and modern music audiences.",
    responsibilities: [
      "Plan and execute content calendars across Instagram, YouTube Shorts, and LinkedIn.",
      "Script engaging short-form video concepts, memes, and trend-jacking music reels.",
      "Monitor engagement metrics, CTRs, and audience retention to optimize content strategy.",
      "Collaborate with artists and event organizers to capture real-time moments during studio sessions and live shows.",
      "Run targeted meta ads and community engagement initiatives.",
    ],
    requirements: [
      "Demonstrated track record of growing social media channels in the entertainment, music, or lifestyle space.",
      "Strong copywriting and storytelling skills in English and contemporary cultural slang.",
      "Proficiency in Meta Business Suite, Canva, basic CapCut/Premiere editing, and Google Analytics.",
      "Passion for music culture, emerging artists, and viral digital trends.",
      "Comfortable with on-camera hosting and conducting quick artist interviews.",
    ],
    atsKeywords: [
      "Social Media Management",
      "Content Strategy",
      "Instagram Reels",
      "Copywriting",
      "Meta Ads",
      "Community Building",
      "SEO",
      "Analytics",
      "Video Scripting",
    ],
  },
  {
    title: "Full Stack Engineer (Next.js / Node.js)",
    department: "Engineering",
    type: "Full-time",
    experience: "1-3 years",
    salaryMin: 35000,
    salaryMax: 65000,
    description:
      "Architect and scale our web platforms, music discovery engines, and internal CRM tools using Next.js, TypeScript, TailwindCSS, and MongoDB.",
    responsibilities: [
      "Build high-performance, SEO-optimized web interfaces using Next.js App Router and React Server Components.",
      "Develop secure, scalable RESTful API routes, background workers, and database schemas with MongoDB.",
      "Integrate AWS S3, multimedia streaming pipelines, and authentication systems.",
      "Optimize core web vitals, mobile responsiveness, and page load speeds.",
      "Collaborate on product specifications, code reviews, and DevOps CI/CD automation.",
    ],
    requirements: [
      "Strong proficiency with TypeScript, React, Next.js, and Node.js.",
      "Experience with MongoDB, Mongoose, and cloud object storage (AWS S3).",
      "Understanding of web performance, server-side rendering, and responsive UI design.",
      "Familiarity with Git workflows, Docker, and modern deployment pipelines.",
      "Problem-solving mindset and eagerness to write clean, maintainable code.",
    ],
    atsKeywords: [
      "Next.js",
      "React",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "AWS",
      "REST APIs",
      "TailwindCSS",
      "Docker",
      "Git",
    ],
  },
  {
    title: "Audio Electronics & Hardware Engineer",
    department: "Hardware",
    type: "Full-time",
    experience: "1-3 years",
    salaryMin: 30000,
    salaryMax: 55000,
    description:
      "Join our hardware R&D lab in Malviya Nagar to design, prototype, and test next-generation acoustic controllers, synthesizers, and audio interface hardware.",
    responsibilities: [
      "Design analog and digital audio schematics and multilayer PCB layouts using KiCad or Altium.",
      "Prototype hardware boards, hand-solder SMD components, and conduct bench testing with oscilloscopes.",
      "Firmware programming for ARM Cortex microcontrollers and ESP32 audio streaming.",
      "Conduct signal-to-noise ratio (SNR), THD, and acoustic frequency response analysis.",
      "Coordinate with fabrication vendors for PCB manufacturing and mechanical housing fits.",
    ],
    requirements: [
      "Degree in Electronics Engineering or proven practical hardware design experience.",
      "Proficiency in PCB CAD software (Altium Designer, KiCad, or Eagle).",
      "Strong hands-on soldering skills, SMD rework, and test equipment troubleshooting.",
      "Knowledge of audio op-amps, DACs, ADCs, I2S/SPI protocols, and power management.",
      "Enthusiasm for audio technology, synths, or music production equipment.",
    ],
    atsKeywords: [
      "KiCad",
      "Altium Designer",
      "PCB Layout",
      "Schematics",
      "Soldering",
      "Microcontrollers",
      "Hardware Testing",
      "SMD Assembly",
      "Audio Electronics",
    ],
  },
];

export default function JobAiImportModal({
  isOpen,
  onClose,
  onApply,
  currentTitle,
  currentDepartment,
}: JobAiImportModalProps) {
  const [activeTab, setActiveTab] = useState<"paste" | "prompt" | "presets">("paste");
  const [rawText, setRawText] = useState("");
  const [parsedData, setParsedData] = useState<ParsedJobData | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [promptRole, setPromptRole] = useState(currentTitle || "Video Editor & Graphic Designer");

  if (!isOpen) return null;

  const handleParse = (textToParse: string) => {
    const text = textToParse || rawText;
    if (!text.trim()) {
      setParsedData(null);
      return;
    }
    const parsed = parseFullJobDescription(text);
    setParsedData(parsed);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setRawText(val);
    if (val.length > 30) {
      handleParse(val);
    } else {
      setParsedData(null);
    }
  };

  const handleApplyParsed = () => {
    if (!parsedData) {
      if (rawText.trim()) {
        const parsed = parseFullJobDescription(rawText);
        onApply(parsed);
        onClose();
      }
      return;
    }
    onApply(parsedData);
    onClose();
  };

  const handleApplyPreset = (preset: typeof PRESET_ROLES[0]) => {
    onApply({
      title: preset.title,
      department: preset.department,
      type: preset.type,
      experience: preset.experience,
      locationType: "On-site",
      location: "Malviya Nagar, New Delhi",
      salaryMin: preset.salaryMin,
      salaryMax: preset.salaryMax,
      salaryPeriod: "MONTH",
      currency: "INR",
      description: preset.description,
      responsibilities: preset.responsibilities,
      requirements: preset.requirements,
      atsKeywords: preset.atsKeywords,
    });
    onClose();
  };

  const structuredPrompt = `Create a complete, professional Job Description for "${promptRole}" at Reset Music (a contemporary music and media collective located in Malviya Nagar, New Delhi).

Format the output strictly using the following headings so our system can auto-fill it:

Job Title: ${promptRole}
Department: ${currentDepartment || "Creative"}
Experience: 1-3 years
Employment Type: Full-time
Location: Malviya Nagar, New Delhi (On-site)
Salary: ₹25,000 - ₹45,000 per month

Role Summary:
(2-3 clear sentences describing the mission and impact of this role)

Core Responsibilities:
• (5-7 clear bullet points starting with •)
• ...

Key Requirements:
• (5-7 clear bullet points starting with •)
• ...

ATS Keywords:
(Comma-separated list of 8-12 essential tools, software, and skills like Premiere Pro, Photoshop, Figma, etc.)`;

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(structuredPrompt);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-3xl rounded-2xl border border-border shadow-2xl relative my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-border/60 bg-secondary/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-foreground flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Smart Job Description Import
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paste your raw job description or draft to automatically structure the role overview, responsibilities, requirements, and ATS keywords.
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

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-border/60 flex items-center gap-2 bg-secondary/10">
          <button
            type="button"
            onClick={() => setActiveTab("paste")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "paste"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Paste Raw Document
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("prompt")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "prompt"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Prompt Template
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("presets")}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "presets"
                ? "border-blue-500 text-blue-500"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Standard Role Presets
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: PASTE DOCUMENT */}
          {activeTab === "paste" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Paste Raw Job Description / Draft</span>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      (Markdown, bullets, or plain text)
                    </span>
                  </label>
                  {rawText && (
                    <button
                      type="button"
                      onClick={() => {
                        setRawText("");
                        setParsedData(null);
                      }}
                      className="text-[11px] text-muted-foreground hover:text-red-500 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>

                <textarea
                  rows={8}
                  placeholder={`Example format:\n\nJob Title: Video Editor & Graphic Designer\nDepartment: Creative\n\nRole Summary:\nWe are looking for a creative Video Editor to produce music aftermovies and reels...\n\nCore Responsibilities:\n• Edit fast-paced music videos and artist interviews.\n• Color grade and mix audio for Reels and YouTube shorts.\n• Design promotional posters in Photoshop.\n\nKey Requirements:\n• 1-2 years experience in Premiere Pro and After Effects.\n• Solid portfolio of music or event edits.\n\nATS Keywords:\nPremiere Pro, After Effects, Photoshop, Color Grading, Sound Design`}
                  value={rawText}
                  onChange={handleTextChange}
                  className="w-full p-3.5 bg-secondary/20 border border-border rounded-xl text-xs font-mono outline-none focus:ring-1 focus:ring-blue-500 transition-all leading-relaxed"
                />
              </div>

              {/* LIVE PARSED PREVIEW */}
              {parsedData && (
                <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Auto-Parsed Structure Preview
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      Ready to populate form
                    </span>
                  </div>

                  {/* Top tags */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {parsedData.title && (
                      <span className="px-2.5 py-1 rounded-md bg-background border border-border font-semibold text-foreground">
                        Title: {parsedData.title}
                      </span>
                    )}
                    {parsedData.department && (
                      <span className="px-2.5 py-1 rounded-md bg-background border border-border text-muted-foreground font-medium">
                        Dept: {parsedData.department}
                      </span>
                    )}
                    {parsedData.type && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-500 uppercase">
                        {parsedData.type}
                      </span>
                    )}
                    {parsedData.experience && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-secondary text-foreground">
                        Exp: {parsedData.experience}
                      </span>
                    )}
                    {parsedData.salaryMin && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 font-mono font-medium">
                        ₹{parsedData.salaryMin} - ₹{parsedData.salaryMax || "Negotiable"}
                      </span>
                    )}
                  </div>

                  {/* Summary */}
                  {parsedData.description && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Role Summary:
                      </p>
                      <p className="text-xs text-foreground bg-background/80 p-2.5 rounded-lg border border-border/60 leading-relaxed">
                        {parsedData.description}
                      </p>
                    </div>
                  )}

                  {/* Responsibilities */}
                  {parsedData.responsibilities && parsedData.responsibilities.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                          Core Responsibilities:
                        </span>
                        <span className="font-bold text-foreground">
                          {parsedData.responsibilities.length} items parsed
                        </span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto bg-background/80 p-2 rounded-lg border border-border/60">
                        {parsedData.responsibilities.map((r, i) => (
                          <div key={i} className="text-xs text-foreground flex items-start gap-1.5 py-0.5">
                            <span className="text-blue-500 font-bold shrink-0">&bull;</span>
                            <span className="leading-snug">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {parsedData.requirements && parsedData.requirements.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-muted-foreground uppercase tracking-wider">
                          Key Requirements:
                        </span>
                        <span className="font-bold text-foreground">
                          {parsedData.requirements.length} items parsed
                        </span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto bg-background/80 p-2 rounded-lg border border-border/60">
                        {parsedData.requirements.map((r, i) => (
                          <div key={i} className="text-xs text-foreground flex items-start gap-1.5 py-0.5">
                            <span className="text-emerald-500 font-bold shrink-0">&bull;</span>
                            <span className="leading-snug">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ATS Keywords */}
                  {parsedData.atsKeywords && parsedData.atsKeywords.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Extracted ATS Keywords ({parsedData.atsKeywords.length}):
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {parsedData.atsKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="px-2 py-0.5 rounded text-[11px] bg-secondary font-mono text-foreground border border-border/60"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROMPT GENERATOR */}
          {activeTab === "prompt" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Target Role Title:
                  </label>
                  <input
                    type="text"
                    value={promptRole}
                    onChange={(e) => setPromptRole(e.target.value)}
                    placeholder="e.g. Senior Video Editor or Music Producer"
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground">Structured Generation Prompt:</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1 font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="p-3 bg-secondary/30 rounded-xl border border-border/60 text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                    {structuredPrompt}
                  </pre>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">
                    Copy and run this prompt in your preferred AI generator or document editor.
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      handleCopyPrompt();
                      setActiveTab("paste");
                    }}
                    className="px-3.5 py-1.5 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy &amp; Switch to Paste Tab</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK STUDIO ROLE PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Select one of Reset Music's pre-configured role templates to populate all descriptions, responsibilities, requirements, and ATS keywords instantly:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_ROLES.map((preset) => (
                  <div
                    key={preset.title}
                    className="p-4 rounded-xl border border-border bg-card hover:border-foreground/30 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-500 uppercase">
                          {preset.department}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {preset.experience}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-foreground group-hover:text-blue-500 transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {preset.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground pt-1">
                        <span>{preset.responsibilities.length} Duties</span> &bull;{" "}
                        <span>{preset.requirements.length} Requirements</span> &bull;{" "}
                        <span>{preset.atsKeywords.length} ATS Skills</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="w-full py-2 bg-secondary hover:bg-foreground hover:text-background text-foreground text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Use This Template</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-border/60 bg-secondary/20 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary transition-colors"
          >
            Cancel
          </button>

          {activeTab === "paste" && (
            <button
              type="button"
              onClick={handleApplyParsed}
              disabled={!rawText.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply to Job Form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
