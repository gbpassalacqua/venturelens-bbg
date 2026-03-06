"use client";

import ScoreCard from "@/components/ScoreCard";
import FeatureMatrix from "@/components/FeatureMatrix";
import { AnalysisResult } from "@/types/analysis";

const TYPE_COLORS: Record<string, string> = {
  direct: "bg-[var(--vl-red)]/20 text-[var(--vl-red)] border-[var(--vl-red)]/30",
  indirect: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  emerging: "bg-[var(--vl-green)]/20 text-[var(--vl-green)] border-[var(--vl-green)]/30",
};

const LEVEL_COLORS: Record<string, string> = {
  high: "bg-[var(--vl-red)]/20 text-[var(--vl-red)]",
  medium: "bg-[var(--vl-amber)]/20 text-[var(--vl-amber)]",
  low: "bg-[var(--vl-green)]/20 text-[var(--vl-green)]",
};

export default function ReportOutput({ result }: { result: AnalysisResult }) {
  const r = result.report_json;
  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-[var(--vl-gold)]">{result.project_name}</h2>
        <span className="text-sm text-[var(--vl-text3)]">{result.file_name}</span>
      </div>

      {/* Layout: Sidebar + Main */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        <ScoreCard score={result.score} scores={r.scores} verdict={result.verdict} />

        <div className="space-y-6">
          {/* Resumo Executivo */}
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <h3 className="font-display font-bold text-sm text-[var(--vl-text2)] mb-2">Resumo Executivo</h3>
            <p className="text-sm italic text-[var(--vl-text2)] leading-relaxed">{r.summary}</p>
          </div>

          {/* TAM / SAM / SOM */}
          <div className="grid grid-cols-3 gap-4">
            {([
              { key: "tam" as const, label: "TAM", color: "var(--vl-gold)" },
              { key: "sam" as const, label: "SAM", color: "#3B82F6" },
              { key: "som" as const, label: "SOM", color: "var(--vl-green)" },
            ]).map(({ key, label, color }) => (
              <div key={key} className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-4" style={{ borderBottomWidth: 3, borderBottomColor: color }}>
                <p className="text-xs text-[var(--vl-text3)] mb-1">{label}</p>
                <p className="font-display font-bold text-lg" style={{ color }}>{r[key].value}</p>
                <p className="text-xs text-[var(--vl-text3)] mt-1">{r[key].description}</p>
              </div>
            ))}
          </div>

          {/* Recomendação */}
          <div className="rounded-xl border border-[var(--vl-gold)]/30 bg-[var(--vl-gold)]/5 p-5">
            <h3 className="font-display font-bold text-sm text-[var(--vl-gold)] mb-2">Recomendação</h3>
            <p className="text-sm text-[var(--vl-text)]">{result.recommendation}</p>
          </div>
        </div>
      </div>

      {/* Concorrentes */}
      <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--vl-border)]">
          <h3 className="font-display font-bold text-sm">Concorrentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--vl-border)] text-[var(--vl-text3)]">
                <th className="text-left px-5 py-2 font-medium">Nome</th>
                <th className="text-left px-5 py-2 font-medium">Tipo</th>
                <th className="text-left px-5 py-2 font-medium">Preço</th>
                <th className="text-left px-5 py-2 font-medium">Fraqueza</th>
              </tr>
            </thead>
            <tbody>
              {r.competitors.map((c, i) => (
                <tr key={i} className="border-b border-[var(--vl-border)] last:border-0">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[c.type] ?? ""}`}>{c.type}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-[var(--vl-text2)]">{c.price}</td>
                  <td className="px-5 py-3 text-[var(--vl-text2)]">{c.weakness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Riscos */}
      <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
        <h3 className="font-display font-bold text-sm mb-4">Riscos</h3>
        <div className="space-y-3">
          {r.risks.map((risk, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-[var(--vl-text2)] text-sm flex-1">{risk.description}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${LEVEL_COLORS[risk.likelihood]}`}>
                P: {risk.likelihood}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${LEVEL_COLORS[risk.impact]}`}>
                I: {risk.impact}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Pontos Fortes / Fracos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-[var(--vl-green)]/20 bg-[var(--vl-card)] p-5">
          <h3 className="font-display font-bold text-sm text-[var(--vl-green)] mb-3">Pontos Fortes</h3>
          <ul className="space-y-2">
            {r.strengths.map((s, i) => (
              <li key={i} className="text-sm text-[var(--vl-text2)] flex gap-2">
                <span className="text-[var(--vl-green)] shrink-0">+</span>{s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-[var(--vl-red)]/20 bg-[var(--vl-card)] p-5">
          <h3 className="font-display font-bold text-sm text-[var(--vl-red)] mb-3">Pontos Fracos</h3>
          <ul className="space-y-2">
            {r.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-[var(--vl-text2)] flex gap-2">
                <span className="text-[var(--vl-red)] shrink-0">-</span>{w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Feature Matrix */}
      <div>
        <h3 className="font-display font-bold text-sm mb-4">Feature Matrix</h3>
        <FeatureMatrix mvp={result.mvp_features} v2={result.v2_features} cut={result.cut_features} />
      </div>

      {/* Próximo Passo */}
      <div className="rounded-xl border border-[var(--vl-gold)]/30 bg-[var(--vl-gold)]/5 p-5">
        <h3 className="font-display font-bold text-sm text-[var(--vl-gold)] mb-2">Próximo Passo</h3>
        <p className="text-sm text-[var(--vl-text)]">{r.next_steps}</p>
      </div>
    </div>
  );
}
