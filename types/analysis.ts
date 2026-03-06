export interface ScoreBreakdown {
  market: number;
  team: number;
  product: number;
  traction: number;
  financials: number;
}

export interface Feature {
  name: string;
  present: boolean;
  notes: string;
}

export interface AnalysisResult {
  id: string;
  created_at: string;
  file_name: string;
  overall_score: number;
  scores: ScoreBreakdown;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  features: Feature[];
  recommendation: "strong_pass" | "pass" | "consider" | "reject";
  raw_text?: string;
  user_id?: string;
}

export interface AnalysisRequest {
  file: File;
}

export interface AnalysisResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
}
