import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JobsList from "./JobsList";

export const metadata = {
  title: "Careers | Reset Music",
  description: "Join the team at Reset Music. Browse open positions in engineering, hardware production, operations, talent management, and finance.",
};

const JOBS_DATA = [
  {
    id: "social-media-manager",
    title: "Social Media Manager",
    department: "Marketing",
    type: "Full-time",
    locationType: "On-site",
    location: "Malviya Nagar, New Delhi",
    experience: "2+ years",
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
      "2+ years of professional experience in social media management, digital marketing, or performance marketing with strong analytical and communication skills."
    ]
  },
  {
    id: "video-editor-graphic-designer",
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
    ]
  },
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
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "INR",
      "value": {
        "@type": "QuantitativeValue",
        "value": 20000,
        "unitText": "MONTH"
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
            href="mailto:careers@musicreset.com?subject=General Career Inquiry"
            className="inline-flex h-10 items-center justify-center rounded-md bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Submit Application
          </a>
        </div>
      </div>
    </div>
  );
}
