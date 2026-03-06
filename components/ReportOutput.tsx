"use client";

import ScoreCard from "@/components/ScoreCard";
import FeatureMatrix from "@/components/FeatureMatrix";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AnalysisResult } from "@/types/analysis";

interface ReportOutputProps {
  result: AnalysisResult;
}

export default function ReportOutput({ result }: ReportOutputProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analysis Report</h2>
        <p className="text-sm text-muted-foreground">{result.file_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard
          overallScore={result.overall_score}
          scores={result.scores}
          recommendation={result.recommendation}
        />
        <FeatureMatrix features={result.features} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{result.summary}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.strengths.map((s, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="shrink-0">+</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Weaknesses</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.weaknesses.map((w, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="shrink-0">-</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Separator />
    </div>
  );
}
