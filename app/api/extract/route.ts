import { NextRequest, NextResponse } from "next/server";
import { geminiExtractModel } from "@/lib/gemini";
import { extractTextFromFile } from "@/lib/file-utils";

const EXTRACT_PROMPT = `Você é um assistente que extrai informações-chave de documentos de startups (PRDs, pitch decks, descrições).

Analise o documento fornecido e extraia APENAS estes 7 campos. Seja conciso — máximo 2 frases por campo.
Se não encontrar a informação, retorne "Não identificado no documento".
Responda em português brasileiro.

Retorne APENAS este JSON, sem markdown, sem backticks:
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
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const textInput = formData.get("text") as string | null;

    if (!file && !textInput) {
      return NextResponse.json(
        { error: "Nenhum arquivo ou texto fornecido" },
        { status: 400 },
      );
    }

    // Build content for Gemini
    let documentContent = "";

    if (file) {
      try {
        documentContent = await extractTextFromFile(file);
      } catch (err) {
        console.error("File extraction error:", err);
        return NextResponse.json(
          { error: "Falha ao ler o arquivo" },
          { status: 400 },
        );
      }
    } else if (textInput) {
      documentContent = textInput;
    }

    if (!documentContent || documentContent.trim().length < 20) {
      return NextResponse.json(
        { error: "Conteúdo insuficiente para extração" },
        { status: 400 },
      );
    }

    // Truncate to first 8000 chars for fast extraction
    const truncated = documentContent.slice(0, 8000);

    const prompt = `${EXTRACT_PROMPT}\n\n--- DOCUMENTO ---\n${truncated}`;

    const result = await geminiExtractModel.generateContent(prompt);
    const text = result.response.text();

    let fields: ExtractedFields;
    try {
      const parsed = JSON.parse(text);
      fields = {
        problema: parsed.problema || EMPTY_FIELDS.problema,
        solucao: parsed.solucao || EMPTY_FIELDS.solucao,
        icp: parsed.icp || EMPTY_FIELDS.icp,
        monetizacao: parsed.monetizacao || EMPTY_FIELDS.monetizacao,
        vertical: parsed.vertical || EMPTY_FIELDS.vertical,
        dependenciasTech: parsed.dependenciasTech || EMPTY_FIELDS.dependenciasTech,
        mercadosAlvo: parsed.mercadosAlvo || EMPTY_FIELDS.mercadosAlvo,
      };
    } catch {
      console.error("Failed to parse extract response:", text);
      fields = EMPTY_FIELDS;
    }

    return NextResponse.json({ fields });
  } catch (error) {
    console.error("Extract error:", error);
    return NextResponse.json(
      { error: "Falha na extração" },
      { status: 500 },
    );
  }
}
