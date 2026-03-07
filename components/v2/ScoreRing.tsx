"use client";

import React from "react";

interface ScoreRingProps {
  score: number; // 0-100
  size?: number; // default 160
  label?: string; // text below score, default "/ 100"
}

export default function ScoreRing({
  score,
  size = 160,
  label = "/ 100",
}: ScoreRingProps) {
  const center = size / 2;
  const radius = size * 0.425;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const gradientId = `scoreGrad-${size}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* SVG Ring */}
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F0A500" />
            <stop offset="100%" stopColor="#FFD166" />
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--vl-border)"
          strokeWidth={10}
        />

        {/* Foreground circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={10}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>

      {/* Label overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[2.8rem] font-extrabold text-[var(--vl-gold)] leading-none">
          {score}
        </span>
        <span className="text-[.7rem] text-[var(--vl-text2)] uppercase tracking-widest mt-1">
          {label}
        </span>
      </div>
    </div>
  );
}
