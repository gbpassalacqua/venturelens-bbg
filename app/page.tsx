"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnalysisResult, AnalysisResponse } from "@/types/analysis";
import Link from "next/link";

// V2 Components
import Navbar from "@/components/v2/Navbar";
import Hero from "@/components/v2/Hero";
import InputScreen from "@/components/v2/InputScreen";
import ConfirmScreen from "@/components/v2/ConfirmScreen";
import ProgressScreen from "@/components/v2/ProgressScreen";
import Dashboard from "@/components/v2/Dashboard";
import CompetitorScreen from "@/components/v2/CompetitorScreen";
import TimingScreen from "@/components/v2/TimingScreen";
import RiskScreen from "@/components/v2/RiskScreen";
import FullReport from "@/components/v2/FullReport";
import PersonaScreen from "@/components/v2/PersonaScreen";
import RoadmapScreen from "@/components/v2/RoadmapScreen";
import PricingScreen from "@/components/v2/PricingScreen";

// PDF
import ReportPDFDownload from "@/components/ReportPDFDownload";

const USERS = ["Giuliano", "Bruno", "Bento"];

type Screen =
  | "hero"
  | "input"
  | "confirm"
  | "progress"
  | "dashboard"
  | "market"
  | "competitors"
  | "timing"
  | "risks"
  | "report"
  | "personas"
  | "roadmap"
  | "pricing";

type TargetMarket = "usa" | "brasil" | "ambos";

// Map screen to navbar tab id
const SCREEN_TO_TAB: Record<string, string> = {
  dashboard: "dashboard",
  market: "market",
  competitors: "competitors",
  timing: "timing",
  risks: "risks",
  report: "report",
  personas: "personas",
  roadmap: "roadmap",
  pricing: "pricing",
};

// Screens that show the app navbar
const APP_NAV_SCREENS: Screen[] = [
  "dashboard",
  "market",
  "competitors",
  "timing",
  "risks",
  "report",
  "personas",
  "roadmap",
  "pricing",
];

interface ConfirmFields {
  problema: string;
  solucao: string;
  icp: string;
  monetizacao: string;
  vertical: string;
  dependencias: string;
  mercados: string;
}

const EMPTY_CONFIRM_FIELDS: ConfirmFields = {
  problema: "",
  solucao: "",
  icp: "",
  monetizacao: "",
  vertical: "",
  dependencias: "",
  mercados: "",
};

function marketLabel(m: TargetMarket): string {
  if (m === "usa") return "Estados Unidos";
  if (m === "brasil") return "Brasil";
  return "Estados Unidos e Brasil";
}

export default function Home() {
  // ── Navigation state ──
  const [screen, setScreen] = useState<Screen>("hero");

  // ── Analysis state ──
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStep, setProgressStep] = useState(0);

  // ── User state ──
  const [selectedUser, setSelectedUser] = useState(USERS[0]);

  // ── File state ──
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ── Idea description ──
  const [ideaText, setIdeaText] = useState("");

  // ── Product description (optional) ──
  const [productDescription, setProductDescription] = useState("");

  // ── Target market ──
  const [targetMarket, setTargetMarket] = useState<TargetMarket>("ambos");

  // ── Confirm fields ──
  const [confirmFields, setConfirmFields] = useState<ConfirmFields>(EMPTY_CONFIRM_FIELDS);

  // ── PDF export state ──
  const [showPdfDownload, setShowPdfDownload] = useState(false);

  // ── Progress timer ref ──
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // ── Go to confirm screen (pre-populate fields) ──
  function goToConfirm() {
    setConfirmFields({
      ...EMPTY_CONFIRM_FIELDS,
      problema: ideaText,
      mercados: marketLabel(targetMarket),
    });
    setScreen("confirm");
  }

  // ── Confirm field change handler ──
  function handleConfirmFieldChange(field: string, value: string) {
    setConfirmFields((prev) => ({ ...prev, [field]: value }));
  }

  // ── Analysis handler ──
  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgressStep(0);
    setScreen("progress");

    // Start progress animation
    let step = 0;
    progressTimerRef.current = setInterval(() => {
      step++;
      if (step <= 6) {
        setProgressStep(step);
      }
    }, 4000);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("created_by", selectedUser);
      formData.append("productMode", "prd");

      // Send idea text and target market
      if (ideaText.trim()) {
        formData.append("ideaText", ideaText.trim());
      }
      if (productDescription.trim()) {
        formData.append("siteUrl", productDescription.trim());
      }
      formData.append("targetMarket", targetMarket);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const json: AnalysisResponse = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error ?? "Erro na análise");
      }

      // Complete progress and show dashboard
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      setProgressStep(7); // All done
      setResult(json.data);

      // Short delay then show dashboard
      setTimeout(() => {
        setScreen("dashboard");
      }, 800);
    } catch (err) {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
      setError(err instanceof Error ? err.message : "Algo deu errado");
      setScreen("input");
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedFile,
    selectedUser,
    ideaText,
    productDescription,
    targetMarket,
  ]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // ── Navigation handlers ──
  function goToHero() {
    setScreen("hero");
  }

  function goToInput() {
    setScreen("input");
  }

  function handleTabChange(tab: string) {
    setScreen(tab as Screen);
  }

  function handleNewAnalysis() {
    setResult(null);
    setSelectedFile(null);
    setError(null);
    setIdeaText("");
    setProductDescription("");
    setTargetMarket("ambos");
    setConfirmFields(EMPTY_CONFIRM_FIELDS);
    setScreen("input");
  }

  function handleExportPDF() {
    setShowPdfDownload(true);
  }

  // ── Navbar mode ──
  const showAppNav = APP_NAV_SCREENS.includes(screen);
  const showLandingNav = screen === "hero";

  return (
    <main className="min-h-screen">
      {/* Landing Navbar */}
      {showLandingNav && (
        <Navbar
          mode="landing"
          onLogoClick={goToHero}
          onNewAnalysis={goToInput}
          onPricingClick={() => setScreen("pricing")}
        />
      )}

      {/* App Navbar */}
      {showAppNav && (
        <Navbar
          mode="app"
          activeTab={SCREEN_TO_TAB[screen] || "dashboard"}
          onTabChange={handleTabChange}
          onNewAnalysis={handleNewAnalysis}
          onLogoClick={goToHero}
          onPricingClick={() => setScreen("pricing")}
        />
      )}

      {/* ── SCREENS ── */}
      <div className="animate-fadeIn" key={screen}>
        {/* Hero / Landing */}
        {screen === "hero" && <Hero onStartAnalysis={goToInput} />}

        {/* Input */}
        {screen === "input" && (
          <>
            <InputScreen
              onFileSelected={(f) => setSelectedFile(f)}
              onNext={goToConfirm}
              onBack={goToHero}
              selectedFile={selectedFile}
              isLoading={isLoading}
              ideaText={ideaText}
              onIdeaTextChange={setIdeaText}
              productDescription={productDescription}
              onProductDescriptionChange={setProductDescription}
              targetMarket={targetMarket}
              onTargetMarketChange={setTargetMarket}
              selectedUser={selectedUser}
              users={USERS}
              onUserChange={setSelectedUser}
            />

            {/* Error display */}
            {error && (
              <div className="max-w-[760px] mx-auto px-10 mt-4">
                <div className="p-4 rounded-xl border border-[var(--vl-red)]/30 bg-[var(--vl-red)]/5">
                  <p className="text-sm text-[var(--vl-red)]">{error}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Confirm */}
        {screen === "confirm" && (
          <ConfirmScreen
            problema={confirmFields.problema}
            solucao={confirmFields.solucao}
            icp={confirmFields.icp}
            monetizacao={confirmFields.monetizacao}
            vertical={confirmFields.vertical}
            dependencias={confirmFields.dependencias}
            mercados={confirmFields.mercados}
            onFieldChange={handleConfirmFieldChange}
            onConfirm={handleAnalyze}
            onBack={goToInput}
            isLoading={isLoading}
          />
        )}

        {/* Progress */}
        {screen === "progress" && (
          <ProgressScreen currentStep={progressStep} />
        )}

        {/* Dashboard */}
        {screen === "dashboard" && result && (
          <Dashboard
            report={result.report_json}
            onTabChange={handleTabChange}
            onExportPDF={handleExportPDF}
          />
        )}

        {/* Market - reuse Dashboard TAM section */}
        {screen === "market" && result && (
          <div className="max-w-[1200px] mx-auto p-10">
            <div className="mb-10">
              <h2 className="font-display text-[2rem] font-bold tracking-[-0.02em]">
                Intelig&ecirc;ncia de Mercado
              </h2>
              <p className="text-[var(--vl-text2)] mt-1.5">
                TAM / SAM / SOM &middot; Tend&ecirc;ncias de demanda &middot;
                Velocidade de investimento
              </p>
            </div>

            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                TAMANHO DE MERCADO
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {[
                  {
                    label: "TAM — Total",
                    val:
                      result.report_json.strategyAnalysis.marketSize.tam,
                    color: "var(--vl-gold)",
                    bar: "var(--vl-gold)",
                  },
                  {
                    label: "SAM",
                    val:
                      result.report_json.strategyAnalysis.marketSize.sam,
                    color: "var(--vl-blue2)",
                    bar: "var(--vl-blue)",
                  },
                  {
                    label: "SOM",
                    val:
                      result.report_json.strategyAnalysis.marketSize.som,
                    color: "var(--vl-green)",
                    bar: "var(--vl-green)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-5 relative overflow-hidden"
                  >
                    <div className="text-[.7rem] uppercase tracking-widest text-[var(--vl-text3)] mb-2">
                      {item.label}
                    </div>
                    <div
                      className="font-display text-[2rem] font-bold"
                      style={{ color: item.color }}
                    >
                      {item.val}
                    </div>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-[3px]"
                      style={{ background: item.bar }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                AVALIA&Ccedil;&Atilde;O DE CREDIBILIDADE
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
                {
                  result.report_json.strategyAnalysis.marketSize
                    .credibilityAssessment
                }
              </p>
            </div>

            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                TIMING DE MERCADO
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
                {
                  result.report_json.strategyAnalysis.marketSize
                    .marketTiming
                }
              </p>
            </div>
          </div>
        )}

        {/* Competitors */}
        {screen === "competitors" && result && (
          <CompetitorScreen report={result.report_json} />
        )}

        {/* Timing */}
        {screen === "timing" && result && (
          <TimingScreen report={result.report_json} />
        )}

        {/* Risks */}
        {screen === "risks" && result && (
          <RiskScreen report={result.report_json} />
        )}

        {/* Full Report */}
        {screen === "report" && result && (
          <FullReport
            report={result.report_json}
            onExportPDF={handleExportPDF}
          />
        )}

        {/* Personas */}
        {screen === "personas" && result && (
          <PersonaScreen report={result.report_json} />
        )}

        {/* Roadmap */}
        {screen === "roadmap" && result && (
          <RoadmapScreen report={result.report_json} />
        )}

        {/* Pricing */}
        {screen === "pricing" && (
          <PricingScreen onStartAnalysis={goToInput} />
        )}
      </div>

      {/* History link - floating */}
      {screen === "hero" && (
        <Link
          href="/history"
          className="fixed bottom-6 right-6 px-4 py-2 rounded-lg bg-[var(--vl-card)] border border-[var(--vl-border)] text-sm text-[var(--vl-text2)] hover:text-[var(--vl-gold)] hover:border-[var(--vl-gold)] transition-all z-50"
        >
          {"\u{1F4CB}"} Hist&oacute;rico
        </Link>
      )}

      {/* PDF Download overlay */}
      {showPdfDownload && result && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200]">
          <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-8 max-w-md mx-4">
            <h3 className="font-display text-lg font-bold mb-4">
              Exportar PDF
            </h3>
            <ReportPDFDownload result={result} />
            <button
              onClick={() => setShowPdfDownload(false)}
              className="mt-4 w-full py-2 rounded-lg border border-[var(--vl-border2)] text-sm text-[var(--vl-text2)] hover:text-[var(--vl-text)] hover:border-[var(--vl-text2)] transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
