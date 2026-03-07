"use client";

import React from "react";
import { tamFontSize, tamTruncate } from "./helpers";

interface TAMCardsProps {
  tam: string;
  sam: string;
  som: string;
}

export default function TAMCards({ tam, sam, som }: TAMCardsProps) {
  const cards = [
    {
      key: "tam",
      label: "TAM \u2014 Total",
      value: tam || "N/D",
      description: "Mercado Total Endere\u00e7\u00e1vel",
      stripColor: "bg-[var(--vl-gold)]",
      valueColor: "var(--vl-gold)",
    },
    {
      key: "sam",
      label: "SAM",
      value: sam || "N/D",
      description: "Mercado Endere\u00e7\u00e1vel Acess\u00edvel",
      stripColor: "bg-[var(--vl-blue)]",
      valueColor: "var(--vl-blue2)",
    },
    {
      key: "som",
      label: "SOM",
      value: som || "N/D",
      description: "Mercado Obt\u00edvel",
      stripColor: "bg-[var(--vl-green)]",
      valueColor: "var(--vl-green)",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-5 max-[900px]:grid-cols-1">
      {cards.map((card) => {
        const displayValue = tamTruncate(card.value);
        const fontSize = tamFontSize(card.value);

        return (
          <div
            key={card.key}
            className="bg-[var(--vl-bg2)] border border-[var(--vl-border)] rounded-lg p-5 relative overflow-hidden"
            style={{ maxHeight: "160px" }}
            title={card.value}
          >
            {/* Bottom colored strip */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-[3px] ${card.stripColor}`}
            />

            {/* Label */}
            <div className="text-[.7rem] uppercase tracking-widest text-[var(--vl-text3)] mb-2">
              {card.label}
            </div>

            {/* Value — dynamic font size */}
            <div
              className="font-display font-bold leading-tight"
              style={{ fontSize, color: card.valueColor }}
            >
              {displayValue}
            </div>

            {/* Description */}
            <div className="text-xs text-[var(--vl-text2)] mt-1.5">
              {card.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
