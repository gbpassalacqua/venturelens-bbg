import { NextRequest } from "next/server";
import { getAnthropicClient, AI_MODEL, parseClaudeJSON, extractResponseText } from "@/lib/ai-client";
import { extractTextFromFile } from "@/lib/file-utils";

export const dynamic = "force-dynamic";

// MIME types that Claude accepts as native document (PDF only)
const CLAUDE_DOC_MIMES = new Set(["application/pdf"]);

// MIME types that Claude accepts as image
const CLAUDE_IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const EXTRACT_PROMPT = `Você é um assistente que extrai informações-chave de documentos de startups (PRDs, pitch decks, apresentações).

Analise o documento fornecido e extraia APENAS estes 7 campos em JSON. Seja conciso — máximo 2 frases por campo.
Se não encontrar a informação, retorne "Não identificado no documento".
Responda em português brasileiro.

Retorne APENAS JSON válido:
{
  "problema": "qual problema o produto resolve",
  "solucao": "como resolve",
  "icp": "perfil de cliente ideal",
  "monetizacao": "modelo de receita",
  "vertical": "indústria/vertical",
  "dependenciasTech": "tecnologias principais usadas",
  "mercadosAlvo": "mercados geográficos alvo"
}`;

function sendLine(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  data: object,
) {
  try {
    controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
  } catch {
    // controller may be closed
  }
}

export async function POST(req: NextRequest) {
  console.log("[extract] Endpoint called");
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = setInterval(() => {
        sendLine(controller, encoder, { type: "heartbeat", ts: Date.now() });
      }, 5000);

      try {
        // Send immediate status to start the stream (bypasses Vercel timeout)
        sendLine(controller, encoder, {
          type: "status",
          message: "Extraindo dados do documento...",
        });

        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const textInput = formData.get("text") as string | null;

        if (!file && !textInput) {
          clearInterval(heartbeat);
          sendLine(controller, encoder, {
            type: "error",
            message: "Nenhum arquivo ou texto",
          });
          controller.close();
          return;
        }

        const client = getAnthropicClient();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let userContent: any[] = [];

        if (file) {
          const mimeType = file.type || "application/pdf";
          const bytes = await file.arrayBuffer();
          const base64 = Buffer.from(bytes).toString("base64");

          if (CLAUDE_DOC_MIMES.has(mimeType)) {
            // PDF → Claude document type
            console.log(
              `[extract] Sending PDF as document: ${file.name}, ${Math.round(bytes.byteLength / 1024)}KB`,
            );
            userContent = [
              {
                type: "document",
                source: { type: "base64", media_type: mimeType, data: base64 },
              },
              { type: "text", text: EXTRACT_PROMPT },
            ];
          } else if (CLAUDE_IMAGE_MIMES.has(mimeType)) {
            // Image → Claude image type
            console.log(
              `[extract] Sending image: ${file.name}, ${mimeType}, ${Math.round(bytes.byteLength / 1024)}KB`,
            );
            userContent = [
              {
                type: "image",
                source: { type: "base64", media_type: mimeType, data: base64 },
              },
              { type: "text", text: EXTRACT_PROMPT },
            ];
          } else {
            // DOCX / other → extract text first
            console.log(
              `[extract] Extracting text from file: ${file.name}, ${mimeType}`,
            );
            let documentContent: string;
            try {
              documentContent = await extractTextFromFile(file);
            } catch (err) {
              console.error("[extract] Text extraction failed:", err);
              clearInterval(heartbeat);
              sendLine(controller, encoder, {
                type: "error",
                message: "Falha ao ler o arquivo",
              });
              controller.close();
              return;
            }

            if (!documentContent || documentContent.trim().length < 20) {
              clearInterval(heartbeat);
              sendLine(controller, encoder, {
                type: "error",
                message: "Conteúdo insuficiente para extração",
              });
              controller.close();
              return;
            }

            const truncated = documentContent.slice(0, 8000);
            console.log(
              `[extract] Extracted ${documentContent.length} chars, sending ${truncated.length} to Claude`,
            );
            userContent = [
              {
                type: "text",
                text:
                  EXTRACT_PROMPT + "\n\n--- DOCUMENTO ---\n" + truncated,
              },
            ];
          }
        } else {
          console.log(
            `[extract] Sending text input: ${textInput!.substring(0, 100)}...`,
          );
          userContent = [
            { type: "text", text: EXTRACT_PROMPT + "\n\nDocumento:\n" + textInput },
          ];
        }

        console.log("[extract] Calling Claude...");
        const response = await client.messages.create({
          model: AI_MODEL,
          max_tokens: 2048,
          messages: [{ role: "user", content: userContent }],
        });

        const text = extractResponseText(response.content);
        console.log("[extract] Claude response:", text.substring(0, 300));

        const fields = parseClaudeJSON(text);
        console.log("[extract] Parsed fields:", Object.keys(fields));

        clearInterval(heartbeat);
        sendLine(controller, encoder, { type: "result", fields });
        controller.close();
      } catch (error: unknown) {
        clearInterval(heartbeat);
        const errMsg =
          error instanceof Error ? error.message : String(error);
        console.error("[extract] Error:", errMsg);
        sendLine(controller, encoder, { type: "error", message: errMsg });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
