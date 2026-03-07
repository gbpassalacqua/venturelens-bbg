"use client";

import React, { useState } from "react";
import FlowBar from "./FlowBar";

interface ConfirmScreenProps {
  problema: string;
  solucao: string;
  icp: string;
  monetizacao: string;
  vertical: string;
  dependencias: string;
  mercados: string;
  onFieldChange: (field: string, value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
  isExtracting?: boolean;
}

const FIELDS: { key: string; label: string; icon: string }[] = [
  { key: "problema", label: "Problema", icon: "\u{1F3AF}" },
  { key: "solucao", label: "Solu\u00E7\u00E3o", icon: "\u{1F4A1}" },
  { key: "icp", label: "ICP (Perfil de Cliente Ideal)", icon: "\u{1F464}" },
  { key: "monetizacao", label: "Modelo de Monetiza\u00E7\u00E3o", icon: "\u{1F4B0}" },
  { key: "vertical", label: "Vertical", icon: "\u{1F4CA}" },
  { key: "dependencias", label: "Depend\u00EAncias Tecnol\u00F3gicas", icon: "\u2699\uFE0F" },
  { key: "mercados", label: "Mercados-Alvo", icon: "\u{1F30D}" },
];

const NOT_IDENTIFIED = "N\u00e3o identificado no documento";

export default function ConfirmScreen({
  problema,
  solucao,
  icp,
  monetizacao,
  vertical,
  dependencias,
  mercados,
  onFieldChange,
  onConfirm,
  onBack,
  isLoading,
  isExtracting = false,
}: ConfirmScreenProps) {
  const [editingField, setEditingField] = useState<string | null>(null);

  const fieldValues: Record<string, string> = {
    problema,
    solucao,
    icp,
    monetizacao,
    vertical,
    dependencias,
    mercados,
  };

  const isEmpty = (val: string) => !val || val === NOT_IDENTIFIED;

  return (
    <div>
      {/* FlowBar */}
      <FlowBar
        steps={[
          { label: "Descrever Ideia", status: "done" },
          { label: "Confirmar", status: "active" },
          { label: "Analisando", status: "pending" },
          { label: "Dashboard", status: "pending" },
        ]}
      />

      {/* Content */}
      <div className="max-w-[760px] mx-auto py-10 px-10">
        {/* Page header */}
        <div className="mb-10">
          <h2 className="font-display text-[2rem] font-bold tracking-[-0.02em]">
            {"Confirme os dados extra\u00eddos"}
          </h2>
          <p className="text-[var(--vl-text2)] mt-1.5">
            {"Revise e edite os campos abaixo antes de iniciar a an\u00e1lise completa."}
          </p>
        </div>

        {/* Extracting loading state */}
        {isExtracting && (
          <div className="flex items-center gap-3 p-4 mb-5 rounded-xl border border-[var(--vl-gold)]/30 bg-[var(--vl-gold)]/5">
            <span className="inline-block w-5 h-5 border-2 border-[var(--vl-gold)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[var(--vl-gold)]">
              {"Extraindo dados do documento com IA..."}
            </span>
          </div>
        )}

        {/* Fields */}
        <div className="space-y-3">
          {FIELDS.map(({ key, label, icon }) => {
            const isEditing = editingField === key;
            const value = fieldValues[key] || "";
            const fieldEmpty = isEmpty(value);

            return (
              <div
                key={key}
                className={`bg-[var(--vl-card)] border rounded-xl p-5 transition-all ${
                  isEditing
                    ? "border-[var(--vl-gold)]/50"
                    : "border-[var(--vl-border)] hover:border-[var(--vl-gold)]/30"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{icon}</span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)]">
                      {label}
                    </span>
                  </div>
                  <button
                    onClick={() => setEditingField(isEditing ? null : key)}
                    className={`text-xs px-3 py-1 rounded-md font-medium transition-all border ${
                      isEditing
                        ? "border-[var(--vl-gold)]/50 text-[var(--vl-gold)] bg-[var(--vl-gold)]/10"
                        : "border-[var(--vl-border)] text-[var(--vl-text3)] hover:text-[var(--vl-gold)] hover:border-[var(--vl-gold)]/50"
                    }`}
                  >
                    {isEditing ? "Salvar" : "Editar"}
                  </button>
                </div>

                {isEditing ? (
                  <textarea
                    value={value === NOT_IDENTIFIED ? "" : value}
                    onChange={(e) => onFieldChange(key, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-gold)]/30 text-sm text-[var(--vl-text)] placeholder:text-[var(--vl-text3)] focus:outline-none focus:border-[var(--vl-gold)]/50 transition-colors resize-none"
                    rows={3}
                    autoFocus
                    placeholder={`Descreva ${label.toLowerCase()}...`}
                  />
                ) : fieldEmpty ? (
                  <p className="text-[.85rem] text-[var(--vl-text3)] italic leading-relaxed">
                    {`${NOT_IDENTIFIED} \u2014 clique em Editar`}
                  </p>
                ) : (
                  <p className="text-[.88rem] text-[var(--vl-text2)] leading-relaxed">
                    {value}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="text-sm text-[var(--vl-text2)] hover:text-[var(--vl-text)] transition-colors py-2 px-4 rounded-lg hover:bg-[var(--vl-bg2)]"
          >
            {"\u2190 Voltar"}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="py-2.5 px-7 rounded-lg text-[.95rem] font-semibold bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(240,165,0,.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[var(--vl-bg)] border-t-transparent rounded-full animate-spin" />
                Iniciando...
              </span>
            ) : (
              "Confirmar e Analisar \u2192"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
