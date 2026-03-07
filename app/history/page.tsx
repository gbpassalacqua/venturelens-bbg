"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabase";
import { AnalysisResult } from "@/types/analysis";
import Link from "next/link";
import FullReport from "@/components/v2/FullReport";

const ReportPDFDownload = dynamic(
  () => import("@/components/ReportPDFDownload"),
  { ssr: false }
);

// V2 verdict badges
const VERDICT_BADGE: Record<string, string> = {
  "STRONG PASS":
    "bg-[var(--vl-green)]/20 text-[var(--vl-green)] border-[var(--vl-green)]/30",
  PASS: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CONDITIONAL:
    "bg-[var(--vl-amber)]/20 text-[var(--vl-amber)] border-[var(--vl-amber)]/30",
  WATCH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DECLINE:
    "bg-[var(--vl-red)]/20 text-[var(--vl-red)] border-[var(--vl-red)]/30",
  // Legacy V1
  AVANÇAR:
    "bg-[var(--vl-green)]/20 text-[var(--vl-green)] border-[var(--vl-green)]/30",
  PIVOTAR:
    "bg-[var(--vl-amber)]/20 text-[var(--vl-amber)] border-[var(--vl-amber)]/30",
  DESCARTAR:
    "bg-[var(--vl-red)]/20 text-[var(--vl-red)] border-[var(--vl-red)]/30",
};

// Verdict label translations
const VERDICT_LABEL: Record<string, string> = {
  "STRONG PASS": "Aprovado com Destaque",
  PASS: "Aprovado",
  CONDITIONAL: "Condicional",
  WATCH: "Observação",
  DECLINE: "Recusado",
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
          setAnalyses((prev) =>
            prev.filter((a) => a.id !== deleteTarget.id)
          );
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rj = a.report_json as any;
    return !!(rj && (rj.meta || (rj.summary && rj.scores && rj.tam)));
  }

  function isV2(a: AnalysisResult): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rj = a.report_json as any;
    return !!(rj?.meta?.modelVersion);
  }

  function getVersionLabel(a: AnalysisResult): string | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rj = a.report_json as any;
    if (rj?.meta?.modelVersion) return "V2";
    if (rj?.summary) return "V1";
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[var(--vl-border)] bg-[rgba(8,13,26,.85)] backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-10 flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center gap-1 cursor-pointer">
            <span className="font-display font-extrabold text-xl text-[var(--vl-gold)]">
              VentureLens
            </span>
            <span className="text-[var(--vl-text2)] font-light text-xl font-display">
              AI
            </span>
          </Link>
          <Link
            href="/"
            className="px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-border2)] bg-transparent text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-all"
          >
            + Nova Análise
          </Link>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-10 py-10">
        <div className="mb-10">
          <h1 className="font-display text-[2rem] font-bold tracking-[-0.02em]">
            Histórico de Análises
          </h1>
          <p className="text-[var(--vl-text2)] mt-1.5">
            Todas as análises realizadas pela equipe
          </p>
        </div>

        {loading && (
          <p className="text-[var(--vl-text3)] animate-pulse text-center py-12">
            Carregando...
          </p>
        )}

        {!loading && analyses.length === 0 && (
          <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-12 text-center">
            <p className="text-[var(--vl-text3)]">Nenhuma análise ainda.</p>
          </div>
        )}

        <div className="space-y-3">
          {analyses.map((a) => (
            <div
              key={a.id}
              className={`bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl transition-all duration-300 hover:border-[var(--vl-gold)]/50 ${
                fadingOut === a.id ? "opacity-0 scale-95" : "opacity-100"
              }`}
            >
              <div className="p-5">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[rgba(240,165,0,.1)] flex items-center justify-center text-[var(--vl-gold)] font-bold text-sm shrink-0">
                    {USER_INITIALS[a.created_by] ?? "?"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-sm truncate">
                        {a.project_name || a.file_name}
                      </p>
                      {getVersionLabel(a) && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                            getVersionLabel(a) === "V2"
                              ? "bg-[rgba(240,165,0,.1)] text-[var(--vl-gold)]"
                              : "bg-[var(--vl-bg2)] text-[var(--vl-text3)]"
                          }`}
                        >
                          {getVersionLabel(a)}
                        </span>
                      )}
                      {a.report_json?.github_status &&
                        a.report_json.github_status !== "sem_github" && (
                          <span title="GitHub analisado" className="text-xs">
                            💻
                          </span>
                        )}
                    </div>
                    <p className="text-xs text-[var(--vl-text3)] mt-0.5">
                      {a.created_by} ·{" "}
                      {new Date(a.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Score */}
                  <span className="font-display font-extrabold text-3xl text-[var(--vl-gold)]">
                    {a.score}
                  </span>

                  {/* Verdict badge */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full border font-medium ${
                      VERDICT_BADGE[a.verdict] ??
                      "bg-[var(--vl-bg2)] text-[var(--vl-text3)] border-[var(--vl-border)]"
                    }`}
                  >
                    {VERDICT_LABEL[a.verdict] ?? a.verdict}
                  </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-3 pl-[56px]">
                  <button
                    onClick={() => setModalData(a)}
                    className="text-xs px-3 py-1.5 rounded-md border border-[var(--vl-border2)] text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-colors"
                  >
                    👁 Ver Relatório
                  </button>

                  {canDownloadPdf(a) ? (
                    <ReportPDFDownload result={a} />
                  ) : (
                    <button
                      disabled
                      title="PDF não disponível para análises antigas"
                      className="text-xs px-3 py-1.5 rounded-md border border-[var(--vl-border)] text-[var(--vl-text3)] opacity-50 cursor-not-allowed"
                    >
                      ⬇ Baixar PDF
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteTarget(a)}
                    className="text-xs px-3 py-1.5 rounded-md border border-[var(--vl-border2)] text-[var(--vl-text3)] hover:border-[var(--vl-red)]/50 hover:text-[var(--vl-red)] transition-colors ml-auto"
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
          <div className="relative w-full max-w-[1200px] bg-[var(--vl-bg)] rounded-2xl border border-[var(--vl-border)] my-8">
            {/* Close button */}
            <button
              onClick={() => setModalData(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-[var(--vl-bg2)] border border-[var(--vl-border)] flex items-center justify-center text-[var(--vl-text3)] hover:text-[var(--vl-text)] hover:border-[var(--vl-gold)] transition-colors"
            >
              ✕
            </button>

            <div className="p-2 md:p-4">
              {isV2(modalData) ? (
                <FullReport
                  report={modalData.report_json}
                  onExportPDF={() => {}}
                />
              ) : (
                <div className="p-8 text-center text-[var(--vl-text2)]">
                  <p className="font-display text-lg font-bold mb-2">
                    Relatório V1
                  </p>
                  <p className="text-sm">
                    Este relatório foi gerado com a versão anterior. Dados
                    limitados disponíveis.
                  </p>
                  <div className="mt-6 text-left bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4">
                      DADOS DO RELATÓRIO
                    </p>
                    <pre className="text-xs text-[var(--vl-text2)] overflow-auto max-h-[400px]">
                      {JSON.stringify(modalData.report_json, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Delete confirmation ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-[var(--vl-card)] rounded-xl border border-[var(--vl-border)] p-6 space-y-4 animate-fade-up">
            <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">
              Confirmar exclusão
            </h3>
            <p className="text-sm text-[var(--vl-text2)]">
              Tem certeza que deseja apagar a análise de{" "}
              <strong className="text-[var(--vl-text)]">
                {deleteTarget.project_name}
              </strong>
              ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="text-sm px-4 py-2 rounded-lg border border-[var(--vl-border2)] text-[var(--vl-text2)] hover:text-[var(--vl-text)] transition-colors"
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
