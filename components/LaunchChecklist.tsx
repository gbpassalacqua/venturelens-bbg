"use client";

import { useState } from "react";
import type { GithubStatus } from "@/types/analysis";

interface LaunchChecklistProps {
  githubStatus?: GithubStatus;
}

export default function LaunchChecklist({ githubStatus }: LaunchChecklistProps) {
  const [showTip, setShowTip] = useState(false);

  if (githubStatus !== "privado_sem_acesso") return null;

  return (
    <div className="rounded-xl border border-[var(--vl-amber)]/30 bg-[var(--vl-amber)]/5 p-4 animate-fade-up">
      <div className="flex items-start gap-3">
        <span className="text-lg shrink-0">🔒</span>
        <div className="flex-1 space-y-2">
          <p className="text-sm text-[var(--vl-text)]">
            <span className="font-bold text-[var(--vl-amber)]">Repositório privado</span>
            {" "}— itens técnicos não verificados
          </p>

          <button
            onClick={() => setShowTip(!showTip)}
            className="text-xs text-[var(--vl-gold)] hover:text-[var(--vl-gold2)] transition-colors underline underline-offset-2"
          >
            {showTip ? "Fechar ▲" : "Saiba como dar acesso →"}
          </button>

          {showTip && (
            <div className="mt-2 space-y-2 text-xs text-[var(--vl-text2)] bg-[var(--vl-bg2)] rounded-lg p-3 border border-[var(--vl-border)]">
              <p className="font-medium text-[var(--vl-text)] mb-1.5">3 formas de verificar o repositório:</p>
              <div className="space-y-1.5">
                <div className="flex gap-2">
                  <span className="text-[var(--vl-gold)] shrink-0">1.</span>
                  <p>
                    <strong>Cole o GitHub Token</strong> no campo da análise.{" "}
                    <span className="text-[var(--vl-text3)]">
                      (github.com/settings/tokens → New token → marque &quot;repo&quot;)
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--vl-gold)] shrink-0">2.</span>
                  <p>
                    <strong>Envie o package.json</strong> do projeto no campo de upload.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-[var(--vl-gold)] shrink-0">3.</span>
                  <p>
                    <strong>Torne o repositório público</strong> temporariamente.{" "}
                    <span className="text-[var(--vl-text3)]">
                      (Settings → Danger Zone → Change visibility)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
