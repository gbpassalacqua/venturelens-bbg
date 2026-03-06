import { NextResponse } from "next/server";
import { extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";
import { getServiceSupabase } from "@/lib/supabase";

async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const createdBy = (formData.get("created_by") as string) || "unknown";

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

    console.log("Gemini raw response:", text);

    // Clean markdown fences and parse JSON
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const d = JSON.parse(cleaned);

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const analysis = {
      id,
      created_at: now,
      created_by: createdBy,
      project_name: d.project_name || file.name.replace(/\.[^.]+$/, ""),
      file_name: file.name,
      score: d.score,
      verdict: d.verdict,
      recommendation: d.recommendation,
      mvp_features: d.mvp_features,
      v2_features: d.v2_features,
      cut_features: d.cut_features,
      report_json: d.report_json,
    };

    // Save to Supabase
    const supabase = getServiceSupabase();
    const { error: dbError } = await supabase.from("analyses").insert({
      id: analysis.id,
      created_at: analysis.created_at,
      created_by: analysis.created_by,
      project_name: analysis.project_name,
      file_name: analysis.file_name,
      score: analysis.score,
      verdict: analysis.verdict,
      recommendation: analysis.recommendation,
      mvp_features: analysis.mvp_features,
      v2_features: analysis.v2_features,
      cut_features: analysis.cut_features,
      report_json: analysis.report_json,
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
    }

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
