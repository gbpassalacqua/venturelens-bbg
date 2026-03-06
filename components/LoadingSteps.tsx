"use client";

import { useEffect, useState } from "react";

const STEPS = [
  { icon: "🤖", label: "Lendo o PRD..." },
  { icon: "📊", label: "Pesquisando o mercado..." },
  { icon: "💰", label: "Calculando TAM/SAM/SOM..." },
  { icon: "⚔️", label: "Mapeando concorrentes..." },
  { icon: "⏱", label: "Avaliando timing de mercado..." },
  { icon: "⚠️", label: "Identificando riscos..." },
  { icon: "🎯", label: "Gerando score final..." },
];

export default function LoadingSteps() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-6 mt-8">
      <div className="space-y-3">
        {STEPS.map((step, i) => {
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
