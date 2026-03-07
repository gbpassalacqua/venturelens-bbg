"use client";

import React, { useState, useMemo } from "react";
import type { V2ReportJson } from "@/types/analysis";
import { parseCompetitor, extractFunding } from "./helpers";

interface CompetitorScreenProps {
  report: V2ReportJson;
}

type TabKey = "all" | "direct" | "indirect" | "emerging";

/* ── Detect emerging competitor keywords ── */
const EMERGING_KEYWORDS = [
  "startup", "emergente", "emerging", "novo", "new entrant",
  "recently", "recente", "early", "seed", "pre-seed",
];

function isEmerging(text: string): boolean {
  const lower = text.toLowerCase();
  return EMERGING_KEYWORDS.some((kw) => lower.includes(kw));
}

/* ── Type tag config ── */
function typeTag(type: "direct" | "indirect" | "emerging") {
  switch (type) {
    case "direct":
      return {
        label: "Direto",
        bg: "rgba(239,68,68,.12)",
        color: "var(--vl-red)",
        border: "rgba(239,68,68,.2)",
      };
    case "indirect":
      return {
        label: "Indireto",
        bg: "rgba(59,130,246,.12)",
        color: "var(--vl-blue2)",
        border: "rgba(59,130,246,.2)",
      };
    case "emerging":
      return {
        label: "Emergente",
        bg: "rgba(34,197,94,.12)",
        color: "var(--vl-green)",
        border: "rgba(34,197,94,.2)",
      };
  }
}

/* ── Threat level tag config ── */
function threatTag(type: "direct" | "indirect" | "emerging") {
  switch (type) {
    case "direct":
      return {
        label: "Alto",
        bg: "rgba(239,68,68,.12)",
        color: "var(--vl-red)",
        border: "rgba(239,68,68,.2)",
      };
    case "indirect":
      return {
        label: "M\u00e9dio",
        bg: "rgba(251,146,60,.12)",
        color: "var(--vl-amber)",
        border: "rgba(251,146,60,.2)",
      };
    case "emerging":
      return {
        label: "Crescente",
        bg: "rgba(34,197,94,.12)",
        color: "var(--vl-green)",
        border: "rgba(34,197,94,.2)",
      };
  }
}

/* ── Moat strength styling ── */
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

/* ── Competitor item type ── */
interface CompItem {
  text: string;
  type: "direct" | "indirect" | "emerging";
  parsed: { name: string; description: string };
  funding: string;
}

/* ════════════════════════════════════════════════════════════════════════
   CompetitorScreen Component
   ════════════════════════════════════════════════════════════════════════ */

export default function CompetitorScreen({ report }: CompetitorScreenProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const { directCompetitors, indirectCompetitors, moatAssessment, moatStrength } =
    report.strategyAnalysis.competitiveLandscape;

  // Build competitor items with type classification
  const allItems = useMemo<CompItem[]>(() => {
    const direct: CompItem[] = directCompetitors.map((text) => ({
      text,
      type: "direct" as const,
      parsed: parseCompetitor(text),
      funding: extractFunding(text),
    }));

    const indirect: CompItem[] = indirectCompetitors.map((text) => {
      const emerging = isEmerging(text);
      return {
        text,
        type: emerging ? ("emerging" as const) : ("indirect" as const),
        parsed: parseCompetitor(text),
        funding: extractFunding(text),
      };
    });

    return [...direct, ...indirect];
  }, [directCompetitors, indirectCompetitors]);

  const directItems = allItems.filter((i) => i.type === "direct");
  const indirectItems = allItems.filter((i) => i.type === "indirect");
  const emergingItems = allItems.filter((i) => i.type === "emerging");

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "Todos", count: allItems.length },
    { key: "direct", label: "Diretos", count: directItems.length },
    { key: "indirect", label: "Indiretos", count: indirectItems.length },
  ];

  // Only show Emergentes tab if there are any
  if (emergingItems.length > 0) {
    tabs.push({ key: "emerging", label: "Emergentes", count: emergingItems.length });
  }

  const filteredItems = useMemo(() => {
    if (activeTab === "direct") return directItems;
    if (activeTab === "indirect") return indirectItems;
    if (activeTab === "emerging") return emergingItems;
    return allItems;
  }, [activeTab, allItems, directItems, indirectItems, emergingItems]);

  const moatColor = MOAT_COLORS[moatStrength.toUpperCase()] ?? "var(--vl-text2)";
  const moatBg = MOAT_BG[moatStrength.toUpperCase()] ?? "rgba(255,255,255,.06)";

  // Business model chips
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
        {allItems.length} competidores identificados
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
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ── Competitor TABLE ── */}
      <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-[var(--vl-text3)] py-4 text-center">
            Nenhum competidor nesta categoria.
          </p>
        ) : (
          <div className="overflow-x-auto">
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
                    Funding
                  </th>
                  <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                    {`Amea\u00e7a`}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, i) => {
                  const tt = typeTag(item.type);
                  const thr = threatTag(item.type);

                  return (
                    <tr
                      key={i}
                      className="border-b border-[var(--vl-border)] last:border-0 hover:bg-[var(--vl-bg2)]/30 transition-colors"
                      title={item.text}
                    >
                      {/* Empresa */}
                      <td className="py-3 px-3.5 text-[var(--vl-text)]">
                        <div className="font-semibold">{item.parsed.name}</div>
                        {item.parsed.description && (
                          <div className="text-xs text-[var(--vl-text3)] mt-0.5 line-clamp-2">
                            {item.parsed.description}
                          </div>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="py-3 px-3.5">
                        <span
                          className="inline-block py-0.5 px-2.5 rounded-full text-[.72rem] font-semibold"
                          style={{
                            background: tt.bg,
                            color: tt.color,
                            border: `1px solid ${tt.border}`,
                          }}
                        >
                          {tt.label}
                        </span>
                      </td>

                      {/* Funding */}
                      <td className="py-3 px-3.5 font-mono text-sm text-[var(--vl-text2)]">
                        {item.funding}
                      </td>

                      {/* Ameaça */}
                      <td className="py-3 px-3.5">
                        <span
                          className="inline-block py-0.5 px-2.5 rounded-full text-[.72rem] font-semibold"
                          style={{
                            background: thr.bg,
                            color: thr.color,
                            border: `1px solid ${thr.border}`,
                          }}
                        >
                          {thr.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Moat Assessment ── */}
      <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mt-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
          {`AVALIA\u00c7\u00c3O DE MOAT`}
          <span className="flex-1 h-px bg-[var(--vl-border)]" />
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
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
            OPORTUNIDADES DE WHITE SPACE
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
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
