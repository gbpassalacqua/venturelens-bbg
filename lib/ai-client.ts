import Anthropic from "@anthropic-ai/sdk";

/** Centralized model name — change here to update everywhere */
export const AI_MODEL = "claude-haiku-4-5-20251001";

/** Create a new Anthropic client (reads ANTHROPIC_API_KEY from env) */
export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY não configurada");
  return new Anthropic({ apiKey });
}

/** Parse Claude response text — extract JSON between first { and last }, ignore trailing text */
export function parseClaudeJSON(text: string) {
  // Strip markdown fences if present
  const stripped = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  // Extract ONLY the JSON object — ignore any text before or after
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Nenhum JSON encontrado na resposta do Claude");
  return JSON.parse(jsonMatch[0]);
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
