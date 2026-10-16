import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JobsList from "./JobsList";
import OpinionStageWidget from "./OpinionStageWidget";
import dbConnect from "@/lib/mongoose";
import Job from "@/models/Job";
import { ensureJobsSeeded, INITIAL_JOBS } from "@/lib/seedJobs";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Careers | Reset Music",
  description: "Join the team at Reset Music. Browse open positions in engineering, hardware production, operations, talent management, and finance.",
  openGraph: {
    title: "Careers | Reset Music",
    description: "Join the team at Reset Music. Browse open positions in engineering, hardware production, operations, talent management, and finance.",
    url: "https://blog.musicreset.com/careers",
    siteName: "Reset Music",
    type: "website",
    images: [
      {
        url: "https://musicreset.com/og-image-1200x630.jpg",
        width: 1200,
        height: 630,
        alt: "Careers at Reset Music",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers | Reset Music",
    description: "Join the team at Reset Music. Browse open positions in engineering, hardware production, operations, talent management, and finance.",
    images: ["https://musicreset.com/og-image-1200x630.jpg"],
  },
};

function mapEmploymentType(type: string): string | string[] {
  const lower = (type || "").toLowerCase();
  if (lower.includes("intern") && lower.includes("full")) return ["INTERN", "FULL_TIME"];
  if (lower.includes("intern")) return "INTERN";
  if (lower.includes("part")) return "PART_TIME";
  if (lower.includes("contract")) return "CONTRACTOR";
  return "FULL_TIME";
}

export default async function CareersPage() {
  await dbConnect();

  const activeJobs = await Job.find({ status: "active" }).sort({ createdAt: -1 }).lean();

  const jobsData = activeJobs.map((j: any) => ({
    id: j.slug || j._id?.toString() || j.id,
    mongoId: j._id?.toString(),
    title: j.title,
    department: j.department,
    type: j.type,
    locationType: j.locationType,
    location: j.location,
    experience: j.experience,
    description: j.description,
    responsibilities: j.responsibilities || [],
    requirements: j.requirements || [],
    customQuestions: (j.customQuestions || []).map((q: any) => ({
      id: q.id || (q._id ? q._id.toString() : ""),
      question: q.question || "",
      type: q.type || "text",
      options: Array.isArray(q.options) ? [...q.options] : [],
      scaleMin: q.scaleMin ?? 1,
      scaleMax: q.scaleMax ?? 5,
      scaleMinLabel: q.scaleMinLabel || "",
      scaleMaxLabel: q.scaleMaxLabel || "",
      required: Boolean(q.required),
    })),
    atsKeywords: Array.isArray(j.atsKeywords) ? [...j.atsKeywords] : [],
  }));

  // Generate Google Jobs Structured Data (JSON-LD) dynamically
  const jsonLdData = activeJobs.map((job: any) => {
    const isRemote = job.locationType === "Remote";
    const postedDate = job.datePosted ? new Date(job.datePosted).toISOString().split("T")[0] : "2026-06-17";
    const validThroughDate = job.validThrough ? new Date(job.validThrough).toISOString().split("T")[0] : "2027-06-17";

    const schema: any = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": job.title,
      "description": `<p>${job.description}</p><p><strong>Core Responsibilities:</strong></p><ul>${(job.responsibilities || []).map((r: string) => `<li>${r}</li>`).join("")}</ul><p><strong>Requirements:</strong></p><ul>${(job.requirements || []).map((r: string) => `<li>${r}</li>`).join("")}</ul>`,
      "datePosted": postedDate,
      "validThrough": validThroughDate,
      "employmentType": mapEmploymentType(job.type),
      "hiringOrganization": {
        "@type": "Organization",
        "name": "Reset Music",
        "sameAs": "https://blog.musicreset.com",
      },
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": job.salary?.currency || "INR",
        "value": {
          "@type": "QuantitativeValue",
          "value": job.salary?.min || 20000,
          "unitText": job.salary?.period || "MONTH",
        },
      },
      "directApply": true,
    };

    if (isRemote) {
      schema.jobLocationType = "TELECOMMUTE";
      schema.applicantLocationRequirements = {
        "@type": "Country",
        "name": "India",
      };
    } else {
      schema.jobLocation = {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "45 Maharishi Dayanand Road, Corner Market, Malviya Nagar",
          "addressLocality": "New Delhi",
          "addressRegion": "Delhi",
          "postalCode": "110017",
          "addressCountry": "IN",
        },
      };
    }

    return schema;
  });

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
      <JobsList jobs={jobsData} />

      {/* Hiring Policy Section */}
      <div className="mt-20 border-t border-border/40 pt-16 max-w-3xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6">Hiring Policy</h2>
        <div className="text-muted-foreground space-y-4 leading-relaxed">
          <p>
            <strong>RESET NETWORKS (OPC) PRIVATE LIMITED</strong> is a DPIIT-recognized and certified startup under the Startup India scheme. We are an early-stage platform exploring new developments in mixed-media, electronic, and digital art forms.
          </p>
          <p>
            We are committed to exceptional artistic quality and interdisciplinary innovation. Through our international network of creators, curators, and collaborators, we foster meaningful experimentation across art, music, science, and technology.
          </p>
          <p>
            Our artists and collaborators work across the world and different time zones. This diversity of backgrounds and distributed culture fuels creativity, while flexibility and independence help us build sustainable, long-term collaborations.
          </p>
          <p className="pt-2 text-foreground font-medium">
            As a small organization, every collaborator is an integral part of the team. We look for individuals who:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Work independently, take initiative, and maintain clear, consistent communication with team members.</li>
            <li>Have a genuine affinity for art, music, science, and technology.</li>
            <li>Write and speak fluent English, with the ability to express ideas simply and clearly.</li>
            <li>Are flexible and responsive to evolving project requirements.</li>
            <li>Can contribute effectively in a fast-paced, constantly changing, and multitasking environment.</li>
            <li>Are open to undertaking role-specific training, where required.</li>
          </ul>
        </div>
      </div>

      {/* Application Form Widget */}
      <div className="mt-16 mb-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center">Apply Now</h2>
        <OpinionStageWidget />
      </div>
    </div>
  );
}
