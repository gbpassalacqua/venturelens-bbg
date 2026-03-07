"use client";

import React from "react";
import type { V2ReportJson, Verdict } from "@/types/analysis";
import KPIRow from "./KPIRow";
import TAMCards from "./TAMCards";

interface DashboardProps {
  report: V2ReportJson;
  onTabChange: (tab: string) => void;
  onExportPDF: () => void;
}

/* ── Score label map (PT-BR) ─────────────────────────────────────── */
const SCORE_LABELS: Record<string, string> = {
  market: "Mercado",
  team: "Equipe",
  product: "Produto",
  traction: "Tra\u00e7\u00e3o",
  financials: "Financeiro",
  gtm: "GTM",
  technology: "Tecnologia",
  deckQuality: "Deck",
};

const SCORE_KEYS = Object.keys(SCORE_LABELS) as Array<keyof typeof SCORE_LABELS>;

/* ── Verdict config ──────────────────────────────────────────────── */
function getVerdictConfig(verdict: string) {
  const v = verdict.toUpperCase() as Verdict;
  switch (v) {
    case "STRONG PASS":
      return {
        bg: "bg-[rgba(34,197,94,.08)]",
        border: "border border-[rgba(34,197,94,.2)]",
        text: "text-[var(--vl-green)]",
        label: "\u2713 Aprovado com Destaque",
      };
    case "PASS":
      return {
        bg: "bg-[rgba(34,197,94,.08)]",
        border: "border border-[rgba(34,197,94,.2)]",
        text: "text-[var(--vl-green)]",
        label: "\u2713 Aprovado",
      };
    case "CONDITIONAL":
      return {
        bg: "bg-[rgba(251,146,60,.08)]",
        border: "border border-[rgba(251,146,60,.2)]",
        text: "text-[var(--vl-amber)]",
        label: "\u26A0 Condicional",
      };
    case "WATCH":
      return {
        bg: "bg-[rgba(251,146,60,.08)]",
        border: "border border-[rgba(251,146,60,.2)]",
        text: "text-[var(--vl-amber)]",
        label: "\uD83D\uDC41 Observa\u00e7\u00e3o",
      };
    case "DECLINE":
      return {
        bg: "bg-[rgba(239,68,68,.08)]",
        border: "border border-[rgba(239,68,68,.2)]",
        text: "text-[var(--vl-red)]",
        label: "\u2715 Recusado",
      };
    default:
      return {
        bg: "bg-[rgba(251,146,60,.08)]",
        border: "border border-[rgba(251,146,60,.2)]",
        text: "text-[var(--vl-amber)]",
        label: verdict,
      };
  }
}

/* ── Bar color by score ──────────────────────────────────────────── */
function barColor(score: number): string {
  if (score >= 80) return "bg-[var(--vl-green)]";
  if (score >= 60) return "bg-[var(--vl-gold)]";
  return "bg-[var(--vl-amber)]";
}

/* ── Truncate text helper ────────────────────────────────────────── */
function truncate(text: string, max: number): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "\u2026" : text;
}

/* ── Extract competitor name ─────────────────────────────────────── */
function competitorName(text: string): string {
  // Try to extract a name before a colon, dash or period
  const match = text.match(/^([^:\-\u2013\u2014.]+)/);
  return match ? match[1].trim() : text.slice(0, 40);
}

/* ================================================================= */
/*  DASHBOARD COMPONENT                                               */
/* ================================================================= */

export default function Dashboard({
  report,
  onTabChange,
  onExportPDF,
}: DashboardProps) {
  const { scores, executiveSummary, strategyAnalysis, meta } = report;
  const verdictCfg = getVerdictConfig(executiveSummary.verdict);
  const landscape = strategyAnalysis.competitiveLandscape;
  const directComps = landscape.directCompetitors?.slice(0, 4) ?? [];
  const indirectComps = landscape.indirectCompetitors?.slice(0, 2) ?? [];

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── PAGE HEADER ────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-10 max-[900px]:flex-col max-[900px]:gap-4">
        <div>
          <h2 className="font-display text-[2rem] font-bold tracking-[-0.02em]">
            {meta.companyName || "VentureLens AI \u2014 An\u00e1lise de Startup"}
          </h2>
          <p className="text-[var(--vl-text2)] mt-1.5">
            An\u00e1lise completa &middot; {meta.industry} &middot; {meta.stage}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onTabChange("report")}
            className="px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-border2)] bg-transparent text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-colors cursor-pointer"
          >
            \uD83D\uDCC4 Relat\u00f3rio Completo
          </button>
          <button
            type="button"
            onClick={onExportPDF}
            className="px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-gold)] bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] transition-colors cursor-pointer"
          >
            \u2B07 Exportar PDF
          </button>
        </div>
      </div>

      {/* ── KPI ROW ────────────────────────────────────────────── */}
      <KPIRow report={report} />

      {/* ── DASHBOARD GRID ─────────────────────────────────────── */}
      <div className="grid grid-cols-[320px_1fr] gap-5 max-[900px]:grid-cols-1">
        {/* ── LEFT SIDEBAR ───────────────────────────────────── */}
        <div>
          {/* Opportunity Score Card */}
          <div className="bg-gradient-to-br from-[var(--vl-card)] to-[var(--vl-card2)] border border-[var(--vl-border)] rounded-xl p-7 text-center relative overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-[60px] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(240,165,0,.2),transparent_70%)] pointer-events-none" />

            {/* Label */}
            <div className="text-[.7rem] uppercase tracking-[.12em] text-[var(--vl-text3)] mb-2.5 relative z-10">
              OPPORTUNITY SCORE
            </div>

            {/* Score */}
            <div className="font-display text-[5rem] font-extrabold text-[var(--vl-gold)] leading-none relative z-10">
              {scores.overall.score}
            </div>

            {/* Caption */}
            <div className="text-sm text-[var(--vl-text2)] mt-2 relative z-10">
              de 100 &middot; {scores.overall.label}
            </div>

            {/* Verdict box */}
            <div
              className={`mt-4 p-3 rounded-lg text-sm relative z-10 ${verdictCfg.bg} ${verdictCfg.border} ${verdictCfg.text}`}
            >
              <div className="font-semibold">{verdictCfg.label}</div>
              <div className="mt-1 text-xs opacity-80">
                {truncate(executiveSummary.verdictExplanation, 160)}
              </div>
            </div>
          </div>

          {/* Score Breakdown Card */}
          <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mt-4">
            {/* Title */}
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
              SCORE BREAKDOWN
              <span className="flex-1 h-px bg-[var(--vl-border)]" />
            </div>

            {/* Score items */}
            <div>
              {SCORE_KEYS.map((key, idx) => {
                const item = scores[key as keyof typeof scores];
                if (!item) return null;
                const score = item.score;
                const isLast = idx === SCORE_KEYS.length - 1;

                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 py-2.5 ${
                      isLast ? "" : "border-b border-[var(--vl-border)]"
                    }`}
                  >
                    {/* Name */}
                    <span className="text-sm min-w-[90px]">
                      {SCORE_LABELS[key]}
                    </span>

                    {/* Bar */}
                    <div className="flex-1">
                      <div className="bg-[var(--vl-border)] rounded h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded ${barColor(score)}`}
                          style={{ width: `${(score / 100) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Score value */}
                    <span className="font-mono text-sm text-[var(--vl-gold2)] min-w-[32px] text-right">
                      {Math.round(score / 5)}/20
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── RIGHT MAIN CONTENT ─────────────────────────────── */}
        <div>
          {/* TAM / SAM / SOM Card */}
          <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
              MERCADO \u2014 TAM / SAM / SOM
              <span className="flex-1 h-px bg-[var(--vl-border)]" />
            </div>
            <TAMCards
              tam={strategyAnalysis.marketSize.tam}
              sam={strategyAnalysis.marketSize.sam}
              som={strategyAnalysis.marketSize.som}
            />
          </div>

          {/* Top Competitors Card */}
          <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6">
            <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
              TOP COMPETIDORES
              <span className="flex-1 h-px bg-[var(--vl-border)]" />
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                    Empresa
                  </th>
                  <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                    Tipo
                  </th>
                  <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                    Amea\u00e7a
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Direct Competitors */}
                {directComps.map((comp, i) => (
                  <tr key={`direct-${i}`}>
                    <td className="py-3 px-3.5 border-b border-[var(--vl-border)] text-[var(--vl-text)]">
                      {competitorName(comp)}
                    </td>
                    <td className="py-3 px-3.5 border-b border-[var(--vl-border)]">
                      <span className="inline-block py-0.5 px-2.5 rounded-full text-[.72rem] font-semibold bg-[rgba(239,68,68,.12)] text-[var(--vl-red)] border border-[rgba(239,68,68,.2)]">
                        Direto
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border-b border-[var(--vl-border)]">
                      <span className="inline-block py-0.5 px-2.5 rounded-full text-[.72rem] font-semibold bg-[rgba(239,68,68,.12)] text-[var(--vl-red)] border border-[rgba(239,68,68,.2)]">
                        Alto
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Indirect Competitors */}
                {indirectComps.map((comp, i) => (
                  <tr key={`indirect-${i}`}>
                    <td className="py-3 px-3.5 border-b border-[var(--vl-border)] text-[var(--vl-text)]">
                      {competitorName(comp)}
                    </td>
                    <td className="py-3 px-3.5 border-b border-[var(--vl-border)]">
                      <span className="inline-block py-0.5 px-2.5 rounded-full text-[.72rem] font-semibold bg-[rgba(59,130,246,.12)] text-[var(--vl-blue2)] border border-[rgba(59,130,246,.2)]">
                        Indireto
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border-b border-[var(--vl-border)]">
                      <span className="inline-block py-0.5 px-2.5 rounded-full text-[.72rem] font-semibold bg-[rgba(59,130,246,.12)] text-[var(--vl-blue2)] border border-[rgba(59,130,246,.2)]">
                        M\u00e9dio
                      </span>
                    </td>
                  </tr>
                ))}

                {directComps.length === 0 && indirectComps.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-6 px-3.5 text-center text-[var(--vl-text3)] text-sm"
                    >
                      Nenhum competidor identificado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* View all competitors button */}
            <button
              type="button"
              onClick={() => onTabChange("competitors")}
              className="mt-3.5 px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-border2)] bg-transparent text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-colors cursor-pointer"
            >
              Ver todos os competidores &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
