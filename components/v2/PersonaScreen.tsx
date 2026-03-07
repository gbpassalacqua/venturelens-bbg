"use client";

import React from "react";
import type { V2ReportJson } from "@/types/analysis";

interface PersonaScreenProps {
  report: V2ReportJson;
}

interface Persona {
  emoji: string;
  bg: string;
  name: string;
  role: string;
  situation: string;
  pain: string;
  wtp: string;
  jtbd: string;
}

const PERSONAS: Persona[] = [
  {
    emoji: "\u{1F468}\u200D\u{1F4BB}",
    bg: "rgba(240,165,0,.1)",
    name: "Fundador Early-Stage",
    role: "Primeiro Empreendimento \u00B7 Desenvolvedor",
    situation: "Construindo nos finais de semana",
    pain: "Semanas pesquisando sem dire\u00E7\u00E3o clara",
    wtp: "Plano Pro",
    jtbd: "\u201CMe ajude a decidir em qual ideia apostar minha carreira.\u201D",
  },
  {
    emoji: "\u{1F469}\u200D\u{1F4BC}",
    bg: "rgba(59,130,246,.1)",
    name: "Analista de VC",
    role: "Fundo Series A \u00B7 Deal Team",
    situation: "Avalia 800+ deals/ano",
    pain: "4h por deal s\u00F3 para b\u00E1sico de mercado",
    wtp: "Plano VC",
    jtbd: "\u201CMe d\u00EA um primeiro filtro objetivo deste pitch deck em minutos.\u201D",
  },
  {
    emoji: "\u{1F468}\u200D\u{1F3E6}",
    bg: "rgba(34,197,94,.1)",
    name: "L\u00EDder de Inova\u00E7\u00E3o",
    role: "Corpora\u00E7\u00E3o \u00B7 Studio Interno",
    situation: "Gerencia equipe de 5 pessoas",
    pain: "Board quer decis\u00F5es baseadas em dados",
    wtp: "Enterprise",
    jtbd: "\u201CJustifique nosso investimento ao board com dados reais de mercado.\u201D",
  },
];

const INFO_LABELS = [
  { key: "situation" as const, label: "Situa\u00E7\u00E3o" },
  { key: "pain" as const, label: "Dor" },
  { key: "wtp" as const, label: "Disposi\u00E7\u00E3o" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PersonaScreen({ report }: PersonaScreenProps) {
  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── Page Header ── */}
      <h2 className="font-display text-[2rem] font-bold">Personas Alvo</h2>
      <p className="text-[var(--vl-text2)] mt-1.5">
        Tr\u00EAs segmentos prim\u00E1rios de usu\u00E1rios derivados da an\u00E1lise.
      </p>

      {/* ── Persona Grid ── */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-3 gap-4 mt-6">
        {PERSONAS.map((persona, i) => (
          <div
            key={i}
            className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 hover:border-[var(--vl-gold)] transition-colors"
          >
            {/* Avatar */}
            <div
              className="w-[52px] h-[52px] rounded-full flex items-center justify-center text-2xl mb-3.5"
              style={{ background: persona.bg }}
            >
              {persona.emoji}
            </div>

            {/* Name & Role */}
            <div className="text-base font-bold">{persona.name}</div>
            <div className="text-xs text-[var(--vl-text2)] mb-3.5">
              {persona.role}
            </div>

            {/* Info Rows */}
            {INFO_LABELS.map((row) => (
              <div key={row.key} className="flex gap-2 mb-1.5 text-sm">
                <span className="text-[var(--vl-text3)] min-w-[80px]">
                  {row.label}
                </span>
                <span className="text-[var(--vl-text)]">{persona[row.key]}</span>
              </div>
            ))}

            {/* JTBD */}
            <div className="mt-3.5 p-3 bg-[rgba(240,165,0,.05)] border border-[rgba(240,165,0,.15)] rounded-md text-xs text-[var(--vl-gold2)] italic">
              {persona.jtbd}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
