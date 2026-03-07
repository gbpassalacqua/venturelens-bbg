"use client";

import React from "react";
import type { V2ReportJson, V2RiskItem, V2TechnicalRisk } from "@/types/analysis";

interface RiskScreenProps {
  report: V2ReportJson;
}

/* ── Helpers ── */

function probBadge(probability: string) {
  const key = probability.toUpperCase();
  if (key === "HIGH")
    return {
      label: "Alta prob.",
      bg: "rgba(239,68,68,.12)",
      color: "var(--vl-red)",
    };
  if (key === "MEDIUM")
    return {
      label: "M\u00e9dia prob.",
      bg: "rgba(251,146,60,.12)",
      color: "var(--vl-amber)",
    };
  return {
    label: "Baixa prob.",
    bg: "rgba(34,197,94,.12)",
    color: "var(--vl-green)",
  };
}

function impactBadge(impact: string) {
  const key = impact.toUpperCase();
  if (key === "FATAL")
    return {
      label: "Fatal",
      bg: "rgba(239,68,68,.12)",
      color: "var(--vl-red)",
    };
  if (key === "HIGH")
    return {
      label: "Alto impacto",
      bg: "rgba(239,68,68,.12)",
      color: "var(--vl-red)",
    };
  if (key === "MEDIUM")
    return {
      label: "M\u00e9dio impacto",
      bg: "rgba(251,146,60,.12)",
      color: "var(--vl-amber)",
    };
  return {
    label: "Baixo impacto",
    bg: "rgba(34,197,94,.12)",
    color: "var(--vl-green)",
  };
}

function severityBadge(severity: string) {
  const key = severity.toUpperCase();
  if (key === "CRITICAL" || key === "HIGH")
    return {
      label: key === "CRITICAL" ? "Cr\u00edtico" : "Alto",
      bg: "rgba(239,68,68,.12)",
      color: "var(--vl-red)",
    };
  if (key === "MEDIUM")
    return {
      label: "M\u00e9dio",
      bg: "rgba(251,146,60,.12)",
      color: "var(--vl-amber)",
    };
  return {
    label: "Baixo",
    bg: "rgba(34,197,94,.12)",
    color: "var(--vl-green)",
  };
}

/* ── Badge Component ── */

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span
      className="inline-block py-0.5 px-2.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

/* ── Strategy Risk Row ── */

function StrategyRiskRow({ item }: { item: V2RiskItem }) {
  const prob = probBadge(item.probability);
  const imp = impactBadge(item.impact);

  return (
    <div className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-4 mb-2.5">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-start">
        {/* Risk name */}
        <div>
          <p className="text-[.88rem] font-semibold mb-1">{item.risk}</p>
        </div>

        {/* Probability */}
        <Badge {...prob} />

        {/* Impact */}
        <Badge {...imp} />
      </div>

      {/* Mitigation */}
      {item.mitigation && (
        <div className="mt-2" style={{ gridColumn: "1 / -1" }}>
          <div className="bg-[rgba(255,255,255,.02)] rounded-md p-2.5">
            <p className="text-xs text-[var(--vl-text2)]">
              <span className="font-bold text-[var(--vl-text)]">
                Mitiga&ccedil;&atilde;o:{" "}
              </span>
              {item.mitigation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Technical Risk Row ── */

function TechnicalRiskRow({ item }: { item: V2TechnicalRisk }) {
  const sev = severityBadge(item.severity);

  return (
    <div className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-4 mb-2.5">
      <div className="grid grid-cols-[1fr_auto] gap-4 items-start">
        {/* Risk name */}
        <div>
          <p className="text-[.88rem] font-semibold mb-1">{item.risk}</p>
        </div>

        {/* Severity */}
        <Badge {...sev} />
      </div>

      {/* Mitigation */}
      {item.mitigation && (
        <div className="mt-2" style={{ gridColumn: "1 / -1" }}>
          <div className="bg-[rgba(255,255,255,.02)] rounded-md p-2.5">
            <p className="text-xs text-[var(--vl-text2)]">
              <span className="font-bold text-[var(--vl-text)]">
                Mitiga&ccedil;&atilde;o:{" "}
              </span>
              {item.mitigation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */

export default function RiskScreen({ report }: RiskScreenProps) {
  const strategyRisks = report.strategyAnalysis.riskMatrix;
  const technicalRisks = report.techAnalysis.technicalRisks;
  const totalRisks = strategyRisks.length + technicalRisks.length;

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── Page Header ── */}
      <h2 className="font-display text-[2rem] font-bold">
        An&aacute;lise de Riscos
      </h2>
      <p className="text-[var(--vl-text2)] mt-1.5">
        {totalRisks} riscos identificados
      </p>

      {/* ── Strategy Risks ── */}
      {strategyRisks.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 mt-6">
            RISCOS ESTRAT&Eacute;GICOS
          </h3>

          {strategyRisks.map((risk, i) => (
            <StrategyRiskRow key={`strat-${i}`} item={risk} />
          ))}
        </>
      )}

      {/* ── Technical Risks ── */}
      {technicalRisks.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 mt-6">
            RISCOS T&Eacute;CNICOS
          </h3>

          {technicalRisks.map((risk, i) => (
            <TechnicalRiskRow key={`tech-${i}`} item={risk} />
          ))}
        </>
      )}

      {/* Empty state */}
      {totalRisks === 0 && (
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-8 text-center mt-6">
          <p className="text-sm text-[var(--vl-text3)]">
            Nenhum risco identificado na an&aacute;lise.
          </p>
        </div>
      )}
    </div>
  );
}
