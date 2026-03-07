"use client";

import React from "react";
import FlowBar from "./FlowBar";
import UploadZone from "../UploadZone";

interface InputScreenProps {
  onFileSelected: (file: File) => void;
  onNext: () => void;
  onBack: () => void;
  selectedFile: File | null;
  isLoading: boolean;
  // Idea text
  ideaText: string;
  onIdeaTextChange: (text: string) => void;
  // Product description (optional)
  productDescription: string;
  onProductDescriptionChange: (text: string) => void;
  // Target market
  targetMarket: "usa" | "brasil" | "ambos";
  onTargetMarketChange: (market: "usa" | "brasil" | "ambos") => void;
  // User
  selectedUser: string;
  users: string[];
  onUserChange: (user: string) => void;
}

type MarketOption = "usa" | "brasil" | "ambos";

const MARKETS: { key: MarketOption; icon: string; label: string }[] = [
  { key: "usa", icon: "\u{1F1FA}\u{1F1F8}", label: "USA" },
  { key: "brasil", icon: "\u{1F1E7}\u{1F1F7}", label: "Brasil" },
  { key: "ambos", icon: "\u{1F30E}", label: "Ambos" },
];

export default function InputScreen({
  onFileSelected,
  onNext,
  onBack,
  selectedFile,
  isLoading,
  ideaText,
  onIdeaTextChange,
  productDescription,
  onProductDescriptionChange,
  targetMarket,
  onTargetMarketChange,
  selectedUser,
  users,
  onUserChange,
}: InputScreenProps) {
  return (
    <div>
      {/* FlowBar */}
      <FlowBar
        steps={[
          { label: "Descrever Ideia", status: "active" },
          { label: "Confirmar", status: "pending" },
          { label: "Analisando", status: "pending" },
          { label: "Dashboard", status: "pending" },
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
            Envie seu pitch deck e descreva sua ideia para an&aacute;lise.
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

        {/* ── Descrição da Ideia ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            {"\u{1F4DD}"} DESCRI&Ccedil;&Atilde;O DA IDEIA
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>
          <textarea
            placeholder="Descreva sua ideia de startup, o problema que resolve, o p&#250;blico-alvo e como pretende monetizar..."
            value={ideaText}
            onChange={(e) => onIdeaTextChange(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-border)] text-sm text-[var(--vl-text)] placeholder:text-[var(--vl-text3)] focus:outline-none focus:border-[var(--vl-gold)]/50 transition-colors resize-none"
            style={{ minHeight: "140px" }}
          />
          <p className="text-[10px] text-[var(--vl-text3)] mt-1.5">
            Quanto mais detalhes, melhor ser&aacute; a an&aacute;lise dos 4
            agentes de IA.
          </p>
        </div>

        {/* ── Pitch Deck (upload) ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            {"\u{1F4C4}"} PITCH DECK
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>
          <UploadZone onFileSelected={onFileSelected} isLoading={isLoading} />
        </div>

        {/* ── Produto (optional) ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            {"\u{1F4BB}"} PRODUTO
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--vl-bg2)] text-[var(--vl-text3)] normal-case tracking-normal font-normal">
              Opcional
            </span>
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>
          <input
            type="text"
            placeholder="URL do produto ou breve descri&#231;&#227;o do produto"
            value={productDescription}
            onChange={(e) => onProductDescriptionChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-border)] text-sm text-[var(--vl-text)] placeholder:text-[var(--vl-text3)] focus:outline-none focus:border-[var(--vl-gold)]/50 transition-colors"
          />
          <p className="text-[10px] text-[var(--vl-text3)] mt-1.5">
            URL ou descri&ccedil;&atilde;o do produto para enriquecer a
            an&aacute;lise
          </p>
        </div>

        {/* ── Mercados-Alvo ── */}
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5 mb-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            {"\u{1F30D}"} MERCADOS-ALVO
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </div>
          <div className="flex gap-2">
            {MARKETS.map(({ key, icon, label }) => (
              <button
                key={key}
                onClick={() => onTargetMarketChange(key)}
                className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all border ${
                  targetMarket === key
                    ? "bg-[var(--vl-gold)]/10 border-[var(--vl-gold)]/50 text-[var(--vl-gold)]"
                    : "bg-[var(--vl-bg2)] border-[var(--vl-border)] text-[var(--vl-text3)] hover:text-[var(--vl-text2)] hover:border-[var(--vl-gold)]/30"
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
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
            onClick={onNext}
            disabled={!selectedFile || isLoading}
            className="py-2.5 px-7 rounded-lg text-[.95rem] font-semibold bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(240,165,0,.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Pr&oacute;ximo &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
