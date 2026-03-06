"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { AnalysisResult, Verdict } from "@/types/analysis";
import Link from "next/link";
import ReportOutput from "@/components/ReportOutput";

const ReportPDFDownload = dynamic(() => import("@/components/ReportPDFDownload"), { ssr: false });

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
  const [modalData, setModalData] = useState<AnalysisResult | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnalysisResult | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [fadingOut, setFadingOut] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    const { data, error } = await supabase
      .from("analyses")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (!error && data) setAnalyses(data as AnalysisResult[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/analyses/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleted_by: deleteTarget.created_by }),
      });

      const json = await res.json();
      if (json.success) {
        setFadingOut(deleteTarget.id);
        setTimeout(() => {
          setAnalyses((prev) => prev.filter((a) => a.id !== deleteTarget.id));
          setFadingOut(null);
        }, 300);
      }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function canDownloadPdf(a: AnalysisResult): boolean {
    return !!(
      a.report_json &&
      a.report_json.summary &&
      a.report_json.scores &&
      a.report_json.tam &&
      a.report_json.competitors
    );
  }

  return (
    <main className="min-h-screen">
      {/* Navbar */}
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
        <h1 className="font-display text-2xl font-bold mb-6">Histórico de Análises</h1>

        {loading && <p className="text-[var(--vl-text3)] animate-pulse text-center py-12">Carregando...</p>}

        {!loading && analyses.length === 0 && (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-12 text-center">
            <p className="text-[var(--vl-text3)]">Nenhuma análise ainda.</p>
          </div>
        )}

        <div className="space-y-3">
          {analyses.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] transition-all duration-300 ${
                fadingOut === a.id ? "opacity-0 scale-95" : "opacity-100"
              }`}
            >
              {/* Card header */}
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-[var(--vl-gold)]/20 flex items-center justify-center text-[var(--vl-gold)] font-bold text-sm shrink-0">
                    {USER_INITIALS[a.created_by] ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-sm truncate">{a.project_name || a.file_name}</p>
                      {/* Icons for site/github */}
                      {a.report_json?.produto_modo === "site" && <span title="Site analisado" className="text-xs">🌐</span>}
                      {a.report_json?.github_status && a.report_json.github_status !== "sem_github" && (
                        <span title="GitHub analisado" className="text-xs">💻</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--vl-text3)]">
                      {a.created_by} · {new Date(a.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <span className="font-display font-bold text-2xl text-[var(--vl-gold)]">{a.score}</span>

                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${VERDICT_BADGE[a.verdict] ?? ""}`}>
                    {a.verdict}
                  </span>

                  {a.report_json?.launch_readiness_score != null && (
                    <span className="text-xs px-2 py-1 rounded-full border border-blue-500/30 bg-blue-500/20 text-blue-400 font-medium">
                      🚀 {a.report_json.launch_readiness_score}%
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-3 ml-13 pl-[52px]">
                  <button
                    onClick={() => setModalData(a)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[var(--vl-border)] text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-colors"
                  >
                    👁 Ver Relatório
                  </button>

                  {canDownloadPdf(a) ? (
                    <ReportPDFDownload result={a} />
                  ) : (
                    <button
                      disabled
                      title="PDF não disponível para análises antigas"
                      className="text-xs px-3 py-1.5 rounded-lg border border-[var(--vl-border)] text-[var(--vl-text3)] opacity-50 cursor-not-allowed"
                    >
                      ⬇ Baixar PDF
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteTarget(a)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-[var(--vl-border)] text-[var(--vl-text3)] hover:border-[var(--vl-red)]/50 hover:text-[var(--vl-red)] transition-colors ml-auto"
                  >
                    🗑 Apagar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL: Full Report ── */}
      {modalData && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/70 backdrop-blur-sm p-4 animate-fade-up">
          <div className="relative w-full max-w-5xl bg-[var(--vl-bg)] rounded-2xl border border-[var(--vl-border)] my-8">
            {/* Close button */}
            <button
              onClick={() => setModalData(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--vl-bg2)] border border-[var(--vl-border)] flex items-center justify-center text-[var(--vl-text3)] hover:text-[var(--vl-text)] hover:border-[var(--vl-gold)] transition-colors"
            >
              ✕
            </button>

            <div className="p-6 md:p-8">
              <ReportOutput result={modalData} />
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--vl-card)] rounded-2xl border border-[var(--vl-border)] p-6 space-y-4 animate-fade-up">
            <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">Confirmar exclusão</h3>
            <p className="text-sm text-[var(--vl-text2)]">
              Tem certeza que deseja apagar a análise de{" "}
              <strong className="text-[var(--vl-text)]">{deleteTarget.project_name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-sm px-4 py-2 rounded-lg border border-[var(--vl-border)] text-[var(--vl-text2)] hover:text-[var(--vl-text)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm px-4 py-2 rounded-lg bg-[var(--vl-red)] text-white font-medium hover:bg-[var(--vl-red)]/80 transition-colors disabled:opacity-50"
              >
                {deleting ? "Apagando..." : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
