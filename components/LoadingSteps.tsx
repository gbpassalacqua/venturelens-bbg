"use client";

import { useEffect, useState } from "react";

const BASE_STEPS = [
  { icon: "📄", label: "Lendo o documento..." },
  { icon: "🏛️", label: "Agent 1 — Strategy Partner analisando mercado e competição..." },
  { icon: "💰", label: "Agent 2 — Finance Analyst auditando métricas e projeções..." },
  { icon: "📈", label: "Agent 3 — Growth Strategist avaliando GTM e tração..." },
  { icon: "⚙️", label: "Agent 4 — CTO avaliando tecnologia e produto..." },
  { icon: "📊", label: "Analisando slide por slide..." },
  { icon: "⚠️", label: "Calculando matriz de riscos..." },
  { icon: "🎯", label: "Gerando scores e veredito final..." },
];

interface LoadingStepsProps {
  extraSteps?: { icon: string; label: string }[];
}

export default function LoadingSteps({ extraSteps = [] }: LoadingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Insert extra steps after the first base step (after reading doc)
  const allSteps = [
    BASE_STEPS[0],
    ...extraSteps,
    ...BASE_STEPS.slice(1),
  ];

  useEffect(() => {
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < allSteps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSteps.length]);

  return (
    <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-6 mt-8">
      <div className="space-y-3">
        {allSteps.map((step, i) => {
          const status = i < currentStep ? "done" : i === currentStep ? "running" : "queued";
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg w-7 text-center">{step.icon}</span>
              <span
                className={`text-sm font-medium transition-colors ${
                  status === "done"
                    ? "text-[var(--vl-green)]"
                    : status === "running"
                    ? "text-[var(--vl-gold)] animate-pulse"
                    : "text-[var(--vl-text3)]"
                }`}
              >
                {step.label}
              </span>
              <span className="ml-auto text-xs">
                {status === "done" && <span className="text-[var(--vl-green)]">✓</span>}
                {status === "running" && (
                  <span className="inline-block w-4 h-4 border-2 border-[var(--vl-gold)] border-t-transparent rounded-full animate-spin" />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
