"use client";

import { ScoreBreakdown, Verdict } from "@/types/analysis";

interface ScoreCardProps {
  score: number;
  scores: ScoreBreakdown;
  verdict: Verdict;
}

const VERDICT_CONFIG: Record<Verdict, { emoji: string; color: string; bg: string }> = {
  "AVANÇAR": { emoji: "🟢", color: "text-[var(--vl-green)]", bg: "bg-[var(--vl-green)]/10 border-[var(--vl-green)]/30" },
  "PIVOTAR": { emoji: "🟡", color: "text-[var(--vl-amber)]", bg: "bg-[var(--vl-amber)]/10 border-[var(--vl-amber)]/30" },
  "DESCARTAR": { emoji: "🔴", color: "text-[var(--vl-red)]", bg: "bg-[var(--vl-red)]/10 border-[var(--vl-red)]/30" },
};

const SCORE_LABELS: Record<keyof ScoreBreakdown, string> = {
  market: "Mercado",
  platform: "Plataforma",
  bbg_fit: "Fit BBG",
  revenue: "Receita",
};

const barColor = (v: number) =>
  v >= 70 ? "bg-[var(--vl-green)]" : v >= 40 ? "bg-[var(--vl-amber)]" : "bg-[var(--vl-red)]";

function GaugeSVG({ value }: { value: number }) {
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const filled = (value / 100) * circumference;
  return (
    <svg viewBox="0 0 160 160" className="w-44 h-44 mx-auto">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--vl-gold)" />
          <stop offset="100%" stopColor="var(--vl-gold2)" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--vl-border)" strokeWidth="10" />
      <circle
        cx="80" cy="80" r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth="10"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        transform="rotate(-90 80 80)"
        className="transition-all duration-1000"
      />
      <text x="80" y="72" textAnchor="middle" className="font-display" fill="var(--vl-gold)" fontSize="40" fontWeight="800">
        {value}
      </text>
      <text x="80" y="96" textAnchor="middle" fill="var(--vl-text3)" fontSize="14">
        /100
      </text>
    </svg>
  );
}

export default function ScoreCard({ score, scores, verdict }: ScoreCardProps) {
  const vc = VERDICT_CONFIG[verdict];
  return (
    <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-6 space-y-6">
      <GaugeSVG value={score} />

      <div className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-2 ${vc.bg}`}>
        <span>{vc.emoji}</span>
        <span className={`font-display font-bold text-lg ${vc.color}`}>{verdict}</span>
      </div>

      <div className="space-y-4">
        {(Object.keys(scores) as (keyof ScoreBreakdown)[]).map((key) => (
          <div key={key} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--vl-text2)]">{SCORE_LABELS[key]}</span>
              <span className="font-mono text-[var(--vl-text)]">{scores[key]}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--vl-bg2)] overflow-hidden">
              <div
                className={`h-full rounded-full animate-bar ${barColor(scores[key])}`}
                style={{ width: `${scores[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
