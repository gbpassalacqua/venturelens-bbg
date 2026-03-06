"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { AnalysisResult } from "@/types/analysis";

const GOLD = "#F0A500";
const GREEN = "#22C55E";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const DARK = "#111827";
const GRAY = "#6B7280";
const LIGHTGRAY = "#E5E7EB";
const WHITE = "#FFFFFF";
const BLUE = "#3B82F6";

const TYPE_LABELS: Record<string, string> = {
  direct: "Direto",
  indirect: "Indireto",
  emerging: "Emergente",
};

const LEVEL_LABELS: Record<string, string> = {
  high: "Alto",
  medium: "Médio",
  low: "Baixo",
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: DARK,
    backgroundColor: WHITE,
  },
  // Header
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
  // Project
  projectName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: DARK,
    marginBottom: 16,
  },
  // Score center
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
  // Bars
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
  // Section
  section: {
    marginTop: 16,
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
  // TAM/SAM/SOM
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
  tamDesc: {
    fontSize: 8,
    color: GRAY,
    marginTop: 2,
  },
  // Table
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
  // Risks
  riskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 6,
  },
  riskDesc: {
    flex: 1,
    fontSize: 9,
    color: DARK,
  },
  riskTag: {
    fontSize: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    color: WHITE,
  },
  // Strengths/Weaknesses columns
  swRow: {
    flexDirection: "row",
    gap: 12,
  },
  swCol: {
    flex: 1,
  },
  swItem: {
    fontSize: 9,
    color: DARK,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  // Features columns
  featRow: {
    flexDirection: "row",
    gap: 10,
  },
  featCol: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
  },
  featTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
  },
  featItem: {
    marginBottom: 4,
  },
  featName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },
  featNameCut: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: GRAY,
    textDecoration: "line-through",
  },
  featReason: {
    fontSize: 7,
    color: GRAY,
    marginTop: 1,
  },
  // Recommendation box
  recoBox: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: GOLD,
    borderRadius: 6,
    backgroundColor: "#FFFBEB",
  },
  // Footer
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

function barColor(v: number) {
  return v >= 70 ? GREEN : v >= 40 ? AMBER : RED;
}

function verdictStyle(v: string) {
  if (v === "AVANÇAR") return { borderColor: GREEN, backgroundColor: "#F0FDF4", color: GREEN };
  if (v === "PIVOTAR") return { borderColor: AMBER, backgroundColor: "#FFFBEB", color: AMBER };
  return { borderColor: RED, backgroundColor: "#FEF2F2", color: RED };
}

function levelColor(l: string) {
  if (l === "high") return RED;
  if (l === "medium") return AMBER;
  return GREEN;
}

function typeColor(t: string) {
  if (t === "direct") return RED;
  if (t === "indirect") return BLUE;
  return GREEN;
}

export default function ReportPDF({ result }: { result: AnalysisResult }) {
  const r = result.report_json;
  const today = new Date().toLocaleDateString("pt-BR");
  const vs = verdictStyle(result.verdict);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>VentureLens BBG</Text>
            <Text style={styles.headerSub}>BBG Digital Products</Text>
          </View>
          <Text style={styles.headerDate}>Gerado em {today}</Text>
        </View>
        <View style={styles.divider} />

        {/* Project Name */}
        <Text style={styles.projectName}>{result.project_name}</Text>

        {/* Score + Verdict */}
        <View style={styles.scoreRow}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNum}>{result.score}</Text>
            <Text style={styles.score100}>/100</Text>
          </View>
          <View style={[styles.verdictBadge, { borderColor: vs.borderColor, backgroundColor: vs.backgroundColor }]}>
            <Text style={[styles.verdictText, { color: vs.color }]}>{result.verdict}</Text>
          </View>
        </View>

        {/* Score Bars */}
        {([
          { key: "market" as const, label: "Mercado" },
          { key: "platform" as const, label: "Plataforma" },
          { key: "bbg_fit" as const, label: "Fit BBG" },
          { key: "revenue" as const, label: "Receita" },
        ]).map(({ key, label }) => (
          <View key={key} style={styles.barRow}>
            <Text style={styles.barLabel}>{label}</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${r.scores[key]}%`, backgroundColor: barColor(r.scores[key]) }]} />
            </View>
            <Text style={styles.barValue}>{r.scores[key]}</Text>
          </View>
        ))}

        {/* Resumo Executivo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>
          <Text style={styles.bodyItalic}>{r.summary}</Text>
        </View>

        {/* TAM / SAM / SOM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TAM / SAM / SOM</Text>
          <View style={styles.tamRow}>
            {([
              { key: "tam" as const, label: "TAM", color: GOLD },
              { key: "sam" as const, label: "SAM", color: BLUE },
              { key: "som" as const, label: "SOM", color: GREEN },
            ]).map(({ key, label, color }) => (
              <View key={key} style={[styles.tamCard, { borderBottomColor: color }]}>
                <Text style={styles.tamLabel}>{label}</Text>
                <Text style={[styles.tamValue, { color }]}>{r[key].value}</Text>
                <Text style={styles.tamDesc}>{r[key].description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Concorrentes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Concorrentes</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Nome</Text>
            <Text style={[styles.th, { flex: 1 }]}>Tipo</Text>
            <Text style={[styles.th, { flex: 1 }]}>Preço</Text>
            <Text style={[styles.th, { flex: 2 }]}>Fraqueza</Text>
          </View>
          {r.competitors.map((c, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, { flex: 2, fontFamily: "Helvetica-Bold" }]}>{c.name}</Text>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <Text style={[styles.tag, { backgroundColor: typeColor(c.type) }]}>
                  {TYPE_LABELS[c.type] ?? c.type}
                </Text>
              </View>
              <Text style={[styles.td, { flex: 1 }]}>{c.price}</Text>
              <Text style={[styles.td, { flex: 2, color: GRAY }]}>{c.weakness}</Text>
            </View>
          ))}
        </View>

        {/* Riscos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Riscos</Text>
          {r.risks.map((risk, i) => (
            <View key={i} style={styles.riskRow}>
              <Text style={styles.riskDesc}>{risk.description}</Text>
              <Text style={[styles.riskTag, { backgroundColor: levelColor(risk.likelihood) }]}>
                P: {LEVEL_LABELS[risk.likelihood] ?? risk.likelihood}
              </Text>
              <Text style={[styles.riskTag, { backgroundColor: levelColor(risk.impact) }]}>
                I: {LEVEL_LABELS[risk.impact] ?? risk.impact}
              </Text>
            </View>
          ))}
        </View>

        {/* Pontos Fortes / Fracos */}
        <View style={styles.section}>
          <View style={styles.swRow}>
            <View style={styles.swCol}>
              <Text style={[styles.sectionTitle, { color: GREEN, borderBottomColor: GREEN }]}>Pontos Fortes</Text>
              {r.strengths.map((s, i) => (
                <Text key={i} style={styles.swItem}>+ {s}</Text>
              ))}
            </View>
            <View style={styles.swCol}>
              <Text style={[styles.sectionTitle, { color: RED, borderBottomColor: RED }]}>Pontos Fracos</Text>
              {r.weaknesses.map((w, i) => (
                <Text key={i} style={styles.swItem}>- {w}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* Feature Matrix */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matriz de Features</Text>
          <View style={styles.featRow}>
            <View style={[styles.featCol, { borderColor: GREEN }]}>
              <Text style={[styles.featTitle, { color: GREEN }]}>MVP AGORA</Text>
              {result.mvp_features.map((f, i) => (
                <View key={i} style={styles.featItem}>
                  <Text style={styles.featName}>{f.name}</Text>
                  <Text style={styles.featReason}>{f.reason}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.featCol, { borderColor: AMBER }]}>
              <Text style={[styles.featTitle, { color: AMBER }]}>V2</Text>
              {result.v2_features.map((f, i) => (
                <View key={i} style={styles.featItem}>
                  <Text style={styles.featName}>{f.name}</Text>
                  <Text style={styles.featReason}>{f.reason}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.featCol, { borderColor: GRAY }]}>
              <Text style={[styles.featTitle, { color: GRAY }]}>CORTAR</Text>
              {result.cut_features.map((f, i) => (
                <View key={i} style={styles.featItem}>
                  <Text style={styles.featNameCut}>{f.name}</Text>
                  <Text style={styles.featReason}>{f.reason}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Próximo Passo */}
        <View style={styles.recoBox}>
          <Text style={styles.sectionTitleGold}>Próximo Passo</Text>
          <Text style={styles.bodyText}>{r.next_steps}</Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Gerado por VentureLens BBG · BBG Digital Products · {today}
        </Text>
      </Page>

      {/* Page 3 — Tech Analysis (if exists) */}
      {r.analise_tecnica && (
        <Page size="A4" style={styles.page}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>VentureLens BBG</Text>
              <Text style={styles.headerSub}>Análise Técnica do Código</Text>
            </View>
            <Text style={styles.headerDate}>{result.project_name}</Text>
          </View>
          <View style={styles.divider} />

          <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
            Análise Técnica — {r.analise_tecnica.arquivos_analisados} arquivos analisados
          </Text>

          {/* Prontidão */}
          <View style={styles.section}>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>Prontidão para Produção</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              {([
                { k: "usuario_novo" as const, l: "Usuário" },
                { k: "autenticacao" as const, l: "Auth" },
                { k: "feature_principal" as const, l: "Feature" },
                { k: "pagamento" as const, l: "Pgto" },
                { k: "email" as const, l: "Email" },
              ]).map(({ k, l }) => {
                const v = r.analise_tecnica!.prontidao[k];
                const icon = v === "ok" ? "✅" : v === "parcial" ? "⚠️" : "❌";
                return (
                  <View key={k} style={{ flex: 1, alignItems: "center", padding: 6, borderWidth: 1, borderColor: LIGHTGRAY, borderRadius: 4 }}>
                    <Text style={{ fontSize: 14, marginBottom: 2 }}>{icon}</Text>
                    <Text style={{ fontSize: 7, color: GRAY }}>{l}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Tech Scores */}
          {([
            { key: "fluxo_end_to_end", label: "Fluxo E2E" },
            { key: "pagamento", label: "Pagamento" },
            { key: "autenticacao", label: "Autenticação" },
            { key: "variaveis_ambiente", label: "Env Vars" },
            { key: "qualidade_codigo", label: "Qualidade" },
          ] as const).map(({ key, label }) => {
            const item = r.analise_tecnica![key];
            const score = item.score;
            const color = score >= 7 ? GREEN : score >= 4 ? AMBER : RED;
            return (
              <View key={key} style={{ marginBottom: 8 }}>
                <View style={styles.barRow}>
                  <Text style={[styles.barLabel, { width: 70 }]}>{label}</Text>
                  <View style={[styles.barTrack, { flex: 1 }]}>
                    <View style={[styles.barFill, { width: `${score * 10}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.barValue, { width: 20 }]}>{score}</Text>
                </View>
                <Text style={{ fontSize: 7, color: GRAY, marginLeft: 70 }}>{item.detalhe}</Text>
              </View>
            );
          })}

          {/* Riscos Técnicos */}
          {r.analise_tecnica.riscos_tecnicos?.length > 0 && (
            <View style={styles.section}>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>Riscos Técnicos</Text>
              {r.analise_tecnica.riscos_tecnicos.map((rt, i) => (
                <View key={i} style={{ marginBottom: 6, padding: 6, borderWidth: 1, borderColor: LIGHTGRAY, borderRadius: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <Text style={[styles.riskTag, { backgroundColor: rt.severidade === "alto" ? RED : rt.severidade === "medio" ? AMBER : GREEN }]}>
                      {rt.severidade.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 9, color: DARK, flex: 1 }}>{rt.risco}</Text>
                  </View>
                  <Text style={{ fontSize: 7, color: GRAY }}>Solução: {rt.solucao}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.footer}>Gerado por VentureLens BBG · Análise Técnica · {today}</Text>
        </Page>
      )}

      {/* Page 4 — Security Audit (if exists) */}
      {r.security_audit && (
        <Page size="A4" style={styles.page}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>VentureLens BBG</Text>
              <Text style={styles.headerSub}>Auditoria de Segurança</Text>
            </View>
            <Text style={styles.headerDate}>{result.project_name}</Text>
          </View>
          <View style={styles.divider} />

          {/* Score + Nivel */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <View style={[styles.scoreCircle, { width: 60, height: 60, borderRadius: 30, borderColor: r.security_audit.score_geral >= 80 ? GREEN : r.security_audit.score_geral >= 40 ? AMBER : RED }]}>
              <Text style={[styles.scoreNum, { fontSize: 22, color: r.security_audit.score_geral >= 80 ? GREEN : r.security_audit.score_geral >= 40 ? AMBER : RED }]}>
                {r.security_audit.score_geral}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", color: DARK }}>{r.security_audit.nivel}</Text>
              <Text style={{ fontSize: 8, color: GRAY }}>Score de Segurança</Text>
            </View>
          </View>

          {/* Critical vulnerabilities */}
          {r.security_audit.vulnerabilidades_criticas?.length > 0 && (
            <View style={{ padding: 8, backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: RED, borderRadius: 6, marginBottom: 12 }}>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: RED, marginBottom: 4 }}>
                {r.security_audit.vulnerabilidades_criticas.length} vulnerabilidade(s) crítica(s)
              </Text>
              {r.security_audit.vulnerabilidades_criticas.map((v, i) => (
                <View key={i} style={{ marginBottom: 4 }}>
                  <Text style={{ fontSize: 8, color: DARK }}>{v.descricao} — {v.arquivo}</Text>
                  <Text style={{ fontSize: 7, color: GRAY }}>Correção: {v.correcao_imediata}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Security Rules */}
          <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>Regras de Segurança</Text>
          {r.security_audit.regras?.map((rule, i) => {
            const statusIcon = rule.status === "ok" ? "✅" : rule.status === "critico" ? "🔴" : rule.status === "alerta" ? "⚠️" : "➖";
            const statusColor = rule.status === "ok" ? GREEN : rule.status === "critico" ? RED : rule.status === "alerta" ? AMBER : GRAY;
            return (
              <View key={i} style={{ marginBottom: 5, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: LIGHTGRAY }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Text style={{ fontSize: 9 }}>{statusIcon}</Text>
                  <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: statusColor, flex: 1 }}>{rule.regra}</Text>
                </View>
                {rule.detalhe && <Text style={{ fontSize: 7, color: GRAY, marginTop: 1 }}>{rule.detalhe}</Text>}
                {rule.correcao && rule.status !== "ok" && <Text style={{ fontSize: 7, color: DARK, marginTop: 1 }}>→ {rule.correcao}</Text>}
              </View>
            );
          })}

          {/* Deploy Checklist */}
          {r.security_audit.checklist_deploy?.length > 0 && (
            <View style={styles.section}>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", marginBottom: 6 }}>Checklist de Deploy</Text>
              {r.security_audit.checklist_deploy.map((item, i) => {
                const icon = item.status === "ok" ? "✅" : item.status === "critico" ? "🔴" : "⚠️";
                return (
                  <View key={i} style={{ flexDirection: "row", gap: 4, marginBottom: 3 }}>
                    <Text style={{ fontSize: 8 }}>{icon}</Text>
                    <Text style={{ fontSize: 8, color: DARK }}>{item.item}</Text>
                  </View>
                );
              })}
            </View>
          )}

          <Text style={styles.footer}>Gerado por VentureLens BBG · Auditoria de Segurança · {today}</Text>
        </Page>
      )}
    </Document>
  );
}
