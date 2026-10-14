import dbConnect from "./mongoose";
import Job from "@/models/Job";

export const INITIAL_JOBS = [
  {
    slug: "social-media-manager",
    title: "Social Media Manager",
    department: "Marketing",
    type: "Intern / Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "Fresher",
    description: "Develop and execute digital marketing and social media strategies that grow brand awareness, increase audience engagement, and drive customer acquisition across RESET NETWORKS’ digital platforms.",
    responsibilities: [
      "Plan, execute, and optimize social media campaigns across multiple digital platforms.",
      "Manage content calendars, campaign schedules, and promotional activities for artists, events, and product launches.",
      "Launch and monitor paid advertising campaigns while tracking performance and optimizing ROI.",
      "Analyze campaign metrics, identify growth opportunities, and collaborate with creative teams to deliver engaging marketing content."
    ],
    requirements: [
      "Degree in Marketing, Digital Marketing, Communications, Business Administration, or a related field.",
      "Proficiency in Meta Business Suite, Meta Ads Manager, Google Ads, Google Analytics, and social media management tools.",
      "Freshers can apply. Prior experience in social media management, digital marketing, or performance marketing is a plus."
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 20000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "video-editor-graphic-designer",
    title: "Video Editor & Graphic Designer",
    department: "Creative",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "2+ years",
    description: "Design compelling visual content and produce high-quality videos that strengthen the RESET NETWORKS brand across digital platforms, artist campaigns, events, and marketing initiatives.",
    responsibilities: [
      "Design creative assets for social media platforms.",
      "Edit promotional videos, event recaps, advertisements, and short-form content for digital platforms.",
      "Create engaging motion graphics, animated titles, visual effects, and branded video content.",
      "Develop basic 3D animations and product visualizations using Blender to support marketing and product storytelling.",
      "Collaborate with marketing, product, and development teams to deliver creative projects on schedule while maintaining brand consistency."
    ],
    requirements: [
      "Degree in Graphic Design, Visual Communication, Animation, Multimedia, or a related field.",
      "Proficiency in Adobe Photoshop, Adobe Illustrator, Adobe Premiere Pro, Adobe After Effects, Blender, and other motion design tools.",
      "Strong understanding of typography, layout design, video editing, motion graphics, color theory, and visual storytelling.",
      "Familiarity with branding, social media content creation, and digital marketing creatives.",
      "2+ years of professional experience in graphic design, video editing, motion graphics, or multimedia production.",
      "Strong portfolio showcasing graphic design, video editing, motion graphics, and creative storytelling projects."
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 25000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "devops-engineer",
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
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 35000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "industrial-engineer",
    title: "Industrial Engineer",
    department: "Operations",
    type: "Intern / Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "Fresher",
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
      "Freshers can apply. Prior experience in manufacturing operations or electronics fabrication environments is a plus."
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 20000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "hr-manager",
    title: "HR Manager",
    department: "Human Resources",
    type: "Intern / Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "Fresher",
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
      "Freshers can apply. Prior HR management or recruitment coordination experience is a plus."
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 20000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "ml-engineer",
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
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 50000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "accountant",
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
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 30000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "artist-manager",
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
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 25000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "pcb-designer",
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
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 35000, currency: "INR", period: "MONTH" },
  },
  {
    slug: "pcb-assembler",
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
    ],
    applyUrl: "",
    status: "active",
    salary: { min: 22000, currency: "INR", period: "MONTH" },
  }
];

export async function ensureJobsSeeded() {
  // Automatic re-seeding disabled so Admin/HR has full manual control over jobs
}
