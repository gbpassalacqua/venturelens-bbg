import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase";
import { extractTextFromFile } from "@/lib/file-utils";
import type { GithubStatus } from "@/types/analysis";

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

// ------- Deep reading types & helpers -------

interface GithubData {
  estrutura: string[];
  rotas_api: string[];
  tem_pagamento: boolean;
  tem_auth: boolean;
  tem_env_example: boolean;
  gitignore_tem_env: boolean;
  tem_migrations_rls: boolean;
  dependencias: {
    pagamento: string[];
    auth: string[];
    email: string[];
    db: string[];
    rate_limit: string[];
    validacao: string[];
  };
  arquivos_lidos: { caminho: string; linhas: number; conteudo: string }[];
  total_arquivos_repo: number;
  linguagem_principal: string;
  ultima_atualizacao: string;
}

interface SecurityFinding {
  tipo: string;
  arquivo: string;
  descricao: string;
  severidade: "critico" | "alto" | "medio" | "baixo";
}

const DEP_CATEGORIES: Record<string, string[]> = {
  pagamento: ["stripe", "mercadopago", "hotmart", "paddle", "@paddle/paddle-node-sdk", "pix"],
  auth: ["next-auth", "@clerk/nextjs", "clerk", "@auth/core", "lucia", "passport"],
  email: ["resend", "nodemailer", "@sendgrid/mail", "postmark"],
  db: ["prisma", "@prisma/client", "@supabase/supabase-js", "supabase", "mongoose", "typeorm", "drizzle-orm", "firebase", "firebase-admin"],
  rate_limit: ["@upstash/ratelimit", "rate-limiter-flexible", "express-rate-limit"],
  validacao: ["zod", "yup", "joi", "class-validator", "valibot"],
};

/** Fetch a single file from GitHub API, return decoded text or null on failure */
async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  headers: Record<string, string>,
): Promise<{ path: string; content: string } | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers },
    );
    if (!res.ok) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();
    if (data.content && data.encoding === "base64") {
      const decoded = Buffer.from(data.content, "base64").toString("utf-8");
      return { path, content: decoded };
    }
    return null;
  } catch {
    return null;
  }
}

/** Fetch directory listing from GitHub API, return array of entries or empty */
async function fetchDirListing(
  owner: string,
  repo: string,
  path: string,
  headers: Record<string, string>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers },
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

/** Fetch the first alternative that succeeds from a list of paths */
async function fetchFirstOf(
  owner: string,
  repo: string,
  paths: string[],
  headers: Record<string, string>,
): Promise<{ path: string; content: string } | null> {
  for (const p of paths) {
    const result = await fetchFileContent(owner, repo, p, headers);
    if (result) return result;
  }
  return null;
}

/** Truncate content to first N lines */
function firstNLines(content: string, n: number): string {
  return content.split("\n").slice(0, n).join("\n");
}

/** Format a file's content for the context block */
function formatFileBlock(path: string, content: string, maxLines: number = 150): string {
  const truncated = firstNLines(content, maxLines);
  const lineCount = truncated.split("\n").length;
  return `=== ARQUIVO: ${path} ===\n${truncated}\n=== FIM (${lineCount} linhas) ===`;
}

/** Hardcoded secret patterns */
const SECRET_PATTERNS = [
  { regex: /sk_live_[A-Za-z0-9]+/g, label: "Stripe live key" },
  { regex: /sk_test_[A-Za-z0-9]+/g, label: "Stripe test key" },
  { regex: /AIza[A-Za-z0-9_-]{35}/g, label: "Google API key" },
  { regex: /ghp_[A-Za-z0-9]{36}/g, label: "GitHub personal token" },
  { regex: /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g, label: "JWT token" },
];

const CONSOLE_LOG_SECRET_PATTERN = /console\.log\s*\([^)]*(?:key|password|secret|token|senha|chave)[^)]*\)/gi;
const SERVICE_ROLE_IN_CLIENT = /["']use client["'][\s\S]*?createClient\s*\([^)]*service.?role/gi;
const AUTH_CHECK_PATTERNS = [/getSession/g, /getUser/g, /\bauth\s*\(\s*\)/g, /getServerSession/g, /currentUser/g];
const NEXT_PUBLIC_SECRET_PATTERN = /NEXT_PUBLIC_[A-Z_]*(?:SECRET|KEY|PASSWORD|TOKEN)/gi;
const WEBHOOK_VERIFY_PATTERNS = [/constructEvent/g, /verifySignature/g, /verify.*signature/gi, /stripe\.webhooks/g];
const SECURITY_HEADERS_PATTERN = /headers\s*(?::\s*\[|\(\s*\{)[\s\S]*?(?:X-Frame-Options|Content-Security-Policy|X-Content-Type-Options|Strict-Transport-Security)/gi;

/** Run security audit on all read files */
function runSecurityAudit(
  readFiles: { caminho: string; conteudo: string }[],
  nextConfigContent: string | null,
): SecurityFinding[] {
  const findings: SecurityFinding[] = [];

  for (const file of readFiles) {
    const { caminho, conteudo } = file;

    // Check for hardcoded secrets
    for (const pat of SECRET_PATTERNS) {
      pat.regex.lastIndex = 0;
      if (pat.regex.test(conteudo)) {
        findings.push({
          tipo: "segredo_hardcoded",
          arquivo: caminho,
          descricao: `Possivel ${pat.label} hardcoded encontrado`,
          severidade: "critico",
        });
      }
    }

    // Check NEXT_PUBLIC_ exposing secrets
    NEXT_PUBLIC_SECRET_PATTERN.lastIndex = 0;
    const publicMatches = conteudo.match(NEXT_PUBLIC_SECRET_PATTERN);
    if (publicMatches) {
      findings.push({
        tipo: "env_publica_sensivel",
        arquivo: caminho,
        descricao: `NEXT_PUBLIC_ expondo dado sensivel: ${publicMatches.join(", ")}`,
        severidade: "alto",
      });
    }

    // Check service role in client component
    SERVICE_ROLE_IN_CLIENT.lastIndex = 0;
    if (SERVICE_ROLE_IN_CLIENT.test(conteudo)) {
      findings.push({
        tipo: "service_role_client",
        arquivo: caminho,
        descricao: "createClient com service role em arquivo 'use client' — expoe chave no browser",
        severidade: "critico",
      });
    }

    // Check console.log with secrets
    CONSOLE_LOG_SECRET_PATTERN.lastIndex = 0;
    if (CONSOLE_LOG_SECRET_PATTERN.test(conteudo)) {
      findings.push({
        tipo: "log_sensivel",
        arquivo: caminho,
        descricao: "console.log pode estar logando segredos (key/password/secret/token)",
        severidade: "alto",
      });
    }

    // Check API routes for auth
    const isApiRoute =
      caminho.includes("api/") ||
      caminho.includes("pages/api/") ||
      caminho.includes("app/api/");
    if (isApiRoute && caminho.endsWith(".ts") || isApiRoute && caminho.endsWith(".js")) {
      const hasAuth = AUTH_CHECK_PATTERNS.some((p) => {
        p.lastIndex = 0;
        return p.test(conteudo);
      });
      if (!hasAuth) {
        findings.push({
          tipo: "rota_sem_auth",
          arquivo: caminho,
          descricao: "Rota de API sem verificacao de autenticacao (getSession/getUser/auth())",
          severidade: "medio",
        });
      }
    }

    // Check webhook files for signature verification
    const isWebhook = caminho.toLowerCase().includes("webhook");
    if (isWebhook) {
      const hasVerification = WEBHOOK_VERIFY_PATTERNS.some((p) => {
        p.lastIndex = 0;
        return p.test(conteudo);
      });
      if (!hasVerification) {
        findings.push({
          tipo: "webhook_sem_verificacao",
          arquivo: caminho,
          descricao: "Webhook sem verificacao de assinatura (constructEvent/verifySignature)",
          severidade: "alto",
        });
      }
    }
  }

  // Check next.config for security headers
  if (nextConfigContent) {
    SECURITY_HEADERS_PATTERN.lastIndex = 0;
    if (!SECURITY_HEADERS_PATTERN.test(nextConfigContent)) {
      findings.push({
        tipo: "sem_security_headers",
        arquivo: "next.config.*",
        descricao: "next.config sem headers de seguranca (CSP, X-Frame-Options, etc.)",
        severidade: "medio",
      });
    }
  }

  return findings;
}

// ------- Deep reading function -------

async function deepReadRepo(
  owner: string,
  repo: string,
  headers: Record<string, string>,
  packageJsonContent: string,
  readmeContent: string,
): Promise<{ deepContext: string; githubData: GithubData; securityFindings: SecurityFinding[] }> {
  const TIMEOUT_MS = 15000;
  const startTime = Date.now();

  const readFiles: { caminho: string; linhas: number; conteudo: string }[] = [];
  const estrutura: string[] = [];
  const rotasApi: string[] = [];

  // Helper: check if we still have time
  const hasTime = () => Date.now() - startTime < TIMEOUT_MS;

  // Helper: add file to readFiles collection
  const collectFile = (path: string, content: string) => {
    const truncated = firstNLines(content, 150);
    const lineCount = truncated.split("\n").length;
    readFiles.push({ caminho: path, linhas: lineCount, conteudo: truncated });
  };

  // Already have package.json and README
  collectFile("package.json", packageJsonContent);
  if (readmeContent) {
    collectFile("README.md", readmeContent);
  }

  // =============================================
  // STEP 1 — Project Map: directory structure
  // =============================================
  let totalFilesRepo = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let repoMeta: any = null;

  if (hasTime()) {
    try {
      const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
      if (metaRes.ok) {
        repoMeta = await metaRes.json();
      }
    } catch {
      // ignore
    }
  }

  const dirsToScan = ["", "src", "app", "pages"];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rootEntries: any[] = [];

  if (hasTime()) {
    const dirResults = await Promise.all(
      dirsToScan.map((dir) => fetchDirListing(owner, repo, dir, headers)),
    );

    for (let i = 0; i < dirsToScan.length; i++) {
      const dir = dirsToScan[i] || "(root)";
      const entries = dirResults[i];
      if (entries.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const entry of entries) {
          const prefix = dir === "(root)" ? "" : `${dirsToScan[i]}/`;
          const displayPath = `${prefix}${entry.name}`;
          const typeLabel = entry.type === "dir" ? "[dir]" : "[file]";
          estrutura.push(`${typeLabel} ${displayPath}`);
          if (i === 0) {
            rootEntries.push(entry);
            totalFilesRepo++;
          }
        }
      }
    }
  }

  // =============================================
  // STEP 2 — Priority Files
  // =============================================
  if (hasTime()) {
    // Configuration files (fetch first match among alternatives)
    const configFetches: Promise<{ path: string; content: string } | null>[] = [
      fetchFirstOf(owner, repo, [".env.example", ".env.sample"], headers),
      fetchFirstOf(owner, repo, ["vercel.json", "netlify.toml"], headers),
      fetchFirstOf(owner, repo, ["next.config.js", "next.config.ts", "next.config.mjs"], headers),
      fetchFirstOf(owner, repo, ["vite.config.js", "vite.config.ts"], headers),
    ];

    // Payment files
    const paymentPaths = [
      "app/api/webhook/route.ts",
      "app/api/checkout/route.ts",
      "pages/api/stripe.ts",
      "src/lib/stripe.ts",
      "src/lib/payment.ts",
    ];
    const paymentFetches = paymentPaths.map((p) => fetchFileContent(owner, repo, p, headers));

    // Auth files
    const authFetches: Promise<{ path: string; content: string } | null>[] = [
      fetchFirstOf(owner, repo, ["app/api/auth/route.ts", "app/api/auth/[...nextauth]/route.ts"], headers),
      fetchFileContent(owner, repo, "src/lib/auth.ts", headers),
      fetchFileContent(owner, repo, "src/lib/supabase.ts", headers),
      fetchFileContent(owner, repo, "middleware.ts", headers),
    ];

    // API routes directory listings
    const apiDirFetches = [
      fetchDirListing(owner, repo, "app/api", headers),
      fetchDirListing(owner, repo, "pages/api", headers),
      fetchDirListing(owner, repo, "src/api", headers),
    ];

    // Security files
    const secFetches: Promise<{ path: string; content: string } | null>[] = [
      fetchFileContent(owner, repo, ".gitignore", headers),
    ];
    const migrationDirFetch = fetchDirListing(owner, repo, "supabase/migrations", headers);

    // Fire all in parallel
    const [configResults, paymentResults, authResults, apiDirResults, secResults, migrationEntries] =
      await Promise.all([
        Promise.all(configFetches),
        Promise.all(paymentFetches),
        Promise.all(authFetches),
        Promise.all(apiDirFetches),
        Promise.all(secFetches),
        migrationDirFetch,
      ]);

    // Collect config files
    for (const r of configResults) {
      if (r && hasTime()) collectFile(r.path, r.content);
    }

    // Collect payment files
    for (const r of paymentResults) {
      if (r && hasTime()) collectFile(r.path, r.content);
    }

    // Collect auth files
    for (const r of authResults) {
      if (r && hasTime()) collectFile(r.path, r.content);
    }

    // Process API directory listings
    const apiDirPaths = ["app/api", "pages/api", "src/api"];
    for (let i = 0; i < apiDirResults.length; i++) {
      const entries = apiDirResults[i];
      if (entries.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const entry of entries) {
          rotasApi.push(`${apiDirPaths[i]}/${entry.name} (${entry.type})`);
        }
      }
    }

    // Collect security files
    for (const r of secResults) {
      if (r && hasTime()) collectFile(r.path, r.content);
    }

    // Collect migration listings
    if (migrationEntries.length > 0) {
      const migrationList = migrationEntries
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((e: any) => e.name as string)
        .join("\n");
      collectFile("supabase/migrations/(listing)", migrationList);
    }

    // Search root for payment-related files
    const paymentKeywords = ["payment", "checkout", "stripe", "pix", "mercadopago"];
    for (const entry of rootEntries) {
      const nameLower = (entry.name as string).toLowerCase();
      const matches = paymentKeywords.some((kw) => nameLower.includes(kw));
      if (matches && entry.type === "file" && hasTime()) {
        const already = readFiles.some((f) => f.caminho === entry.name);
        if (!already) {
          const r = await fetchFileContent(owner, repo, entry.name, headers);
          if (r) collectFile(r.path, r.content);
        }
      }
    }

    // Also fetch migration file contents to check for RLS
    if (migrationEntries.length > 0 && hasTime()) {
      // Fetch up to 3 migration files to check for RLS
      const migrationFilesToRead = migrationEntries.slice(0, 3);
      const migFetches = migrationFilesToRead.map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => fetchFileContent(owner, repo, `supabase/migrations/${e.name}`, headers),
      );
      const migResults = await Promise.all(migFetches);
      for (const r of migResults) {
        if (r && hasTime()) collectFile(r.path, r.content);
      }
    }
  }

  // =============================================
  // STEP 3 — Already done above (collectFile formats content)
  // =============================================

  // =============================================
  // STEP 4 — Build githubData
  // =============================================

  // Parse package.json for dependency categorization
  let allDeps: Record<string, string> = {};
  try {
    const pkg = JSON.parse(packageJsonContent);
    allDeps = {
      ...((pkg.dependencies as Record<string, string>) || {}),
      ...((pkg.devDependencies as Record<string, string>) || {}),
    };
  } catch {
    // ignore parse error
  }
  const depNames = Object.keys(allDeps);

  const categorizedDeps: GithubData["dependencias"] = {
    pagamento: [],
    auth: [],
    email: [],
    db: [],
    rate_limit: [],
    validacao: [],
  };

  for (const [category, packages] of Object.entries(DEP_CATEGORIES)) {
    categorizedDeps[category as keyof typeof categorizedDeps] = packages.filter((p) =>
      depNames.includes(p),
    );
  }

  // Check .gitignore for .env
  const gitignoreFile = readFiles.find((f) => f.caminho === ".gitignore");
  const gitignoreTemEnv = gitignoreFile
    ? gitignoreFile.conteudo.split("\n").some((line) => line.trim() === ".env" || line.trim().startsWith(".env"))
    : false;

  // Check migration files for RLS
  const migrationFiles = readFiles.filter((f) => f.caminho.includes("supabase/migrations/") && !f.caminho.endsWith("(listing)"));
  const temMigrationsRls = migrationFiles.some((f) =>
    /enable\s+row\s+level\s+security|row_level_security/i.test(f.conteudo),
  );

  // Check for payment/auth presence
  const temPagamento =
    categorizedDeps.pagamento.length > 0 ||
    readFiles.some((f) =>
      ["payment", "checkout", "stripe", "pix", "mercadopago"].some((kw) =>
        f.caminho.toLowerCase().includes(kw),
      ),
    );

  const temAuth =
    categorizedDeps.auth.length > 0 ||
    readFiles.some((f) =>
      f.caminho.toLowerCase().includes("auth") || f.caminho === "middleware.ts",
    );

  const temEnvExample = readFiles.some(
    (f) => f.caminho === ".env.example" || f.caminho === ".env.sample",
  );

  const githubData: GithubData = {
    estrutura,
    rotas_api: rotasApi,
    tem_pagamento: temPagamento,
    tem_auth: temAuth,
    tem_env_example: temEnvExample,
    gitignore_tem_env: gitignoreTemEnv,
    tem_migrations_rls: temMigrationsRls,
    dependencias: categorizedDeps,
    arquivos_lidos: readFiles.map((f) => ({
      caminho: f.caminho,
      linhas: f.linhas,
      conteudo: f.conteudo,
    })),
    total_arquivos_repo: repoMeta?.size ? repoMeta.size : totalFilesRepo,
    linguagem_principal: repoMeta?.language || "desconhecido",
    ultima_atualizacao: repoMeta?.updated_at || "desconhecido",
  };

  // =============================================
  // Security Audit
  // =============================================
  const nextConfigFile = readFiles.find(
    (f) => f.caminho.startsWith("next.config"),
  );
  const securityFindings = runSecurityAudit(
    readFiles.map((f) => ({ caminho: f.caminho, conteudo: f.conteudo })),
    nextConfigFile?.conteudo || null,
  );

  // =============================================
  // Build deep context string
  // =============================================
  const contextParts: string[] = [];
  contextParts.push(`\n--- LEITURA PROFUNDA DO REPOSITÓRIO ---`);
  contextParts.push(`Arquivos lidos: ${readFiles.length}`);
  contextParts.push(`Linguagem principal: ${githubData.linguagem_principal}`);
  contextParts.push(`Ultima atualizacao: ${githubData.ultima_atualizacao}`);
  contextParts.push(`Tempo de leitura: ${Date.now() - startTime}ms`);

  contextParts.push(`\n--- ESTRUTURA DO PROJETO ---`);
  contextParts.push(estrutura.join("\n"));

  if (rotasApi.length > 0) {
    contextParts.push(`\n--- ROTAS DE API ENCONTRADAS ---`);
    contextParts.push(rotasApi.join("\n"));
  }

  contextParts.push(`\n--- DEPENDENCIAS CATEGORIZADAS ---`);
  contextParts.push(JSON.stringify(categorizedDeps, null, 2));

  contextParts.push(`\n--- VERIFICACOES ---`);
  contextParts.push(`Tem pagamento: ${temPagamento ? "SIM" : "NAO"}`);
  contextParts.push(`Tem auth: ${temAuth ? "SIM" : "NAO"}`);
  contextParts.push(`Tem .env.example: ${temEnvExample ? "SIM" : "NAO"}`);
  contextParts.push(`.gitignore tem .env: ${gitignoreTemEnv ? "SIM" : "NAO"}`);
  contextParts.push(`Migrations com RLS: ${temMigrationsRls ? "SIM" : "NAO"}`);

  // All file contents
  contextParts.push(`\n--- CONTEUDO DOS ARQUIVOS ---`);
  for (const f of readFiles) {
    contextParts.push(formatFileBlock(f.caminho, f.conteudo, 150));
  }

  // Security audit
  if (securityFindings.length > 0) {
    contextParts.push(`\n--- AUDITORIA DE SEGURANCA (${securityFindings.length} achados) ---`);
    for (const finding of securityFindings) {
      contextParts.push(
        `[${finding.severidade.toUpperCase()}] ${finding.tipo} em ${finding.arquivo}: ${finding.descricao}`,
      );
    }
  } else {
    contextParts.push(`\n--- AUDITORIA DE SEGURANCA ---`);
    contextParts.push(`Nenhum problema critico de seguranca encontrado nos arquivos lidos.`);
  }

  // JSON summary
  contextParts.push(`\n--- RESUMO ESTRUTURADO (githubData JSON) ---`);
  contextParts.push(JSON.stringify(githubData, null, 2));

  return {
    deepContext: contextParts.join("\n"),
    githubData,
    securityFindings,
  };
}

// ------- resolveGithub with deep reading -------

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pkgData: any = await pkgRes.json();
        const content = Buffer.from(pkgData.content, "base64").toString("utf-8");

        let readmeContent = "";
        const readmeRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
          { headers },
        );
        if (readmeRes.ok) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const readmeData: any = await readmeRes.json();
          readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
        }

        // Deep reading
        const { deepContext } = await deepReadRepo(owner, repo, headers, content, readmeContent);

        const lines: string[] = [];
        lines.push(`[REPOSITORIO GITHUB VERIFICADO — ${owner}/${repo}]`);
        lines.push(`Repositorio verificado com sucesso.`);
        lines.push(`\n--- package.json ---`);
        lines.push(content);
        if (readmeContent) {
          lines.push(`\n--- README.md ---`);
          lines.push(readmeContent.slice(0, 3000));
        }
        lines.push(deepContext);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkgData: any = await pkgRes.json();
      const content = Buffer.from(pkgData.content, "base64").toString("utf-8");

      let readmeContent = "";
      const readmeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/README.md`,
        { headers: pubHeaders },
      );
      if (readmeRes.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const readmeData: any = await readmeRes.json();
        readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8");
      }

      // Deep reading
      const { deepContext } = await deepReadRepo(owner, repo, pubHeaders, content, readmeContent);

      const lines: string[] = [];
      lines.push(`[REPOSITORIO GITHUB VERIFICADO — ${owner}/${repo}]`);
      lines.push(`Repositorio verificado com sucesso.`);
      lines.push(`\n--- package.json ---`);
      lines.push(content);
      if (readmeContent) {
        lines.push(`\n--- README.md ---`);
        lines.push(readmeContent.slice(0, 3000));
      }
      lines.push(deepContext);

      return { status: "verificado", context: lines.join("\n") };
    }
  } catch (err) {
    console.log("Strategy C error:", err);
  }

  return {
    status: "privado_sem_acesso",
    context: `[GITHUB INACESSIVEL — ${owner}/${repo}]\nGitHub inacessivel — itens tecnicos nao verificados.\nMarque TODOS os itens tecnicos como nao_verificado.\nNao invente ou assuma dependencias.`,
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
    const extractedContext = (formData.get("extractedContext") as string) || null;

    if (!file) return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });

    const textoExtraido = await extractTextFromFile(file);

    if (!textoExtraido || textoExtraido.trim().length < 50) {
      return NextResponse.json({ success: false, error: "Could not extract enough text from file" }, { status: 400 });
    }

    const github = await resolveGithub(githubUrl, packageJsonFile);

    const { geminiModel } = await import("@/lib/gemini");
    const { VENTURELENS_SYSTEM_PROMPT, V2_SCHEMA_PART_A, V2_SCHEMA_PART_B } = await import("@/lib/playbook");

    let prompt = `${VENTURELENS_SYSTEM_PROMPT}\n\nAnalyze this document:\n\n${textoExtraido}`;

    // Append founder-provided context if available
    if (extractedContext) {
      try {
        const fields = JSON.parse(extractedContext);
        prompt += `\n\n--- CONTEXTO ADICIONAL FORNECIDO PELO FUNDADOR ---
- Problema: ${fields.problema || "N/A"}
- Solução: ${fields.solucao || "N/A"}
- ICP: ${fields.icp || "N/A"}
- Monetização: ${fields.monetizacao || "N/A"}
- Vertical: ${fields.vertical || "N/A"}
- Dependências Tecnológicas: ${fields.dependencias || "N/A"}
- Mercados-Alvo: ${fields.mercados || "N/A"}

Considere estas informações como verdade fornecida pelo fundador. Use-as para enriquecer sua análise.`;
      } catch {
        // ignore parse error
      }
    }

    if (github.context) {
      prompt += `\n\n--- TECHNICAL DATA FROM REPOSITORY ---\n${github.context}`;
    }

    // Try full call first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let d: any;
    try {
      const result = await geminiModel.generateContent(prompt);
      const text = result.response.text();
      d = JSON.parse(text);
    } catch (parseError) {
      // FALLBACK: Split into 2 calls
      console.log("Full response failed, trying split fallback...", parseError);

      const promptA = `${prompt}\n\n${V2_SCHEMA_PART_A}`;
      const promptB = `${prompt}\n\n${V2_SCHEMA_PART_B}`;

      const [resultA, resultB] = await Promise.all([
        geminiModel.generateContent(promptA),
        geminiModel.generateContent(promptB),
      ]);

      const partA = JSON.parse(resultA.response.text());
      const partB = JSON.parse(resultB.response.text());
      d = { ...partA, ...partB };
    }

    // Inject github_status
    if (github.status !== "sem_github") {
      d.github_status = github.status;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    const analysis = {
      id,
      created_at: now,
      created_by: createdBy,
      project_name: d.meta?.companyName || file.name.replace(/\.[^.]+$/, ""),
      file_name: file.name,
      score: d.scores?.overall?.score || 0,
      verdict: d.executiveSummary?.verdict || "WATCH",
      recommendation: d.executiveSummary?.verdictExplanation || "",
      mvp_features: (d.recommendations?.immediate || []).map((s: string) => ({ name: s, reason: "" })),
      v2_features: (d.recommendations?.shortTerm || []).map((s: string) => ({ name: s, reason: "" })),
      cut_features: (d.recommendations?.strategic || []).map((s: string) => ({ name: s, reason: "" })),
      report_json: d,
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

    if (dbError) console.error("Supabase insert error:", dbError);

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
