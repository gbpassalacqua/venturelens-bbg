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
import TAMCards from "@/components/v2/TAMCards";

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

  // ── Extraction state ──
  const [isExtracting, setIsExtracting] = useState(false);

  // ── PDF export state ──
  const [showPdfDownload, setShowPdfDownload] = useState(false);

  // ── Progress timer ref ──
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // ── Go to confirm screen (extract fields from document first) ──
  async function goToConfirm() {
    // Pre-populate with what we already know
    setConfirmFields({
      ...EMPTY_CONFIRM_FIELDS,
      problema: ideaText,
      mercados: marketLabel(targetMarket),
    });

    // Navigate immediately, show extracting state
    setScreen("confirm");

    // Attempt AI extraction from the uploaded file or idea text
    if (!selectedFile && !ideaText.trim()) return;

    setIsExtracting(true);
    try {
      const formData = new FormData();
      if (selectedFile) {
        formData.append("file", selectedFile);
      } else if (ideaText.trim()) {
        formData.append("text", ideaText.trim());
      }

      console.log("=== FRONTEND: Calling /api/extract ===");
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      console.log("=== FRONTEND: Extract response status ===", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("=== FRONTEND: Extract data ===", JSON.stringify(data).substring(0, 300));
        if (data.fields) {
          const NOT_IDENTIFIED = "Não identificado no documento";
          setConfirmFields((prev) => ({
            problema: (data.fields.problema && data.fields.problema !== NOT_IDENTIFIED) ? data.fields.problema : prev.problema || "",
            solucao: (data.fields.solucao && data.fields.solucao !== NOT_IDENTIFIED) ? data.fields.solucao : prev.solucao || "",
            icp: (data.fields.icp && data.fields.icp !== NOT_IDENTIFIED) ? data.fields.icp : prev.icp || "",
            monetizacao: (data.fields.monetizacao && data.fields.monetizacao !== NOT_IDENTIFIED) ? data.fields.monetizacao : prev.monetizacao || "",
            vertical: (data.fields.vertical && data.fields.vertical !== NOT_IDENTIFIED) ? data.fields.vertical : prev.vertical || "",
            dependencias: (data.fields.dependenciasTech && data.fields.dependenciasTech !== NOT_IDENTIFIED) ? data.fields.dependenciasTech : prev.dependencias || "",
            mercados: (data.fields.mercadosAlvo && data.fields.mercadosAlvo !== NOT_IDENTIFIED) ? data.fields.mercadosAlvo : prev.mercados || marketLabel(targetMarket),
          }));
        }
      } else {
        // Extraction failed — leave fields as-is, user can fill manually
        const errBody = await res.text();
        console.warn("=== FRONTEND: Extract API error ===", res.status, errBody);
      }
    } catch (err) {
      // Network error — don't block the flow
      console.warn("=== FRONTEND: Extract fetch error ===", err);
    } finally {
      setIsExtracting(false);
    }
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

      // Send extracted/edited context from Confirm screen
      const hasContent = Object.values(confirmFields).some((v) => v.trim().length > 0);
      if (hasContent) {
        formData.append("extractedContext", JSON.stringify(confirmFields));
      }

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
    confirmFields,
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
    setIsExtracting(false);
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
              isExtracting={isExtracting}
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
            isExtracting={isExtracting}
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
                {"Intelig\u00eancia de Mercado"}
              </h2>
              <p className="text-[var(--vl-text2)] mt-1.5">
                {"TAM / SAM / SOM \u00b7 Tend\u00eancias de demanda \u00b7 Velocidade de investimento"}
              </p>
            </div>

            {/* TAM / SAM / SOM — using shared TAMCards component */}
            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                TAMANHO DE MERCADO
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <TAMCards
                tam={result.report_json.strategyAnalysis.marketSize.tam}
                sam={result.report_json.strategyAnalysis.marketSize.sam}
                som={result.report_json.strategyAnalysis.marketSize.som}
              />
            </div>

            {/* Credibility Assessment */}
            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                {"AVALIA\u00c7\u00c3O DE CREDIBILIDADE"}
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
                {result.report_json.strategyAnalysis.marketSize.credibilityAssessment}
              </p>
            </div>

            {/* Methodology Card */}
            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                METODOLOGIA
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
                {"An\u00e1lise baseada em dados p\u00fablicos de mercado, benchmarks de ind\u00fastria e compara\u00e7\u00e3o com empresas similares. Os valores de TAM/SAM/SOM foram estimados com base na vertical de atua\u00e7\u00e3o, modelo de neg\u00f3cio e mercados-alvo identificados no pitch deck."}
              </p>
            </div>

            {/* Funding Velocity */}
            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6 mb-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                VELOCIDADE DE INVESTIMENTO
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                        {"M\u00e9trica"}
                      </th>
                      <th className="text-left py-2.5 px-3.5 bg-[var(--vl-bg2)] border-b-2 border-[var(--vl-border2)] text-[var(--vl-text2)] text-[.72rem] uppercase tracking-wider font-semibold">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[var(--vl-border)]">
                      <td className="py-3 px-3.5 text-[var(--vl-text)]">Ask de Funding</td>
                      <td className="py-3 px-3.5 font-mono text-[var(--vl-gold2)]">
                        {result.report_json.meta.fundingAsk || "\u2014"}
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--vl-border)]">
                      <td className="py-3 px-3.5 text-[var(--vl-text)]">{"Valua\u00e7\u00e3o Impl\u00edcita"}</td>
                      <td className="py-3 px-3.5 font-mono text-[var(--vl-gold2)]">
                        {result.report_json.financialAnalysis.fundraisingAnalysis.impliedValuation || "\u2014"}
                      </td>
                    </tr>
                    <tr className="border-b border-[var(--vl-border)]">
                      <td className="py-3 px-3.5 text-[var(--vl-text)]">Runway Projetado</td>
                      <td className="py-3 px-3.5 font-mono text-[var(--vl-gold2)]">
                        {result.report_json.financialAnalysis.fundraisingAnalysis.runwayFromRaise || "\u2014"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3.5 text-[var(--vl-text)]">{"Pr\u00f3ximo Milestone"}</td>
                      <td className="py-3 px-3.5 text-[var(--vl-text2)]">
                        {result.report_json.financialAnalysis.fundraisingAnalysis.nextMilestone || "\u2014"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timing de Mercado */}
            <div className="bg-[var(--vl-card)] border border-[var(--vl-border)] rounded-xl p-6">
              <div className="text-xs font-semibold uppercase tracking-widest text-[var(--vl-text3)] mb-4 flex items-center gap-2">
                TIMING DE MERCADO
                <span className="flex-1 h-px bg-[var(--vl-border)]" />
              </div>
              <p className="text-sm text-[var(--vl-text2)] leading-relaxed">
                {result.report_json.strategyAnalysis.marketSize.marketTiming}
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
