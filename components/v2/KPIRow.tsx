"use client";

import React from "react";
import type { V2ReportJson } from "@/types/analysis";

interface KPIRowProps {
  report: V2ReportJson;
}

export default function KPIRow({ report }: KPIRowProps) {
  const metrics = report.financialAnalysis.currentMetrics;

  const kpis = [
    {
      value: metrics.revenue || "N/D",
      label: "Receita/ARR",
      delta: null,
      deltaColor: "",
    },
    {
      value: metrics.burnRate || "N/D",
      label: "Burn Rate",
      delta: null,
      deltaColor: "",
    },
    {
      value: metrics.ltvCacRatio || "N/D",
      label: "LTV:CAC",
      delta: null,
      deltaColor: "",
    },
    {
      value: metrics.churn || "N/D",
      label: "Churn Rate",
      delta: null,
      deltaColor: "",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 mb-5 max-[900px]:grid-cols-2">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-4"
        >
          <div className="font-mono text-[1.3rem] text-[var(--vl-gold2)] font-medium">
            {kpi.value}
          </div>
          <div className="text-xs text-[var(--vl-text2)] mt-1">{kpi.label}</div>
          {kpi.delta && (
            <div className={`text-xs mt-1 ${kpi.deltaColor}`}>{kpi.delta}</div>
          )}
        </div>
      ))}
    </div>
  );
}
