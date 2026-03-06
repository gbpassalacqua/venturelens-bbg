"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnalysisResult, V2ReportJson, V2ScoreItem } from "@/types/analysis";

const ReportPDFDownload = dynamic(() => import("@/components/ReportPDFDownload"), { ssr: false });

/* ─── Verdict colors ─── */
const VERDICT_COLORS: Record<string, string> = {
  "STRONG PASS": "bg-[var(--vl-green)]/15 text-[var(--vl-green)] border-[var(--vl-green)]/40",
  "PASS":        "bg-blue-500/15 text-blue-400 border-blue-500/40",
  "CONDITIONAL": "bg-[var(--vl-amber)]/15 text-[var(--vl-amber)] border-[var(--vl-amber)]/40",
  "WATCH":       "bg-orange-500/15 text-orange-400 border-orange-500/40",
  "DECLINE":     "bg-[var(--vl-red)]/15 text-[var(--vl-red)] border-[var(--vl-red)]/40",
};

/* ─── Grade colors ─── */
const GRADE_COLORS: Record<string, string> = {
  A: "bg-[var(--vl-green)]/15 text-[var(--vl-green)] border-[var(--vl-green)]/40",
  B: "bg-blue-500/15 text-blue-400 border-blue-500/40",
  C: "bg-[var(--vl-amber)]/15 text-[var(--vl-amber)] border-[var(--vl-amber)]/40",
  D: "bg-orange-500/15 text-orange-400 border-orange-500/40",
  F: "bg-[var(--vl-red)]/15 text-[var(--vl-red)] border-[var(--vl-red)]/40",
};

/* ─── Probability / Impact colors ─── */
const PROB_IMPACT_COLORS: Record<string, string> = {
  LOW:    "bg-[var(--vl-green)]/15 text-[var(--vl-green)]",
  MEDIUM: "bg-[var(--vl-amber)]/15 text-[var(--vl-amber)]",
  HIGH:   "bg-[var(--vl-red)]/15 text-[var(--vl-red)]",
  FATAL:  "bg-red-900/30 text-red-400 animate-pulse",
};

/* ─── Severity colors ─── */
const SEVERITY_COLORS: Record<string, string> = {
  LOW:      "bg-[var(--vl-green)]/15 text-[var(--vl-green)] border-[var(--vl-green)]/40",
  MEDIUM:   "bg-[var(--vl-amber)]/15 text-[var(--vl-amber)] border-[var(--vl-amber)]/40",
  HIGH:     "bg-[var(--vl-red)]/15 text-[var(--vl-red)] border-[var(--vl-red)]/40",
  CRITICAL: "bg-red-900/30 text-red-400 border-red-700/50",
};

/* ─── Outcome badge colors ─── */
const OUTCOME_COLORS: Record<string, string> = {
  SUCCESS:  "bg-[var(--vl-green)]/15 text-[var(--vl-green)] border-[var(--vl-green)]/40",
  FAILURE:  "bg-[var(--vl-red)]/15 text-[var(--vl-red)] border-[var(--vl-red)]/40",
  ACQUIRED: "bg-blue-500/15 text-blue-400 border-blue-500/40",
  IPO:      "bg-[var(--vl-gold)]/15 text-[var(--vl-gold)] border-[var(--vl-gold)]/40",
  PIVOT:    "bg-[var(--vl-amber)]/15 text-[var(--vl-amber)] border-[var(--vl-amber)]/40",
};

/* ─── Score bar color ─── */
const barColor = (v: number) =>
  v >= 70 ? "bg-[var(--vl-green)]" : v >= 40 ? "bg-[var(--vl-amber)]" : "bg-[var(--vl-red)]";

/* ─── Score label map ─── */
const SCORE_LABELS: Record<string, string> = {
  market:      "Market",
  team:        "Team",
  product:     "Product",
  traction:    "Traction",
  financials:  "Financials",
  gtm:         "Go-to-Market",
  technology:  "Technology",
  deckQuality: "Deck Quality",
};

/* ─── Tab definitions ─── */
type TabKey = "strategy" | "finance" | "marketing" | "tech";
const TABS: { key: TabKey; label: string }[] = [
  { key: "strategy", label: "Strategy" },
  { key: "finance", label: "Finance" },
  { key: "marketing", label: "Marketing" },
  { key: "tech", label: "Tech" },
];

/* ─── Reusable Null Card ─── */
function NullCard({ text = "Data not available in this analysis" }: { text?: string }) {
  return (
    <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-bg2)] p-5">
      <p className="text-sm text-[var(--vl-text3)] italic">{text}</p>
    </div>
  );
}

/* ─── Section wrapper ─── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">{title}</h3>
      {children}
    </div>
  );
}

/* ─── Detail row ─── */
function DetailRow({ label, value }: { label: string; value: string | undefined | null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-2 border-b border-[var(--vl-border)] last:border-0">
      <span className="text-sm font-medium text-[var(--vl-text2)] sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-[var(--vl-text)]">{value || "—"}</span>
    </div>
  );
}

/* ─── Gauge SVG ─── */
function GaugeSVG({ value }: { value: number }) {
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const filled = (value / 100) * circumference;
  return (
    <svg viewBox="0 0 160 160" className="w-48 h-48 mx-auto">
      <defs>
        <linearGradient id="gaugeGradV2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--vl-gold)" />
          <stop offset="100%" stopColor="var(--vl-gold2)" />
        </linearGradient>
      </defs>
      <circle cx="80" cy="80" r={r} fill="none" stroke="var(--vl-border)" strokeWidth="10" />
      <circle
        cx="80" cy="80" r={r} fill="none" stroke="url(#gaugeGradV2)" strokeWidth="10"
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

/* ─── Mini Score Card ─── */
function MiniScoreCard({ name, item }: { name: string; item: V2ScoreItem | undefined | null }) {
  if (!item) return <NullCard />;
  return (
    <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--vl-text2)]">{name}</span>
        <span className="font-display font-bold text-lg text-[var(--vl-text)]">{item.score}</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--vl-bg2)] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor(item.score)}`}
          style={{ width: `${item.score}%` }}
        />
      </div>
      <p className="text-xs font-medium text-[var(--vl-text2)]">{item.label}</p>
      <p className="text-xs text-[var(--vl-text3)] leading-relaxed">{item.summary}</p>
    </div>
  );
}

/* ─── Tag Badge ─── */
function Tag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${className}`}>
      {children}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB CONTENT RENDERERS
   ═══════════════════════════════════════════════════════════════ */

function StrategyTab({ r }: { r: V2ReportJson }) {
  const s = r.strategyAnalysis;
  if (!s) return <NullCard />;

  return (
    <div className="space-y-6">
      {/* Market Size */}
      <Section title="Market Size">
        {s.marketSize ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([
                { key: "tam" as const, label: "TAM", color: "var(--vl-gold)" },
                { key: "sam" as const, label: "SAM", color: "#3B82F6" },
                { key: "som" as const, label: "SOM", color: "var(--vl-green)" },
              ] as const).map(({ key, label, color }) => (
                <div key={key} className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-4" style={{ borderBottomWidth: 3, borderBottomColor: color }}>
                  <p className="text-xs text-[var(--vl-text3)] mb-1">{label}</p>
                  <p className="font-display font-bold text-lg" style={{ color }}>{s.marketSize[key] || "—"}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-4 space-y-1">
              <DetailRow label="Credibility Assessment" value={s.marketSize.credibilityAssessment} />
              <DetailRow label="Market Timing" value={s.marketSize.marketTiming} />
            </div>
          </>
        ) : <NullCard />}
      </Section>

      {/* Competitive Landscape */}
      <Section title="Competitive Landscape">
        {s.competitiveLandscape ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-4">
            {s.competitiveLandscape.directCompetitors?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-text3)] mb-2">Direct Competitors</p>
                <div className="flex flex-wrap gap-2">
                  {s.competitiveLandscape.directCompetitors.map((c, i) => (
                    <Tag key={i} className="bg-[var(--vl-red)]/10 text-[var(--vl-red)] border-[var(--vl-red)]/30">{c}</Tag>
                  ))}
                </div>
              </div>
            )}
            {s.competitiveLandscape.indirectCompetitors?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-text3)] mb-2">Indirect Competitors</p>
                <div className="flex flex-wrap gap-2">
                  {s.competitiveLandscape.indirectCompetitors.map((c, i) => (
                    <Tag key={i} className="bg-blue-500/10 text-blue-400 border-blue-500/30">{c}</Tag>
                  ))}
                </div>
              </div>
            )}
            <DetailRow label="Moat Assessment" value={s.competitiveLandscape.moatAssessment} />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--vl-text2)]">Moat Strength</span>
              <Tag className="bg-[var(--vl-gold)]/15 text-[var(--vl-gold)] border-[var(--vl-gold)]/40">
                {s.competitiveLandscape.moatStrength || "—"}
              </Tag>
            </div>
          </div>
        ) : <NullCard />}
      </Section>

      {/* Business Model */}
      <Section title="Business Model">
        {s.businessModel ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <DetailRow label="Revenue Model" value={s.businessModel.revenueModel} />
            <DetailRow label="Scalability" value={s.businessModel.scalability} />
            <DetailRow label="Pricing Power" value={s.businessModel.pricingPower} />
            <DetailRow label="Unit Economics Viability" value={s.businessModel.unitEconomicsViability} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Team Assessment */}
      <Section title="Team Assessment">
        {s.teamAssessment ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-4">
            <DetailRow label="Founder-Market Fit" value={s.teamAssessment.founderMarketFit} />
            {s.teamAssessment.keyStrengths?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-green)] mb-2">Key Strengths</p>
                <ul className="space-y-1">
                  {s.teamAssessment.keyStrengths.map((item, i) => (
                    <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                      <span className="text-[var(--vl-green)] shrink-0">+</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s.teamAssessment.keyGaps?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-red)] mb-2">Key Gaps</p>
                <ul className="space-y-1">
                  {s.teamAssessment.keyGaps.map((item, i) => (
                    <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                      <span className="text-[var(--vl-red)] shrink-0">-</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s.teamAssessment.hiringPriorities?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-amber)] mb-2">Hiring Priorities</p>
                <div className="flex flex-wrap gap-2">
                  {s.teamAssessment.hiringPriorities.map((item, i) => (
                    <Tag key={i} className="bg-[var(--vl-amber)]/10 text-[var(--vl-amber)] border-[var(--vl-amber)]/30">{item}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <NullCard />}
      </Section>
    </div>
  );
}

function FinanceTab({ r }: { r: V2ReportJson }) {
  const f = r.financialAnalysis;
  if (!f) return <NullCard />;

  const metricEntries: { label: string; value: string | undefined }[] = f.currentMetrics ? [
    { label: "Revenue", value: f.currentMetrics.revenue },
    { label: "Burn Rate", value: f.currentMetrics.burnRate },
    { label: "Runway", value: f.currentMetrics.runway },
    { label: "Gross Margin", value: f.currentMetrics.grossMargin },
    { label: "CAC", value: f.currentMetrics.cac },
    { label: "LTV", value: f.currentMetrics.ltv },
    { label: "LTV/CAC Ratio", value: f.currentMetrics.ltvCacRatio },
    { label: "Churn", value: f.currentMetrics.churn },
    { label: "NRR", value: f.currentMetrics.nrr },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Current Metrics */}
      <Section title="Current Metrics">
        {f.currentMetrics ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricEntries.map(({ label, value }, i) => (
              <div key={i} className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-4">
                <p className="text-xs text-[var(--vl-text3)] mb-1">{label}</p>
                <p className="font-display font-bold text-base text-[var(--vl-text)]">{value || "—"}</p>
              </div>
            ))}
          </div>
        ) : <NullCard />}
      </Section>

      {/* Projections Audit */}
      <Section title="Projections Audit">
        {f.projectionsAudit ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-4">
            <DetailRow label="Revenue Projections" value={f.projectionsAudit.revenueProjections} />
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--vl-text2)]">Credibility Score</span>
                <span className="text-sm font-mono text-[var(--vl-text)]">{f.projectionsAudit.credibilityScore || "—"}</span>
              </div>
              {f.projectionsAudit.credibilityScore && (
                <div className="h-2 rounded-full bg-[var(--vl-bg2)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor(parseInt(f.projectionsAudit.credibilityScore) || 0)}`}
                    style={{ width: `${parseInt(f.projectionsAudit.credibilityScore) || 0}%` }}
                  />
                </div>
              )}
            </div>
            {f.projectionsAudit.keyAssumptions?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-text3)] mb-2">Key Assumptions</p>
                <ul className="space-y-1">
                  {f.projectionsAudit.keyAssumptions.map((a, i) => (
                    <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                      <span className="text-[var(--vl-text3)] shrink-0">&bull;</span>{a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {f.projectionsAudit.redFlags?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-red)] mb-2">Red Flags</p>
                <ul className="space-y-1">
                  {f.projectionsAudit.redFlags.map((flag, i) => (
                    <li key={i} className="text-sm text-[var(--vl-red)] flex gap-2">
                      <span className="shrink-0">!</span>{flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : <NullCard />}
      </Section>

      {/* Fundraising Analysis */}
      <Section title="Fundraising Analysis">
        {f.fundraisingAnalysis ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <DetailRow label="Amount Raising" value={f.fundraisingAnalysis.amountRaising} />
            <DetailRow label="Use of Funds" value={f.fundraisingAnalysis.useOfFunds} />
            <DetailRow label="Implied Valuation" value={f.fundraisingAnalysis.impliedValuation} />
            <DetailRow label="Runway from Raise" value={f.fundraisingAnalysis.runwayFromRaise} />
            <DetailRow label="Next Milestone" value={f.fundraisingAnalysis.nextMilestone} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Financial Verdict */}
      {f.financialVerdict && (
        <div className="rounded-xl border border-[var(--vl-gold)]/30 bg-[var(--vl-gold)]/5 p-5">
          <h4 className="font-display font-bold text-sm text-[var(--vl-gold)] mb-2">Financial Verdict</h4>
          <p className="text-sm text-[var(--vl-text)] leading-relaxed">{f.financialVerdict}</p>
        </div>
      )}
    </div>
  );
}

function MarketingTab({ r }: { r: V2ReportJson }) {
  const m = r.marketingAnalysis;
  if (!m) return <NullCard />;

  return (
    <div className="space-y-6">
      {/* GTM Strategy */}
      <Section title="GTM Strategy">
        {m.gtmStrategy ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-4">
            {m.gtmStrategy.primaryChannels?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-text3)] mb-2">Primary Channels</p>
                <div className="flex flex-wrap gap-2">
                  {m.gtmStrategy.primaryChannels.map((ch, i) => (
                    <Tag key={i} className="bg-[var(--vl-gold)]/10 text-[var(--vl-gold)] border-[var(--vl-gold)]/30">{ch}</Tag>
                  ))}
                </div>
              </div>
            )}
            <DetailRow label="Channel-Market Fit" value={m.gtmStrategy.channelMarketFit} />
            <DetailRow label="Distribution Model" value={m.gtmStrategy.distributionModel} />
            <DetailRow label="Sales Cycle Complexity" value={m.gtmStrategy.salesCycleComplexity} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Traction Validation */}
      <Section title="Traction Validation">
        {m.tractionValidation ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <DetailRow label="Current Traction" value={m.tractionValidation.currentTraction} />
            <DetailRow label="Growth Trajectory" value={m.tractionValidation.growthTrajectory} />
            <DetailRow label="Traction Quality" value={m.tractionValidation.tractionQuality} />
            <DetailRow label="Social Proof" value={m.tractionValidation.socialProof} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Brand Positioning */}
      <Section title="Brand Positioning">
        {m.brandPositioning ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-3">
            <DetailRow label="Value Proposition" value={m.brandPositioning.valueProposition} />
            <DetailRow label="Messaging Quality" value={m.brandPositioning.messagingQuality} />
            <div className="flex items-center gap-2 py-2 border-b border-[var(--vl-border)]">
              <span className="text-sm font-medium text-[var(--vl-text2)] sm:w-48 shrink-0">Differentiation Strength</span>
              <Tag className="bg-[var(--vl-gold)]/15 text-[var(--vl-gold)] border-[var(--vl-gold)]/40">
                {m.brandPositioning.differentiationStrength || "—"}
              </Tag>
            </div>
            <DetailRow label="Emotional Resonance" value={m.brandPositioning.emotionalResonance} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Scalability Assessment */}
      <Section title="Scalability Assessment">
        {m.scalabilityAssessment ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <DetailRow label="Channel Scalability" value={m.scalabilityAssessment.channelScalability} />
            <DetailRow label="Viral Potential" value={m.scalabilityAssessment.viralPotential} />
            <DetailRow label="Content/SEO Moat" value={m.scalabilityAssessment.contentSEOMoat} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Deck Storytelling */}
      <Section title="Deck Storytelling">
        {m.deckStorytelling ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-3">
            <DetailRow label="Narrative Arc" value={m.deckStorytelling.narrativeArc} />
            <DetailRow label="Slide Flow" value={m.deckStorytelling.slideFlow} />
            <DetailRow label="Visual Quality" value={m.deckStorytelling.visualQuality} />
            <DetailRow label="Information Density" value={m.deckStorytelling.informationDensity} />
            {m.deckStorytelling.missingSlides?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-red)] mb-2">Missing Slides</p>
                <div className="flex flex-wrap gap-2">
                  {m.deckStorytelling.missingSlides.map((slide, i) => (
                    <Tag key={i} className="bg-[var(--vl-red)]/10 text-[var(--vl-red)] border-[var(--vl-red)]/30">{slide}</Tag>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : <NullCard />}
      </Section>

      {/* Marketing Verdict */}
      {m.marketingVerdict && (
        <div className="rounded-xl border border-[var(--vl-gold)]/30 bg-[var(--vl-gold)]/5 p-5">
          <h4 className="font-display font-bold text-sm text-[var(--vl-gold)] mb-2">Marketing Verdict</h4>
          <p className="text-sm text-[var(--vl-text)] leading-relaxed">{m.marketingVerdict}</p>
        </div>
      )}
    </div>
  );
}

function TechTab({ r }: { r: V2ReportJson }) {
  const t = r.techAnalysis;
  if (!t) return <NullCard />;

  return (
    <div className="space-y-6">
      {/* Technology Assessment */}
      <Section title="Technology Assessment">
        {t.technologyAssessment ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <DetailRow label="Tech Stack" value={t.technologyAssessment.techStack} />
            <DetailRow label="Architecture Scalability" value={t.technologyAssessment.architectureScalability} />
            <DetailRow label="AI/ML Claims" value={t.technologyAssessment.aiMlClaims} />
            <DetailRow label="Data Strategy" value={t.technologyAssessment.dataStrategy} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Product Analysis */}
      <Section title="Product Analysis">
        {t.productAnalysis ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <DetailRow label="PMF Signals" value={t.productAnalysis.pmfSignals} />
            <DetailRow label="Feature Differentiation" value={t.productAnalysis.featureDifferentiation} />
            <DetailRow label="Product Complexity" value={t.productAnalysis.productComplexity} />
            <DetailRow label="UX Quality" value={t.productAnalysis.uxQuality} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Technical Risks */}
      <Section title="Technical Risks">
        {t.technicalRisks?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.technicalRisks.map((risk, i) => {
              const sev = (risk.severity || "").toUpperCase();
              const sevClass = SEVERITY_COLORS[sev] || SEVERITY_COLORS.MEDIUM;
              return (
                <div key={i} className={`rounded-xl border p-4 space-y-2 ${sevClass}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{risk.risk}</span>
                    <Tag className={sevClass}>{risk.severity}</Tag>
                  </div>
                  <p className="text-xs opacity-80">{risk.mitigation}</p>
                </div>
              );
            })}
          </div>
        ) : <NullCard />}
      </Section>

      {/* IP & Defensibility */}
      <Section title="IP & Defensibility">
        {t.ipDefensibility ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <DetailRow label="Patents" value={t.ipDefensibility.patents} />
            <DetailRow label="Proprietary Tech" value={t.ipDefensibility.proprietaryTech} />
            <DetailRow label="Moat Durability" value={t.ipDefensibility.moatDurability} />
            <DetailRow label="Open Source Risk" value={t.ipDefensibility.openSourceRisk} />
          </div>
        ) : <NullCard />}
      </Section>

      {/* Security & Compliance */}
      <Section title="Security & Compliance">
        {t.securityCompliance ? (
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-3">
            <DetailRow label="Data Privacy" value={t.securityCompliance.dataPrivacy} />
            <DetailRow label="Security Mentions" value={t.securityCompliance.securityMentions} />
            {t.securityCompliance.complianceGaps?.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--vl-red)] mb-2">Compliance Gaps</p>
                <ul className="space-y-1">
                  {t.securityCompliance.complianceGaps.map((gap, i) => (
                    <li key={i} className="text-sm text-[var(--vl-red)] flex gap-2">
                      <span className="shrink-0">!</span>{gap}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : <NullCard />}
      </Section>

      {/* Tech Verdict */}
      {t.techVerdict && (
        <div className="rounded-xl border border-[var(--vl-gold)]/30 bg-[var(--vl-gold)]/5 p-5">
          <h4 className="font-display font-bold text-sm text-[var(--vl-gold)] mb-2">Tech Verdict</h4>
          <p className="text-sm text-[var(--vl-text)] leading-relaxed">{t.techVerdict}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ReportOutput({ result }: { result: AnalysisResult }) {
  const r = result.report_json;
  const [activeTab, setActiveTab] = useState<TabKey>("strategy");
  const [expandedSlides, setExpandedSlides] = useState<Set<number>>(new Set());

  /* ─── V1 backward compat guard ─── */
  if (!r?.meta) {
    return (
      <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-bg2)] p-6 animate-fade-up">
        <p className="text-sm text-[var(--vl-text3)]">
          Analise criada com versao anterior. Execute uma nova analise para ver o relatorio V2 completo.
        </p>
      </div>
    );
  }

  const toggleSlide = (n: number) => {
    setExpandedSlides((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const verdictKey = (r.executiveSummary?.verdict || "").toUpperCase();
  const verdictClass = VERDICT_COLORS[verdictKey] || VERDICT_COLORS.CONDITIONAL;

  const scores = r.scores;
  const scoreKeys = ["market", "team", "product", "traction", "financials", "gtm", "technology", "deckQuality"] as const;

  return (
    <div className="space-y-8 animate-fade-up">

      {/* ═══════════════════════════════════════════════════════
          1. HEADER
          ═══════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--vl-gold)]">
            {r.meta.companyName || result.project_name}
          </h2>
          <p className="text-sm text-[var(--vl-text3)] mt-1">{result.file_name}</p>
        </div>
        <ReportPDFDownload result={result} />
      </div>

      {/* ═══════════════════════════════════════════════════════
          2. EXECUTIVE SUMMARY
          ═══════════════════════════════════════════════════════ */}
      {r.executiveSummary ? (
        <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">Executive Summary</h3>

          {/* One-liner */}
          {r.executiveSummary.oneLiner && (
            <p className="text-sm italic text-[var(--vl-text2)] leading-relaxed">{r.executiveSummary.oneLiner}</p>
          )}

          {/* Thesis */}
          {r.executiveSummary.thesis && (
            <div className="rounded-lg border-l-4 border-[var(--vl-green)] bg-[var(--vl-green)]/5 p-4">
              <p className="text-xs font-bold text-[var(--vl-green)] mb-1">THESIS</p>
              <p className="text-sm text-[var(--vl-text)] leading-relaxed">{r.executiveSummary.thesis}</p>
            </div>
          )}

          {/* Anti-thesis */}
          {r.executiveSummary.antiThesis && (
            <div className="rounded-lg border-l-4 border-[var(--vl-red)] bg-[var(--vl-red)]/5 p-4">
              <p className="text-xs font-bold text-[var(--vl-red)] mb-1">ANTI-THESIS</p>
              <p className="text-sm text-[var(--vl-text)] leading-relaxed">{r.executiveSummary.antiThesis}</p>
            </div>
          )}

          {/* Verdict badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-4 py-2 rounded-lg border font-display font-bold text-sm ${verdictClass}`}>
              {r.executiveSummary.verdict}
            </span>
          </div>

          {/* Verdict explanation */}
          {r.executiveSummary.verdictExplanation && (
            <p className="text-sm text-[var(--vl-text2)] leading-relaxed">{r.executiveSummary.verdictExplanation}</p>
          )}
        </div>
      ) : <NullCard />}

      {/* ═══════════════════════════════════════════════════════
          3. OVERALL SCORE GAUGE + 8 SCORE CARDS
          ═══════════════════════════════════════════════════════ */}
      {scores ? (
        <div className="space-y-6">
          {/* Overall gauge + verdict */}
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-6 flex flex-col items-center space-y-4">
            {scores.overall ? (
              <>
                <GaugeSVG value={scores.overall.score} />
                <span className={`inline-flex items-center px-4 py-2 rounded-lg border font-display font-bold text-sm ${verdictClass}`}>
                  {r.executiveSummary?.verdict || result.verdict}
                </span>
                <p className="text-sm text-[var(--vl-text2)] text-center">{scores.overall.label}</p>
                <p className="text-xs text-[var(--vl-text3)] text-center max-w-lg">{scores.overall.summary}</p>
              </>
            ) : <NullCard />}
          </div>

          {/* 2x4 score grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scoreKeys.map((key) => (
              <MiniScoreCard
                key={key}
                name={SCORE_LABELS[key] || key}
                item={scores[key]}
              />
            ))}
          </div>
        </div>
      ) : <NullCard />}

      {/* ═══════════════════════════════════════════════════════
          4. TABBED ANALYSIS (Strategy | Finance | Marketing | Tech)
          ═══════════════════════════════════════════════════════ */}
      <div className="space-y-4">
        {/* Tab buttons */}
        <div className="flex gap-1 rounded-xl border border-[var(--vl-border)] bg-[var(--vl-bg2)] p-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-[var(--vl-gold)] text-[var(--vl-bg)] font-bold shadow-sm"
                  : "text-[var(--vl-text3)] hover:text-[var(--vl-text)] hover:bg-[var(--vl-card)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-up">
          {activeTab === "strategy"  && <StrategyTab r={r} />}
          {activeTab === "finance"   && <FinanceTab r={r} />}
          {activeTab === "marketing" && <MarketingTab r={r} />}
          {activeTab === "tech"      && <TechTab r={r} />}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          5. SLIDE-BY-SLIDE ANALYSIS
          ═══════════════════════════════════════════════════════ */}
      {r.slideBySlide?.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">Slide-by-Slide Analysis</h3>
          <div className="space-y-2">
            {r.slideBySlide.map((slide) => {
              const isOpen = expandedSlides.has(slide.slideNumber);
              const gradeKey = (slide.grade || "").toUpperCase().charAt(0);
              const gradeClass = GRADE_COLORS[gradeKey] || GRADE_COLORS.C;
              return (
                <div key={slide.slideNumber} className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] overflow-hidden">
                  {/* Header (clickable) */}
                  <button
                    onClick={() => toggleSlide(slide.slideNumber)}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[var(--vl-bg2)] transition-colors"
                  >
                    <span className="font-mono text-xs text-[var(--vl-text3)] w-8 shrink-0">#{slide.slideNumber}</span>
                    <span className="text-sm font-medium text-[var(--vl-text)] flex-1">{slide.slideTitle || "Untitled"}</span>
                    {slide.category && (
                      <Tag className="bg-[var(--vl-bg2)] text-[var(--vl-text3)] border-[var(--vl-border)]">
                        {slide.category}
                      </Tag>
                    )}
                    <Tag className={gradeClass}>{slide.grade}</Tag>
                    <svg
                      className={`w-4 h-4 text-[var(--vl-text3)] shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-5 pb-4 space-y-3 border-t border-[var(--vl-border)]">
                      {slide.strengths?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-[var(--vl-green)] mb-1.5">Strengths</p>
                          <ul className="space-y-1">
                            {slide.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                                <span className="text-[var(--vl-green)] shrink-0">+</span>{s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {slide.weaknesses?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[var(--vl-red)] mb-1.5">Weaknesses</p>
                          <ul className="space-y-1">
                            {slide.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                                <span className="text-[var(--vl-red)] shrink-0">-</span>{w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {slide.suggestion && (
                        <div className="rounded-lg bg-[var(--vl-bg2)] p-3">
                          <p className="text-xs font-medium text-[var(--vl-text3)] mb-1">Suggestion</p>
                          <p className="text-sm text-[var(--vl-text)]">{slide.suggestion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : <NullCard text="Slide-by-slide analysis not available" />}

      {/* ═══════════════════════════════════════════════════════
          6. RISK MATRIX
          ═══════════════════════════════════════════════════════ */}
      {r.strategyAnalysis?.riskMatrix?.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">Risk Matrix</h3>
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--vl-border)] text-[var(--vl-text3)]">
                    <th className="text-left px-5 py-3 font-medium">Risk</th>
                    <th className="text-left px-5 py-3 font-medium">Probability</th>
                    <th className="text-left px-5 py-3 font-medium">Impact</th>
                    <th className="text-left px-5 py-3 font-medium">Mitigation</th>
                  </tr>
                </thead>
                <tbody>
                  {r.strategyAnalysis.riskMatrix.map((risk, i) => {
                    const probKey = (risk.probability || "").toUpperCase();
                    const impKey = (risk.impact || "").toUpperCase();
                    const probClass = PROB_IMPACT_COLORS[probKey] || "";
                    const impClass = PROB_IMPACT_COLORS[impKey] || "";
                    return (
                      <tr key={i} className="border-b border-[var(--vl-border)] last:border-0">
                        <td className="px-5 py-3 font-medium text-[var(--vl-text)]">{risk.risk}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${probClass}`}>{risk.probability}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${impClass}`}>{risk.impact}</span>
                        </td>
                        <td className="px-5 py-3 text-[var(--vl-text2)]">{risk.mitigation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : <NullCard text="Risk matrix not available" />}

      {/* ═══════════════════════════════════════════════════════
          7. INVESTOR QUESTIONS
          ═══════════════════════════════════════════════════════ */}
      {r.investorQuestions?.length > 0 ? (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">Investor Questions</h3>
          <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5">
            <ol className="space-y-3">
              {r.investorQuestions.map((q, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="font-display font-bold text-[var(--vl-gold)] shrink-0 w-7 text-right">{i + 1}.</span>
                  <span className="text-[var(--vl-text)] leading-relaxed">{q}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : <NullCard text="Investor questions not available" />}

      {/* ═══════════════════════════════════════════════════════
          8. RECOMMENDATIONS
          ═══════════════════════════════════════════════════════ */}
      {r.recommendations ? (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Immediate */}
            <div className="rounded-xl border-2 border-[var(--vl-red)]/40 bg-[var(--vl-card)] p-5 space-y-3">
              <h4 className="font-display font-bold text-sm text-[var(--vl-red)]">Agora</h4>
              {r.recommendations.immediate?.length > 0 ? (
                <ul className="space-y-2">
                  {r.recommendations.immediate.map((item, i) => (
                    <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                      <span className="text-[var(--vl-red)] shrink-0">&bull;</span>{item}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-[var(--vl-text3)] italic">None</p>}
            </div>

            {/* Short-Term */}
            <div className="rounded-xl border-2 border-[var(--vl-amber)]/40 bg-[var(--vl-card)] p-5 space-y-3">
              <h4 className="font-display font-bold text-sm text-[var(--vl-amber)]">2-4 Semanas</h4>
              {r.recommendations.shortTerm?.length > 0 ? (
                <ul className="space-y-2">
                  {r.recommendations.shortTerm.map((item, i) => (
                    <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                      <span className="text-[var(--vl-amber)] shrink-0">&bull;</span>{item}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-[var(--vl-text3)] italic">None</p>}
            </div>

            {/* Strategic */}
            <div className="rounded-xl border-2 border-blue-500/40 bg-[var(--vl-card)] p-5 space-y-3">
              <h4 className="font-display font-bold text-sm text-blue-400">Estrategico</h4>
              {r.recommendations.strategic?.length > 0 ? (
                <ul className="space-y-2">
                  {r.recommendations.strategic.map((item, i) => (
                    <li key={i} className="text-sm text-[var(--vl-text)] flex gap-2">
                      <span className="text-blue-400 shrink-0">&bull;</span>{item}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-xs text-[var(--vl-text3)] italic">None</p>}
            </div>
          </div>
        </div>
      ) : <NullCard text="Recommendations not available" />}

      {/* ═══════════════════════════════════════════════════════
          9. COMPARABLES
          ═══════════════════════════════════════════════════════ */}
      {r.comparables ? (
        <div className="space-y-4">
          <h3 className="font-display font-bold text-lg text-[var(--vl-text)]">Comparables</h3>
          {r.comparables.similarCompanies?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {r.comparables.similarCompanies.map((comp, i) => {
                const outcomeKey = (comp.outcome || "").toUpperCase();
                const outcomeClass = OUTCOME_COLORS[outcomeKey] || "bg-[var(--vl-bg2)] text-[var(--vl-text3)] border-[var(--vl-border)]";
                return (
                  <div key={i} className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-[var(--vl-text)]">{comp.name}</span>
                      <Tag className={outcomeClass}>{comp.outcome}</Tag>
                    </div>
                    <p className="text-xs text-[var(--vl-text3)]">Similarity: {comp.similarity}</p>
                    <p className="text-sm text-[var(--vl-text2)] leading-relaxed">{comp.lesson}</p>
                  </div>
                );
              })}
            </div>
          ) : <NullCard text="No comparable companies available" />}

          {/* Benchmark metrics */}
          {r.comparables.benchmarkMetrics && (
            <div className="rounded-xl border border-[var(--vl-border)] bg-[var(--vl-bg2)] p-5">
              <p className="text-xs font-medium text-[var(--vl-text3)] mb-2">Benchmark Metrics</p>
              <p className="text-sm text-[var(--vl-text)] leading-relaxed">{r.comparables.benchmarkMetrics}</p>
            </div>
          )}
        </div>
      ) : <NullCard text="Comparables not available" />}
    </div>
  );
}
