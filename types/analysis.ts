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
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
