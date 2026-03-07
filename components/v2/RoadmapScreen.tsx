"use client";

import React from "react";
import type { V2ReportJson } from "@/types/analysis";

interface RoadmapScreenProps {
  report: V2ReportJson;
}

interface Phase {
  tag: string;
  tagBg: string;
  tagColor: string;
  barColor: string;
  title: string;
  goal: string;
  itemsKey: "immediate" | "shortTerm" | "strategic";
}

const PHASES: Phase[] = [
  {
    tag: "FASE 1 \u00B7 IMEDIATO",
    tagBg: "rgba(240,165,0,.1)",
    tagColor: "var(--vl-gold)",
    barColor: "var(--vl-gold)",
    title: "Funda\u00E7\u00E3o",
    goal: "Implementar a\u00E7\u00F5es imediatas antes da pr\u00F3xima reuni\u00E3o.",
    itemsKey: "immediate",
  },
  {
    tag: "FASE 2 \u00B7 CURTO PRAZO",
    tagBg: "rgba(59,130,246,.1)",
    tagColor: "var(--vl-blue2)",
    barColor: "var(--vl-blue)",
    title: "Crescimento",
    goal: "Executar melhorias de curto prazo nas pr\u00F3ximas 2-4 semanas.",
    itemsKey: "shortTerm",
  },
  {
    tag: "FASE 3 \u00B7 ESTRAT\u00C9GICO",
    tagBg: "rgba(34,197,94,.1)",
    tagColor: "var(--vl-green)",
    barColor: "var(--vl-green)",
    title: "Plataforma",
    goal: "Iniciativas estrat\u00E9gicas de longo prazo.",
    itemsKey: "strategic",
  },
];

export default function RoadmapScreen({ report }: RoadmapScreenProps) {
  const recommendations = report.recommendations;

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── Page Header ── */}
      <h2 className="font-display text-[2rem] font-bold">Roadmap do Produto</h2>
      <p className="text-[var(--vl-text2)] mt-1.5">
        Tr\u00EAs fases baseadas nas recomenda\u00E7\u00F5es da an\u00E1lise.
      </p>

      {/* ── Phases Grid ── */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-3 gap-4 mt-6">
        {PHASES.map((phase, i) => {
          const items = recommendations[phase.itemsKey] ?? [];

          return (
            <div
              key={i}
              className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 relative overflow-hidden"
            >
              {/* Top Colored Bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: phase.barColor }}
              />

              {/* Phase Tag */}
              <span
                className="text-[.68rem] font-bold uppercase tracking-widest py-0.5 px-2.5 rounded-full inline-block mb-3.5"
                style={{ background: phase.tagBg, color: phase.tagColor }}
              >
                {phase.tag}
              </span>

              {/* Phase Title */}
              <div className="font-display text-[1.1rem] font-bold mb-1.5">
                {phase.title}
              </div>

              {/* Phase Goal */}
              <p className="text-xs text-[var(--vl-text2)] mb-4 leading-relaxed">
                {phase.goal}
              </p>

              {/* Phase Items */}
              <div>
                {items.map((item, j) => (
                  <div
                    key={j}
                    className={`text-sm text-[var(--vl-text)] py-1.5 flex items-center gap-2 ${
                      j < items.length - 1
                        ? "border-b border-[var(--vl-border)]"
                        : ""
                    }`}
                  >
                    <span className="font-mono text-[var(--vl-text3)] shrink-0">
                      &rarr;
                    </span>
                    <span>{item}</span>
                  </div>
                ))}

                {items.length === 0 && (
                  <p className="text-sm text-[var(--vl-text3)]">
                    Nenhuma recomenda\u00E7\u00E3o dispon\u00EDvel.
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
