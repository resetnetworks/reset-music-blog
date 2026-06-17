import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JobsList from "./JobsList";

export const metadata = {
  title: "Careers | Reset Music",
  description: "Join the team at Reset Music. Browse open positions in engineering, hardware production, operations, talent management, and finance.",
};

const JOBS_DATA = [
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    department: "Engineering",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "1+ years",
    description: "Looking for a DevOps Engineer to manage CI/CD pipelines, cloud infrastructure, and system reliability.",
    responsibilities: [
      "Maintain and configure CI/CD build scripts and release automation pipelines.",
      "Configure, manage, and optimize AWS cloud workloads and VPS systems.",
      "Collaborate with developers to automate server provisioning and application deployments.",
      "Monitor system uptime, error alerts, and implement access control best practices."
    ],
    requirements: [
      "Strong hands-on experience with AWS, Terraform, Docker, and GitHub Actions.",
      "Familiarity with server monitoring and log management tools.",
      "1+ years of professional experience in DevOps, systems engineering, or backend automation."
    ]
  },
  {
    id: "industrial-engineer",
    title: "Industrial Engineer",
    department: "Operations",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "2+ years",
    description: "Optimize production workflows and design efficient operational systems for scaling manufacturing.",
    responsibilities: [
      "Analyze and design optimized workflows for product assembly and electronics manufacturing.",
      "Improve workspace layout, space utilization, and assembly lines.",
      "Implement rigorous quality control and quality assurance testing standards.",
      "Optimize material routing, vendor shipping schedules, and parts storage systems."
    ],
    requirements: [
      "Degree in Industrial Engineering, Operations Research, or Manufacturing Technology.",
      "Familiarity with lean manufacturing methodologies, process mapping, and CAD tools.",
      "2+ years of active experience in manufacturing operations or electronics fabrication environments."
    ]
  },
  {
    id: "hr-manager",
    title: "HR Manager",
    department: "Human Resources",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "2+ years",
    description: "We’re seeking an HR Manager to lead recruitment, employee engagement, and HR strategy.",
    responsibilities: [
      "Lead full-cycle recruitment pipelines for engineering, hardware design, and marketing roles.",
      "Design onboarding, training programs, and performance review cycles.",
      "Manage company policies, payroll details, legal compliance, and benefits.",
      "Organize team-building events and foster a healthy collaborative workspace culture."
    ],
    requirements: [
      "Degree in Human Resources, Business Administration, or related organizational fields.",
      "Excellent written, verbal, and interpersonal communication skills.",
      "2+ years of professional HR management or recruitment coordination experience."
    ]
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    department: "AI & Research",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "3+ years",
    description: "Develop and deploy machine learning models for recommendation, classification, and audio analysis.",
    responsibilities: [
      "Design, train, and test recommendation algorithms for music and editorial curation.",
      "Build audio classification and feature extraction models for music track waveforms.",
      "Deploy ML models as scalable, low-latency APIs in serverless or cloud container architectures.",
      "Collaborate with the data engineering team to format datasets and set up model training pipelines."
    ],
    requirements: [
      "Strong proficiency in Python, PyTorch, TensorFlow, or equivalent ML libraries.",
      "Solid understanding of digital signal processing, audio classification, or user recommendation methods.",
      "3+ years of experience training and maintaining machine learning systems in production."
    ]
  },
  {
    id: "accountant",
    title: "Accountant",
    department: "Finance",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "3+ years",
    description: "Handle accounting, bookkeeping, and financial reporting for a growing tech company.",
    responsibilities: [
      "Manage company ledgers, accounts payable, accounts receivable, and bookkeeping transactions.",
      "Prepare monthly financial statements, balance sheets, and statutory tax filings (GST, Income Tax).",
      "Perform regular bank reconciliation, credit checks, and expense audit approvals.",
      "Assist corporate managers in financial forecast modeling and budget monitoring."
    ],
    requirements: [
      "Degree in Accounting, Commerce, or Finance.",
      "Fluency in standard accounting tools (QuickBooks, Tally, Zoho Books, or similar).",
      "3+ years of experience managing business accounting and reporting procedures."
    ]
  },
  {
    id: "artist-manager",
    title: "Artist Manager",
    department: "Talent Management",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "1+ years",
    description: "Work with artists to manage collaborations, schedules, contracts, and promotions.",
    responsibilities: [
      "Serve as the primary point of contact for collaborating musicians, producers, and creators.",
      "Coordinate release agreements, royalty share split contracts, and deliverables.",
      "Manage release calendars, social announcements, and digital marketing promotion campaigns.",
      "Organize podcast recordings, live sessions, interviews, and community showcases."
    ],
    requirements: [
      "1+ years of experience in the music industry, talent representation, or creative agency environments.",
      "Strong coordination, networking, and written communications skills.",
      "Basic understanding of music copyright, licensing, and streaming distribution platforms."
    ]
  },
  {
    id: "pcb-designer",
    title: "PCB Designer",
    department: "Hardware",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "2+ years",
    description: "Design high-quality PCB layouts for music hardware and embedded systems.",
    responsibilities: [
      "Design multi-layer printed circuit board (PCB) layouts for high-fidelity audio hardware.",
      "Coordinate component selection, manage product BOMs (Bill of Materials), and consult with vendors.",
      "Perform circuit layout calculations, signal routing, and EMI shielding optimization checks.",
      "Compile board fabrication packages (Gerber data, drill maps, pick-and-place offsets)."
    ],
    requirements: [
      "Proficiency with EDA/PCB design suites (Altium Designer, KiCad, or Autodesk EAGLE).",
      "Familiarity with analog audio circuits, power supply design, and digital microcontrollers.",
      "2+ years of solid experience translating board schematics to fabrication-ready designs."
    ]
  },
  {
    id: "pcb-assembler",
    title: "PCB Assembler",
    department: "Hardware Production",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "1+ year",
    description: "Assemble and test printed circuit boards for audio hardware products.",
    responsibilities: [
      "Solder surface-mount (SMD) and through-hole electronic components manually onto circuit boards.",
      "Operate, configure, and monitor pick-and-place assembly machines and reflow ovens.",
      "Perform electrical testing and diagnostic troubleshooting on completed audio hardware boards.",
      "Maintain a safe, ESD-compliant hardware assembly station and inventory log."
    ],
    requirements: [
      "Outstanding precision soldering skills for fine-pitch components (0603 packages, ICs).",
      "Ability to interpret PCB schematics, layouts, and assembly reference diagrams.",
      "1+ years of professional electronics assembly, rework, or testing experience."
    ]
  }
];

export default function CareersPage() {
  // Generate JobPosting Structured Data in JSON-LD format for Google Search / Google Jobs Indexing
  const jsonLdData = JOBS_DATA.map((job) => ({
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": `${job.description} Core Responsibilities: ${job.responsibilities.join(" ")} Requirements: ${job.requirements.join(" ")}`,
    "datePosted": "2026-06-17",
    "validThrough": "2027-06-17",
    "employmentType": "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Reset Music",
      "sameAs": "https://blog.musicreset.com"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "45 Maharishi Dayanand Road, Corner Market, Malviya Nagar",
        "addressLocality": "New Delhi",
        "addressRegion": "Delhi",
        "postalCode": "110017",
        "addressCountry": "IN"
      }
    },
    "directApply": true
  }));

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      {/* Google Jobs Schema Script Injection */}
      {jsonLdData.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      {/* Hero Header */}
      <div className="max-w-3xl mb-16">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6 leading-[1.15]">
          Join the Reset Music Team
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Help us design high-quality hardware, write insightful editorials, and build dynamic recommendations for a community of passionate music makers.
        </p>
      </div>

      {/* Jobs Interactive Area */}
      <JobsList jobs={JOBS_DATA} />

      {/* General application info */}
      <div className="mt-20 border-t border-border/40 pt-16">
        <div className="p-8 md:p-12 bg-secondary/40 rounded-xl border border-border/40 text-center max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-3">General Submissions</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Don't see a specific listing that fits your profile? Send us your resume anyway. We're always looking for outstanding talents.
          </p>
          <a
            href="mailto:support@musicreset.com?subject=General Career Inquiry"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Submit Application
          </a>
        </div>
      </div>
    </div>
  );
}
