"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import ReportOutput from "@/components/ReportOutput";
import { AnalysisResult, AnalysisResponse } from "@/types/analysis";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileSelected(file: File) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json: AnalysisResponse = await res.json();

      if (!json.success || !json.data) {
        throw new Error(json.error ?? "Analysis failed");
      }

      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">VentureLens</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered pitch deck analysis
            </p>
          </div>
          <Link href="/history">
            <Button variant="outline">History</Button>
          </Link>
        </header>

        <UploadZone onFileSelected={handleFileSelected} isLoading={isLoading} />

        {isLoading && (
          <div className="mt-8 text-center">
            <p className="text-muted-foreground animate-pulse">
              Analyzing your pitch deck with Claude...
            </p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <ReportOutput result={result} />
          </div>
        )}
      </div>
    </main>
  );
}
