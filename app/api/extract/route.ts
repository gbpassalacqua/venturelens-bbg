import { NextRequest } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { extractTextFromFile } from "@/lib/file-utils";

export const dynamic = "force-dynamic";

const GEMINI_MODEL = "gemini-3-flash-preview";

// MIME types that Gemini accepts as inline data (multimodal)
const GEMINI_INLINE_MIMES = new Set([
  "application/pdf",
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

        const apiKey =
          process.env.GEMINI_API_KEY ||
          process.env.GOOGLE_API_KEY ||
          process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey) {
          clearInterval(heartbeat);
          sendLine(controller, encoder, {
            type: "error",
            message: "API key não configurada",
          });
          controller.close();
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: GEMINI_MODEL,
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let parts: any[];

        if (file) {
          const mimeType = file.type || "application/pdf";

          if (GEMINI_INLINE_MIMES.has(mimeType)) {
            const bytes = await file.arrayBuffer();
            const base64 = Buffer.from(bytes).toString("base64");
            console.log(
              `[extract] Sending file as base64: ${file.name}, ${mimeType}, ${Math.round(bytes.byteLength / 1024)}KB`,
            );
            parts = [
              { text: EXTRACT_PROMPT },
              { inlineData: { mimeType, data: base64 } },
            ];
          } else {
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
              `[extract] Extracted ${documentContent.length} chars, sending ${truncated.length} to Gemini`,
            );
            parts = [
              {
                text:
                  EXTRACT_PROMPT + "\n\n--- DOCUMENTO ---\n" + truncated,
              },
            ];
          }
        } else {
          console.log(
            `[extract] Sending text input: ${textInput!.substring(0, 100)}...`,
          );
          parts = [
            { text: EXTRACT_PROMPT + "\n\nDocumento:\n" + textInput },
          ];
        }

        console.log("[extract] Calling Gemini...");
        const result = await model.generateContent(parts);
        const response = result.response;
        const text = response.text();
        console.log("[extract] Gemini response:", text.substring(0, 300));

        let fields;
        try {
          fields = JSON.parse(text);
        } catch {
          const cleaned = text
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();
          fields = JSON.parse(cleaned);
        }

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
