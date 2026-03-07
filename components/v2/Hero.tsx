"use client";

import React from "react";
import ScoreRing from "./ScoreRing";

interface HeroProps {
  onStartAnalysis: () => void;
}

const MINI_STATS = [
  { val: "$12B", label: "TAM" },
  { val: "8.2", label: "Timing" },
  { val: "14", label: "Competidores" },
  { val: "USA", label: "Mercado" },
  { val: "BR", label: "Mercado" },
  { val: "A+", label: "Moat" },
];

const BOTTOM_STATS = [
  { val: "5 min", label: "Tempo medio de analise" },
  { val: "12K+", label: "Ideias analisadas" },
  { val: "6+", label: "Fontes de dados" },
  { val: "USA & BR", label: "Mercados cobertos" },
];

const FEATURES: {
  icon: string;
  title: string;
  desc: string;
  bg: string;
  cta?: boolean;
}[] = [
  {
    icon: "\u{1F4D0}",
    title: "Calculadora TAM / SAM / SOM",
    desc: "Estimativa hibrida top-down e bottom-up usando dados de mercado em tempo real.",
    bg: "rgba(240,165,0,.1)",
  },
  {
    icon: "\u{1F50D}",
    title: "Analise de Competidores",
    desc: "Identifica competidores diretos, indiretos e emergentes com dados de funding e posicionamento.",
    bg: "rgba(59,130,246,.1)",
  },
  {
    icon: "\u23F1",
    title: "Motor de Timing de Mercado",
    desc: "Avalia prontidao tecnologica, tendencias de demanda, clima regulatorio e curvas de adocao.",
    bg: "rgba(34,197,94,.1)",
  },
  {
    icon: "\u{1F3AF}",
    title: "Opportunity Score",
    desc: "Score composto 0\u2013100 ponderado em mercado, competicao, timing, viabilidade e monetizacao.",
    bg: "rgba(251,146,60,.1)",
  },
  {
    icon: "\u26A0\uFE0F",
    title: "Analise de Riscos",
    desc: "Identifica riscos criticos com ratings de probabilidade/impacto e estrategias de mitigacao.",
    bg: "rgba(239,68,68,.1)",
  },
];

export default function Hero({ onStartAnalysis }: HeroProps) {
  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="max-w-[1200px] mx-auto grid grid-cols-1 md-hero:grid-cols-2 gap-[60px] items-center min-h-[calc(100vh-60px)] pt-20 pb-10 px-10 md-hero:px-10">
        {/* Left Column */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-[rgba(240,165,0,.08)] border border-[rgba(240,165,0,.2)] rounded-full py-1 px-3.5 pl-2 text-xs text-[var(--vl-gold)] mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--vl-green)] animate-pulse" />
            Intelig&ecirc;ncia de Mercado em Tempo Real
          </div>

          {/* H1 */}
          <h1 className="font-display text-[2.4rem] md-hero:text-[3.6rem] font-extrabold leading-[1.05] tracking-[-0.03em] mb-5">
            Valide sua{" "}
            <em className="italic font-light text-[var(--vl-gold)]">
              ideia de startup
            </em>{" "}
            em 5 minutos
          </h1>

          {/* Paragraph */}
          <p className="text-[1.05rem] text-[var(--vl-text2)] leading-[1.7] mb-9">
            Envie seu PRD ou descreva sua ideia. O VentureLens AI retorna um
            relat&oacute;rio completo de valida&ccedil;&atilde;o &mdash; TAM,
            competidores, timing e opportunity score &mdash; instantaneamente.
          </p>

          {/* CTA */}
          <div className="flex gap-3">
            <button
              onClick={onStartAnalysis}
              className="py-3.5 px-7 rounded-lg text-[.95rem] font-semibold bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(240,165,0,.3)] transition-all"
            >
              Analisar Minha Ideia &rarr;
            </button>
          </div>
        </div>

        {/* Right Column (hero-visual) — hidden on small screens */}
        <div className="hidden md-hero:block">
          <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 relative overflow-hidden">
            {/* Pseudo glow */}
            <div
              className="absolute -top-20 -right-20 w-[300px] h-[300px] pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(240,165,0,.15) 0%, transparent 70%)",
              }}
            />

            {/* Score Ring */}
            <div className="flex justify-center relative z-10">
              <ScoreRing score={78} size={160} />
            </div>

            {/* Mini stats grid */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 relative z-10">
              {MINI_STATS.map((s, i) => (
                <div
                  key={i}
                  className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-3 text-center"
                >
                  <div className="font-mono text-[1.1rem] text-[var(--vl-gold2)] font-medium">
                    {s.val}
                  </div>
                  <div className="text-[.68rem] text-[var(--vl-text3)] uppercase tracking-widest mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md-hero:grid-cols-4 gap-4 max-w-[1200px] mx-auto px-10 pb-[60px]">
        {BOTTOM_STATS.map((s, i) => (
          <div
            key={i}
            className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-5"
          >
            <div className="font-display text-[2rem] font-bold text-[var(--vl-text)]">
              {s.val}
            </div>
            <div className="text-sm text-[var(--vl-text2)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Features Section ── */}
      <div className="max-w-[1200px] mx-auto px-10 pb-5">
        <h2 className="font-display text-[1.6rem] font-bold tracking-[-0.02em] mb-1.5">
          Tudo que voc&ecirc; precisa para validar uma startup
        </h2>
        <p className="text-[var(--vl-text2)] text-[.9rem] mb-7">
          Seis motores de valida&ccedil;&atilde;o rodam em paralelo, sintetizados
          por IA em um relat&oacute;rio acion&aacute;vel.
        </p>
      </div>

      <div className="grid grid-cols-1 md-hero:grid-cols-3 gap-4 max-w-[1200px] mx-auto px-10 pb-20">
        {FEATURES.map((f, i) => (
          <div
            key={i}
            className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 hover:border-[var(--vl-gold)] hover:-translate-y-0.5 transition-all cursor-pointer"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3.5"
              style={{ background: f.bg }}
            >
              {f.icon}
            </div>
            <h3 className="text-[.95rem] font-semibold mb-2">{f.title}</h3>
            <p className="text-[.82rem] text-[var(--vl-text2)] leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}

        {/* CTA feature card */}
        <div
          onClick={onStartAnalysis}
          className="bg-[var(--vl-card)] border border-dashed border-[rgba(240,165,0,.3)] rounded-xl p-6 hover:border-[var(--vl-gold)] hover:-translate-y-0.5 transition-all cursor-pointer"
          style={{ background: "rgba(240,165,0,.05)" }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3.5"
            style={{ background: "rgba(240,165,0,.05)" }}
          >
            +
          </div>
          <h3 className="text-[.95rem] font-semibold mb-2">
            Analise sua ideia &rarr;
          </h3>
          <p className="text-[.82rem] text-[var(--vl-text2)] leading-relaxed">
            Envie um PRD, cole uma descri&ccedil;&atilde;o, ou arraste seu pitch
            deck.
          </p>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="text-center py-8 text-[var(--vl-text3)] text-xs border-t border-[var(--vl-border)] mt-10">
        &copy; 2025 VentureLens AI &middot; Plataforma de Valida&ccedil;&atilde;o
        de Startups
      </footer>
    </div>
  );
}
