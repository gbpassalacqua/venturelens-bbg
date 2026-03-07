"use client";

import React from "react";
import type { V2ReportJson } from "@/types/analysis";

interface TimingScreenProps {
  report: V2ReportJson;
}

interface TimingDimension {
  name: string;
  scoreKey: keyof V2ReportJson["scores"];
  description: string;
}

function getTimingLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Janela Excelente", color: "var(--vl-green)" };
  if (score >= 60) return { text: "Janela Favor\u00e1vel", color: "var(--vl-gold)" };
  return { text: "Timing Question\u00e1vel", color: "var(--vl-amber)" };
}

export default function TimingScreen({ report }: TimingScreenProps) {
  const marketScore = report.scores.market.score;
  const displayScore = (marketScore / 10).toFixed(1);
  const label = getTimingLabel(marketScore);

  const marketTimingText = report.strategyAnalysis.marketSize.marketTiming;

  // Derive dimension descriptions from relevant report fields
  const techReadinessDesc =
    report.techAnalysis.technologyAssessment.architectureScalability;
  const demandTrendDesc =
    report.marketingAnalysis.tractionValidation.growthTrajectory;
  const regulatoryDesc =
    report.techAnalysis.securityCompliance.dataPrivacy;
  const adoptionCurveDesc =
    report.marketingAnalysis.scalabilityAssessment.channelScalability;

  const dimensions: TimingDimension[] = [
    {
      name: "Prontid\u00e3o Tecnol\u00f3gica",
      scoreKey: "technology",
      description: techReadinessDesc,
    },
    {
      name: "Tend\u00eancia de Demanda",
      scoreKey: "traction",
      description: demandTrendDesc,
    },
    {
      name: "Ambiente Regulat\u00f3rio",
      scoreKey: "product",
      description: regulatoryDesc,
    },
    {
      name: "Curva de Ado\u00e7\u00e3o",
      scoreKey: "gtm",
      description: adoptionCurveDesc,
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── Page Header ── */}
      <h2 className="font-display text-[2rem] font-bold">
        Motor de Timing de Mercado
      </h2>
      <p className="text-[var(--vl-text2)] mt-1.5">
        Avalia&ccedil;&atilde;o do timing de entrada no mercado
      </p>

      {/* ── Composite Score Card ── */}
      <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-8 text-center mb-4 mt-6">
        <div className="font-display text-[4rem] font-extrabold text-[var(--vl-gold)] leading-none">
          {displayScore}{" "}
          <span className="text-[1.5rem] font-normal text-[var(--vl-text3)]">
            / 10
          </span>
        </div>

        <p className="text-[var(--vl-text2)] mt-1.5">
          Score Composto de Timing &middot;{" "}
          <span style={{ color: label.color }}>{label.text}</span>
        </p>

        {marketTimingText && (
          <p className="max-w-[500px] mx-auto mt-4 text-[var(--vl-text2)] text-sm leading-relaxed">
            {marketTimingText}
          </p>
        )}
      </div>

      {/* ── Timing Dimensions Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {dimensions.map((dim) => {
          const scoreItem = report.scores[dim.scoreKey];
          const pct = scoreItem?.score ?? 0;

          return (
            <div
              key={dim.name}
              className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-[18px]"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-2.5">
                <span className="text-sm font-semibold">{dim.name}</span>
                <span className="font-mono text-base text-[var(--vl-gold2)]">
                  {scoreItem ? (scoreItem.score / 10).toFixed(1) : "N/A"}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="bg-[var(--vl-border)] rounded h-2 overflow-hidden">
                <div
                  className="h-full rounded bg-gradient-to-r from-[var(--vl-gold)] to-[var(--vl-gold2)] transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Description */}
              <p className="text-xs text-[var(--vl-text3)] mt-1.5 leading-relaxed line-clamp-3">
                {dim.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
