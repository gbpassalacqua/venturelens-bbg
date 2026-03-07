"use client";

import React from "react";
import type { V2ReportJson, Verdict } from "@/types/analysis";
import { extractShortValue } from "./helpers";

/* ── Props ─────────────────────────────────────────────────────────── */
interface FullReportProps {
  report: V2ReportJson;
  onExportPDF: () => void;
}

/* ── Verdict config ────────────────────────────────────────────────── */
function verdictBadge(verdict: string) {
  const v = verdict.toUpperCase() as Verdict;
  switch (v) {
    case "STRONG PASS":
      return { bg: "bg-[rgba(34,197,94,.1)]", text: "text-[var(--vl-green)]", label: "Aprovado com Destaque" };
    case "PASS":
      return { bg: "bg-[rgba(34,197,94,.1)]", text: "text-[var(--vl-green)]", label: "Aprovado" };
    case "CONDITIONAL":
      return { bg: "bg-[rgba(251,146,60,.1)]", text: "text-[var(--vl-amber)]", label: "Condicional" };
    case "WATCH":
      return { bg: "bg-[rgba(251,146,60,.1)]", text: "text-[var(--vl-amber)]", label: "Observação" };
    case "DECLINE":
      return { bg: "bg-[rgba(239,68,68,.1)]", text: "text-[var(--vl-red)]", label: "Recusado" };
    default:
      return { bg: "bg-[rgba(251,146,60,.1)]", text: "text-[var(--vl-amber)]", label: verdict };
  }
}

/* ── Grade color ───────────────────────────────────────────────────── */
function gradeColor(grade: string) {
  const g = grade.toUpperCase().charAt(0);
  switch (g) {
    case "A": return "text-[var(--vl-green)]";
    case "B": return "text-[var(--vl-blue)]";
    case "C": return "text-[var(--vl-amber)]";
    default:  return "text-[var(--vl-red)]";
  }
}

/* ── Section title ─────────────────────────────────────────────────── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
      {children}
      <span className="flex-1 h-px bg-[var(--vl-border)]" />
    </h3>
  );
}

/* ── Card wrapper ──────────────────────────────────────────────────── */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4 ${className}`}>
      {children}
    </div>
  );
}

/* ── Metric box ────────────────────────────────────────────────────── */
function MetricBox({ label, value }: { label: string; value: string }) {
  const shortVal = extractShortValue(value);
  return (
    <div className="bg-[var(--vl-bg2)] rounded-lg p-3" title={value}>
      <div className="text-xs text-[var(--vl-text3)] uppercase tracking-wider mb-1">{label}</div>
      <div className="font-mono text-sm text-[var(--vl-gold2)]">{shortVal}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Full Report Component
   ══════════════════════════════════════════════════════════════════════ */
export default function FullReport({ report, onExportPDF }: FullReportProps) {
  const badge = verdictBadge(report.executiveSummary.verdict);

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h2 className="font-display text-[2rem] font-bold">
            {"Relat\u00f3rio Completo de Valida\u00e7\u00e3o"}
          </h2>
          <p className="text-[var(--vl-text2)] mt-1.5">
            VentureLens AI · {report.meta.companyName} · {report.meta.industry} · {report.meta.stage}
          </p>
        </div>
        <button onClick={onExportPDF} className="btn-primary whitespace-nowrap">
          ⬇ Exportar PDF
        </button>
      </div>

      {/* ── VERDICT SUMMARY CARD ────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[var(--vl-card)] to-[var(--vl-card2)] border border-[var(--vl-border)] rounded-xl p-8 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-10 items-center">
          {/* Left — verdict explanation */}
          <div>
            <h3 className="font-display text-xl font-bold mb-3">Veredito da IA</h3>
            <p className="text-base leading-[1.7] text-[var(--vl-text2)] italic">
              {report.executiveSummary.verdictExplanation}
            </p>
          </div>

          {/* Right — score + badge */}
          <div>
            <div className="font-display text-[5rem] font-extrabold text-[var(--vl-gold)] leading-none text-center">
              {report.scores.overall.score}
            </div>
            <div className="text-xs uppercase tracking-widest text-[var(--vl-text2)] text-center">
              Opportunity Score
            </div>
            <div className={`mt-3 p-2 rounded-md text-xs font-semibold text-center ${badge.bg} ${badge.text}`}>
              {badge.label}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1 — Executive Summary ───────────────────────────── */}
      <Card>
        <SectionTitle>1. SUMÁRIO EXECUTIVO</SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[var(--vl-text3)]">Empresa: </span>
            <span className="text-[var(--vl-text)]">{report.meta.companyName}</span>
          </div>
          <div>
            <span className="text-[var(--vl-text3)]">Indústria: </span>
            <span className="text-[var(--vl-text)]">{report.meta.industry}</span>
          </div>
          <div>
            <span className="text-[var(--vl-text3)]">Estágio: </span>
            <span className="text-[var(--vl-text)]">{report.meta.stage}</span>
          </div>
          <div>
            <span className="text-[var(--vl-text3)]">Localização: </span>
            <span className="text-[var(--vl-text)]">{report.meta.location}</span>
          </div>
          <div>
            <span className="text-[var(--vl-text3)]">Ask de Funding: </span>
            <span className="text-[var(--vl-text)]">{report.meta.fundingAsk}</span>
          </div>
          <div>
            <span className="text-[var(--vl-text3)]">One-Liner: </span>
            <span className="text-[var(--vl-text)]">{report.executiveSummary.oneLiner}</span>
          </div>
        </div>

        {/* Thesis */}
        <div className="mt-4 p-4 bg-[var(--vl-bg2)] rounded-lg">
          <div className="text-xs text-[var(--vl-green)] font-semibold mb-2">
            TESE (Por que pode ser ótimo)
          </div>
          <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
            {report.executiveSummary.thesis}
          </p>
        </div>

        {/* Anti-thesis */}
        <div className="mt-3 p-4 bg-[var(--vl-bg2)] rounded-lg">
          <div className="text-xs text-[var(--vl-red)] font-semibold mb-2">
            ANTÍTESE (Por que pode falhar)
          </div>
          <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
            {report.executiveSummary.antiThesis}
          </p>
        </div>
      </Card>

      {/* ── SECTION 2 — Investor Questions ──────────────────────────── */}
      <Card>
        <SectionTitle>2. PERGUNTAS DE INVESTIDORES</SectionTitle>

        <ol>
          {report.investorQuestions.map((question, i) => (
            <li
              key={i}
              className="flex gap-3 py-2.5 border-b border-[var(--vl-border)] last:border-0"
            >
              <span className="font-mono text-sm text-[var(--vl-gold2)] min-w-[24px]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-[var(--vl-text2)] leading-relaxed">
                {question}
              </span>
            </li>
          ))}
        </ol>
      </Card>

      {/* ── SECTION 3 — Slide-by-Slide Analysis ────────────────────── */}
      <Card>
        <SectionTitle>3. ANÁLISE SLIDE POR SLIDE</SectionTitle>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--vl-text3)] border-b border-[var(--vl-border)]">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">Título</th>
                <th className="pb-2 pr-3">Categoria</th>
                <th className="pb-2 pr-3">Nota</th>
                <th className="pb-2">Sugestão</th>
              </tr>
            </thead>
            <tbody>
              {report.slideBySlide.map((slide) => (
                <tr
                  key={slide.slideNumber}
                  className="border-b border-[var(--vl-border)] last:border-0"
                >
                  <td className="py-2.5 pr-3 font-mono text-[var(--vl-text3)]">
                    {slide.slideNumber}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--vl-text)]">
                    {slide.slideTitle}
                  </td>
                  <td className="py-2.5 pr-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs bg-[var(--vl-bg2)] text-[var(--vl-text2)] border border-[var(--vl-border)]">
                      {slide.category}
                    </span>
                  </td>
                  <td className={`py-2.5 pr-3 font-mono font-bold ${gradeColor(slide.grade)}`}>
                    {slide.grade}
                  </td>
                  <td className="py-2.5 text-[var(--vl-text2)] leading-relaxed">
                    {slide.suggestion}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── SECTION 4 — Financial Verdict ───────────────────────────── */}
      <Card>
        <SectionTitle>4. ANÁLISE FINANCEIRA</SectionTitle>

        <p className="text-sm text-[var(--vl-text2)] leading-relaxed mb-4">
          {report.financialAnalysis.financialVerdict}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetricBox label="Receita" value={report.financialAnalysis.currentMetrics.revenue} />
          <MetricBox label="Burn Rate" value={report.financialAnalysis.currentMetrics.burnRate} />
          <MetricBox label="Runway" value={report.financialAnalysis.currentMetrics.runway} />
          <MetricBox label="Margem Bruta" value={report.financialAnalysis.currentMetrics.grossMargin} />
          <MetricBox label="CAC" value={report.financialAnalysis.currentMetrics.cac} />
          <MetricBox label="LTV" value={report.financialAnalysis.currentMetrics.ltv} />
          <MetricBox label="LTV:CAC" value={report.financialAnalysis.currentMetrics.ltvCacRatio} />
          <MetricBox label="Churn" value={report.financialAnalysis.currentMetrics.churn} />
          <MetricBox label="NRR" value={report.financialAnalysis.currentMetrics.nrr} />
        </div>
      </Card>

      {/* ── SECTION 5 — Comparables ─────────────────────────────────── */}
      <Card>
        <SectionTitle>5. EMPRESAS COMPARÁVEIS</SectionTitle>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--vl-text3)] border-b border-[var(--vl-border)]">
                <th className="pb-2 pr-3">Empresa</th>
                <th className="pb-2 pr-3">Similaridade</th>
                <th className="pb-2 pr-3">Resultado</th>
                <th className="pb-2">Lição</th>
              </tr>
            </thead>
            <tbody>
              {report.comparables.similarCompanies.map((comp, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--vl-border)] last:border-0"
                >
                  <td className="py-2.5 pr-3 text-[var(--vl-text)] font-semibold">
                    {comp.name}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--vl-text2)]">
                    {comp.similarity}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--vl-text2)]">
                    {comp.outcome}
                  </td>
                  <td className="py-2.5 text-[var(--vl-text2)] leading-relaxed">
                    {comp.lesson}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-[var(--vl-text2)] mt-4 leading-relaxed">
          {report.comparables.benchmarkMetrics}
        </p>
      </Card>

      {/* ── SECTION 6 — Recommendations ─────────────────────────────── */}
      <Card>
        <SectionTitle>6. RECOMENDAÇÕES</SectionTitle>

        {/* Immediate */}
        <div className="mb-5">
          <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-[rgba(239,68,68,.1)] text-[var(--vl-red)] mb-3">
            IMEDIATO
          </span>
          <div>
            {report.recommendations.immediate.map((item, i) => (
              <div
                key={i}
                className="flex gap-2 py-2 border-b border-[var(--vl-border)] last:border-0"
              >
                <span className="font-mono text-[var(--vl-text3)]">&rarr;</span>
                <span className="text-sm text-[var(--vl-text)]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Short-term */}
        <div className="mb-5">
          <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-[rgba(251,146,60,.1)] text-[var(--vl-amber)] mb-3">
            CURTO PRAZO
          </span>
          <div>
            {report.recommendations.shortTerm.map((item, i) => (
              <div
                key={i}
                className="flex gap-2 py-2 border-b border-[var(--vl-border)] last:border-0"
              >
                <span className="font-mono text-[var(--vl-text3)]">&rarr;</span>
                <span className="text-sm text-[var(--vl-text)]">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic */}
        <div>
          <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-[rgba(34,197,94,.1)] text-[var(--vl-green)] mb-3">
            ESTRATÉGICO
          </span>
          <div>
            {report.recommendations.strategic.map((item, i) => (
              <div
                key={i}
                className="flex gap-2 py-2 border-b border-[var(--vl-border)] last:border-0"
              >
                <span className="font-mono text-[var(--vl-text3)]">&rarr;</span>
                <span className="text-sm text-[var(--vl-text)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
