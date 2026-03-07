"use client";

import React from "react";

interface PricingScreenProps {
  onStartAnalysis: () => void;
}

interface PricingTier {
  tier: string;
  amount: string;
  period?: string;
  target: string;
  features: string[];
  buttonLabel: string;
  featured?: boolean;
}

const TIERS: PricingTier[] = [
  {
    tier: "FREE",
    amount: "$0",
    target: "Para explorar a plataforma",
    features: [
      "3 an\u00E1lises por m\u00EAs",
      "Estimativa b\u00E1sica de TAM",
      "Top 3 competidores",
      "Exporta\u00E7\u00E3o PDF com marca d\u2019\u00E1gua",
    ],
    buttonLabel: "Come\u00E7ar Gr\u00E1tis",
  },
  {
    tier: "PRO",
    amount: "$29",
    period: "/m\u00EAs",
    target: "Para fundadores e product managers",
    features: [
      "An\u00E1lises ilimitadas",
      "TAM/SAM/SOM completo",
      "Mapa completo de competidores",
      "An\u00E1lise de mercado Brasil",
      "Detalhamento de timing",
      "An\u00E1lise de riscos + mitiga\u00E7\u00F5es",
      "Exporta\u00E7\u00E3o PDF limpa",
    ],
    buttonLabel: "Iniciar Trial de 14 Dias",
    featured: true,
  },
  {
    tier: "VC ANALYST",
    amount: "$199",
    period: "/m\u00EAs",
    target: "Para analistas de VC e deal teams",
    features: [
      "Tudo do Pro",
      "Dashboard de portf\u00F3lio",
      "Scoring e ranking de deals",
      "Alertas Slack/email",
      "Acesso API (1.000 req/m\u00EAs)",
      "At\u00E9 5 assentos",
    ],
    buttonLabel: "Iniciar Trial Gr\u00E1tis",
  },
  {
    tier: "ENTERPRISE",
    amount: "Sob Consulta",
    target: "Para fundos e corpora\u00E7\u00F5es",
    features: [
      "Tudo do VC Plan",
      "SSO + SAML2",
      "Relat\u00F3rios white-label",
      "Fontes de dados customizadas",
      "SLA + suporte dedicado",
      "API ilimitada",
    ],
    buttonLabel: "Falar com Vendas",
  },
];

export default function PricingScreen({ onStartAnalysis }: PricingScreenProps) {
  return (
    <div className="max-w-[1200px] mx-auto p-10">
      {/* ── Page Header ── */}
      <div className="text-center mb-10">
        <h2 className="font-display text-[2rem] font-bold">
          Pre\u00E7os simples e transparentes
        </h2>
        <p className="text-[var(--vl-text2)] mt-1.5">
          Saiba se sua ideia vale a pena &mdash; come\u00E7ando gr\u00E1tis.
        </p>
      </div>

      {/* ── Pricing Grid ── */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-4 gap-3.5">
        {TIERS.map((tier, i) => {
          const isFeatured = tier.featured === true;
          const isEnterprise = tier.tier === "ENTERPRISE";

          return (
            <div
              key={i}
              className={`rounded-xl p-6 relative ${
                isFeatured
                  ? "border border-[var(--vl-gold)] bg-gradient-to-br from-[var(--vl-card2)] to-[rgba(240,165,0,.05)]"
                  : "bg-[var(--vl-card)] border border-[var(--vl-border)]"
              }`}
            >
              {/* Featured Badge */}
              {isFeatured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--vl-gold)] text-[var(--vl-bg)] text-[.65rem] font-extrabold uppercase tracking-wider py-0.5 px-3.5 rounded-full whitespace-nowrap">
                  Mais Popular
                </span>
              )}

              {/* Tier Label */}
              <div className="text-[.7rem] uppercase tracking-widest text-[var(--vl-text3)] mb-2">
                {tier.tier}
              </div>

              {/* Amount */}
              {isEnterprise ? (
                <div className="font-display text-2xl font-extrabold text-[var(--vl-text)] leading-none">
                  {tier.amount}
                </div>
              ) : (
                <div className="leading-none">
                  <span className="font-display text-[2.2rem] font-extrabold text-[var(--vl-text)]">
                    {tier.amount}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-[var(--vl-text2)] font-normal font-sans">
                      {tier.period}
                    </span>
                  )}
                </div>
              )}

              {/* Target */}
              <p className="text-xs text-[var(--vl-text2)] my-2 mb-4">
                {tier.target}
              </p>

              {/* Features */}
              <div>
                {tier.features.map((feature, j) => (
                  <div
                    key={j}
                    className={`text-sm text-[var(--vl-text2)] py-1.5 flex items-center gap-2 ${
                      j < tier.features.length - 1
                        ? "border-b border-[var(--vl-border)]"
                        : ""
                    }`}
                  >
                    <span className="text-[var(--vl-green)] font-bold shrink-0">
                      &#10003;
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Button */}
              <button
                onClick={onStartAnalysis}
                className={`w-full mt-[18px] py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  isFeatured
                    ? "bg-[var(--vl-gold)] text-[var(--vl-bg)] border border-[var(--vl-gold)] hover:bg-[var(--vl-gold2)]"
                    : "border border-[var(--vl-border2)] bg-transparent text-[var(--vl-text2)] hover:border-[var(--vl-text2)] hover:text-[var(--vl-text)]"
                }`}
              >
                {tier.buttonLabel}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Bottom Card ── */}
      <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-8 mt-6 text-center">
        <div className="font-display text-xl font-bold mb-2">
          Usado por fundadores, analistas e equipes de inova\u00E7\u00E3o
        </div>
        <p className="text-sm text-[var(--vl-text2)]">
          Todos os planos incluem: Dados de mercado USA + Brasil &middot; Motor
          de s\u00EDntese IA &middot; Modelo de Opportunity Score &middot;
          Armazenamento seguro (reten\u00E7\u00E3o de 90 dias)
        </p>
      </div>
    </div>
  );
}
