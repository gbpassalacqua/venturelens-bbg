"use client";

import { useState, useEffect, useRef } from "react";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  url: string;
  private: boolean;
  updated_at: string;
  description: string | null;
  language: string | null;
}

interface RepoSelectorProps {
  onSelect: (url: string, fullName: string, isPrivate: boolean) => void;
  onClear: () => void;
  selected: { fullName: string; isPrivate: boolean } | null;
  disabled?: boolean;
}

export default function RepoSelector({ onSelect, onClear, selected, disabled }: RepoSelectorProps) {
  const [open, setOpen] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchRepos() {
    if (repos.length > 0) {
      setOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/github/repos");
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Erro ao buscar repos");
      }

      setRepos(data.repos);
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(repo: Repo) {
    onSelect(repo.url, repo.full_name, repo.private);
    setOpen(false);
    setSearch("");
  }

  function handleFallbackSubmit() {
    if (fallbackUrl.trim()) {
      const parts = fallbackUrl.trim().replace(/\.git$/, "").split("/");
      const fullName = parts.slice(-2).join("/");
      onSelect(fallbackUrl.trim(), fullName, false);
      setFallbackUrl("");
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "hoje";
    if (days === 1) return "ontem";
    if (days < 30) return `${days}d atrás`;
    if (days < 365) return `${Math.floor(days / 30)}m atrás`;
    return `${Math.floor(days / 365)}a atrás`;
  }

  const filtered = repos.filter(
    (r) =>
      r.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  // If selected, show selected state
  if (selected) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-green)]/30">
          <div className="flex items-center gap-2">
            <span className="text-xs">💻</span>
            <span className="text-xs text-[var(--vl-text)] font-medium">{selected.fullName}</span>
            <span className="text-xs">{selected.isPrivate ? "🔒" : "🌐"}</span>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-[var(--vl-text3)] hover:text-[var(--vl-red)]"
          >
            ✕
          </button>
        </div>
        {selected.isPrivate && (
          <p className="text-[10px] text-[var(--vl-green)]">🔒 Privado — token configurado ✅</p>
        )}
      </div>
    );
  }

  // Error fallback: show manual input
  if (error) {
    return (
      <div className="space-y-2">
        <p className="text-[10px] text-[var(--vl-amber)]">
          ⚠️ Não foi possível carregar. Cole a URL:
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://github.com/usuario/projeto"
            value={fallbackUrl}
            onChange={(e) => setFallbackUrl(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-border)] text-sm text-[var(--vl-text)] placeholder:text-[var(--vl-text3)] focus:outline-none focus:border-[var(--vl-gold)]/50 transition-colors"
          />
          <button
            onClick={handleFallbackSubmit}
            disabled={!fallbackUrl.trim()}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-[var(--vl-gold)] text-[var(--vl-bg)] hover:bg-[var(--vl-gold2)] transition-colors disabled:opacity-50"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={fetchRepos}
        disabled={disabled || loading}
        className={`w-full py-2.5 px-4 rounded-lg border text-xs font-medium text-left transition-all ${
          disabled
            ? "opacity-50 cursor-not-allowed border-[var(--vl-border)] text-[var(--vl-text3)]"
            : "border-[var(--vl-border2)] text-[var(--vl-text2)] hover:border-[var(--vl-gold)] hover:text-[var(--vl-gold)]"
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-[var(--vl-gold)] border-t-transparent rounded-full animate-spin" />
            Carregando repositórios...
          </span>
        ) : (
          "💻 Selecionar repositório →"
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-[var(--vl-border)] bg-[var(--vl-card)] shadow-2xl overflow-hidden animate-fade-up">
          {/* Search */}
          <div className="p-2 border-b border-[var(--vl-border)]">
            <input
              type="text"
              placeholder="Buscar repositório..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-[var(--vl-bg2)] border border-[var(--vl-border)] text-xs text-[var(--vl-text)] placeholder:text-[var(--vl-text3)] focus:outline-none focus:border-[var(--vl-gold)]/50"
            />
          </div>

          {/* List */}
          <div className="max-h-[320px] overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-xs text-[var(--vl-text3)] text-center py-4">Nenhum repositório encontrado</p>
            )}
            {filtered.slice(0, 50).map((repo) => (
              <button
                key={repo.id}
                onClick={() => handleSelect(repo)}
                className="w-full text-left px-3 py-2.5 hover:bg-[var(--vl-bg2)] transition-colors border-b border-[var(--vl-border)] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{repo.private ? "🔒" : "🌐"}</span>
                  <span className="text-xs font-medium text-[var(--vl-text)] truncate">{repo.full_name}</span>
                  {repo.language && (
                    <span className="text-[10px] text-[var(--vl-text3)] shrink-0">{repo.language}</span>
                  )}
                  <span className="text-[10px] text-[var(--vl-text3)] ml-auto shrink-0">{formatDate(repo.updated_at)}</span>
                </div>
                {repo.description && (
                  <p className="text-[10px] text-[var(--vl-text3)] mt-0.5 truncate pl-5">{repo.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
