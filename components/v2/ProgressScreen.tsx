"use client";

import React from "react";
import FlowBar from "./FlowBar";

interface ProgressScreenProps {
  currentStep: number; // 0-6, which step is running
  onComplete?: () => void;
}

const STEPS = [
  {
    icon: "\u{1F916}",
    name: "Parsing da Ideia por IA",
    detail: "Extraindo problema, ICP, vertical, monetiza\u00E7\u00E3o",
  },
  {
    icon: "\u{1F4CA}",
    name: "Intelig\u00EAncia de Mercado",
    detail: "Consultando fontes de dados e tend\u00EAncias\u2026",
  },
  {
    icon: "\u{1F4B0}",
    name: "C\u00E1lculo TAM / SAM / SOM",
    detail: "Estimativa top-down e bottom-up",
  },
  {
    icon: "\u2694\uFE0F",
    name: "An\u00E1lise de Competidores",
    detail: "Identificando players diretos, indiretos e emergentes",
  },
  {
    icon: "\u23F1",
    name: "Motor de Timing de Mercado",
    detail: "Avaliando prontid\u00E3o tecnol\u00F3gica e tend\u00EAncias",
  },
  {
    icon: "\u26A0\uFE0F",
    name: "An\u00E1lise de Riscos e Viabilidade",
    detail: "Avaliando necessidades de capital e riscos",
  },
  {
    icon: "\u{1F3AF}",
    name: "Gerando Opportunity Score",
    detail: "Score composto ponderado (0\u2013100)",
  },
];

function getEtaText(currentStep: number): string {
  const remaining = STEPS.length - currentStep;
  if (remaining <= 0) return "Finalizando\u2026";
  if (remaining <= 2) return `Quase pronto \u2014 ~${remaining * 15}s restantes`;
  return `Estimativa: ~${remaining * 15}s restantes (${remaining} etapas)`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ProgressScreen({ currentStep, onComplete }: ProgressScreenProps) {
  return (
    <div>
      {/* FlowBar */}
      <FlowBar
        steps={[
          { label: "Descrever Ideia", status: "done" },
          { label: "An\u00E1lise em Andamento", status: "active" },
          { label: "Dashboard", status: "pending" },
        ]}
      />

      {/* Content */}
      <div className="max-w-[640px] mx-auto pt-[60px] text-center px-10">
        <h2 className="font-display text-[1.8rem] font-bold mb-2">
          Executando motores de valida&ccedil;&atilde;o&hellip;
        </h2>
        <p className="text-[var(--vl-text2)] mb-12 text-[.9rem]">
          {getEtaText(currentStep)}
        </p>

        {/* Steps list */}
        <div className="space-y-2 text-left">
          {STEPS.map((step, i) => {
            const isDone = i < currentStep;
            const isRunning = i === currentStep;
            // const isQueued = i > currentStep;

            /* border color */
            const borderColor = isDone
              ? "border-[var(--vl-green)]"
              : isRunning
                ? "border-[var(--vl-gold)]"
                : "border-[var(--vl-border)]";

            /* icon circle */
            const iconCircle = isDone
              ? "bg-[rgba(34,197,94,.1)] border-[var(--vl-green)]"
              : isRunning
                ? "bg-[rgba(240,165,0,.1)] border-[var(--vl-gold)] animate-spinner-pulse"
                : "bg-[var(--vl-card)] border-[var(--vl-border)]";

            return (
              <div
                key={i}
                className={`flex items-center gap-4 p-4 rounded-lg bg-[var(--vl-bg2)] border ${borderColor}`}
              >
                {/* Step icon circle */}
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0 border ${iconCircle}`}
                >
                  {step.icon}
                </span>

                {/* Info */}
                <div className="min-w-0">
                  <div className="text-[.9rem] font-semibold">{step.name}</div>
                  <div className="text-xs text-[var(--vl-text2)] mt-0.5">
                    {step.detail}
                  </div>
                </div>

                {/* Status */}
                <div className="ml-auto text-xs whitespace-nowrap shrink-0">
                  {isDone && (
                    <span className="text-[var(--vl-green)]">
                      {"\u2713"} Conclu&iacute;do
                    </span>
                  )}
                  {isRunning && (
                    <span className="text-[var(--vl-gold)]">
                      Executando&hellip;
                    </span>
                  )}
                  {!isDone && !isRunning && (
                    <span className="text-[var(--vl-text3)]">Na fila</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
