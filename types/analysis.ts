export interface Feature {
  name: string;
  reason: string;
}

export interface Competitor {
  name: string;
  type: "direct" | "indirect" | "emerging";
  price: string;
  weakness: string;
}

export interface Risk {
  description: string;
  likelihood: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
}

export interface ScoreBreakdown {
  market: number;
  platform: number;
  bbg_fit: number;
  revenue: number;
}

export type GithubStatus = "verificado" | "via_package_json" | "privado_sem_acesso" | "sem_github";

export interface ChecklistItem {
  item: string;
  status: string;
}

// --- Tech Analysis ---

export interface TechScoreItem {
  score: number;
  detalhe: string;
}

export interface TechScoreWithStatus extends TechScoreItem {
  status: string; // "implementado" | "iniciado" | "ausente"
}

export interface TechProntidao {
  usuario_novo: string; // "ok" | "parcial" | "nao"
  autenticacao: string;
  feature_principal: string;
  pagamento: string;
  email: string;
}

export interface TechRisco {
  risco: string;
  severidade: string; // "alto" | "medio" | "baixo"
  solucao: string;
}

export interface TechAnalysisData {
  fluxo_end_to_end: TechScoreItem;
  pagamento: TechScoreWithStatus;
  autenticacao: TechScoreWithStatus;
  variaveis_ambiente: TechScoreItem;
  qualidade_codigo: TechScoreItem;
  prontidao: TechProntidao;
  riscos_tecnicos: TechRisco[];
  arquivos_analisados: number;
}

// --- Security Audit ---

export interface SecurityRule {
  regra: string;
  status: string; // "ok" | "alerta" | "critico" | "nao_aplicavel"
  detalhe: string;
  correcao: string;
}

export interface SecurityVulnerability {
  descricao: string;
  arquivo: string;
  linha_aproximada: string;
  correcao_imediata: string;
}

export interface SecurityChecklistItem {
  item: string;
  status: string; // "ok" | "pendente" | "critico"
}

export interface SecurityAuditData {
  score_geral: number;
  nivel: string; // "Inseguro" | "Básico" | "Adequado" | "Seguro" | "Excelente"
  regras: SecurityRule[];
  vulnerabilidades_criticas: SecurityVulnerability[];
  checklist_deploy: SecurityChecklistItem[];
}

// --- Report JSON ---

export interface ReportJson {
  summary: string;
  scores: ScoreBreakdown;
  tam: { value: string; description: string };
  sam: { value: string; description: string };
  som: { value: string; description: string };
  competitors: Competitor[];
  risks: Risk[];
  next_steps: string;
  strengths: string[];
  weaknesses: string[];
  github_status?: GithubStatus;
  launch_readiness_score?: number;
  launch_verdict?: string;
  launch_checklist?: ChecklistItem[];
  top3_para_lancar?: string[];
  produto_modo?: string;
  analise_tecnica?: TechAnalysisData;
  security_audit?: SecurityAuditData;
}

export type Verdict = "AVANÇAR" | "PIVOTAR" | "DESCARTAR";

export interface AnalysisResult {
  id: string;
  created_at: string;
  created_by: string;
  project_name: string;
  file_url?: string;
  file_name: string;
  score: number;
  verdict: Verdict;
  recommendation: string;
  mvp_features: Feature[];
  v2_features: Feature[];
  cut_features: Feature[];
  report_json: ReportJson;
  deleted_at?: string | null;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
