"use client";

import { useState } from "react";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Search, 
  X, 
  CheckCircle2, 
  Building,
  Mail
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  department: string;
  type: string;
  locationType: string;
  location: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
}

interface JobsListProps {
  jobs: Job[];
}

export default function JobsList({ jobs }: JobsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [appliedStatus, setAppliedStatus] = useState<string | null>(null);

  const departments = ["All", ...Array.from(new Set(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === "All" || job.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleApply = (jobTitle: string, e: React.FormEvent) => {
    e.preventDefault();
    setAppliedStatus("Application instruction sent! Please email support@musicreset.com");
    setTimeout(() => {
      setAppliedStatus(null);
      setActiveJob(null);
    }, 4000);
  };

  return (
    <div>
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-10 pb-6 border-b border-border/40">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-secondary/30 border border-border/60 rounded-md text-sm outline-none focus:ring-1 focus:ring-foreground transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-4 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedDept === dept
                  ? "bg-foreground text-background"
                  : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 bg-secondary/10 rounded-xl border border-border/40">
          <p className="text-muted-foreground">No open positions found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-secondary/20 rounded-xl border border-border/40 hover:border-border transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-foreground/10 text-foreground rounded uppercase tracking-wider">
                    {job.type}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Exp: {job.experience}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-semibold group-hover:text-foreground/80 transition-colors">
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium mt-1">
                    {job.department}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-border/40">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {job.location} ({job.locationType})
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveJob(job)}
                    className="h-8 px-3 rounded-md border border-border bg-background text-[11px] font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    View Details
                  </button>
                  <a
                    href={`mailto:support@musicreset.com?subject=Application for ${encodeURIComponent(job.title)}`}
                    className="h-8 px-3 rounded-md bg-foreground text-[11px] font-medium text-background hover:bg-foreground/90 transition-colors flex items-center"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {activeJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background w-full max-w-2xl rounded-xl border border-border shadow-lg max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/60 flex items-start justify-between sticky top-0 bg-background/95 backdrop-blur">
              <div>
                <span className="px-2 py-0.5 text-[9px] font-semibold bg-foreground/10 text-foreground rounded uppercase tracking-wider">
                  {activeJob.type}
                </span>
                <h2 className="text-xl font-bold mt-2">{activeJob.title}</h2>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  {activeJob.department} &bull; {activeJob.location} ({activeJob.locationType})
                </p>
              </div>
              <button 
                onClick={() => setActiveJob(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Job Description
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {activeJob.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Core Responsibilities
                </h4>
                <ul className="space-y-2">
                  {activeJob.responsibilities.map((resp, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Requirements
                </h4>
                <ul className="space-y-2">
                  {activeJob.requirements.map((req, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-secondary/30 rounded-lg border border-border/40 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                  <Building className="w-4 h-4" /> Hiring Location &amp; Company
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Reset Networks, Malviya Nagar, New Delhi, Delhi, 110017, India
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border/60 bg-secondary/10 flex items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground font-mono">
                Exp: {activeJob.experience}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveJob(null)}
                  className="h-9 px-4 rounded-md border border-border bg-background text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  Cancel
                </button>
                <a
                  href={`mailto:support@musicreset.com?subject=Application for ${encodeURIComponent(activeJob.title)}`}
                  className="h-9 px-4 rounded-md bg-foreground text-xs font-medium text-background hover:bg-foreground/90 transition-colors flex items-center"
                >
                  Apply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
