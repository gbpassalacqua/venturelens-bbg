"use client";

import { useState, useRef } from "react";
import UploadZone from "@/components/UploadZone";
import ReportOutput from "@/components/ReportOutput";
import LoadingSteps from "@/components/LoadingSteps";
import { AnalysisResult, AnalysisResponse } from "@/types/analysis";
import Link from "next/link";

const USERS = ["Giuliano", "Bruno", "Bento"];

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState(USERS[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // GitHub fields
  const [githubUrl, setGithubUrl] = useState("");
  const [packageJsonFile, setPackageJsonFile] = useState<File | null>(null);
  const packageJsonRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("created_by", selectedUser);

      if (githubUrl.trim()) {
        formData.append("githubUrl", githubUrl.trim());
      }
      if (packageJsonFile) {
        formData.append("packageJsonFile", packageJsonFile);
      }

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const json: AnalysisResponse = await res.json();

      if (!json.success || !json.data) throw new Error(json.error ?? "Erro na análise");
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--vl-border)] bg-[var(--vl-bg)]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-xl text-[var(--vl-gold)]">VentureLens</span>
            <span className="text-sm text-[var(--vl-text3)] font-medium ml-1">BBG</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/history" className="text-sm text-[var(--vl-text2)] hover:text-[var(--vl-text)] transition-colors">
              Histórico
            </Link>
            <div className="flex gap-1 bg-[var(--vl-bg2)] rounded-lg p-0.5">
              {USERS.map((u) => (
                <button
                  key={u}
                  onClick={() => setSelectedUser(u)}
                  className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
                    selectedUser === u
                      ? "bg-[var(--vl-gold)] text-[var(--vl-bg)]"
                      : "text-[var(--vl-text3)] hover:text-[var(--vl-text2)]"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {!result && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 pt-8">
              <h1 className="font-display text-4xl font-bold text-[var(--vl-text)]">
                Analise seu <span className="text-[var(--vl-gold)]">PRD</span>
              </h1>
              <p className="text-[var(--vl-text3)]">Envie seu PRD para análise com IA</p>
            </div>

            <UploadZone onFileSelected={(f) => setSelectedFile(f)} isLoading={isLoading} />

            {/* GitHub Section */}
            <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base">💻</span>
                <h3 className="font-display font-bold text-sm text-[var(--vl-text)]">Repositório GitHub</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--vl-bg2)] text-[var(--vl-text3)]">Opcional</span>
              </div>

              {/* Campo 1 — URL */}
              <div>
                <input
                  type="url"
                  placeholder="https://github.com/usuario/projeto"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-border)] text-sm text-[var(--vl-text)] placeholder:text-[var(--vl-text3)] focus:outline-none focus:border-[var(--vl-gold)]/50 transition-colors"
                />
              </div>

              {githubUrl.trim() && (
                <div className="space-y-3">
                  <p className="text-[10px] text-[var(--vl-text3)]">
                    📦 Opcionalmente, envie o <strong className="text-[var(--vl-text2)]">package.json</strong> para enriquecer a análise técnica
                  </p>

                  {/* Upload package.json */}
                  <div className="space-y-2">
                    <input
                      ref={packageJsonRef}
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setPackageJsonFile(f);
                      }}
                      className="hidden"
                    />
                    {!packageJsonFile ? (
                      <button
                        onClick={() => packageJsonRef.current?.click()}
                        className="w-full py-3 rounded-lg border border-dashed border-[var(--vl-border)] bg-[var(--vl-bg2)] text-xs text-[var(--vl-text3)] hover:border-[var(--vl-gold)]/40 hover:text-[var(--vl-text2)] transition-colors"
                      >
                        📦 Clique para enviar o package.json
                      </button>
                    ) : (
                      <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-green)]/30">
                        <span className="text-xs text-[var(--vl-green)]">✓ {packageJsonFile.name}</span>
                        <button
                          onClick={() => {
                            setPackageJsonFile(null);
                            if (packageJsonRef.current) packageJsonRef.current.value = "";
                          }}
                          className="text-xs text-[var(--vl-text3)] hover:text-[var(--vl-red)]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {selectedFile && !isLoading && (
              <button
                onClick={handleAnalyze}
                className="w-full py-3 rounded-xl font-display font-bold text-lg bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] transition-colors"
              >
                Analisar PRD
              </button>
            )}

            {isLoading && <LoadingSteps />}

            {error && (
              <div className="p-4 rounded-xl border border-[var(--vl-red)]/30 bg-[var(--vl-red)]/5">
                <p className="text-sm text-[var(--vl-red)]">{error}</p>
              </div>
            )}
          </div>
        )}

        {result && <ReportOutput result={result} />}
      </div>
    </main>
  );
}
