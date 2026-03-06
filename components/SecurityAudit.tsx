"use client";

import { useState } from "react";

interface SecurityAuditData {
  score_geral: number;
  nivel: string;
  regras: {
    regra: string;
    status: string;
    detalhe: string;
    correcao: string;
  }[];
  vulnerabilidades_criticas: {
    descricao: string;
    arquivo: string;
    linha_aproximada: string;
    correcao_imediata: string;
  }[];
  checklist_deploy: {
    item: string;
    status: string;
  }[];
}

interface SecurityAuditProps {
  security_audit?: SecurityAuditData;
}

function getScoreBadge(score: number): { label: string; emoji: string; bg: string; text: string } {
  if (score >= 80) {
    return {
      label: "Seguro",
      emoji: "✅",
      bg: "bg-[var(--vl-green)]/20 border-[var(--vl-green)]/30",
      text: "text-[var(--vl-green)]",
    };
  }
  if (score >= 60) {
    return {
      label: "Adequado",
      emoji: "⚠️",
      bg: "bg-[var(--vl-amber)]/20 border-[var(--vl-amber)]/30",
      text: "text-[var(--vl-amber)]",
    };
  }
  if (score >= 40) {
    return {
      label: "Básico",
      emoji: "⚠️",
      bg: "bg-[var(--vl-amber)]/20 border-[var(--vl-amber)]/30",
      text: "text-[var(--vl-amber)]",
    };
  }
  return {
    label: "Inseguro",
    emoji: "🔴",
    bg: "bg-[var(--vl-red)]/20 border-[var(--vl-red)]/30",
    text: "text-[var(--vl-red)]",
  };
}

function getRuleStatusConfig(status: string): {
  icon: string;
  color: string;
  expandable: boolean;
} {
  const normalized = status.toLowerCase().trim();
  switch (normalized) {
    case "ok":
      return { icon: "✅", color: "text-[var(--vl-green)]", expandable: false };
    case "alerta":
      return { icon: "⚠️", color: "text-[var(--vl-amber)]", expandable: true };
    case "critico":
    case "crítico":
      return { icon: "🔴", color: "text-[var(--vl-red)]", expandable: true };
    case "nao_aplicavel":
    case "não aplicável":
    case "na":
      return { icon: "➖", color: "text-[var(--vl-text3)]", expandable: false };
    default:
      return { icon: "➖", color: "text-[var(--vl-text3)]", expandable: false };
  }
}

function getDeployStatusConfig(status: string): { icon: string; color: string } {
  const normalized = status.toLowerCase().trim();
  switch (normalized) {
    case "ok":
      return { icon: "✅", color: "text-[var(--vl-green)]" };
    case "pendente":
      return { icon: "⚠️", color: "text-[var(--vl-amber)]" };
    case "critico":
    case "crítico":
      return { icon: "🔴", color: "text-[var(--vl-red)]" };
    default:
      return { icon: "➖", color: "text-[var(--vl-text3)]" };
  }
}

export default function SecurityAudit({ security_audit }: SecurityAuditProps) {
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set());

  if (!security_audit) return null;

  const data = security_audit;
  const badge = getScoreBadge(data.score_geral);
  const hasVulns = data.vulnerabilidades_criticas.length > 0;

  const toggleRule = (index: number) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-sm flex items-center gap-2">
            <span>🔒</span> Auditoria de Segurança
          </h3>
          <p className="text-xs text-[var(--vl-text3)] mt-1">
            Nível: {data.nivel}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${badge.bg}`}
        >
          <span>{badge.emoji}</span>
          <span className={`font-display font-bold text-sm ${badge.text}`}>
            {data.score_geral}/100
          </span>
          <span className={`text-xs ${badge.text}`}>{badge.label}</span>
        </div>
      </div>

      {/* Critical Vulnerabilities Banner */}
      {hasVulns && (
        <div className="rounded-lg border border-[var(--vl-red)]/40 bg-[var(--vl-red)]/10 p-4 space-y-3">
          <p className="text-sm font-bold text-[var(--vl-red)] flex items-center gap-2">
            <span>🚨</span>
            {data.vulnerabilidades_criticas.length} vulnerabilidade(s) cr&iacute;tica(s). N&atilde;o fa&ccedil;a deploy antes de corrigir.
          </p>
          <div className="space-y-3">
            {data.vulnerabilidades_criticas.map((vuln, i) => (
              <div
                key={i}
                className="rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-red)]/20 p-3 space-y-1.5"
              >
                <p className="text-sm text-[var(--vl-text)] font-medium">{vuln.descricao}</p>
                <p className="text-xs text-[var(--vl-text3)]">
                  <span className="font-mono text-[var(--vl-text2)]">{vuln.arquivo}</span>
                  {vuln.linha_aproximada && (
                    <span className="ml-2 text-[var(--vl-text3)]">
                      (linha ~{vuln.linha_aproximada})
                    </span>
                  )}
                </p>
                <div className="flex items-start gap-2 mt-1">
                  <span className="text-[var(--vl-gold)] text-xs shrink-0 mt-0.5">💡</span>
                  <p className="text-xs text-[var(--vl-text2)] leading-relaxed">
                    {vuln.correcao_imediata}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Rules */}
      <div className="space-y-2">
        <p className="text-xs text-[var(--vl-text2)] font-medium">Regras de Segurança</p>
        <div className="space-y-1">
          {data.regras.map((regra, i) => {
            const cfg = getRuleStatusConfig(regra.status);
            const isExpanded = expandedRules.has(i);
            const isCritico =
              regra.status.toLowerCase().trim() === "critico" ||
              regra.status.toLowerCase().trim() === "crítico";

            return (
              <div key={i} className="rounded-lg border border-[var(--vl-border)] overflow-hidden">
                {cfg.expandable ? (
                  <button
                    onClick={() => toggleRule(i)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--vl-bg2)] transition-colors"
                  >
                    <span className="shrink-0">{cfg.icon}</span>
                    <span className="text-sm text-[var(--vl-text)] flex-1">{regra.regra}</span>
                    <span className={`text-xs ${cfg.color} font-medium`}>
                      {regra.status}
                    </span>
                    <span className="text-xs text-[var(--vl-text3)] ml-1">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <span className="shrink-0">{cfg.icon}</span>
                    <span className="text-sm text-[var(--vl-text)] flex-1">{regra.regra}</span>
                    <span className={`text-xs ${cfg.color} font-medium`}>
                      {regra.status}
                    </span>
                  </div>
                )}

                {cfg.expandable && isExpanded && (
                  <div className="px-4 pb-3 pt-0 space-y-2 border-t border-[var(--vl-border)] bg-[var(--vl-bg2)]">
                    <div className="pt-2.5">
                      {!isCritico && regra.detalhe && (
                        <p className="text-xs text-[var(--vl-text2)] leading-relaxed mb-2">
                          {regra.detalhe}
                        </p>
                      )}
                      <div className="flex items-start gap-2">
                        <span className="text-[var(--vl-gold)] text-xs shrink-0 mt-0.5">💡</span>
                        <p className="text-xs text-[var(--vl-text2)] leading-relaxed">
                          {isCritico ? regra.correcao : regra.correcao}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Deploy Checklist */}
      {data.checklist_deploy.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--vl-text2)] font-medium">Checklist de Deploy</p>
          <div className="rounded-lg border border-[var(--vl-border)] divide-y divide-[var(--vl-border)]">
            {data.checklist_deploy.map((item, i) => {
              const cfg = getDeployStatusConfig(item.status);
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="shrink-0">{cfg.icon}</span>
                  <span className="text-sm text-[var(--vl-text)] flex-1">{item.item}</span>
                  <span className={`text-xs font-medium ${cfg.color}`}>{item.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
