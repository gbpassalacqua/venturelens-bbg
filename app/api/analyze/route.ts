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
  context: string; // extra text to inject into prompt
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
  // Token lido da variável de ambiente do servidor — nunca exposto ao cliente
  const githubToken = process.env.GITHUB_TOKEN || null;

  console.log("=== GITHUB DEBUG ===");
  console.log("githubUrl:", githubUrl);
  console.log("githubToken existe:", !!githubToken);
  console.log("packageJsonFile existe:", !!packageJsonFile);

  // No GitHub URL provided
  if (!githubUrl) {
    console.log("Resultado: sem_github (URL não fornecida)");
    console.log("===================");
    return { status: "sem_github", context: "" };
  }

  const parsed = parseGithubOwnerRepo(githubUrl);
  if (!parsed) {
    console.log("Resultado: sem_github (URL inválida)");
    console.log("===================");
    return { status: "sem_github", context: "" };
  }

  const { owner, repo } = parsed;
  console.log("Parsed repo:", owner, "/", repo);

  // STRATEGY B — package.json uploaded directly
  if (packageJsonFile) {
    console.log("Strategy B: package.json upload");
    const buf = await packageJsonFile.arrayBuffer();
    const content = Buffer.from(buf).toString("utf-8");
    console.log("package.json size:", content.length, "bytes");
    console.log("===================");
    return {
      status: "via_package_json",
      context: analyzePackageJson(content),
    };
  }

  // STRATEGY A — Token from env var
  if (githubToken) {
    console.log("Strategy A: usando token do env var");
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${githubToken}`,
    };

    try {
      const pkgUrl = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
      console.log("Fetching:", pkgUrl);
      const pkgRes = await fetch(pkgUrl, { headers });
      console.log("GitHub API status (package.json):", pkgRes.status);

      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        const content = Buffer.from(pkgData.content, "base64").toString("utf-8");
        console.log("package.json encontrado:", true, "- size:", content.length);

        let readmeContent = "";
        const readmeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
          { headers },
        );
        console.log("GitHub API status (README):", readmeRes.status);
        if (readmeRes.ok) {
          const readmeData = await readmeRes.json();
          readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }
        console.log("README encontrado:", !!readmeContent);
        console.log("Resultado: verificado");
        console.log("===================");

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

      console.log("Token fetch falhou, caindo para Strategy C");
    } catch (err) {
      console.log("Strategy A error:", err);
    }
  }

  // STRATEGY C — Public repo (no token) or token failed
  console.log("Strategy C: tentando sem auth");
  const pubHeaders: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };

  try {
    const pkgRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
      { headers: pubHeaders },
    );
    console.log("GitHub API status (public):", pkgRes.status);

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

      console.log("package.json encontrado (public):", true);
      console.log("README encontrado (public):", !!readmeContent);
      console.log("Resultado: verificado (public)");
      console.log("===================");

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

  console.log("Resultado: privado_sem_acesso");
  console.log("===================");
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
    console.log("=== GITHUB RESULT ===");
    console.log("status:", github.status);
    console.log("context length:", github.context.length);
    console.log("context preview:", github.context.slice(0, 200));
    console.log("====================");

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

    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();

    console.log("Gemini raw response (first 500):", text.slice(0, 500));

    // Clean markdown fences and parse JSON
    const cleaned = text
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();
    const d = JSON.parse(cleaned);

    // Ensure github_status is set even if Gemini didn't return it
    if (d.report_json && github.status !== "sem_github") {
      d.report_json.github_status = d.report_json.github_status || github.status;
    }

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
