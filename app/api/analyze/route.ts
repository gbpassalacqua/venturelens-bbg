import { NextResponse } from "next/server";
import { extractText as extractPdfText } from "unpdf";
import mammoth from "mammoth";
import { getServiceSupabase } from "@/lib/supabase";
import type { GithubStatus } from "@/types/analysis";

// ------- File text extraction -------
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

// ------- GitHub helpers -------
interface GithubResult {
  status: GithubStatus;
  context: string;
}

function parseGithubOwnerRepo(url: string): { owner: string; repo: string } | null {
  try {
    const u = new URL(url);
    const parts = u.pathname.replace(/^\//, "").replace(/\.git$/, "").split("/");
    if (parts.length >= 2) return { owner: parts[0], repo: parts[1] };
  } catch {
    // invalid URL
  }
  return null;
}

const KNOWN_PACKAGES = [
  "stripe", "mercadopago", "hotmart",
  "@supabase/supabase-js", "supabase",
  "prisma", "@prisma/client",
  "resend", "nodemailer",
  "next-auth", "@clerk/nextjs", "clerk",
  "firebase", "firebase-admin",
  "paddle", "@paddle/paddle-node-sdk",
];

function analyzePackageJson(content: string): string {
  try {
    const pkg = JSON.parse(content);
    const allDeps = {
      ...((pkg.dependencies as Record<string, string>) || {}),
      ...((pkg.devDependencies as Record<string, string>) || {}),
    };

    const depNames = Object.keys(allDeps);
    const scripts = Object.keys((pkg.scripts as Record<string, string>) || {});
    const found = KNOWN_PACKAGES.filter((p) => depNames.includes(p));

    const lines: string[] = [];
    lines.push(`[ANÁLISE VIA PACKAGE.JSON LOCAL]`);
    lines.push(`Nome do projeto: ${pkg.name || "desconhecido"}`);
    lines.push(`Total de dependências: ${depNames.length}`);
    if (found.length > 0) {
      lines.push(`Dependências notáveis encontradas: ${found.join(", ")}`);
    }
    if (scripts.length > 0) {
      lines.push(`Scripts disponíveis: ${scripts.join(", ")}`);
    }
    lines.push(`\nNota: README, .env.example e estrutura de diretórios NÃO verificados (apenas package.json disponível).`);

    return lines.join("\n");
  } catch {
    return "[Erro ao parsear package.json]";
  }
}

async function resolveGithub(
  githubUrl: string | null,
  packageJsonFile: File | null,
): Promise<GithubResult> {
  const githubToken = process.env.GITHUB_TOKEN || null;

  if (!githubUrl) {
    return { status: "sem_github", context: "" };
  }

  const parsed = parseGithubOwnerRepo(githubUrl);
  if (!parsed) {
    return { status: "sem_github", context: "" };
  }

  const { owner, repo } = parsed;

  // STRATEGY B — package.json uploaded directly
  if (packageJsonFile) {
    const buf = await packageJsonFile.arrayBuffer();
    const content = Buffer.from(buf).toString("utf-8");
    return {
      status: "via_package_json",
      context: analyzePackageJson(content),
    };
  }

  // STRATEGY A — Token from env var
  if (githubToken) {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${githubToken}`,
    };

    try {
      const pkgRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
        { headers },
      );

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        const content = Buffer.from(pkgData.content, "base64").toString("utf-8");

        let readmeContent = "";
        const readmeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
          { headers },
        );
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }

        const lines: string[] = [];
        lines.push(`[REPOSITÓRIO GITHUB VERIFICADO — ${owner}/${repo}]`);
        lines.push(`✅ Repositório verificado com sucesso.`);
        lines.push(`\n--- package.json ---`);
        lines.push(content);
        if (readmeContent) {
          lines.push(`\n--- README.md ---`);
          lines.push(readmeContent.slice(0, 3000));
        }

        return { status: "verificado", context: lines.join("\n") };
      }
    } catch (err) {
      console.log("Strategy A error:", err);
    }
  }

  // STRATEGY C — Public repo (no token) or token failed
  const pubHeaders: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  try {
    const pkgRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      { headers: pubHeaders },
    );

    if (pkgRes.ok) {
      const pkgData = await pkgRes.json();
      const content = Buffer.from(pkgData.content, "base64").toString("utf-8");

      let readmeContent = "";
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
        { headers: pubHeaders },
      );
      if (readmeRes.ok) {
        const readmeData = await readmeRes.json();
        readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
      }

      const lines: string[] = [];
      lines.push(`[REPOSITÓRIO GITHUB VERIFICADO — ${owner}/${repo}]`);
      lines.push(`✅ Repositório verificado com sucesso.`);
      lines.push(`\n--- package.json ---`);
      lines.push(content);
      if (readmeContent) {
        lines.push(`\n--- README.md ---`);
        lines.push(readmeContent.slice(0, 3000));
      }

      return { status: "verificado", context: lines.join("\n") };
    }
  } catch (err) {
    console.log("Strategy C error:", err);
  }

  return {
    status: "privado_sem_acesso",
    context: `[GITHUB INACESSÍVEL — ${owner}/${repo}]\nGitHub inacessível — itens técnicos não verificados.\nMarque TODOS os itens técnicos como nao_verificado.\nNão invente ou assuma dependências.`,
  };
}

// ------- Main POST handler -------
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const createdBy = (formData.get("created_by") as string) || "unknown";
    const githubUrl = (formData.get("githubUrl") as string) || null;
    const packageJsonFile = (formData.get("packageJsonFile") as File | null) || null;
    const productMode = (formData.get("productMode") as string) || "prd";

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

    // Resolve GitHub (strategies A/B/C)
    const github = await resolveGithub(githubUrl, packageJsonFile);

    // Build prompt with GitHub context
    const { geminiModel } = await import("@/lib/gemini");
    const { VENTURELENS_SYSTEM_PROMPT } = await import("@/lib/playbook");

    let prompt = `${VENTURELENS_SYSTEM_PROMPT}\n\nAnalise este PRD:\n\n${textoExtraido}`;

    if (github.context) {
      prompt += `\n\n--- DADOS TÉCNICOS DO REPOSITÓRIO ---\n${github.context}`;
    }

    if (github.status !== "sem_github") {
      prompt += `\n\nINCLUA no report_json o campo "github_status": "${github.status}"`;
    }

    prompt += `\n\nINCLUA no report_json o campo "produto_modo": "${productMode}"`;

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    // Clean markdown fences and parse JSON
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const d = JSON.parse(cleaned);

    // Build complete report_json with ALL generated data
    const reportJson = {
      ...(d.report_json || {}),
      summary: d.report_json?.summary || d.summary || "",
      scores: d.report_json?.scores || d.scores || {},
      tam: d.report_json?.tam || d.tam || {},
      sam: d.report_json?.sam || d.sam || {},
      som: d.report_json?.som || d.som || {},
      competitors: d.report_json?.competitors || d.competitors || [],
      risks: d.report_json?.risks || d.risks || [],
      next_steps: d.report_json?.next_steps || d.next_steps || "",
      strengths: d.report_json?.strengths || d.strengths || [],
      weaknesses: d.report_json?.weaknesses || d.weaknesses || [],
      github_status: d.report_json?.github_status || github.status,
      produto_modo: productMode,
      launch_readiness_score: d.report_json?.launch_readiness_score || d.launch_readiness_score || null,
      launch_verdict: d.report_json?.launch_verdict || d.launch_verdict || null,
      launch_checklist: d.report_json?.launch_checklist || d.launch_checklist || null,
      top3_para_lancar: d.report_json?.top3_para_lancar || d.top3_para_lancar || null,
      // Embed top-level fields for full reconstruction from history
      _score: d.score,
      _verdict: d.verdict,
      _recommendation: d.recommendation,
      _mvp_features: d.mvp_features || [],
      _v2_features: d.v2_features || [],
      _cut_features: d.cut_features || [],
    };

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
      report_json: reportJson,
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
