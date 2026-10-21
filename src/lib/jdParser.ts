export interface ParsedJobData {
  title?: string;
  department?: string;
  type?: string;
  locationType?: string;
  location?: string;
  experience?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  atsKeywords?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: string;
  currency?: string;
}

const COMMON_DEPARTMENTS: Record<string, string[]> = {
  Creative: [
    "creative",
    "video",
    "editor",
    "graphic",
    "designer",
    "motion",
    "animation",
    "visual",
    "art",
    "multimedia",
    "3d",
    "blender",
    "premiere",
  ],
  Marketing: [
    "marketing",
    "social media",
    "seo",
    "content",
    "growth",
    "copywriter",
    "campaign",
    "digital marketing",
    "community",
    "reels",
  ],
  Engineering: [
    "engineer",
    "developer",
    "software",
    "full stack",
    "backend",
    "frontend",
    "web",
    "react",
    "next.js",
    "node",
    "python",
    "code",
  ],
  Hardware: [
    "hardware",
    "electronics",
    "pcb",
    "circuit",
    "embedded",
    "microcontroller",
    "soldering",
    "kicad",
    "altium",
    "iot",
  ],
  "Hardware Production": [
    "production",
    "assembly",
    "reflow",
    "smt",
    "testing",
    "quality control",
    "manufacturing",
  ],
  "AI & Research": [
    "ai",
    "machine learning",
    "data science",
    "deep learning",
    "pytorch",
    "tensorflow",
    "audio processing",
    "nlp",
  ],
  Finance: [
    "finance",
    "accountant",
    "accounts",
    "tally",
    "tax",
    "audit",
    "billing",
    "gst",
    "payroll",
  ],
  "Human Resources": [
    "hr",
    "human resources",
    "recruiter",
    "talent acquisition",
    "people",
    "onboarding",
  ],
  "Talent Management": [
    "artist",
    "talent",
    "music",
    "curation",
    "artist relations",
    "a&r",
    "licensing",
  ],
};

const POPULAR_SKILLS = [
  "Premiere Pro",
  "After Effects",
  "Photoshop",
  "Illustrator",
  "InDesign",
  "Figma",
  "Blender",
  "DaVinci Resolve",
  "Motion Graphics",
  "Color Grading",
  "Video Editing",
  "Sound Design",
  "Audio Mixing",
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "MongoDB",
  "AWS",
  "Docker",
  "TailwindCSS",
  "REST APIs",
  "Git",
  "GitHub",
  "SEO",
  "Meta Ads",
  "Google Ads",
  "Google Analytics",
  "Social Media Management",
  "Content Strategy",
  "Copywriting",
  "Tally",
  "GST",
  "Altium Designer",
  "KiCad",
  "PCB Layout",
  "Microcontrollers",
  "Soldering",
  "PyTorch",
  "TensorFlow",
];

/**
 * Clean bullet strings by removing leading dashes, asterisks, bullet dots, numbers, emojis, etc.
 */
export function cleanBulletLine(line: string): string {
  return line
    .replace(/^[\s\t]*[•\-\*–—\+►▪▫▸👉✔✓✦\u2022\u2023\u25E6\u2043\u2219]+\s*/, "") // symbols
    .replace(/^[\s\t]*\d+[\.\)]\s*/, "") // 1. or 1)
    .replace(/^\*\*([^*]+)\*\*:\s*/, "$1: ") // bold headers in bullets
    .trim();
}

/**
 * Split text lines into bullet items, taking into account multi-line bullets.
 */
export function parseBulletList(rawText: string): string[] {
  if (!rawText || !rawText.trim()) return [];

  const lines = rawText.split("\n");
  const bullets: string[] = [];
  let currentBullet = "";

  for (let rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      if (currentBullet) {
        bullets.push(currentBullet.trim());
        currentBullet = "";
      }
      continue;
    }

    // Check if this line starts a new bullet
    const isNewBullet =
      /^[•\-\*–—\+►▪▫▸👉✔✓✦\u2022\u2023\u25E6\u2043\u2219]/.test(trimmed) ||
      /^\d+[\.\)]\s/.test(trimmed) ||
      /^[A-Z][\.\)]\s/.test(trimmed);

    if (isNewBullet) {
      if (currentBullet) {
        bullets.push(currentBullet.trim());
      }
      currentBullet = cleanBulletLine(trimmed);
    } else {
      if (currentBullet) {
        // Continuation of previous bullet
        currentBullet += " " + cleanBulletLine(trimmed);
      } else {
        // Line without bullet symbol
        currentBullet = cleanBulletLine(trimmed);
      }
    }
  }

  if (currentBullet) {
    bullets.push(currentBullet.trim());
  }

  return bullets
    .map((b) => b.trim())
    .filter((b) => b.length > 2 && !/^(responsibilities|requirements|duties):?$/i.test(b));
}

/**
 * Parse an entire raw job description (e.g. from ChatGPT, LinkedIn, or text file)
 * and split it into clean, structured fields.
 */
export function parseFullJobDescription(rawInput: string): ParsedJobData {
  if (!rawInput || !rawInput.trim()) return {};

  const result: ParsedJobData = {};
  const normalized = rawInput.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n").map((l) => l.trim());

  // 1. Detect Job Title
  // Look for "Job Title:", "Title:", "Role:", "# <title>", or first line
  for (const line of lines.slice(0, 10)) {
    if (!line) continue;
    const titleMatch = line.match(/^(?:job\s+title|role\s+title|position\s+title|title|role|position)\s*[:\-–]\s*(.+)$/i);
    if (titleMatch && titleMatch[1]) {
      result.title = titleMatch[1].replace(/[*#]/g, "").trim();
      break;
    }
    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch && headingMatch[1] && !/overview|summary|responsibilities|requirements/i.test(headingMatch[1])) {
      result.title = headingMatch[1].replace(/[*]/g, "").trim();
      break;
    }
  }

  if (!result.title && lines[0] && lines[0].length < 70 && !lines[0].includes(":")) {
    result.title = lines[0].replace(/[*#]/g, "").trim();
  }

  // 2. Detect Department from title or content
  const fullTextLower = normalized.toLowerCase();
  for (const [dept, keywords] of Object.entries(COMMON_DEPARTMENTS)) {
    if (keywords.some((kw) => (result.title || "").toLowerCase().includes(kw) || fullTextLower.includes(`department: ${kw}`) || fullTextLower.includes(`dept: ${kw}`))) {
      result.department = dept;
      break;
    }
  }

  // 3. Detect Employment Type
  if (/internship|intern\b/i.test(fullTextLower)) {
    result.type = "Internship";
  } else if (/part[\s-]time/i.test(fullTextLower)) {
    result.type = "Part-time";
  } else if (/contract|freelance/i.test(fullTextLower)) {
    result.type = "Contract";
  } else {
    result.type = "Full-time";
  }

  // 4. Detect Location Setting (On-site, Remote, Hybrid)
  if (/remote\b/i.test(fullTextLower)) {
    result.locationType = "Remote";
  } else if (/hybrid\b/i.test(fullTextLower)) {
    result.locationType = "Hybrid";
  } else {
    result.locationType = "On-site";
  }

  // 5. Detect Experience Level
  if (/fresher|entry[\s-]level|0[\s-]1\s*year/i.test(fullTextLower)) {
    result.experience = "Fresher";
  } else if (/1[\s-–]3\s*years?|1\+?\s*years?/i.test(fullTextLower)) {
    result.experience = "1-3 years";
  } else if (/3[\s-–]5\s*years?|3\+?\s*years?/i.test(fullTextLower)) {
    result.experience = "3-5 years";
  } else if (/5\+?\s*years?|senior/i.test(fullTextLower)) {
    result.experience = "5+ years";
  }

  // 6. Section Partitioning (Summary, Responsibilities, Requirements, Keywords)
  const sections: {
    name: "summary" | "responsibilities" | "requirements" | "keywords" | "other";
    startIndex: number;
    headerLine: string;
  }[] = [];

  const isSummaryHeader = (l: string) =>
    /^(?:#+\s*)?(?:role\s+summary|job\s+summary|summary|about\s+the\s+role|about\s+us|job\s+overview|overview|role\s+overview|the\s+opportunity)\b/i.test(l);

  const isRespHeader = (l: string) =>
    /^(?:#+\s*)?(?:core\s+responsibilities|key\s+responsibilities|responsibilities|what\s+you['’]ll\s+do|duties|key\s+duties|deliverables|what\s+you\s+will\s+do|job\s+responsibilities)\b/i.test(l);

  const isReqHeader = (l: string) =>
    /^(?:#+\s*)?(?:key\s+requirements|requirements|qualifications|what\s+we['’]re\s+looking\s+for|skills\s*&?\s*qualifications|who\s+you\s+are|eligibility|what\s+you\s+need|minimum\s+qualifications)\b/i.test(l);

  const isKeywordHeader = (l: string) =>
    /^(?:#+\s*)?(?:ats\s+keywords|keywords|key\s+skills|skills\s+required|target\s+keywords|technical\s+skills|tools\s*&?\s*technologies)\b/i.test(l);

  lines.forEach((line, index) => {
    if (isRespHeader(line)) {
      sections.push({ name: "responsibilities", startIndex: index, headerLine: line });
    } else if (isReqHeader(line)) {
      sections.push({ name: "requirements", startIndex: index, headerLine: line });
    } else if (isKeywordHeader(line)) {
      sections.push({ name: "keywords", startIndex: index, headerLine: line });
    } else if (isSummaryHeader(line)) {
      sections.push({ name: "summary", startIndex: index, headerLine: line });
    }
  });

  // Extract sections based on split indices
  const getSectionContent = (targetName: string): string => {
    const secIdx = sections.findIndex((s) => s.name === targetName);
    if (secIdx === -1) return "";

    const start = sections[secIdx].startIndex + 1;
    const nextSec = sections[secIdx + 1];
    const end = nextSec ? nextSec.startIndex : lines.length;

    return lines.slice(start, end).join("\n").trim();
  };

  const summaryContent = getSectionContent("summary");
  const respContent = getSectionContent("responsibilities");
  const reqContent = getSectionContent("requirements");
  const kwContent = getSectionContent("keywords");

  // Summary
  if (summaryContent) {
    result.description = summaryContent
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => !/^[-*•]/.test(l))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Fallback for description if no explicit summary section: check top paragraphs before first header
  if (!result.description && sections.length > 0) {
    const topLines = lines.slice(0, sections[0].startIndex);
    const candidateSummary = topLines
      .filter((l) => l && !l.startsWith("#") && !/^(job title|department|location|type|experience|salary)/i.test(l))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (candidateSummary.length > 20) {
      result.description = candidateSummary;
    }
  }

  // Responsibilities
  if (respContent) {
    result.responsibilities = parseBulletList(respContent);
  }

  // Requirements
  if (reqContent) {
    result.requirements = parseBulletList(reqContent);
  }

  // ATS Keywords
  const extractedKeywords = new Set<string>();

  if (kwContent) {
    // Split by commas, newlines, semicolons
    const rawTokens = kwContent
      .replace(/^[•\-\*]\s*/gm, "")
      .split(/[,;\n\t]+/)
      .map((k) => k.replace(/[*#]/g, "").trim())
      .filter((k) => k.length >= 2 && k.length <= 40);

    rawTokens.forEach((k) => extractedKeywords.add(k));
  }

  // Auto-scan full text for popular industry skills if fewer than 5 keywords were found
  if (extractedKeywords.size < 6) {
    for (const skill of POPULAR_SKILLS) {
      const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
      const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, "i");
      if (regex.test(normalized)) {
        extractedKeywords.add(skill);
      }
    }
  }

  if (extractedKeywords.size > 0) {
    result.atsKeywords = Array.from(extractedKeywords);
  }

  // 7. Detect Salary if mentioned (e.g. "₹25,000 - ₹40,000" or "25000 to 40000")
  const salaryMatch = normalized.match(/(?:salary|compensation|ctc|stipend)\s*[:\-–]?\s*(?:[₹$]|inr)?\s*(\d{1,3}(?:,\d{3})*|\d{4,6})\s*(?:[-–to]+)\s*(?:[₹$]|inr)?\s*(\d{1,3}(?:,\d{3})*|\d{4,6})/i);
  if (salaryMatch) {
    const minVal = parseInt(salaryMatch[1].replace(/,/g, ""), 10);
    const maxVal = parseInt(salaryMatch[2].replace(/,/g, ""), 10);
    if (!isNaN(minVal)) result.salaryMin = minVal;
    if (!isNaN(maxVal)) result.salaryMax = maxVal;
  }

  return result;
}
