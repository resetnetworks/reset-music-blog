export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import("pdf-parse");
    const PDFParseClass = pdfParseModule.PDFParse || (pdfParseModule as any).default?.PDFParse;
    
    if (PDFParseClass) {
      const parser = new PDFParseClass({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      
      if (typeof result === "string") {
        return result;
      } else if (result && typeof (result as any).text === "string") {
        return (result as any).text;
      }
    } else if (typeof (pdfParseModule as any).default === "function") {
      const result = await (pdfParseModule as any).default(buffer);
      return result?.text || "";
    }
    return "";
  } catch (err) {
    console.warn("PDF extraction library error, attempting raw text scan fallback:", err);
    try {
      const raw = buffer.toString("latin1");
      // Match text in PDF strings: (text) Tj or [(t)(e)(x)(t)] TJ
      const tjMatches = raw.match(/\(([^()]{2,})\)\s*Tj/g) || [];
      if (tjMatches.length > 0) {
        return tjMatches.map(m => m.replace(/^\(/, "").replace(/\)\s*Tj$/, "")).join(" ");
      }
      // General alphanumeric words scan if valid text stream
      const words = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|[a-zA-Z]{3,}/g) || [];
      return words.join(" ");
    } catch {
      return "";
    }
  }
}

export interface AtsMatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
}

export function calculateAtsScore(
  resumeText: string,
  atsKeywords: string[]
): AtsMatchResult {
  if (!atsKeywords || atsKeywords.length === 0) {
    return {
      score: 100,
      matchedKeywords: [],
      missingKeywords: [],
    };
  }

  const normalizedText = (resumeText || "")
    .toLowerCase()
    .replace(/[^\w\s\+\#\.\-]/g, " ") // preserve characters like C++, C#, .NET, Node.js
    .replace(/\s+/g, " ");

  const matched: string[] = [];
  const missing: string[] = [];

  for (const rawKeyword of atsKeywords) {
    const keyword = rawKeyword.trim();
    if (!keyword) continue;

    const lowerKeyword = keyword.toLowerCase();
    
    // Check if whole word or phrase exists in normalized text
    // Escape regex special chars except + and #
    const escaped = lowerKeyword.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`(^|\\b|\\s)${escaped}(\\b|\\s|$)`, "i");

    if (regex.test(normalizedText) || normalizedText.includes(lowerKeyword)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const total = matched.length + missing.length;
  const score = total > 0 ? Math.round((matched.length / total) * 100) : 100;

  return {
    score,
    matchedKeywords: matched,
    missingKeywords: missing,
  };
}
