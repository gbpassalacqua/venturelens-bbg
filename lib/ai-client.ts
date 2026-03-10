import Anthropic from "@anthropic-ai/sdk";

/** Centralized model name — change here to update everywhere */
export const AI_MODEL = "claude-haiku-4-5-20251001";

/** Create a new Anthropic client (reads ANTHROPIC_API_KEY from env) */
export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");
  return new Anthropic({ apiKey });
}

/** Parse Claude response text, handling markdown-wrapped JSON */
export function parseClaudeJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(cleaned);
  }
}

/** Extract text from Claude response content blocks */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractResponseText(content: any[]): string {
  return content
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((block: any) => block.type === "text")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((block: any) => block.text)
    .join("");
}
