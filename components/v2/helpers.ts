/* ──────────────────────────────────────────────────────────────────────
   helpers.ts — Shared formatting helpers for VentureLens V2 components
   ────────────────────────────────────────────────────────────────────── */

/**
 * Extract a short numeric/currency value from a potentially long AI-generated string.
 * Strips parenthetical explanations and tries to find a compact metric.
 */
export function extractShortValue(text: string): string {
  if (!text) return "\u2014";

  // Strip parenthetical text: "R$50K (estimated based on early traction)" → "R$50K"
  const clean = text.replace(/\s*\(.*?\)/g, "").trim();

  // If already short, return as-is
  if (clean.length <= 20) return clean || "\u2014";

  // Try to extract a currency/numeric value
  const match = clean.match(/[R$€£¥]*\s*[\d,.]+\s*[KMBTkmbt%]*/);
  if (match) return match[0].trim();

  // Fallback: truncate
  return clean.substring(0, 18) + "\u2026";
}

/**
 * Dynamic font size for TAM/SAM/SOM values based on text length.
 */
export function tamFontSize(text: string): string {
  if (!text) return "2rem";
  if (text.length < 15) return "2rem";
  if (text.length < 40) return "1.4rem";
  return "1.1rem";
}

/**
 * Truncate TAM/SAM/SOM values at 80 chars.
 */
export function tamTruncate(text: string, max = 80): string {
  if (!text) return "N/D";
  if (text.length > max) return text.substring(0, max) + "...";
  return text;
}

/**
 * Try to extract a funding amount from competitor description text.
 */
export function extractFunding(text: string): string {
  const match = text.match(/\$[\d,.]+\s*[KMBTkmbt]?i?/i);
  return match ? match[0] : "\u2014";
}

/**
 * Parse a competitor text string into name + description.
 * Handles "Name (description)", "Name: description", "Name — description" patterns.
 */
export function parseCompetitor(text: string): { name: string; description: string } {
  // Pattern: "Name (description)"
  const parenMatch = text.match(/^([^(]+)\s*\((.+)\)\s*$/);
  if (parenMatch) return { name: parenMatch[1].trim(), description: parenMatch[2].trim() };

  // Pattern: "Name: description" or "Name — description"
  const dashMatch = text.match(/^([^:\u2013\u2014\u2015\u2212.]+?)\s*[:\u2013\u2014\u2015\u2212.]\s*([\s\S]+)$/);
  if (dashMatch) return { name: dashMatch[1].trim(), description: dashMatch[2].trim() };

  // Fallback: use first 40 chars as name
  return {
    name: text.length > 40 ? text.substring(0, 40) : text,
    description: "",
  };
}

/**
 * Split a risk text into title + description.
 * If the text is long (>60 chars), splits at the first period.
 * Otherwise, uses the first ~10 words as title.
 */
export function splitRiskText(text: string): { title: string; description: string } {
  if (!text) return { title: "", description: "" };

  // If short enough, it's all title
  if (text.length <= 60) return { title: text, description: "" };

  // Try splitting at first period
  const periodIdx = text.indexOf(".");
  if (periodIdx > 0 && periodIdx < 100) {
    return {
      title: text.substring(0, periodIdx + 1).trim(),
      description: text.substring(periodIdx + 1).trim(),
    };
  }

  // Fallback: first 10 words
  const words = text.split(/\s+/);
  if (words.length > 10) {
    return {
      title: words.slice(0, 10).join(" ") + "\u2026",
      description: words.slice(10).join(" "),
    };
  }

  return { title: text, description: "" };
}

/**
 * Score color helper for /20 scale
 */
export function scoreColor(scoreOf20: number): string {
  if (scoreOf20 >= 16) return "var(--vl-green)";
  if (scoreOf20 >= 13) return "var(--vl-gold)";
  if (scoreOf20 >= 10) return "var(--vl-amber)";
  return "var(--vl-red)";
}

/**
 * Bar color helper for percentage scores
 */
export function barColorForScore(score: number): string {
  if (score >= 80) return "bg-[var(--vl-green)]";
  if (score >= 65) return "bg-[var(--vl-gold)]";
  if (score >= 50) return "bg-[var(--vl-amber)]";
  return "bg-[var(--vl-red)]";
}
