"use client";

import { Feature } from "@/types/analysis";

interface FeatureMatrixProps {
  mvp: Feature[];
  v2: Feature[];
  cut: Feature[];
}

function FeatureColumn({
  title,
  icon,
  features,
  borderColor,
  strikethrough,
}: {
  title: string;
  icon: string;
  features: Feature[];
  borderColor: string;
  strikethrough?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-[var(--vl-card)] overflow-hidden`} style={{ borderColor }}>
      <div className="px-4 py-3 border-b" style={{ borderColor }}>
        <h3 className="font-display font-bold text-sm flex items-center gap-2">
          <span>{icon}</span> {title}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        {features.length === 0 && (
          <p className="text-xs text-[var(--vl-text3)] italic">Nenhuma feature</p>
        )}
        {features.map((f, i) => (
          <div key={i} className="space-y-0.5">
            <p className={`text-sm font-medium ${strikethrough ? "line-through text-[var(--vl-text3)]" : "text-[var(--vl-text)]"}`}>
              {f.name}
            </p>
            <p className="text-xs text-[var(--vl-text3)]">{f.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FeatureMatrix({ mvp, v2, cut }: FeatureMatrixProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FeatureColumn title="MVP AGORA" icon="✅" features={mvp} borderColor="var(--vl-green)" />
      <FeatureColumn title="V2" icon="🔄" features={v2} borderColor="var(--vl-amber)" />
      <FeatureColumn title="CORTAR" icon="✂️" features={cut} borderColor="var(--vl-text3)" strikethrough />
    </div>
  );
}
