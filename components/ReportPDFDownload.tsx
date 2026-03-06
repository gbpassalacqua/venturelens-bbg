"use client";

import { useState, useEffect, useRef } from "react";
import { AnalysisResult } from "@/types/analysis";

export default function ReportPDFDownload({ result }: { result: AnalysisResult }) {
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modulesRef = useRef<{ PDFDownloadLink: any; ReportPDF: any }>({ PDFDownloadLink: null, ReportPDF: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [renderer, pdf] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/ReportPDF"),
      ]);
      if (!cancelled) {
        modulesRef.current = {
          PDFDownloadLink: renderer.PDFDownloadLink,
          ReportPDF: pdf.default,
        };
        setReady(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const safeName = (result.project_name || "report").replace(/[^a-zA-Z0-9_-]/g, "_");
  const fileName = `VentureLens_${safeName}_${today}.pdf`;

  if (!ready) {
    return (
      <button
        disabled
        className="text-xs px-4 py-2 rounded-lg border border-[var(--vl-border)] text-[var(--vl-text3)] opacity-50 cursor-wait"
      >
        Preparando PDF...
      </button>
    );
  }

  const { PDFDownloadLink, ReportPDF } = modulesRef.current;

  return (
    <PDFDownloadLink
      document={<ReportPDF result={result} />}
      fileName={fileName}
      className="text-xs px-4 py-2 rounded-lg font-bold bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] transition-colors inline-flex items-center gap-1.5"
    >
      {({ loading }: { loading: boolean }) =>
        loading ? "Gerando PDF..." : "⬇ Baixar PDF"
      }
    </PDFDownloadLink>
  );
}
