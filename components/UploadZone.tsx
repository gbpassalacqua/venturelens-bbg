"use client";

import { useCallback, useState } from "react";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
];

export default function UploadZone({ onFileSelected, isLoading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Envie um arquivo PDF, DOCX ou TXT.");
        return;
      }
      setFileName(file.name);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) handleFile(e.target.files[0]);
    },
    [handleFile]
  );

  return (
    <div
      className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
        dragActive
          ? "border-[var(--vl-gold)] bg-[var(--vl-gold)]/5"
          : "border-[var(--vl-border2)] hover:border-[var(--vl-gold)]/50"
      } bg-[var(--vl-card)]`}
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center py-12 gap-3 cursor-pointer">
        <span className="text-5xl">📄</span>
        <p className="text-lg font-medium text-[var(--vl-text)]">
          {fileName ?? "Arraste seu PRD aqui"}
        </p>
        <p className="text-sm text-[var(--vl-text3)]">PDF, DOCX ou TXT</p>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
}
