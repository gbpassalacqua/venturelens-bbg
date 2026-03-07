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
  weight: string;
}

function getTimingLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Janela Excelente", color: "var(--vl-green)" };
  if (score >= 60) return { text: "Janela Favor\u00e1vel", color: "var(--vl-gold)" };
  return { text: "Timing Question\u00e1vel", color: "var(--vl-amber)" };
}

function signalLabel(score: number): { text: string; color: string } {
  if (score >= 80) return { text: "Forte", color: "var(--vl-green)" };
  if (score >= 60) return { text: "Moderado", color: "var(--vl-gold)" };
  if (score >= 40) return { text: "Fraco", color: "var(--vl-amber)" };
  return { text: "Negativo", color: "var(--vl-red)" };
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
      weight: "25%",
    },
    {
      name: "Tend\u00eancia de Demanda",
      scoreKey: "traction",
      description: demandTrendDesc,
      weight: "30%",
    },
    {
      name: "Ambiente Regulat\u00f3rio",
      scoreKey: "product",
      description: regulatoryDesc,
      weight: "20%",
    },
    {
      name: "Curva de Ado\u00e7\u00e3o",
      scoreKey: "gtm",
      description: adoptionCurveDesc,
      weight: "25%",
    },
  ];

  // Build timing signals detail data
  const signals = [
    {
      signal: "Maturidade Tecnol\u00f3gica",
      source: "An\u00e1lise T\u00e9cnica",
      value: report.scores.technology
        ? `${(report.scores.technology.score / 10).toFixed(1)}/10`
        : "N/A",
      interpretation: techReadinessDesc
        ? techReadinessDesc.length > 100
          ? techReadinessDesc.substring(0, 100) + "\u2026"
          : techReadinessDesc
        : "\u2014",
    },
    {
      signal: "Velocidade de Demanda",
      source: "Tra\u00e7\u00e3o & Mercado",
      value: report.scores.traction
        ? `${(report.scores.traction.score / 10).toFixed(1)}/10`
        : "N/A",
      interpretation: demandTrendDesc
        ? demandTrendDesc.length > 100
          ? demandTrendDesc.substring(0, 100) + "\u2026"
          : demandTrendDesc
        : "\u2014",
    },
    {
      signal: "Risco Regulat\u00f3rio",
      source: "Seguran\u00e7a & Compliance",
      value: report.scores.product
        ? `${(report.scores.product.score / 10).toFixed(1)}/10`
        : "N/A",
      interpretation: regulatoryDesc
        ? regulatoryDesc.length > 100
          ? regulatoryDesc.substring(0, 100) + "\u2026"
          : regulatoryDesc
        : "\u2014",
    },
    {
      signal: "Curva de Ado\u00e7\u00e3o",
      source: "GTM & Escalabilidade",
      value: report.scores.gtm
        ? `${(report.scores.gtm.score / 10).toFixed(1)}/10`
        : "N/A",
      interpretation: adoptionCurveDesc
        ? adoptionCurveDesc.length > 100
          ? adoptionCurveDesc.substring(0, 100) + "\u2026"
          : adoptionCurveDesc
        : "\u2014",
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── Page Header ── */}
      <h2 className="font-display text-[2rem] font-bold">
        Motor de Timing de Mercado
      </h2>
      <p className="text-[var(--vl-text2)] mt-1.5">
        {"Avalia\u00e7\u00e3o do timing de entrada no mercado"}
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
          {"Score Composto de Timing \u00b7 "}
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
          const sig = signalLabel(pct);

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

              {/* Weight + Signal text */}
              <p className="text-xs text-[var(--vl-text3)] mt-1.5">
                {`Peso: ${dim.weight} \u00b7 Sinal: `}
                <span style={{ color: sig.color }}>{sig.text}</span>
              </p>

              {/* Description */}
              <p className="text-xs text-[var(--vl-text3)] mt-1 leading-relaxed line-clamp-3">
                {dim.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Timing Signals Detail Table ── */}
      <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
          {"DETALHES DOS SINAIS DE TIMING"}
          <span className="flex-1 h-px bg-[var(--vl-border)]" />
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                  Sinal
                </th>
                <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                  Fonte
                </th>
                <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                  Valor
                </th>
                <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                  {`Interpreta\u00e7\u00e3o`}
                </th>
              </tr>
            </thead>
            <tbody>
              {signals.map((sig, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--vl-border)] last:border-0 hover:bg-[var(--vl-bg2)]/30 transition-colors"
                >
                  <td className="py-3 px-3.5 text-[var(--vl-text)] font-semibold">
                    {sig.signal}
                  </td>
                  <td className="py-3 px-3.5 text-[var(--vl-text2)]">
                    {sig.source}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[var(--vl-gold2)]">
                    {sig.value}
                  </td>
                  <td className="py-3 px-3.5 text-[var(--vl-text2)] leading-relaxed">
                    {sig.interpretation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
