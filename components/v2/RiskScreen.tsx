"use client";

import React from "react";
import type { V2ReportJson, UCRiskItem } from "@/types/analysis";
import { splitRiskText } from "./helpers";

interface RiskScreenProps {
  report: V2ReportJson;
}

/* ── Helpers ── */

function probBadge(prob: string) {
  const key = prob.toUpperCase();
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

/* ── Risk Row ── */

function RiskRow({ item }: { item: UCRiskItem }) {
  const prob = probBadge(item.p);
  const imp = impactBadge(item.i);
  const { title, description } = splitRiskText(item.r);

  return (
    <div className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-4 mb-2.5">
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-start">
        <div>
          <p className="text-[.88rem] font-semibold mb-1">{title}</p>
          {description && (
            <p className="text-xs text-[var(--vl-text2)] leading-relaxed">
              {description}
            </p>
          )}
        </div>
        <Badge {...prob} />
        <Badge {...imp} />
      </div>

      {item.m && (
        <div className="mt-2" style={{ gridColumn: "1 / -1" }}>
          <div className="bg-[rgba(255,255,255,.02)] rounded-md p-2.5">
            <p className="text-xs text-[var(--vl-text2)]">
              <span className="font-bold text-[var(--vl-text)]">
                {"Mitiga\u00e7\u00e3o: "}
              </span>
              {item.m}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main Component ── */

export default function RiskScreen({ report }: RiskScreenProps) {
  const risks = report.risks || [];

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      <h2 className="font-display text-[2rem] font-bold">
        {"An\u00e1lise de Riscos"}
      </h2>
      <p className="text-[var(--vl-text2)] mt-1.5">
        {risks.length} riscos identificados
      </p>

      {risks.length > 0 && (
        <>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 mt-6 flex items-center gap-2">
            RISCOS IDENTIFICADOS
            <span className="flex-1 h-px bg-[var(--vl-border)]" />
          </h3>

          {risks.map((risk, i) => (
            <RiskRow key={i} item={risk} />
          ))}
        </>
      )}

      {risks.length === 0 && (
        <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-8 text-center mt-6">
          <p className="text-sm text-[var(--vl-text3)]">
            {"Nenhum risco identificado na an\u00e1lise."}
          </p>
        </div>
      )}
    </div>
  );
}
