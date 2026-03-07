/**
 * Shared file text extraction utilities.
 * Used by both /api/analyze and /api/extract endpoints.
 */
import { extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";

/**
 * Extract plain text from a file buffer based on its MIME type.
 * Supports: PDF, DOCX/DOC, plain text.
 */
export async function extractTextFromBuffer(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    const { text } = await extractPdfText(new Uint8Array(buffer), { mergePages: true });
    return text as string;
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

/**
 * Extract text from a File object (from FormData).
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return extractTextFromBuffer(buffer, file.type);
}
