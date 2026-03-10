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
  return RED;
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
  if (lower === "high" || lower === "critical" || lower === "fatal") return RED;
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
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 8,
    color: DARK,
  },
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
  bodyText: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.5,
  },
  label: {
    fontSize: 8,
    color: GRAY,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
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
  metricCellLabel: {
    fontSize: 7,
    color: GRAY,
    marginBottom: 2,
  },
  metricCellValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  badge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    color: WHITE,
    fontFamily: "Helvetica-Bold",
  },
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

  if (!r?.name) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>Análise criada com versão anterior. Execute novamente para relatório V2.</Text>
        </Page>
      </Document>
    );
  }

  const today = new Date().toLocaleDateString("pt-BR");
  const vColor = verdictColor(r.verdict);
  const vBg = verdictBg(r.verdict);

  const scores = r.scores;
  const risks = r.risks;
  const fin = r.fin;
  const gtm = r.gtm;
  const tech = r.tech;
  const slides = r.slides;
  const questions = r.questions;
  const recs = r.recs;
  const comps = r.comps;

  return (
    <Document>
      {/* ═══════════════════════════════════════════════════════════
          PAGE 1 — Executive Overview
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Análise V2" date={today} />

        <Text style={styles.companyName}>{r.name ?? result.project_name}</Text>

        <View style={styles.metaRow}>
          {r.industry ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Indústria: </Text>
              <Text style={styles.metaValue}>{r.industry}</Text>
            </View>
          ) : null}
          {r.stage ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Estágio: </Text>
              <Text style={styles.metaValue}>{r.stage}</Text>
            </View>
          ) : null}
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>
          {r.thesis ? (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.label}>Tese</Text>
              <Text style={styles.bodyText}>{r.thesis}</Text>
            </View>
          ) : null}
          {r.antiThesis ? (
            <View style={{ marginBottom: 4 }}>
              <Text style={styles.label}>Antítese</Text>
              <Text style={styles.bodyText}>{r.antiThesis}</Text>
            </View>
          ) : null}
        </View>

        {/* Verdict + Score */}
        <View style={[styles.scoreRow, { marginTop: 12 }]}>
          <View style={[styles.scoreCircle, { borderColor: vColor }]}>
            <Text style={[styles.scoreNum, { color: vColor }]}>
              {r.score ?? result.score}
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
                {r.verdict ?? result.verdict}
              </Text>
            </View>
          </View>
        </View>

        {r.thesis ? (
          <Text style={[styles.bodyText, { textAlign: "center", marginBottom: 8 }]}>
            {r.thesis}
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
              { key: "market" as const, label: "Mercado" },
              { key: "team" as const, label: "Time" },
              { key: "product" as const, label: "Produto" },
              { key: "traction" as const, label: "Tração" },
              { key: "financials" as const, label: "Financeiro" },
              { key: "gtm" as const, label: "GTM" },
              { key: "tech" as const, label: "Tecnologia" },
              { key: "deck" as const, label: "Qualidade do Deck" },
            ]).map(({ key, label }) => {
              const score = scores?.[key];
              if (score == null) return null;
              return <ScoreBar key={key} label={label} score={score} />;
            })}
          </View>
        ) : null}

        {/* TAM / SAM / SOM */}
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
                  {r[key] ?? "N/A"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Moat strength badge */}
        {r.moat ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8, marginBottom: 4 }}>
            <Text style={styles.label}>Força do Moat:</Text>
            <Text
              style={[
                styles.badge,
                {
                  backgroundColor:
                    r.moat.toLowerCase() === "strong" || r.moat.toLowerCase() === "fortress"
                      ? GREEN
                      : r.moat.toLowerCase() === "moderate"
                        ? AMBER
                        : RED,
                },
              ]}
            >
              {r.moat}
            </Text>
          </View>
        ) : null}

        {/* Risk Matrix */}
        {risks && risks.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Matriz de Riscos</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 3 }]}>Risco</Text>
              <Text style={[styles.th, { flex: 1 }]}>Prob.</Text>
              <Text style={[styles.th, { flex: 1 }]}>Impacto</Text>
              <Text style={[styles.th, { flex: 3 }]}>Mitigação</Text>
            </View>
            {risks.map((rm, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 3 }]}>{rm?.r}</Text>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.tag,
                      { backgroundColor: severityColor(rm?.p) },
                    ]}
                  >
                    {rm?.p}
                  </Text>
                </View>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.tag,
                      { backgroundColor: severityColor(rm?.i) },
                    ]}
                  >
                    {rm?.i}
                  </Text>
                </View>
                <Text style={[styles.td, { flex: 3, color: GRAY }]}>{rm?.m}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Footer date={today} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PAGE 3 — Financial & GTM
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Financeiro & GTM" date={today} />

        {/* Financial Metrics Grid */}
        {fin ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métricas Financeiras</Text>
            <View style={styles.metricGrid}>
              {([
                { key: "revenue" as const, label: "Receita" },
                { key: "burn" as const, label: "Burn Rate" },
                { key: "ltv_cac" as const, label: "LTV/CAC" },
                { key: "churn" as const, label: "Churn" },
              ]).map(({ key, label }) => {
                const val = fin?.[key];
                if (!val) return null;
                return (
                  <View key={key} style={styles.metricCell}>
                    <Text style={styles.metricCellLabel}>{label}</Text>
                    <Text style={styles.metricCellValue}>{val}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* GTM */}
        {gtm ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Estratégia Go-To-Market</Text>
            {gtm.channels ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Canais</Text>
                <Text style={styles.bodyText}>{gtm.channels}</Text>
              </View>
            ) : null}
            {gtm.traction ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Tração Atual</Text>
                <Text style={styles.bodyText}>{gtm.traction}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        {/* Tech */}
        {tech ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliação Tecnológica</Text>
            {tech.stack ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Stack Tecnológica</Text>
                <Text style={styles.bodyText}>{tech.stack}</Text>
              </View>
            ) : null}
            {tech.risk ? (
              <View style={{ marginBottom: 4 }}>
                <Text style={styles.label}>Risco Técnico</Text>
                <Text style={styles.bodyText}>{tech.risk}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <Footer date={today} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PAGE 4 — Slides & Questions
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Slides & Perguntas" date={today} />

        {/* Slide-by-Slide Table */}
        {slides && slides.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise Slide por Slide</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 20 }]}>#</Text>
              <Text style={[styles.th, { flex: 2 }]}>Título</Text>
              <Text style={[styles.th, { width: 40 }]}>Nota</Text>
              <Text style={[styles.th, { flex: 3 }]}>Dica</Text>
            </View>
            {slides.map((slide, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { width: 20, fontFamily: "Helvetica-Bold" }]}>
                  {slide?.n}
                </Text>
                <Text style={[styles.td, { flex: 2 }]}>{slide?.t}</Text>
                <View style={{ width: 40, flexDirection: "row" }}>
                  <Text
                    style={[
                      styles.tag,
                      { backgroundColor: gradeColor(slide?.g) },
                    ]}
                  >
                    {slide?.g}
                  </Text>
                </View>
                <Text style={[styles.td, { flex: 3, color: GRAY }]}>
                  {slide?.tip}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

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

        <Footer date={today} />
      </Page>

      {/* ═══════════════════════════════════════════════════════════
          PAGE 5 — Recommendations & Comparables
          ═══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={styles.page}>
        <Header subtitle="Recomendações & Comparáveis" date={today} />

        {/* Recommendations in 3 columns */}
        {recs ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recomendações</Text>
            <View style={styles.threeCol}>
              {recs.now && recs.now.length > 0 ? (
                <View style={[styles.colCard, { borderColor: RED }]}>
                  <Text style={[styles.colTitle, { color: RED }]}>Imediato</Text>
                  {recs.now.map((item, i) => (
                    <Text key={i} style={styles.colItem}>
                      {i + 1}. {item}
                    </Text>
                  ))}
                </View>
              ) : null}

              {recs.soon && recs.soon.length > 0 ? (
                <View style={[styles.colCard, { borderColor: AMBER }]}>
                  <Text style={[styles.colTitle, { color: AMBER }]}>Curto Prazo</Text>
                  {recs.soon.map((item, i) => (
                    <Text key={i} style={styles.colItem}>
                      {i + 1}. {item}
                    </Text>
                  ))}
                </View>
              ) : null}

              {recs.later && recs.later.length > 0 ? (
                <View style={[styles.colCard, { borderColor: BLUE }]}>
                  <Text style={[styles.colTitle, { color: BLUE }]}>Estratégico</Text>
                  {recs.later.map((item, i) => (
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
        {comps && comps.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comparáveis</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Empresa</Text>
              <Text style={[styles.th, { flex: 3 }]}>Similaridade</Text>
              <Text style={[styles.th, { flex: 3 }]}>Resultado</Text>
            </View>
            {comps.map((c, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2, fontFamily: "Helvetica-Bold" }]}>
                  {c?.name}
                </Text>
                <Text style={[styles.td, { flex: 3 }]}>{c?.sim}</Text>
                <Text style={[styles.td, { flex: 3 }]}>{c?.out}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Footer date={today} />
      </Page>
    </Document>
  );
}
