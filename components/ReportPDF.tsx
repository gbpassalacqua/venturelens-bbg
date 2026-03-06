"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { AnalysisResult, V2ReportJson } from "@/types/analysis";

/* ── Color constants ── */
const GOLD = "#F0A500";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const DARK = "#111827";
const GRAY = "#6B7280";
const LIGHTGRAY = "#E5E7EB";
const WHITE = "#FFFFFF";
const BLUE = "#3B82F6";
const ORANGE = "#F97316";

/* ── Helpers ── */

function barColor(v: number) {
  return v >= 70 ? GREEN : v >= 40 ? AMBER : RED;
}

function verdictColor(v?: string): string {
  const upper = (v ?? "").toUpperCase();
  if (upper === "STRONG PASS") return GREEN;
  if (upper === "PASS") return BLUE;
  if (upper === "CONDITIONAL") return AMBER;
  if (upper === "WATCH") return ORANGE;
  return RED; // DECLINE or unknown
}

function verdictBg(v?: string): string {
  const upper = (v ?? "").toUpperCase();
  if (upper === "STRONG PASS") return "#F0FDF4";
  if (upper === "PASS") return "#EFF6FF";
  if (upper === "CONDITIONAL") return "#FFFBEB";
  if (upper === "WATCH") return "#FFF7ED";
  return "#FEF2F2";
}

function severityColor(s?: string): string {
  const lower = (s ?? "").toLowerCase();
  if (lower === "high" || lower === "critical") return RED;
  if (lower === "medium") return AMBER;
  return GREEN;
}

function gradeColor(g?: string): string {
  const upper = (g ?? "").toUpperCase();
  if (upper === "A" || upper === "A+") return GREEN;
  if (upper === "B" || upper === "B+") return BLUE;
  if (upper === "C" || upper === "C+") return AMBER;
  return RED;
}

/* ── Styles ── */

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
    backgroundColor: WHITE,
  },
  /* Header */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
  },
  headerSub: {
    fontSize: 9,
    color: GRAY,
  },
  headerDate: {
    fontSize: 8,
    color: GRAY,
  },
  divider: {
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 18,
  },
  /* Company / Project */
  companyName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    gap: 3,
  },
  metaLabel: {
    fontSize: 8,
    color: GRAY,
    fontFamily: "Helvetica-Bold",
  },
  metaValue: {
    fontSize: 8,
    color: DARK,
  },
  /* Score */
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    gap: 18,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: {
    fontSize: 30,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    textAlign: "center",
  },
  score100: {
    fontSize: 10,
    color: GRAY,
    textAlign: "center",
  },
  verdictBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  verdictText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  /* Section */
  section: {
    marginTop: 14,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: LIGHTGRAY,
  },
  sectionTitleGold: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: GOLD,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: GOLD,
  },
  bodyText: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.5,
  },
  bodyItalic: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.5,
    fontFamily: "Helvetica-Oblique",
  },
  label: {
    fontSize: 8,
    color: GRAY,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  /* Bars */
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  barLabel: {
    width: 80,
    fontSize: 9,
    color: GRAY,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: LIGHTGRAY,
    borderRadius: 4,
    marginRight: 8,
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  barValue: {
    width: 25,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },
  /* TAM / SAM / SOM cards */
  tamRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 4,
  },
  tamCard: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: LIGHTGRAY,
    borderBottomWidth: 3,
  },
  tamLabel: {
    fontSize: 8,
    color: GRAY,
    marginBottom: 2,
  },
  tamValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
  },
  /* Table */
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: LIGHTGRAY,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: LIGHTGRAY,
  },
  th: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
  },
  td: {
    fontSize: 9,
    color: DARK,
  },
  tag: {
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    color: WHITE,
  },
  /* 3-col layout */
  threeCol: {
    flexDirection: "row",
    gap: 10,
  },
  colCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
  },
  colTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  colItem: {
    fontSize: 8,
    color: DARK,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  /* Metric grid */
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metricCell: {
    width: "30%",
    padding: 8,
    borderWidth: 1,
    borderColor: LIGHTGRAY,
    borderRadius: 6,
  },
  metricLabel: {
    fontSize: 7,
    color: GRAY,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  /* Badge / Tag */
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    color: WHITE,
    fontFamily: "Helvetica-Bold",
  },
  /* Footer */
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 7,
    color: GRAY,
    borderTopWidth: 1,
    borderTopColor: LIGHTGRAY,
    paddingTop: 6,
  },
});

/* ── Reusable sub-components ── */

function Header({ subtitle, date }: { subtitle: string; date: string }) {
  return (
    <>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>VentureLens BBG</Text>
          <Text style={styles.headerSub}>{subtitle}</Text>
        </View>
        <Text style={styles.headerDate}>{date}</Text>
      </View>
      <View style={styles.divider} />
    </>
  );
}

function Footer({ date }: { date: string }) {
  return (
    <Text style={styles.footer}>
      Gerado por VentureLens BBG · Análise V2 · {date}
    </Text>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { width: `${Math.min(score, 100)}%`, backgroundColor: barColor(score) },
          ]}
        />
      </View>
      <Text style={[styles.barValue, { color: barColor(score) }]}>{score}</Text>
    </View>
  );
}

/* ── Main Component ── */

export default function ReportPDF({ result }: { result: AnalysisResult }) {
  const r = result.report_json as V2ReportJson;

  // If V1 data (no meta field), render a simple fallback page
  if (!r?.meta) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Análise criada com versão anterior. Execute novamente para relatório V2.</Text>
        </Page>
      </Document>
    );
  }

  const today = new Date().toLocaleDateString("pt-BR");
  const vColor = verdictColor(r.executiveSummary?.verdict);
  const vBg = verdictBg(r.executiveSummary?.verdict);

  const scores = r.scores;
  const exec = r.executiveSummary;
  const strategy = r.strategyAnalysis;
  const fin = r.financialAnalysis;
  const mkt = r.marketingAnalysis;
  const tech = r.techAnalysis;
  const slides = r.slideBySlide;
  const questions = r.investorQuestions;
  const recs = r.recommendations;
  const comps = r.comparables;

  return (
    <Document>
      {/* ═══════════════════════════════════════════════════════════
          PAGE 1 — Executive Overview
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Análise V2" date={today} />

        {/* Company Name */}
        <Text style={styles.companyName}>{r.meta?.companyName ?? result.project_name}</Text>

        {/* Meta info row */}
        <View style={styles.metaRow}>
          {r.meta?.industry ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Indústria: </Text>
              <Text style={styles.metaValue}>{r.meta.industry}</Text>
            </View>
          ) : null}
          {r.meta?.stage ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Estágio: </Text>
              <Text style={styles.metaValue}>{r.meta.stage}</Text>
            </View>
          ) : null}
          {r.meta?.location ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Localização: </Text>
              <Text style={styles.metaValue}>{r.meta.location}</Text>
            </View>
          ) : null}
          {r.meta?.fundingAsk ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Captação: </Text>
              <Text style={styles.metaValue}>{r.meta.fundingAsk}</Text>
            </View>
          ) : null}
        </View>

        {/* Executive Summary */}
        {exec ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumo Executivo</Text>
            {exec.oneLiner ? (
              <Text style={[styles.bodyText, { fontFamily: "Helvetica-Bold", marginBottom: 6 }]}>
                {exec.oneLiner}
              </Text>
            ) : null}
            {exec.thesis ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Tese</Text>
                <Text style={styles.bodyText}>{exec.thesis}</Text>
              </View>
            ) : null}
            {exec.antiThesis ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Antítese</Text>
                <Text style={styles.bodyText}>{exec.antiThesis}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Verdict + Score */}
        <View style={[styles.scoreRow, { marginTop: 12 }]}>
          <View style={[styles.scoreCircle, { borderColor: vColor }]}>
            <Text style={[styles.scoreNum, { color: vColor }]}>
              {scores?.overall?.score ?? result.score}
            </Text>
            <Text style={styles.score100}>/100</Text>
          </View>
          <View>
            <View
              style={[
                styles.verdictBadge,
                { borderColor: vColor, backgroundColor: vBg },
              ]}
            >
              <Text style={[styles.verdictText, { color: vColor }]}>
                {exec?.verdict ?? result.verdict}
              </Text>
            </View>
          </View>
        </View>

        {exec?.verdictExplanation ? (
          <Text style={[styles.bodyText, { textAlign: "center", marginBottom: 8 }]}>
            {exec.verdictExplanation}
          </Text>
        ) : null}

        <Footer date={today} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PAGE 2 — Scores & Strategy
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Scores & Estratégia" date={today} />

        {/* Score bars */}
        {scores ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scores</Text>
            {([
              { key: "overall" as const, label: "Geral" },
              { key: "market" as const, label: "Mercado" },
              { key: "team" as const, label: "Time" },
              { key: "product" as const, label: "Produto" },
              { key: "traction" as const, label: "Tração" },
              { key: "financials" as const, label: "Financeiro" },
              { key: "gtm" as const, label: "GTM" },
              { key: "technology" as const, label: "Tecnologia" },
              { key: "deckQuality" as const, label: "Qualidade do Deck" },
            ]).map(({ key, label }) => {
              const item = scores?.[key];
              if (!item) return null;
              return (
                <View key={key}>
                  <ScoreBar label={label} score={item.score} />
                  {item.summary ? (
                    <Text style={{ fontSize: 7, color: GRAY, marginLeft: 80, marginBottom: 4, marginTop: -3 }}>
                      {item.summary}
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ) : null}

        {/* TAM / SAM / SOM */}
        {strategy?.marketSize ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tamanho de Mercado</Text>
            <View style={styles.tamRow}>
              {([
                { key: "tam" as const, label: "TAM", color: GOLD },
                { key: "sam" as const, label: "SAM", color: BLUE },
                { key: "som" as const, label: "SOM", color: GREEN },
              ]).map(({ key, label, color }) => (
                <View key={key} style={[styles.tamCard, { borderBottomColor: color }]}>
                  <Text style={styles.tamLabel}>{label}</Text>
                  <Text style={[styles.tamValue, { color }]}>
                    {strategy.marketSize?.[key] ?? "N/A"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Moat strength badge */}
        {strategy?.competitiveLandscape?.moatStrength ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 4 }}>
            <Text style={styles.label}>Força do Moat:</Text>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor:
                    strategy.competitiveLandscape.moatStrength.toLowerCase() === "strong"
                      ? GREEN
                      : strategy.competitiveLandscape.moatStrength.toLowerCase() === "moderate"
                        ? AMBER
                        : RED,
                },
              ]}
            >
              {strategy.competitiveLandscape.moatStrength}
            </Text>
          </View>
        ) : null}

        {/* Risk Matrix */}
        {strategy?.riskMatrix && strategy.riskMatrix.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matriz de Riscos</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 3 }]}>Risco</Text>
              <Text style={[styles.th, { flex: 1 }]}>Prob.</Text>
              <Text style={[styles.th, { flex: 1 }]}>Impacto</Text>
              <Text style={[styles.th, { flex: 3 }]}>Mitigação</Text>
            </View>
            {strategy.riskMatrix.map((rm, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 3 }]}>{rm?.risk}</Text>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.tag,
                      { backgroundColor: severityColor(rm?.probability) },
                    ]}
                  >
                    {rm?.probability}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.tag,
                      { backgroundColor: severityColor(rm?.impact) },
                    ]}
                  >
                    {rm?.impact}
                  </Text>
                </View>
                <Text style={[styles.td, { flex: 3, color: GRAY }]}>{rm?.mitigation}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Footer date={today} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PAGE 3 — Financial & Marketing
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Financeiro & Marketing" date={today} />

        {/* Financial Metrics Grid */}
        {fin?.currentMetrics ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métricas Financeiras</Text>
            <View style={styles.metricGrid}>
              {([
                { key: "revenue" as const, label: "Receita" },
                { key: "burnRate" as const, label: "Burn Rate" },
                { key: "runway" as const, label: "Runway" },
                { key: "grossMargin" as const, label: "Margem Bruta" },
                { key: "cac" as const, label: "CAC" },
                { key: "ltv" as const, label: "LTV" },
                { key: "ltvCacRatio" as const, label: "LTV/CAC" },
                { key: "churn" as const, label: "Churn" },
                { key: "nrr" as const, label: "NRR" },
              ]).map(({ key, label }) => {
                const val = fin.currentMetrics?.[key];
                if (!val) return null;
                return (
                  <View key={key} style={styles.metricCell}>
                    <Text style={styles.metricLabel}>{label}</Text>
                    <Text style={styles.metricValue}>{val}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Fundraising Analysis */}
        {fin?.fundraisingAnalysis ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise de Captação</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {([
                { key: "amountRaising" as const, label: "Captação" },
                { key: "impliedValuation" as const, label: "Valuation Implícito" },
                { key: "runwayFromRaise" as const, label: "Runway Pós-Captação" },
                { key: "nextMilestone" as const, label: "Próximo Marco" },
              ]).map(({ key, label }) => {
                const val = fin.fundraisingAnalysis?.[key];
                if (!val) return null;
                return (
                  <View key={key} style={{ marginRight: 16, marginBottom: 4 }}>
                    <Text style={styles.metricLabel}>{label}</Text>
                    <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: DARK }}>
                      {val}
                    </Text>
                  </View>
                );
              })}
            </View>
            {fin.fundraisingAnalysis?.useOfFunds ? (
              <View style={{ marginTop: 4 }}>
                <Text style={styles.label}>Uso dos Recursos</Text>
                <Text style={styles.bodyText}>{fin.fundraisingAnalysis.useOfFunds}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Financial Verdict */}
        {fin?.financialVerdict ? (
          <View style={{ marginTop: 6, padding: 8, backgroundColor: "#F9FAFB", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: GOLD }}>
            <Text style={styles.label}>Veredito Financeiro</Text>
            <Text style={styles.bodyText}>{fin.financialVerdict}</Text>
          </View>
        ) : null}

        {/* Marketing: GTM Channels */}
        {mkt?.gtmStrategy ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estratégia Go-To-Market</Text>
            {mkt.gtmStrategy.primaryChannels && mkt.gtmStrategy.primaryChannels.length > 0 ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Canais Primários</Text>
                <Text style={styles.bodyText}>
                  {mkt.gtmStrategy.primaryChannels.join(", ")}
                </Text>
              </View>
            ) : null}
            {mkt.gtmStrategy.channelMarketFit ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Channel-Market Fit</Text>
                <Text style={styles.bodyText}>{mkt.gtmStrategy.channelMarketFit}</Text>
              </View>
            ) : null}
            {mkt.gtmStrategy.distributionModel ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Modelo de Distribuição</Text>
                <Text style={styles.bodyText}>{mkt.gtmStrategy.distributionModel}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Traction */}
        {mkt?.tractionValidation ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Validação de Tração</Text>
            {([
              { key: "currentTraction" as const, label: "Tração Atual" },
              { key: "growthTrajectory" as const, label: "Trajetória de Crescimento" },
              { key: "tractionQuality" as const, label: "Qualidade da Tração" },
              { key: "socialProof" as const, label: "Prova Social" },
            ]).map(({ key, label }) => {
              const val = mkt.tractionValidation?.[key];
              if (!val) return null;
              return (
                <View key={key} style={{ marginBottom: 3 }}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.bodyText}>{val}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Brand Positioning */}
        {mkt?.brandPositioning ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posicionamento de Marca</Text>
            {([
              { key: "valueProposition" as const, label: "Proposta de Valor" },
              { key: "messagingQuality" as const, label: "Qualidade da Mensagem" },
              { key: "differentiationStrength" as const, label: "Diferenciação" },
            ]).map(({ key, label }) => {
              const val = mkt.brandPositioning?.[key];
              if (!val) return null;
              return (
                <View key={key} style={{ marginBottom: 3 }}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.bodyText}>{val}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Marketing Verdict */}
        {mkt?.marketingVerdict ? (
          <View style={{ marginTop: 6, padding: 8, backgroundColor: "#F9FAFB", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: GOLD }}>
            <Text style={styles.label}>Veredito de Marketing</Text>
            <Text style={styles.bodyText}>{mkt.marketingVerdict}</Text>
          </View>
        ) : null}

        <Footer date={today} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PAGE 4 — Tech & Slide Analysis
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Tecnologia & Slides" date={today} />

        {/* Technology Assessment */}
        {tech?.technologyAssessment ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliação Tecnológica</Text>
            {tech.technologyAssessment.techStack ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Stack Tecnológica</Text>
                <Text style={styles.bodyText}>{tech.technologyAssessment.techStack}</Text>
              </View>
            ) : null}
            {tech.technologyAssessment.architectureScalability ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Escalabilidade da Arquitetura</Text>
                <Text style={styles.bodyText}>{tech.technologyAssessment.architectureScalability}</Text>
              </View>
            ) : null}
            {tech.technologyAssessment.aiMlClaims ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Claims de IA/ML</Text>
                <Text style={styles.bodyText}>{tech.technologyAssessment.aiMlClaims}</Text>
              </View>
            ) : null}
            {tech.technologyAssessment.dataStrategy ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Estratégia de Dados</Text>
                <Text style={styles.bodyText}>{tech.technologyAssessment.dataStrategy}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Technical Risks */}
        {tech?.technicalRisks && tech.technicalRisks.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Riscos Técnicos</Text>
            {tech.technicalRisks.map((tr, i) => (
              <View
                key={i}
                style={{
                  marginBottom: 6,
                  padding: 6,
                  borderWidth: 1,
                  borderColor: LIGHTGRAY,
                  borderRadius: 4,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <Text
                    style={[styles.badge, { backgroundColor: severityColor(tr?.severity) }]}
                  >
                    {tr?.severity?.toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 9, color: DARK, flex: 1 }}>{tr?.risk}</Text>
                </View>
                {tr?.mitigation ? (
                  <Text style={{ fontSize: 7, color: GRAY }}>Mitigação: {tr.mitigation}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* IP Defensibility */}
        {tech?.ipDefensibility ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PI & Defensibilidade</Text>
            {([
              { key: "patents" as const, label: "Patentes" },
              { key: "proprietaryTech" as const, label: "Tecnologia Proprietária" },
              { key: "moatDurability" as const, label: "Durabilidade do Moat" },
              { key: "openSourceRisk" as const, label: "Risco Open Source" },
            ]).map(({ key, label }) => {
              const val = tech.ipDefensibility?.[key];
              if (!val) return null;
              return (
                <View key={key} style={{ marginBottom: 3 }}>
                  <Text style={styles.label}>{label}</Text>
                  <Text style={styles.bodyText}>{val}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Slide-by-Slide Table */}
        {slides && slides.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Slide por Slide</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 20 }]}>#</Text>
              <Text style={[styles.th, { flex: 2 }]}>Título</Text>
              <Text style={[styles.th, { width: 40 }]}>Nota</Text>
              <Text style={[styles.th, { flex: 3 }]}>Pontos Fortes</Text>
            </View>
            {slides.map((slide, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { width: 20, fontFamily: "Helvetica-Bold" }]}>
                  {slide?.slideNumber}
                </Text>
                <Text style={[styles.td, { flex: 2 }]}>{slide?.slideTitle}</Text>
                <View style={{ width: 40, flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.tag,
                      { backgroundColor: gradeColor(slide?.grade) },
                    ]}
                  >
                    {slide?.grade}
                  </Text>
                </View>
                <Text style={[styles.td, { flex: 3, color: GRAY }]}>
                  {slide?.strengths?.join("; ")}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        <Footer date={today} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PAGE 5 — Recommendations & Questions
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Recomendações & Perguntas" date={today} />

        {/* Investor Questions */}
        {questions && questions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perguntas do Investidor</Text>
            {questions.map((q, i) => (
              <Text key={i} style={{ fontSize: 9, color: DARK, marginBottom: 4, lineHeight: 1.4 }}>
                {i + 1}. {q}
              </Text>
            ))}
          </View>
        ) : null}

        {/* Recommendations in 3 columns */}
        {recs ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendações</Text>
            <View style={styles.threeCol}>
              {/* Immediate */}
              {recs.immediate && recs.immediate.length > 0 ? (
                <View style={[styles.colCard, { borderColor: RED }]}>
                  <Text style={[styles.colTitle, { color: RED }]}>Imediato</Text>
                  {recs.immediate.map((item, i) => (
                    <Text key={i} style={styles.colItem}>
                      {i + 1}. {item}
                    </Text>
                  ))}
                </View>
              ) : null}

              {/* Short-Term */}
              {recs.shortTerm && recs.shortTerm.length > 0 ? (
                <View style={[styles.colCard, { borderColor: AMBER }]}>
                  <Text style={[styles.colTitle, { color: AMBER }]}>Curto Prazo</Text>
                  {recs.shortTerm.map((item, i) => (
                    <Text key={i} style={styles.colItem}>
                      {i + 1}. {item}
                    </Text>
                  ))}
                </View>
              ) : null}

              {/* Strategic */}
              {recs.strategic && recs.strategic.length > 0 ? (
                <View style={[styles.colCard, { borderColor: BLUE }]}>
                  <Text style={[styles.colTitle, { color: BLUE }]}>Estratégico</Text>
                  {recs.strategic.map((item, i) => (
                    <Text key={i} style={styles.colItem}>
                      {i + 1}. {item}
                    </Text>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Comparables */}
        {comps?.similarCompanies && comps.similarCompanies.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparáveis</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Empresa</Text>
              <Text style={[styles.th, { flex: 2 }]}>Similaridade</Text>
              <Text style={[styles.th, { flex: 2 }]}>Resultado</Text>
              <Text style={[styles.th, { flex: 3 }]}>Lição</Text>
            </View>
            {comps.similarCompanies.map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2, fontFamily: "Helvetica-Bold" }]}>
                  {c?.name}
                </Text>
                <Text style={[styles.td, { flex: 2 }]}>{c?.similarity}</Text>
                <Text style={[styles.td, { flex: 2 }]}>{c?.outcome}</Text>
                <Text style={[styles.td, { flex: 3, color: GRAY }]}>{c?.lesson}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Footer date={today} />
      </Page>
    </Document>
  );
}
