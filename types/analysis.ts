// ─── Legacy types kept for DB column compat ───
export interface Feature {
  name: string;
  reason: string;
}

export type GithubStatus = "verificado" | "via_package_json" | "privado_sem_acesso" | "sem_github";

// ─── V2 Report JSON types ───

export interface V2Meta {
  companyName: string;
  industry: string;
  stage: string;
  location: string;
  fundingAsk: string;
  analyzedAt: string;
  slidesAnalyzed: number;
  modelVersion: string;
}

export interface V2ExecutiveSummary {
  oneLiner: string;
  thesis: string;
  antiThesis: string;
  verdict: string;
  verdictExplanation: string;
}

export interface V2ScoreItem {
  score: number;
  label: string;
  summary: string;
}

export interface V2Scores {
  overall: V2ScoreItem;
  market: V2ScoreItem;
  team: V2ScoreItem;
  product: V2ScoreItem;
  traction: V2ScoreItem;
  financials: V2ScoreItem;
  gtm: V2ScoreItem;
  technology: V2ScoreItem;
  deckQuality: V2ScoreItem;
}

// Strategy Analysis
export interface V2MarketSize {
  tam: string;
  sam: string;
  som: string;
  credibilityAssessment: string;
  marketTiming: string;
}

export interface V2CompetitiveLandscape {
  directCompetitors: string[];
  indirectCompetitors: string[];
  moatAssessment: string;
  moatStrength: string;
}

export interface V2BusinessModel {
  revenueModel: string;
  scalability: string;
  pricingPower: string;
  unitEconomicsViability: string;
}

export interface V2TeamAssessment {
  founderMarketFit: string;
  keyStrengths: string[];
  keyGaps: string[];
  hiringPriorities: string[];
}

export interface V2RiskItem {
  risk: string;
  probability: string;
  impact: string;
  mitigation: string;
}

export interface V2StrategyAnalysis {
  marketSize: V2MarketSize;
  competitiveLandscape: V2CompetitiveLandscape;
  businessModel: V2BusinessModel;
  teamAssessment: V2TeamAssessment;
  riskMatrix: V2RiskItem[];
}

// Financial Analysis
export interface V2CurrentMetrics {
  revenue: string;
  burnRate: string;
  runway: string;
  grossMargin: string;
  cac: string;
  ltv: string;
  ltvCacRatio: string;
  churn: string;
  nrr: string;
}

export interface V2ProjectionsAudit {
  revenueProjections: string;
  credibilityScore: string;
  keyAssumptions: string[];
  redFlags: string[];
}

export interface V2FundraisingAnalysis {
  amountRaising: string;
  useOfFunds: string;
  impliedValuation: string;
  runwayFromRaise: string;
  nextMilestone: string;
}

export interface V2FinancialAnalysis {
  currentMetrics: V2CurrentMetrics;
  projectionsAudit: V2ProjectionsAudit;
  fundraisingAnalysis: V2FundraisingAnalysis;
  financialVerdict: string;
}

// Marketing Analysis
export interface V2GTMStrategy {
  primaryChannels: string[];
  channelMarketFit: string;
  distributionModel: string;
  salesCycleComplexity: string;
}

export interface V2TractionValidation {
  currentTraction: string;
  growthTrajectory: string;
  tractionQuality: string;
  socialProof: string;
}

export interface V2BrandPositioning {
  valueProposition: string;
  messagingQuality: string;
  differentiationStrength: string;
  emotionalResonance: string;
}

export interface V2ScalabilityAssessment {
  channelScalability: string;
  viralPotential: string;
  contentSEOMoat: string;
}

export interface V2DeckStorytelling {
  narrativeArc: string;
  slideFlow: string;
  visualQuality: string;
  informationDensity: string;
  missingSlides: string[];
}

export interface V2MarketingAnalysis {
  gtmStrategy: V2GTMStrategy;
  tractionValidation: V2TractionValidation;
  brandPositioning: V2BrandPositioning;
  scalabilityAssessment: V2ScalabilityAssessment;
  deckStorytelling: V2DeckStorytelling;
  marketingVerdict: string;
}

// Tech Analysis
export interface V2TechnologyAssessment {
  techStack: string;
  architectureScalability: string;
  aiMlClaims: string;
  dataStrategy: string;
}

export interface V2ProductAnalysis {
  pmfSignals: string;
  featureDifferentiation: string;
  productComplexity: string;
  uxQuality: string;
}

export interface V2TechnicalRisk {
  risk: string;
  severity: string;
  mitigation: string;
}

export interface V2IPDefensibility {
  patents: string;
  proprietaryTech: string;
  moatDurability: string;
  openSourceRisk: string;
}

export interface V2SecurityCompliance {
  dataPrivacy: string;
  securityMentions: string;
  complianceGaps: string[];
}

export interface V2TechAnalysis {
  technologyAssessment: V2TechnologyAssessment;
  productAnalysis: V2ProductAnalysis;
  technicalRisks: V2TechnicalRisk[];
  ipDefensibility: V2IPDefensibility;
  securityCompliance: V2SecurityCompliance;
  techVerdict: string;
}

// Slide-by-Slide
export interface V2SlideAnalysis {
  slideNumber: number;
  slideTitle: string;
  category: string;
  strengths: string[];
  weaknesses: string[];
  suggestion: string;
  grade: string;
}

// Comparables
export interface V2Comparable {
  name: string;
  similarity: string;
  outcome: string;
  lesson: string;
}

export interface V2Comparables {
  similarCompanies: V2Comparable[];
  benchmarkMetrics: string;
}

// Recommendations
export interface V2Recommendations {
  immediate: string[];
  shortTerm: string[];
  strategic: string[];
}

// ─── Full V2 Report (stored in report_json) ───

export interface V2ReportJson {
  meta: V2Meta;
  executiveSummary: V2ExecutiveSummary;
  scores: V2Scores;
  strategyAnalysis: V2StrategyAnalysis;
  financialAnalysis: V2FinancialAnalysis;
  marketingAnalysis: V2MarketingAnalysis;
  techAnalysis: V2TechAnalysis;
  slideBySlide: V2SlideAnalysis[];
  investorQuestions: string[];
  recommendations: V2Recommendations;
  comparables: V2Comparables;
  // Injected by backend
  github_status?: string;
}

// ─── Verdict ───

export type Verdict = "STRONG PASS" | "PASS" | "CONDITIONAL" | "WATCH" | "DECLINE";

// ─── Analysis Result (DB row + V2 report) ───

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
