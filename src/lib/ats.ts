export interface AtsMatchResult {
  score: number;
  resumeScore: number;
  screeningScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  scoredAnswers?: Array<{
    questionId: string;
    question: string;
    answer: string;
    score: number;
  }>;
}

/**
 * Evaluates and scores an individual screening question answer (0 - 100).
 */
export function scoreSingleAnswer(
  answerText: string,
  questionDef?: {
    type?: string;
    options?: string[];
    scaleMin?: number;
    scaleMax?: number;
    required?: boolean;
    question?: string;
  }
): number {
  if (!answerText || !answerText.trim()) {
    return 0;
  }

  const trimmed = answerText.trim();
  const lower = trimmed.toLowerCase();

  // 1. Explicit fraction pattern: "1 / 5", "5 / 5", "3 / 5", "4/5", etc.
  const fractionMatch = trimmed.match(/(?:^|\b)(\d+)\s*\/\s*(\d+)/);
  if (fractionMatch) {
    const val = parseInt(fractionMatch[1], 10);
    const max = parseInt(fractionMatch[2], 10);
    if (max > 0) {
      return Math.min(100, Math.max(0, Math.round((val / max) * 100)));
    }
  }

  // 2. Scale / numeric rating (1 to 5)
  if (questionDef?.type === "scale" || /rate\s+your/i.test(questionDef?.question || "")) {
    const numMatch = trimmed.match(/^([1-5])\b/);
    if (numMatch) {
      const val = parseInt(numMatch[1], 10);
      const max = questionDef?.scaleMax || 5;
      return Math.min(100, Math.max(0, Math.round((val / max) * 100)));
    }
  }

  // 3. Boolean / Yes-No questions (e.g. on-site studio availability, reddit experience)
  if (
    questionDef?.type === "boolean" ||
    lower === "yes" ||
    lower === "no" ||
    lower.startsWith("yes,") ||
    lower.startsWith("no,")
  ) {
    if (lower.startsWith("yes") || lower === "true" || lower.includes("available")) {
      return 100;
    }
    if (lower.startsWith("no") || lower === "false" || lower.includes("not available")) {
      return 0;
    }
  }

  // 4. Experience-level questions (e.g. "How much professional experience...", "How much relevant experience...")
  if (
    /experience/i.test(questionDef?.question || "") ||
    /fresher|year|month/i.test(lower)
  ) {
    if (/4\+\s*years|senior|lead|5\+\s*years/i.test(lower)) {
      return 100;
    }
    if (/2[–\-]4\s*years|more than 2 years|3\+\s*years/i.test(lower)) {
      return 90;
    }
    if (/1[–\-]2\s*years|1\+\s*years/i.test(lower)) {
      return 75;
    }
    if (/6[–\-]12\s*months/i.test(lower)) {
      return 60;
    }
    if (/less than 6 months|less than 1 year|fresher/i.test(lower)) {
      return 45;
    }
  }

  // 5. Options array matching
  if (questionDef?.options && questionDef.options.length > 0) {
    const optIndex = questionDef.options.findIndex(
      (opt) =>
        opt.trim().toLowerCase() === lower ||
        lower.startsWith(opt.trim().toLowerCase()) ||
        opt.trim().toLowerCase().startsWith(lower)
    );
    if (optIndex >= 0) {
      if (questionDef.options.length === 1) return 100;
      const base = 35;
      const progress = (optIndex / (questionDef.options.length - 1)) * (100 - base);
      return Math.round(base + progress);
    }
  }

  // 6. Portfolio / Link / Showreel questions
  if (
    /portfolio|showreel|link|website|drive|behance|github/i.test(
      questionDef?.question || ""
    )
  ) {
    const isUrl =
      /https?:\/\/[^\s]+|drive\.google\.com|behance\.net|notion\.site|framer\.website|artstation\.com|youtube\.com|vimeo\.com|github\.com|\.[a-z]{2,}(\/|$)/i.test(
        trimmed
      );
    if (isUrl) {
      return 100;
    }
    if (lower === "no" || lower === "none" || lower === "n/a" || lower === "na") {
      return 0;
    }
  }

  // 7. General text responses
  if (lower === "no" || lower === "none" || lower === "n/a" || lower === "na") {
    return 10;
  }
  if (trimmed.length >= 10) {
    return 80;
  }
  if (trimmed.length > 0) {
    return 50;
  }

  return 0;
}

/**
 * Calculates ATS score taking into account both the candidate's resume keywords
 * and their answered screening questions (ratings, experience, software proficiency, availability).
 */
export function calculateAtsScore(
  resumeText: string,
  atsKeywords: string[],
  answers?: Array<{ questionId: string; question: string; answer: string; score?: number }>,
  customQuestions?: Array<{
    id: string;
    question: string;
    type: string;
    options?: string[];
    scaleMin?: number;
    scaleMax?: number;
    required?: boolean;
  }>
): AtsMatchResult {
  const normalizedText = (resumeText || "")
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\-]/g, " ")
    .replace(/\s+/g, " ");

  const resumeMatched: string[] = [];
  const resumeMissing: string[] = [];

  for (const rawKeyword of atsKeywords || []) {
    const keyword = rawKeyword.trim();
    if (!keyword) continue;

    const lowerKeyword = keyword.toLowerCase();
    const escaped = lowerKeyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, "i");

    const simplifiedKeyword = lowerKeyword
      .replace(/^(adobe|ms|microsoft|google)\s+/i, "")
      .trim();

    const matchesDirect = regex.test(normalizedText) || normalizedText.includes(lowerKeyword);
    const matchesSimplified =
      simplifiedKeyword.length >= 4 &&
      (normalizedText.includes(simplifiedKeyword) ||
        new RegExp(`(^|\\b|\\s)${simplifiedKeyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(\\b|\\s|$)`, "i").test(
          normalizedText
        ));

    if (matchesDirect || matchesSimplified) {
      resumeMatched.push(keyword);
    } else {
      resumeMissing.push(keyword);
    }
  }

  const totalKeywords = (atsKeywords || []).length;
  const resumeScore =
    totalKeywords > 0
      ? Math.round((resumeMatched.length / totalKeywords) * 100)
      : 100;

  // Process and score screening answers
  let scoredAnswers: Array<{
    questionId: string;
    question: string;
    answer: string;
    score: number;
  }> = [];
  let screeningScore = 0;
  const verifiedKeywords = new Set<string>(resumeMatched);

  if (answers && answers.length > 0) {
    let totalAnswerPoints = 0;

    scoredAnswers = answers.map((ans) => {
      const qDef = (customQuestions || []).find(
        (q) =>
          q.id === ans.questionId ||
          q.question.trim().toLowerCase() === (ans.question || "").trim().toLowerCase()
      );
      const answerScore = scoreSingleAnswer(ans.answer, qDef);
      totalAnswerPoints += answerScore;

      // If candidate scored >= 60% on a question related to an ATS keyword, verify that keyword
      if (answerScore >= 60) {
        const combinedText = `${ans.question} ${ans.answer}`.toLowerCase();
        for (const kw of atsKeywords || []) {
          const lkw = kw.toLowerCase();
          const simplified = lkw.replace(/^(adobe|ms|microsoft|google)\s+/i, "").trim();
          if (combinedText.includes(lkw) || (simplified.length >= 4 && combinedText.includes(simplified))) {
            verifiedKeywords.add(kw);
          }
        }
      }

      return {
        questionId: ans.questionId,
        question: ans.question,
        answer: ans.answer,
        score: answerScore,
      };
    });

    screeningScore = Math.round(totalAnswerPoints / scoredAnswers.length);
  }

  const finalMatched = Array.from(verifiedKeywords);
  const finalMissing = (atsKeywords || []).filter((kw) => !verifiedKeywords.has(kw));

  // Blend scores:
  // If candidate submitted screening questions: 40% resume + 60% screening questions
  // If no questions exist or no answers submitted: 100% resume score
  let finalScore: number;
  if (answers && answers.length > 0) {
    if (totalKeywords > 0) {
      finalScore = Math.round(resumeScore * 0.4 + screeningScore * 0.6);
    } else {
      finalScore = screeningScore;
    }
  } else {
    finalScore = resumeScore;
  }

  finalScore = Math.min(100, Math.max(0, finalScore));

  return {
    score: finalScore,
    resumeScore,
    screeningScore,
    matchedKeywords: finalMatched,
    missingKeywords: finalMissing,
    scoredAnswers,
  };
}

// PDF syntax keywords that should NEVER pollute candidate resume text
const PDF_SYNTAX_KEYWORDS = new Set([
  "pdf", "obj", "endobj", "stream", "endstream", "xref", "trailer", "startxref",
  "catalog", "pages", "page", "metadata", "structtreeroot", "markinfo", "marked",
  "viewerpreferences", "outlines", "outputintents", "outputintent", "type", "resources",
  "font", "extgstate", "procset", "xobject", "mediabox", "bleedbox", "trimbox", "cropbox",
  "rotate", "structparents", "structelem", "parenttree", "parenttreenextkey", "idtree",
  "limits", "nums", "names", "length", "filter", "flatedecode", "bbox", "group", "transparency",
  "annot", "annots", "subtype", "link", "border", "rect", "destoutputprofile", "curv", "xyz",
  "desc", "cprt", "tech", "lumi", "meas", "bkpt", "acsp", "identity", "descendantfonts",
  "tounicode", "fontdescriptor", "cidfonttype", "cidtogidmap", "cidsysteminfo", "fontname",
  "flags", "ascent", "descent", "stemv", "capheight", "italicangle", "fontbbox", "fontfile",
  "true", "false", "null", "devicergb", "devicegray", "devicecmyk", "iccbased",
  "bitspercomponent", "width", "height", "colorspace", "action", "uri", "contents",
  "displaydoctitle", "gts", "pdfa", "info", "srgb", "iec", "outputcondition",
  "outputconditionidentifier", "registryname", "kids", "count", "parent", "tabs",
  "xml", "xpacket", "begin", "mpcehihzreszntczkc", "rdf", "xmlns", "about", "purl",
  "elements", "adobe", "xap", "pdfuaid", "language", "format", "creatortool", "createdate",
  "modifydate", "metadatadate", "part", "alt", "seq", "creator", "description",
  "lbody", "objr", "normal", "basefont", "encoding", "span", "figure", "trapped"
]);

/**
 * Extracts clean, human-readable text from a PDF buffer.
 * Supports standard PDFs, Canva resumes, and Tagged PDFs.
 * Configures native pdfjs-dist worker properly to prevent fallback to raw PDF bytecode.
 */
export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) {
    return "";
  }

  // Ensure an independent, standard Uint8Array with byte offset 0.
  // This avoids the fatal `Please provide binary data as Uint8Array, rather than Buffer`
  // thrown by pdfjs-dist in cross-realm Node.js / Next.js server environments.
  const uint8Data = new Uint8Array(
    buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  );

  // 1. Primary Engine: Native pdfjs-dist
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    try {
      // @ts-ignore
      await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
    } catch {
      // Continue if worker is already configured
    }

    const loadingTask = pdfjs.getDocument({
      data: uint8Data,
      verbosity: 0,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const doc = await loadingTask.promise;
    const pagesText: string[] = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => (typeof item?.str === "string" ? item.str : ""))
        .filter(Boolean)
        .join(" ");

      if (pageText.trim()) {
        pagesText.push(pageText.trim());
      }
      page.cleanup();
    }

    await doc.destroy();
    const result = pagesText.join("\n\n").trim();
    if (result.length > 20) {
      return result;
    }
  } catch (pdfjsErr) {
    console.warn("pdfjs-dist extraction notice (trying fallback):", (pdfjsErr as any)?.message || pdfjsErr);
  }

  // 2. Secondary Engine: pdf-parse with strict Uint8Array
  try {
    const pdfParseModule = await import("pdf-parse");
    const PDFParseClass = pdfParseModule.PDFParse || (pdfParseModule as any).default?.PDFParse;

    if (PDFParseClass) {
      const parser = new PDFParseClass({ data: uint8Data });
      const parseResult = await parser.getText();
      await parser.destroy();

      const text = typeof parseResult === "string" ? parseResult : parseResult?.text;
      if (typeof text === "string" && text.trim().length > 20) {
        return text.trim();
      }
    }
  } catch (pdfParseErr) {
    console.warn("pdf-parse secondary engine notice:", (pdfParseErr as any)?.message || pdfParseErr);
  }

  // 3. Tertiary Fallback: Tagged Elements & String Extraction (strictly filtering PDF bytecode)
  try {
    const raw = buffer.toString("latin1");

    // Match text strings inside parentheses: (Some text) Tj
    const tjMatches = raw.match(/\(([^()]{2,})\)\s*Tj/g) || [];
    if (tjMatches.length > 5) {
      const extracted = tjMatches
        .map((m) => m.replace(/^\(/, "").replace(/\)\s*Tj$/, "").trim())
        .filter((w) => w.length > 0 && !PDF_SYNTAX_KEYWORDS.has(w.toLowerCase()))
        .join(" ");
      if (extracted.length > 20) {
        return extracted;
      }
    }

    // Match tagged /StructElem elements often used by Canva
    const structMatches = raw.match(/StructElem\s+([A-Za-z0-9\s.,/@+_-]{3,50})\s+endobj/g) || [];
    if (structMatches.length > 3) {
      const extracted = structMatches
        .map((m) => m.replace(/^StructElem\s+/, "").replace(/\s+endobj$/, "").trim())
        .filter((w) => w.length > 1 && !PDF_SYNTAX_KEYWORDS.has(w.toLowerCase()))
        .join(" ");
      if (extracted.length > 20) {
        return extracted;
      }
    }

    // If no text streams or tagged elements exist, it is an image/scanned PDF without OCR
    return "";
  } catch {
    return "";
  }
}

