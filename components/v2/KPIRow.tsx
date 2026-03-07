"use client";

import React from "react";
import type { V2ReportJson } from "@/types/analysis";
import { extractShortValue } from "./helpers";

interface KPIRowProps {
  report: V2ReportJson;
}

export default function KPIRow({ report }: KPIRowProps) {
  const metrics = report.financialAnalysis.currentMetrics;

  const kpis = [
    {
      raw: metrics.revenue || "N/D",
      label: "Receita/ARR",
    },
    {
      raw: metrics.burnRate || "N/D",
      label: "Burn Rate",
    },
    {
      raw: metrics.ltvCacRatio || "N/D",
      label: "LTV:CAC",
    },
    {
      raw: metrics.churn || "N/D",
      label: "Churn Rate",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-5 max-[900px]:grid-cols-2">
      {kpis.map((kpi) => {
        const shortVal = extractShortValue(kpi.raw);
        return (
          <div
            key={kpi.label}
            className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-4"
            title={kpi.raw}
          >
            <div className="font-mono text-[1.3rem] text-[var(--vl-gold2)] font-medium">
              {shortVal}
            </div>
            <div className="text-xs text-[var(--vl-text2)] mt-1">{kpi.label}</div>
          </div>
        );
      })}
    </div>
  );
}
