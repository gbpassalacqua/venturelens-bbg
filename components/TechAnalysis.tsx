"use client";

interface TechAnalysisData {
  fluxo_end_to_end: { score: number; detalhe: string };
  pagamento: { score: number; status: string; detalhe: string };
  autenticacao: { score: number; status: string; detalhe: string };
  variaveis_ambiente: { score: number; detalhe: string };
  qualidade_codigo: { score: number; detalhe: string };
  prontidao: {
    usuario_novo: string;
    autenticacao: string;
    feature_principal: string;
    pagamento: string;
    email: string;
  };
  riscos_tecnicos: { risco: string; severidade: string; solucao: string }[];
  arquivos_analisados: number;
}

interface TechAnalysisProps {
  analise_tecnica?: TechAnalysisData;
}

const barColor = (v: number) =>
  v >= 7 ? "bg-[var(--vl-green)]" : v >= 4 ? "bg-[var(--vl-amber)]" : "bg-[var(--vl-red)]";

const barTextColor = (v: number) =>
  v >= 7
    ? "text-[var(--vl-green)]"
    : v >= 4
      ? "text-[var(--vl-amber)]"
      : "text-[var(--vl-red)]";

const PRONTIDAO_LABELS: Record<string, string> = {
  usuario_novo: "Usuário Novo",
  autenticacao: "Autenticação",
  feature_principal: "Feature Principal",
  pagamento: "Pagamento",
  email: "E-mail",
};

function ProntidaoIcon({ status }: { status: string }) {
  const normalized = status.toLowerCase().trim();
  if (normalized === "ok") {
    return <span className="text-2xl" title="OK">✅</span>;
  }
  if (normalized === "parcial") {
    return <span className="text-2xl" title="Parcial">⚠️</span>;
  }
  return <span className="text-2xl" title="Não implementado">❌</span>;
}

function prontidaoColor(status: string): string {
  const normalized = status.toLowerCase().trim();
  if (normalized === "ok") return "text-[var(--vl-green)]";
  if (normalized === "parcial") return "text-[var(--vl-amber)]";
  return "text-[var(--vl-red)]";
}

const SEVERITY_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  alto: {
    bg: "bg-[var(--vl-red)]/20 border-[var(--vl-red)]/30",
    text: "text-[var(--vl-red)]",
    label: "Alto",
  },
  medio: {
    bg: "bg-[var(--vl-amber)]/20 border-[var(--vl-amber)]/30",
    text: "text-[var(--vl-amber)]",
    label: "Médio",
  },
  baixo: {
    bg: "bg-[var(--vl-green)]/20 border-[var(--vl-green)]/30",
    text: "text-[var(--vl-green)]",
    label: "Baixo",
  },
};

interface ScoreBarProps {
  label: string;
  score: number;
  detalhe: string;
}

function ScoreBar({ label, score, detalhe }: ScoreBarProps) {
  const pct = Math.min(Math.max((score / 10) * 100, 0), 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--vl-text2)]">{label}</span>
        <span className={`font-mono font-bold ${barTextColor(score)}`}>{score}/10</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--vl-bg2)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor(score)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-[var(--vl-text3)] leading-relaxed">{detalhe}</p>
    </div>
  );
}

export default function TechAnalysis({ analise_tecnica }: TechAnalysisProps) {
  if (!analise_tecnica) return null;

  const data = analise_tecnica;
  const prontidaoKeys = Object.keys(PRONTIDAO_LABELS) as (keyof typeof data.prontidao)[];

  const scores: { label: string; score: number; detalhe: string }[] = [
    { label: "Fluxo End-to-End", score: data.fluxo_end_to_end.score, detalhe: data.fluxo_end_to_end.detalhe },
    { label: "Pagamento", score: data.pagamento.score, detalhe: data.pagamento.detalhe },
    { label: "Autenticação", score: data.autenticacao.score, detalhe: data.autenticacao.detalhe },
    { label: "Variáveis de Ambiente", score: data.variaveis_ambiente.score, detalhe: data.variaveis_ambiente.detalhe },
    { label: "Qualidade do Código", score: data.qualidade_codigo.score, detalhe: data.qualidade_codigo.detalhe },
  ];

  return (
    <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <span>🔬</span> Análise Técnica do Código
        </h3>
        <p className="text-xs text-[var(--vl-text3)] mt-1">
          {data.arquivos_analisados} arquivos analisados
        </p>
      </div>

      {/* Prontidao Grid */}
      <div>
        <p className="text-xs text-[var(--vl-text2)] font-medium mb-3">Prontidão para Produção</p>
        <div className="grid grid-cols-5 gap-3">
          {prontidaoKeys.map((key) => {
            const status = data.prontidao[key];
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-1.5 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-border)] py-3 px-2"
              >
                <ProntidaoIcon status={status} />
                <span className={`text-[10px] text-center font-medium leading-tight ${prontidaoColor(status)}`}>
                  {PRONTIDAO_LABELS[key]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-4">
        <p className="text-xs text-[var(--vl-text2)] font-medium">Scores Técnicos (0-10)</p>
        {scores.map((s) => (
          <ScoreBar key={s.label} label={s.label} score={s.score} detalhe={s.detalhe} />
        ))}
      </div>

      {/* Riscos Tecnicos */}
      {data.riscos_tecnicos.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-[var(--vl-text2)] font-medium">Riscos Técnicos</p>
          {data.riscos_tecnicos.map((risco, i) => {
            const sev = SEVERITY_CONFIG[risco.severidade.toLowerCase()] ?? SEVERITY_CONFIG.medio;
            return (
              <div
                key={i}
                className={`rounded-lg border p-4 space-y-2 ${sev.bg}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-[var(--vl-text)] font-medium flex-1">{risco.risco}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap ${sev.bg} ${sev.text}`}
                  >
                    {sev.label}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[var(--vl-gold)] text-xs shrink-0 mt-0.5">💡</span>
                  <p className="text-xs text-[var(--vl-text2)] leading-relaxed">{risco.solucao}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
