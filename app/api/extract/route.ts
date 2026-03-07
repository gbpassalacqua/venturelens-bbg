import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = "gemini-3-flash-preview";

const EXTRACT_PROMPT = `Você é um assistente que extrai informações-chave de documentos de startups (PRDs, pitch decks, descrições).

Analise o documento fornecido e extraia APENAS estes 7 campos em JSON. Seja conciso — máximo 2 frases por campo.
Se não encontrar a informação, retorne "Não identificado no documento".
Responda em português brasileiro.

Retorne APENAS JSON válido, sem markdown, sem backticks:
{
  "problema": "qual problema o produto resolve",
  "solucao": "como o produto resolve o problema",
  "icp": "perfil de cliente ideal (quem são os usuários/compradores)",
  "monetizacao": "modelo de receita (preço, planos, frequência)",
  "vertical": "indústria ou vertical do produto",
  "dependenciasTech": "principais tecnologias, APIs ou plataformas usadas",
  "mercadosAlvo": "mercados geográficos alvo"
}`;

interface ExtractedFields {
  problema: string;
  solucao: string;
  icp: string;
  monetizacao: string;
  vertical: string;
  dependenciasTech: string;
  mercadosAlvo: string;
}

const EMPTY_FIELDS: ExtractedFields = {
  problema: "Não identificado no documento",
  solucao: "Não identificado no documento",
  icp: "Não identificado no documento",
  monetizacao: "Não identificado no documento",
  vertical: "Não identificado no documento",
  dependenciasTech: "Não identificado no documento",
  mercadosAlvo: "Não identificado no documento",
};

export async function POST(req: NextRequest) {
  console.log("=== EXTRACT ENDPOINT CALLED ===");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;

    if (!file && !textInput) {
      console.error("=== EXTRACT: No file or text provided ===");
      return NextResponse.json(
        { error: "Nenhum arquivo ou texto fornecido" },
        { status: 400 },
      );
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      console.error("=== EXTRACT: NO GEMINI API KEY FOUND ===");
      return NextResponse.json(
        { error: "API key não configurada" },
        { status: 500 },
      );
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
    let content: any[];

    if (file) {
      // Send file directly as base64 to Gemini multimodal API
      // This handles visual PDFs (pitch decks with images/charts) correctly
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString("base64");
      const mimeType = file.type || "application/pdf";

      console.log(
        `=== EXTRACT: Sending file as base64 (${mimeType}, ${bytes.byteLength} bytes) ===`,
      );

      content = [
        { text: EXTRACT_PROMPT },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64,
          },
        },
      ];
    } else {
      console.log(
        `=== EXTRACT: Sending text input (${textInput!.length} chars) ===`,
      );
      content = [
        {
          text:
            EXTRACT_PROMPT + "\n\n--- DOCUMENTO ---\n" + textInput!.slice(0, 8000),
        },
      ];
    }

    console.log("=== CALLING GEMINI FOR EXTRACTION ===");
    const result = await model.generateContent(content);
    const response = result.response;
    const text = response.text();
    console.log(
      "=== GEMINI EXTRACT RESPONSE ===",
      text.substring(0, 300),
    );

    // Parse JSON response
    let fields: ExtractedFields;
    try {
      const parsed = JSON.parse(text);
      fields = {
        problema: parsed.problema || EMPTY_FIELDS.problema,
        solucao: parsed.solucao || EMPTY_FIELDS.solucao,
        icp: parsed.icp || EMPTY_FIELDS.icp,
        monetizacao: parsed.monetizacao || EMPTY_FIELDS.monetizacao,
        vertical: parsed.vertical || EMPTY_FIELDS.vertical,
        dependenciasTech:
          parsed.dependenciasTech || EMPTY_FIELDS.dependenciasTech,
        mercadosAlvo: parsed.mercadosAlvo || EMPTY_FIELDS.mercadosAlvo,
      };
    } catch {
      // Try cleaning markdown backticks if present
      try {
        const cleaned = text
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        const parsed = JSON.parse(cleaned);
        fields = {
          problema: parsed.problema || EMPTY_FIELDS.problema,
          solucao: parsed.solucao || EMPTY_FIELDS.solucao,
          icp: parsed.icp || EMPTY_FIELDS.icp,
          monetizacao: parsed.monetizacao || EMPTY_FIELDS.monetizacao,
          vertical: parsed.vertical || EMPTY_FIELDS.vertical,
          dependenciasTech:
            parsed.dependenciasTech || EMPTY_FIELDS.dependenciasTech,
          mercadosAlvo: parsed.mercadosAlvo || EMPTY_FIELDS.mercadosAlvo,
        };
      } catch {
        console.error("=== EXTRACT: Failed to parse Gemini response ===", text);
        fields = EMPTY_FIELDS;
      }
    }

    console.log("=== EXTRACT SUCCESS ===", JSON.stringify(fields).substring(0, 200));
    return NextResponse.json({ fields });
  } catch (error: unknown) {
    const errMsg =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("=== EXTRACT ERROR ===", errMsg);
    return NextResponse.json(
      { error: "Falha na extração", detail: errMsg },
      { status: 500 },
    );
  }
}
