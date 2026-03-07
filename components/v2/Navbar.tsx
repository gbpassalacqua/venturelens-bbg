"use client";

import React from "react";

interface NavbarProps {
  mode: "landing" | "app";
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onNewAnalysis?: () => void;
  onLogoClick?: () => void;
  onPricingClick?: () => void;
}

const APP_TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "market", label: "Mercado" },
  { id: "competitors", label: "Competidores" },
  { id: "timing", label: "Timing" },
  { id: "risks", label: "Riscos" },
  { id: "report", label: "Relat\u00f3rio Completo" },
  { id: "personas", label: "Personas" },
  { id: "roadmap", label: "Roadmap" },
  { id: "pricing", label: "Pricing" },
] as const;

export default function Navbar({
  mode,
  activeTab,
  onTabChange,
  onNewAnalysis,
  onLogoClick,
  onPricingClick,
}: NavbarProps) {
  const Logo = (
    <button
      type="button"
      onClick={onLogoClick}
      className="flex items-center gap-0 bg-transparent border-none cursor-pointer select-none"
    >
      <span className="font-display font-bold text-xl text-[var(--vl-gold)]">
        VentureLens
      </span>
      <span className="font-display font-light text-xl text-[var(--vl-text2)] ml-[2px]">
        AI
      </span>
    </button>
  );

  /* ------------------------------------------------------------------ */
  /*  LANDING MODE                                                       */
  /* ------------------------------------------------------------------ */
  if (mode === "landing") {
    return (
      <nav
        className="sticky top-0 z-50 flex items-center justify-between h-[60px] px-5 md:px-10 border-b border-[var(--vl-border)]"
        style={{
          background: "rgba(8,13,26,.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
        }}
      >
        {Logo}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPricingClick}
            className="px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-border2)] bg-transparent text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-colors cursor-pointer"
          >
            Pricing
          </button>

          <button
            type="button"
            onClick={onNewAnalysis}
            className="px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-gold)] bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] transition-colors cursor-pointer"
          >
            {"Come\u00e7ar Gr\u00e1tis"}
          </button>
        </div>
      </nav>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  APP MODE                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <nav
      className="sticky top-0 z-50 flex items-center justify-between h-[60px] px-5 md:px-10 border-b border-[var(--vl-border)]"
      style={{
        background: "rgba(8,13,26,.85)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
      }}
    >
      {/* Left: Logo */}
      <div className="shrink-0">{Logo}</div>

      {/* Center: Tabs */}
      <div
        className="flex items-center gap-1 overflow-x-auto mx-4 scrollbar-hide"
        style={{ maxWidth: "calc(100% - 320px)" }}
      >
        {APP_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange?.(tab.id)}
              className={`
                shrink-0 px-[14px] py-[6px] rounded-md text-xs font-medium whitespace-nowrap cursor-pointer transition-colors border-none
                ${
                  isActive
                    ? "text-[var(--vl-gold)] bg-[rgba(240,165,0,.1)]"
                    : "text-[var(--vl-text2)] bg-transparent hover:text-[var(--vl-text)] hover:bg-[var(--vl-border)]"
                }
              `}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onNewAnalysis}
          className="px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-border2)] bg-transparent text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)] transition-colors cursor-pointer"
        >
          {"+ Nova An\u00e1lise"}
        </button>

        <button
          type="button"
          className="px-[18px] py-[7px] rounded-md text-xs font-semibold border border-[var(--vl-gold)] bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] transition-colors cursor-pointer"
        >
          Upgrade
        </button>
      </div>
    </nav>
  );
}
