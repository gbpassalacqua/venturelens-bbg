"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AnalysisResult, Verdict } from "@/types/analysis";
import Link from "next/link";

const VERDICT_BADGE: Record<Verdict, string> = {
  "AVANÇAR": "bg-[var(--vl-green)]/20 text-[var(--vl-green)] border-[var(--vl-green)]/30",
  "PIVOTAR": "bg-[var(--vl-amber)]/20 text-[var(--vl-amber)] border-[var(--vl-amber)]/30",
  "DESCARTAR": "bg-[var(--vl-red)]/20 text-[var(--vl-red)] border-[var(--vl-red)]/30",
};

const USER_INITIALS: Record<string, string> = {
  Giuliano: "G",
  Bruno: "B",
  Bento: "B",
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setAnalyses(data as AnalysisResult[]);
      setLoading(false);
    }
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-[var(--vl-border)] bg-[var(--vl-bg)]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 max-w-5xl flex items-center justify-between h-14">
          <div className="flex items-center gap-1">
            <span className="font-display font-bold text-xl text-[var(--vl-gold)]">VentureLens</span>
            <span className="text-sm text-[var(--vl-text3)] font-medium ml-1">BBG</span>
          </div>
          <Link href="/" className="text-sm px-4 py-1.5 rounded-lg border border-[var(--vl-border)] text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-colors">
            Nova Análise
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="font-display text-2xl font-bold mb-6">Histórico</h1>

        {loading && <p className="text-[var(--vl-text3)] animate-pulse text-center py-12">Carregando...</p>}

        {!loading && analyses.length === 0 && (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-12 text-center">
            <p className="text-[var(--vl-text3)]">Nenhuma análise ainda.</p>
          </div>
        )}

        <div className="space-y-3">
          {analyses.map((a) => (
            <div key={a.id}>
              <button
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                className="w-full text-left rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-4 hover:border-[var(--vl-border2)] transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[var(--vl-gold)]/20 flex items-center justify-center text-[var(--vl-gold)] font-bold text-sm shrink-0">
                    {USER_INITIALS[a.created_by] ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-sm truncate">{a.project_name || a.file_name}</p>
                    <p className="text-xs text-[var(--vl-text3)]">
                      {a.created_by} · {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <span className="font-display font-bold text-2xl text-[var(--vl-gold)]">{a.score}</span>

                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${VERDICT_BADGE[a.verdict] ?? ""}`}>
                    {a.verdict}
                  </span>

                  <span className="text-[var(--vl-text3)] text-sm">{expanded === a.id ? "▲" : "▼"}</span>
                </div>
              </button>

              {expanded === a.id && a.report_json && (
                <div className="mt-2 rounded-xl border border-[var(--vl-border)] bg-[var(--vl-bg2)] p-5 text-sm">
                  <p className="text-[var(--vl-text2)] italic mb-4">{a.report_json.summary}</p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[var(--vl-text3)] mb-1">Recomendação</p>
                      <p className="text-[var(--vl-text)]">{a.recommendation}</p>
                    </div>
                    <div>
                      <p className="text-[var(--vl-text3)] mb-1">Próximo passo</p>
                      <p className="text-[var(--vl-text)]">{a.report_json.next_steps}</p>
                    </div>
                  </div>

                  {a.report_json.strengths?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[var(--vl-green)] text-xs font-medium mb-1">Pontos Fortes</p>
                      <ul className="text-xs text-[var(--vl-text2)] space-y-0.5">
                        {a.report_json.strengths.map((s: string, i: number) => <li key={i}>+ {s}</li>)}
                      </ul>
                    </div>
                  )}

                  {a.report_json.weaknesses?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-[var(--vl-red)] text-xs font-medium mb-1">Pontos Fracos</p>
                      <ul className="text-xs text-[var(--vl-text2)] space-y-0.5">
                        {a.report_json.weaknesses.map((w: string, i: number) => <li key={i}>- {w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
