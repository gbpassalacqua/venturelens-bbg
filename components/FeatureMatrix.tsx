"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Feature } from "@/types/analysis";

interface FeatureMatrixProps {
  features: Feature[];
}

export default function FeatureMatrix({ features }: FeatureMatrixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="flex items-start gap-3 py-2 border-b last:border-0"
            >
              <span className="text-lg mt-0.5">
                {feature.present ? "✅" : "❌"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{feature.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {feature.notes}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
