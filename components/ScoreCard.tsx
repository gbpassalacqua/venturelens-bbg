"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScoreBreakdown } from "@/types/analysis";

interface ScoreCardProps {
  overallScore: number;
  scores: ScoreBreakdown;
  recommendation: string;
}

const RECOMMENDATION_COLORS: Record<string, string> = {
  strong_pass: "bg-green-600",
  pass: "bg-green-500",
  consider: "bg-yellow-500",
  reject: "bg-red-500",
};

const RECOMMENDATION_LABELS: Record<string, string> = {
  strong_pass: "Strong Pass",
  pass: "Pass",
  consider: "Consider",
  reject: "Reject",
};

const SCORE_LABELS: Record<keyof ScoreBreakdown, string> = {
  market: "Market",
  team: "Team",
  product: "Product",
  traction: "Traction",
  financials: "Financials",
};

export default function ScoreCard({
  overallScore,
  scores,
  recommendation,
}: ScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Score</CardTitle>
          <Badge className={RECOMMENDATION_COLORS[recommendation]}>
            {RECOMMENDATION_LABELS[recommendation] ?? recommendation}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <span className="text-5xl font-bold">{overallScore}</span>
          <span className="text-muted-foreground text-lg">/100</span>
        </div>
        <div className="space-y-3">
          {(Object.keys(scores) as (keyof ScoreBreakdown)[]).map((key) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{SCORE_LABELS[key]}</span>
                <span className="text-muted-foreground">{scores[key]}</span>
              </div>
              <Progress value={scores[key]} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
