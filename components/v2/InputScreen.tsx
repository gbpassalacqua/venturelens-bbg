"use client";

import React, { useRef } from "react";
import FlowBar from "./FlowBar";
import UploadZone from "../UploadZone";
import RepoSelector from "../RepoSelector";

interface InputScreenProps {
  onFileSelected: (file: File) => void;
  onAnalyze: () => void;
  onBack: () => void;
  selectedFile: File | null;
  isLoading: boolean;
  // Product mode
  productMode: "site" | "html" | "prd";
  onProductModeChange: (mode: "site" | "html" | "prd") => void;
  siteUrl: string;
  onSiteUrlChange: (url: string) => void;
  htmlFile: File | null;
  onHtmlFileSelected: (file: File | null) => void;
  // GitHub
  githubUrl: string;
  selectedRepo: { fullName: string; isPrivate: boolean } | null;
  packageJsonFile: File | null;
  onGithubSelect: (url: string, fullName: string, isPrivate: boolean) => void;
  onGithubClear: () => void;
  onPackageJsonSelected: (file: File | null) => void;
  // User
  selectedUser: string;
  users: string[];
  onUserChange: (user: string) => void;
}

type ProductMode = "site" | "html" | "prd";

const PRODUCT_MODES: { mode: ProductMode; icon: string; label: string }[] = [
  { mode: "site", icon: "\u{1F310}", label: "Tenho site no ar" },
  { mode: "html", icon: "\u{1F4C4}", label: "Tenho HTML" },
  { mode: "prd", icon: "\u{1F4CB}", label: "S\u00F3 o PRD" },
];

export default function InputScreen({
  onFileSelected,
  onAnalyze,
  onBack,
  selectedFile,
  isLoading,
  productMode,
  onProductModeChange,
  siteUrl,
  onSiteUrlChange,
  htmlFile,
  onHtmlFileSelected,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  githubUrl,
  selectedRepo,
  packageJsonFile,
  onGithubSelect,
  onGithubClear,
  onPackageJsonSelected,
  selectedUser,
  users,
  onUserChange,
}: InputScreenProps) {
  const htmlRef = useRef<HTMLInputElement>(null);
  const packageJsonRef = useRef<HTMLInputElement>(null);

  const hasRepo = !!selectedRepo;
  const hasPkg = !!packageJsonFile;

  return (
    <div>
      {/* FlowBar */}
      <FlowBar
        steps={[
          { label: "Descrever Ideia", status: "active" },
          { label: "An\u00E1lise em Andamento", status: "pending" },
          { label: "Dashboard", status: "pending" },
          { label: "", status: "pending" },
        ]}
      />

      {/* Content */}
      <div className="max-w-[760px] mx-auto py-10 px-10">
        {/* Page header */}
        <div className="mb-10">
          <h2 className="font-display text-[2rem] font-bold tracking-[-0.02em]">
            Descreva sua startup
          </h2>
          <p className="text-[var(--vl-text2)] mt-1.5">
            Envie seu pitch deck e informa&ccedil;&otilde;es adicionais para
            an&aacute;lise.
          </p>
        </div>

        {/* ── Analista (user selector) ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            ANALISTA
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>
          <div className="flex gap-1 bg-[var(--vl-bg2)] rounded-lg p-0.5">
            {users.map((u) => (
              <button
                key={u}
                onClick={() => onUserChange(u)}
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

        {/* ── Pitch Deck (upload) ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            PITCH DECK
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>
          <UploadZone onFileSelected={onFileSelected} isLoading={isLoading} />
        </div>

        {/* ── Produto (optional) ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            PRODUTO
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--vl-bg2)] text-[var(--vl-text3)] normal-case tracking-normal font-normal">
              Opcional
            </span>
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>

          {/* 3 pill buttons */}
          <div className="flex gap-2 mb-4">
            {PRODUCT_MODES.map(({ mode, icon, label }) => (
              <button
                key={mode}
                onClick={() => {
                  onProductModeChange(mode);
                  if (mode !== "site") onSiteUrlChange("");
                  if (mode !== "html") {
                    onHtmlFileSelected(null);
                    if (htmlRef.current) htmlRef.current.value = "";
                  }
                }}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                  productMode === mode
                    ? "bg-[var(--vl-gold)]/10 border-[var(--vl-gold)]/50 text-[var(--vl-gold)]"
                    : "bg-[var(--vl-bg2)] border-[var(--vl-border)] text-[var(--vl-text3)] hover:text-[var(--vl-text2)] hover:border-[var(--vl-gold)]/30"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          {/* Conditional: Site URL */}
          {productMode === "site" && (
            <div className="animate-fade-up">
              <input
                type="url"
                placeholder="https://meuproduto.com.br"
                value={siteUrl}
                onChange={(e) => onSiteUrlChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-border)] text-sm text-[var(--vl-text)] placeholder:text-[var(--vl-text3)] focus:outline-none focus:border-[var(--vl-gold)]/50 transition-colors"
              />
              <p className="text-[10px] text-[var(--vl-text3)] mt-1.5">
                URL do site para enriquecer a an&aacute;lise de produto
              </p>
            </div>
          )}

          {/* Conditional: HTML upload */}
          {productMode === "html" && (
            <div className="animate-fade-up space-y-2">
              <input
                ref={htmlRef}
                type="file"
                accept=".html,.htm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  onHtmlFileSelected(f ?? null);
                }}
                className="hidden"
              />
              {!htmlFile ? (
                <button
                  onClick={() => htmlRef.current?.click()}
                  className="w-full py-3 rounded-lg border border-dashed border-[var(--vl-border)] bg-[var(--vl-bg2)] text-xs text-[var(--vl-text3)] hover:border-[var(--vl-gold)]/40 hover:text-[var(--vl-text2)] transition-colors"
                >
                  {"\u{1F4C4}"} Clique para enviar o arquivo HTML
                </button>
              ) : (
                <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-green)]/30">
                  <span className="text-xs text-[var(--vl-green)]">
                    {"\u2713"} {htmlFile.name}
                  </span>
                  <button
                    onClick={() => {
                      onHtmlFileSelected(null);
                      if (htmlRef.current) htmlRef.current.value = "";
                    }}
                    className="text-xs text-[var(--vl-text3)] hover:text-[var(--vl-red)]"
                  >
                    {"\u2715"}
                  </button>
                </div>
              )}
              <p className="text-[10px] text-[var(--vl-text3)]">
                Arquivo HTML da landing page ou produto
              </p>
            </div>
          )}
        </div>

        {/* ── Reposit\u00F3rio GitHub (optional) ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            {"\u{1F4BB}"} REPOSIT&Oacute;RIO GITHUB
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--vl-bg2)] text-[var(--vl-text3)] normal-case tracking-normal font-normal">
              Opcional
            </span>
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>

          <p className="text-[10px] text-[var(--vl-text3)] mb-4">
            Use o reposit&oacute;rio{" "}
            <strong className="text-[var(--vl-text2)]">OU</strong> envie o
            package.json
          </p>

          {/* RepoSelector */}
          <RepoSelector
            onSelect={(url, fullName, isPrivate) => {
              onGithubSelect(url, fullName, isPrivate);
              // Clear package.json when repo is selected
              onPackageJsonSelected(null);
              if (packageJsonRef.current) packageJsonRef.current.value = "";
            }}
            onClear={onGithubClear}
            selected={selectedRepo}
            disabled={hasPkg}
          />

          {/* OR divider */}
          {!hasRepo && !hasPkg && (
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-[var(--vl-border)]" />
              <span className="text-[10px] text-[var(--vl-text3)]">ou</span>
              <div className="flex-1 h-px bg-[var(--vl-border)]" />
            </div>
          )}

          {/* Upload package.json */}
          {!hasRepo && (
            <div className="space-y-2 mt-3">
              <input
                ref={packageJsonRef}
                type="file"
                accept=".json"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  onPackageJsonSelected(f ?? null);
                }}
                className="hidden"
              />
              {!packageJsonFile ? (
                <button
                  onClick={() => packageJsonRef.current?.click()}
                  className="w-full py-3 rounded-lg border border-dashed border-[var(--vl-border)] bg-[var(--vl-bg2)] text-xs text-[var(--vl-text3)] hover:border-[var(--vl-gold)]/40 hover:text-[var(--vl-text2)] transition-colors"
                >
                  {"\u{1F4E6}"} Clique para enviar o package.json
                </button>
              ) : (
                <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-green)]/30">
                  <span className="text-xs text-[var(--vl-green)]">
                    {"\u2713"} {packageJsonFile.name}
                  </span>
                  <button
                    onClick={() => {
                      onPackageJsonSelected(null);
                      if (packageJsonRef.current)
                        packageJsonRef.current.value = "";
                    }}
                    className="text-xs text-[var(--vl-text3)] hover:text-[var(--vl-red)]"
                  >
                    {"\u2715"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom buttons ── */}
        <div className="flex justify-between mt-2">
          <button
            onClick={onBack}
            className="text-sm text-[var(--vl-text2)] hover:text-[var(--vl-text)] transition-colors py-2 px-4 rounded-lg hover:bg-[var(--vl-bg2)]"
          >
            &larr; Voltar
          </button>
          <button
            onClick={onAnalyze}
            disabled={!selectedFile || isLoading}
            className="py-2.5 px-7 rounded-lg text-[.95rem] font-semibold bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(240,165,0,.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[var(--vl-bg)] border-t-transparent rounded-full animate-spin" />
                Analisando...
              </span>
            ) : (
              "Analisar Minha Ideia \u2192"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
