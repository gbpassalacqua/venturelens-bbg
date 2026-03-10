// ─── Legacy types kept for DB column compat ───
export interface Feature {
  name: string;
  reason: string;
}

export type GithubStatus = "verificado" | "via_package_json" | "privado_sem_acesso" | "sem_github";

// ─── Ultra-Compact Report JSON types ───

/** Scores are direct numbers 0-100 */
export interface UCScores {
  market: number;
  team: number;
  product: number;
  traction: number;
  financials: number;
  gtm: number;
  tech: number;
  deck: number;
  [key: string]: number;
}

export interface UCCompetitor {
  n: string;
  t: string;
  threat: string;
  gap: string;
}

export interface UCRiskItem {
  r: string;
  p: string;
  i: string;
  m: string;
}

export interface UCFinancials {
  revenue: string;
  burn: string;
  ltv_cac: string;
  churn: string;
}

export interface UCGtm {
  channels: string;
  traction: string;
}

export interface UCTech {
  stack: string;
  risk: string;
}

export interface UCSlide {
  n: number;
  t: string;
  g: string;
  tip: string;
}

export interface UCRecs {
  now: string[];
  soon: string[];
  later: string[];
}

export interface UCComparable {
  name: string;
  sim: string;
  out: string;
}

// ─── Full Ultra-Compact Report (stored in report_json) ───

export interface V2ReportJson {
  // Root-level fields
  name: string;
  industry: string;
  stage: string;
  verdict: string;
  score: number;
  thesis: string;
  antiThesis: string;

  // Scores
  scores: UCScores;

  // Market (root-level)
  tam: string;
  sam: string;
  som: string;
  moat: string;
  timing: string;

  // Arrays
  competitors: UCCompetitor[];
  risks: UCRiskItem[];

  // Objects
  fin: UCFinancials;
  gtm: UCGtm;
  tech: UCTech;

  // Slides & questions
  slides: UCSlide[];
  questions: string[];

  // Recommendations & comparables
  recs: UCRecs;
  comps: UCComparable[];

  // Injected by backend
  github_status?: string;
}

// ─── Verdict ───

export type Verdict = "STRONG PASS" | "PASS" | "CONDITIONAL" | "WATCH" | "DECLINE";

// ─── Analysis Result (DB row + report) ───

export interface AnalysisResult {
  id: string;
  created_at: string;
  created_by: string;
  project_name: string;
  file_url?: string;
  file_name: string;
  score: number;
  verdict: string;
  recommendation: string;
  mvp_features: Feature[];
  v2_features: Feature[];
  cut_features: Feature[];
  report_json: V2ReportJson;
  deleted_at?: string | null;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
