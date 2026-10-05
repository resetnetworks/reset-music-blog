"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Info,
  FileText,
  ExternalLink,
  Download,
  Eye,
  X,
  CheckCircle2
} from "lucide-react";

interface FinancialDoc {
  id: string;
  title: string;
  financialYear: string;
  periodLabel: string;
  asOfDate: string;
  type: string;
  status: string;
  description: string;
  highlights: string[];
  pdfUrl: string;
}

const financialDocuments: FinancialDoc[] = [
  {
    id: "fs-2025",
    title: "Financial Statement FY 2024–25",
    financialYear: "FY 2024–25",
    periodLabel: "1 April 2024 – 31 March 2025",
    asOfDate: "As on 31 March 2025",
    type: "Audited Standalone Statement & AOC-4 Filing",
    status: "Latest Audited Statement",
    description:
      "Full audited financial statement and AOC-4 statutory filing, including Directors' report, Independent Auditor's report, Balance Sheet, Statement of Profit & Loss, and Notes 1 to 25.",
    highlights: [
      "Statement of Profit & Loss (FY 2024–25)",
      "Balance Sheet as of 31st March, 2025",
      "Notes & Schedules (Notes 1 to 25)",
      "Statutory Disclosures & AOC-4 Filing"
    ],
    pdfUrl: "https://reset-blog-app.s3.ap-south-1.amazonaws.com/documents/Financial+Statement+2025.pdf"
  },
  {
    id: "fs-2024",
    title: "Signed Financial Statement FY 2023–24",
    financialYear: "FY 2023–24",
    periodLabel: "1 April 2023 – 31 March 2024",
    asOfDate: "As on 31 March 2024",
    type: "Signed Audited Financial Statement",
    status: "Historical Audited Filing",
    description:
      "Signed standalone financial statements and Independent Auditor's Report by Murmuria & Associates for the financial year ended 31st March 2024.",
    highlights: [
      "Signed Balance Sheet as of 31st March, 2024",
      "Signed Statement of Profit & Loss (FY 2023–24)",
      "Independent Auditor's Report (Murmuria & Associates)",
      "Statutory Auditor Sign-offs & Notes"
    ],
    pdfUrl: "https://reset-blog-app.s3.ap-south-1.amazonaws.com/documents/Signed+FS+31.03.2024.pdf"
  }
];

export default function InvestorRelationsClient() {
  const [currencyMode, setCurrencyMode] = useState<"lakhs" | "exact">("lakhs");
  const [selectedDoc, setSelectedDoc] = useState<FinancialDoc | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Sticky Top Control Bar */}
      <div className="sticky top-14 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 shadow-xs">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          <Link
            href="/"
            className="inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors group shrink-0 whitespace-nowrap"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1 shrink-0" />
            <span className="font-medium">Home</span>
            <span className="text-border">/</span>
            <span className="text-foreground">Investor Relations</span>
          </Link>

          {/* Static Currency Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider hidden sm:inline-block font-medium">
              View Values:
            </span>
            <div className="flex items-center bg-secondary/80 p-0.5 rounded-lg border border-border/80 text-xs shadow-2xs shrink-0">
              <button
                onClick={() => setCurrencyMode("lakhs")}
                className={`px-2 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${currencyMode === "lakhs"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                In Lakhs (₹ L)
              </button>
              <button
                onClick={() => setCurrencyMode("exact")}
                className={`px-2 sm:px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all ${currencyMode === "exact"
                    ? "bg-foreground text-background shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Exact INR (₹)
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Financial Banner - THE YEAR AT A GLANCE */}
        <div className="mb-12 relative overflow-hidden rounded-2xl bg-foreground text-background p-6 sm:p-10 md:p-12 shadow-lg">
          {/* Top Tagline */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/15">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest font-bold text-white">RESET MUSIC.</span>
              <span className="text-white/30">•</span>
              <span className="text-xs uppercase tracking-widest text-white/70">INVESTOR FINANCIALS</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono">
              <Calendar className="w-3.5 h-3.5" />
              <span>FY 2024–25</span>
            </div>
          </div>

          {/* Hero Title */}
          <div className="my-8 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-[1.08] text-white">
              THE YEAR <br />
              AT A GLANCE.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/80 leading-relaxed max-w-2xl">
              RESET NETWORKS works across independent music, digital music services, artist-facing activity, studio and venue experiences, events, and audio research.
            </p>
          </div>

          {/* 3-Column Metric Line Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/15 border-y border-white/15 py-8 my-6">
            {/* Metric 1 */}
            <div className="py-4 md:py-0 md:pr-8">
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                {currencyMode === "lakhs" ? "₹21.43L" : "₹21,42,813"}
              </div>
              <div className="text-xs tracking-wider uppercase text-white/70 mt-2 font-semibold">
                TOTAL REVENUE · FY25
              </div>
            </div>

            {/* Metric 2 */}
            <div className="py-4 md:py-0 md:px-8">
              <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 tracking-tight font-mono">
                +411%
              </div>
              <div className="text-xs tracking-wider uppercase text-white/70 mt-2 font-semibold">
                REVENUE GROWTH YEAR-ON-YEAR
              </div>
            </div>

            {/* Metric 3 */}
            <div className="py-4 md:py-0 md:pl-8">
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                ₹6,681
              </div>
              <div className="text-xs tracking-wider uppercase text-white/70 mt-2 font-semibold">
                NET PROFIT AFTER TAX · FY25
              </div>
            </div>
          </div>

          {/* A Quick Read 4-Grid Cards */}
          <div className="pt-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/50 mb-5 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" />
              <span>A QUICK READ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              <div className="border-t border-white/15 pt-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                  REVENUE EXPANDED
                </h3>
                <p className="text-sm text-white/75 leading-relaxed">
                  Total revenue rose from <strong>₹4.20 lakh</strong> in FY24 to <strong>₹21.43 lakh</strong> in FY25.
                </p>
              </div>

              <div className="border-t border-white/15 pt-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                  PROFIT COMPRESSED
                </h3>
                <p className="text-sm text-white/75 leading-relaxed">
                  Net profit after tax moved from <strong>₹66,689</strong> to <strong>₹6,681</strong>, despite higher reported revenue.
                </p>
              </div>

              <div className="border-t border-white/15 pt-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                  OTHER INCOME MATTERED
                </h3>
                <p className="text-sm text-white/75 leading-relaxed">
                  <strong>₹7.71 lakh</strong> of FY25 total revenue was reported as other income, separate from operating revenue.
                </p>
              </div>

              <div className="border-t border-white/15 pt-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1.5">
                  BALANCE SHEET GREW
                </h3>
                <p className="text-sm text-white/75 leading-relaxed">
                  Total assets increased to approximately <strong>₹88.10 lakh</strong> at 31 March 2025.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Footnote */}
          <div className="mt-8 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/60">
            <p className="max-w-xl leading-relaxed">
              Prepared from the company’s uploaded AOC-4 financial statement. Amounts converted from rupees in hundreds to rupees/lakh where applicable. This is an investor-summary document, not a substitute for the full audited accounts.
            </p>
            <div className="font-mono text-white/90 text-left sm:text-right shrink-0">
              RESET NETWORKS (OPC) PVT. LTD.<br />
              MALVIYA NAGAR, NEW DELHI
            </div>
          </div>
        </div>

        {/* Regulatory Disclosure Note */}
        <div className="p-4 mb-10 rounded-xl bg-secondary/30 border border-border flex items-start gap-3 text-xs text-muted-foreground leading-relaxed">
          <Info className="w-4 h-4 text-foreground shrink-0 mt-0.5" />
          <p>
            The company’s published financial information should be read alongside the audited standalone financial statements and supporting notes. All figures relate to the Indian legal entity (<strong>RESET NETWORKS (OPC) PRIVATE LIMITED</strong>) and the stated financial year.
          </p>
        </div>

        {/* Section Header for Document Cards */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Official Filings & Documents</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Audited Financial Statements
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Direct access to view or download full statutory reports and audited balance sheets.
            </p>
          </div>
        </div>

        {/* Financial Document Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {financialDocuments.map((doc) => (
            <div
              key={doc.id}
              className="group relative flex flex-col justify-between bg-card hover:bg-card/90 border border-border hover:border-foreground/40 rounded-2xl p-6 sm:p-8 transition-all duration-200 shadow-xs hover:shadow-md"
            >
              <div>
                {/* Header tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${doc.id === "fs-2025"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : "bg-secondary text-foreground border border-border"
                      }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {doc.financialYear}
                  </span>

                  <span className="text-[11px] uppercase tracking-wider font-mono text-muted-foreground">
                    {doc.asOfDate}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {doc.title}
                </h3>

                {/* Subtitle / Period */}
                <div className="text-xs font-medium text-muted-foreground mb-4">
                  Financial Period: <span className="text-foreground font-semibold">{doc.periodLabel}</span>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  {doc.description}
                </p>

                {/* Document Contents Checklist */}
                <div className="bg-secondary/40 rounded-xl p-4 mb-6 border border-border/60">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Sections Included in Document:
                  </div>
                  <ul className="space-y-2">
                    {doc.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-foreground/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedDoc(doc)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background font-semibold text-xs sm:text-sm hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Document</span>
                </button>

                <a
                  href={doc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-xs sm:text-sm border border-border transition-all"
                >
                  <span>Open PDF</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href={doc.pdfUrl}
                  download
                  className="inline-flex items-center justify-center p-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border transition-all"
                  title="Download PDF"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive In-App PDF Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl h-[92vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="w-5 h-5 text-foreground shrink-0" />
                <div className="truncate">
                  <h4 className="text-sm sm:text-base font-bold text-foreground truncate">
                    {selectedDoc.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedDoc.periodLabel} · {selectedDoc.asOfDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedDoc.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground border border-border transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Open in New Tab</span>
                </a>
                <a
                  href={selectedDoc.pdfUrl}
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-xs font-semibold text-foreground border border-border transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all cursor-pointer"
                  aria-label="Close Preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal PDF Viewer Body */}
            <div className="flex-1 w-full h-full bg-neutral-900">
              <iframe
                src={`${selectedDoc.pdfUrl}#toolbar=1&navpanes=0`}
                title={selectedDoc.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
