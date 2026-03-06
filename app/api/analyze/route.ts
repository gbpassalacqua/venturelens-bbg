import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { getServiceSupabase } from "@/lib/supabase";
import { AnalysisResult } from "@/types/analysis";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>;

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text;
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const textoExtraido = await extractText(buffer, file.type);

    if (!textoExtraido || textoExtraido.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: "Could not extract enough text from file" },
        { status: 400 }
      );
    }

    // Gemini analysis
    const { geminiModel } = await import("@/lib/gemini");
    const { VENTURELENS_SYSTEM_PROMPT } = await import("@/lib/playbook");

    const prompt = `${VENTURELENS_SYSTEM_PROMPT}\n\nAnalise este PRD:\n\n${textoExtraido}`;
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    // Debug: ver o que o Gemini retornou
    console.log("Gemini raw response:", text);

    // Limpar markdown fences e extrair JSON
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const analysisData = JSON.parse(cleaned);

    const analysis: AnalysisResult = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      file_name: file.name,
      overall_score: analysisData.overall_score,
      scores: analysisData.scores,
      summary: analysisData.summary,
      strengths: analysisData.strengths,
      weaknesses: analysisData.weaknesses,
      features: analysisData.features,
      recommendation: analysisData.recommendation,
    };

    // Save to Supabase
    const supabase = getServiceSupabase();
    await supabase.from("analyses").insert({
      id: analysis.id,
      created_at: analysis.created_at,
      file_name: analysis.file_name,
      overall_score: analysis.overall_score,
      scores: analysis.scores,
      summary: analysis.summary,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      features: analysis.features,
      recommendation: analysis.recommendation,
    });

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
