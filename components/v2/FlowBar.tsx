"use client";

import React from "react";

interface FlowBarProps {
  steps: { label: string; status: "done" | "active" | "pending" }[];
}

export default function FlowBar({ steps }: FlowBarProps) {
  return (
    <div className="flex items-center bg-[var(--vl-bg2)] border-b border-[var(--vl-border)] px-10 overflow-x-auto">
      {steps.map((step, index) => {
        const isDone = step.status === "done";
        const isActive = step.status === "active";
        /* --- circle colour --- */
        const circleClass = isDone
          ? "bg-[var(--vl-green)] text-[var(--vl-bg)]"
          : isActive
            ? "bg-[var(--vl-gold)] text-[var(--vl-bg)]"
            : "bg-[var(--vl-border)] text-[var(--vl-text3)]";

        /* --- text colour --- */
        const textClass = isDone
          ? "text-[var(--vl-green)]"
          : isActive
            ? "text-[var(--vl-gold)]"
            : "text-[var(--vl-text3)] hover:text-[var(--vl-text)]";

        return (
          <div
            key={index}
            className={`
              flex items-center gap-2 py-3.5 px-5 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors
              border-b-2
              ${isActive ? "border-b-[var(--vl-gold)]" : "border-b-transparent"}
              ${textClass}
            `}
          >
            {/* Step number / check circle */}
            <span
              className={`
                w-5 h-5 rounded-full flex items-center justify-center text-[.65rem] font-bold shrink-0
                ${circleClass}
              `}
            >
              {isDone ? "\u2713" : index + 1}
            </span>

            {/* Step label */}
            <span>{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
