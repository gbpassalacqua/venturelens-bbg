"use client";

import React, { useState, useMemo } from "react";
import type { V2ReportJson } from "@/types/analysis";

interface CompetitorScreenProps {
  report: V2ReportJson;
}

type TabKey = "all" | "direct" | "indirect";

const MOAT_COLORS: Record<string, string> = {
  NONE: "var(--vl-red)",
  WEAK: "var(--vl-red)",
  MODERATE: "var(--vl-amber)",
  STRONG: "var(--vl-green)",
  FORTRESS: "var(--vl-green)",
};

const MOAT_BG: Record<string, string> = {
  NONE: "rgba(239,68,68,.12)",
  WEAK: "rgba(239,68,68,.12)",
  MODERATE: "rgba(251,146,60,.12)",
  STRONG: "rgba(34,197,94,.12)",
  FORTRESS: "rgba(34,197,94,.12)",
};

export default function CompetitorScreen({ report }: CompetitorScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const { directCompetitors, indirectCompetitors, moatAssessment, moatStrength } =
    report.strategyAnalysis.competitiveLandscape;

  const directCount = directCompetitors.length;
  const indirectCount = indirectCompetitors.length;
  const totalCount = directCount + indirectCount;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "direct", label: `Diretos (${directCount})` },
    { key: "indirect", label: `Indiretos (${indirectCount})` },
  ];

  const items = useMemo(() => {
    const direct = directCompetitors.map((text) => ({ text, type: "direct" as const }));
    const indirect = indirectCompetitors.map((text) => ({ text, type: "indirect" as const }));

    if (activeTab === "direct") return direct;
    if (activeTab === "indirect") return indirect;
    return [...direct, ...indirect];
  }, [activeTab, directCompetitors, indirectCompetitors]);

  const moatColor = MOAT_COLORS[moatStrength.toUpperCase()] ?? "var(--vl-text2)";
  const moatBg = MOAT_BG[moatStrength.toUpperCase()] ?? "rgba(255,255,255,.06)";

  // Extract business-model related chips from businessModel fields
  const businessModel = report.strategyAnalysis.businessModel;
  const whiteSpaceChips = [
    businessModel.revenueModel,
    businessModel.scalability,
    businessModel.pricingPower,
    businessModel.unitEconomicsViability,
  ].filter(Boolean);

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── Page Header ── */}
      <h2 className="font-display text-[2rem] font-bold">Panorama Competitivo</h2>
      <p className="text-[var(--vl-text2)] mt-1.5">
        {totalCount} competidores identificados
      </p>

      {/* ── Tabs ── */}
      <div className="flex gap-1 mb-5 mt-6 border-b border-[var(--vl-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`py-2 px-[18px] text-sm font-medium cursor-pointer border-b-2 -mb-px transition-all ${
              activeTab === tab.key
                ? "text-[var(--vl-gold)] border-b-[var(--vl-gold)]"
                : "text-[var(--vl-text2)] border-transparent hover:text-[var(--vl-text)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Competitor List ── */}
      <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6">
        {items.length === 0 && (
          <p className="text-sm text-[var(--vl-text3)]">
            Nenhum competidor nesta categoria.
          </p>
        )}

        {items.map((item, i) => (
          <div
            key={i}
            className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-4 mb-2.5 last:mb-0"
          >
            <div className="flex items-start gap-3">
              {/* Type Tag */}
              <span
                className="inline-block py-0.5 px-2.5 rounded-full text-xs font-semibold shrink-0 mt-0.5"
                style={{
                  background:
                    item.type === "direct"
                      ? "rgba(239,68,68,.12)"
                      : "rgba(59,130,246,.12)",
                  color:
                    item.type === "direct"
                      ? "var(--vl-red)"
                      : "var(--vl-blue2)",
                }}
              >
                {item.type === "direct" ? "Direto" : "Indireto"}
              </span>

              {/* Content */}
              <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Moat Assessment ── */}
      <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4">
          AVALIA&Ccedil;&Atilde;O DE MOAT
        </h3>

        <div className="flex items-center gap-3 mb-3">
          <span
            className="inline-block py-1 px-3 rounded-full text-xs font-semibold"
            style={{ background: moatBg, color: moatColor }}
          >
            {moatStrength}
          </span>
        </div>

        <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
          {moatAssessment}
        </p>
      </div>

      {/* ── White Space Opportunities ── */}
      {whiteSpaceChips.length > 0 && (
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4">
            OPORTUNIDADES DE WHITE SPACE
          </h3>

          <div className="flex flex-wrap">
            {whiteSpaceChips.map((chip, i) => (
              <span
                key={i}
                className="inline-block py-1 px-3 rounded-full text-xs font-semibold m-1"
                style={{
                  background: "rgba(59,130,246,.1)",
                  border: "1px solid rgba(59,130,246,.2)",
                  color: "var(--vl-blue2)",
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
