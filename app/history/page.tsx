"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AnalysisResult } from "@/types/analysis";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const RECOMMENDATION_COLORS: Record<string, string> = {
  strong_pass: "bg-green-600",
  pass: "bg-green-500",
  consider: "bg-yellow-500",
  reject: "bg-red-500",
};

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setAnalyses(data as AnalysisResult[]);
      }
      setLoading(false);
    }

    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">History</h1>
            <p className="text-muted-foreground mt-1">
              Previous pitch deck analyses
            </p>
          </div>
          <Link href="/">
            <Button variant="outline">New Analysis</Button>
          </Link>
        </header>

        {loading && (
          <p className="text-muted-foreground animate-pulse text-center">
            Loading...
          </p>
        )}

        {!loading && analyses.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No analyses yet.</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {analysis.file_name}
                  </CardTitle>
                  <Badge
                    className={
                      RECOMMENDATION_COLORS[analysis.recommendation] ?? ""
                    }
                  >
                    {analysis.recommendation.replace("_", " ")}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(analysis.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="font-bold text-xl">
                    {analysis.overall_score}/100
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {analysis.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
