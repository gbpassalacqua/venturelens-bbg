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
    name: "AI Parsing da Ideia",
    detail: "Extraindo problema, ICP, vertical, monetiza\u00E7\u00E3o",
  },
  {
    icon: "\u{1F4CA}",
    name: "Agente Estrat\u00E9gia (McKinsey)",
    detail: "An\u00E1lise de mercado, TAM/SAM/SOM, posicionamento",
  },
  {
    icon: "\u{1F4B0}",
    name: "Agente Finan\u00E7as (Goldman)",
    detail: "Modelagem financeira, unit economics, proje\u00E7\u00F5es",
  },
  {
    icon: "\u{1F4C8}",
    name: "Agente Marketing (Growth)",
    detail: "Canais de aquisi\u00E7\u00E3o, personas, growth strategy",
  },
  {
    icon: "\u2699\uFE0F",
    name: "Agente Tecnologia (CTO)",
    detail: "Stack t\u00E9cnico, arquitetura, riscos de engenharia",
  },
  {
    icon: "\u{1F3AF}",
    name: "Calculando Opportunity Score",
    detail: "Score composto ponderado (0\u2013100)",
  },
  {
    icon: "\u{1F4CB}",
    name: "Gerando Relat\u00F3rio Final",
    detail: "Consolidando insights dos 4 agentes",
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
          { label: "Confirmar", status: "done" },
          { label: "Analisando", status: "active" },
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
