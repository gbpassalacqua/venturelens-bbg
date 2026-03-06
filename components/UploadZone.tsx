"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

export default function UploadZone({
  onFileSelected,
  isLoading,
}: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Please upload a PDF, DOCX, or TXT file.");
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
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        dragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="text-4xl">📄</div>
        <div className="text-center">
          <p className="text-lg font-medium">
            {fileName ?? "Drop your pitch deck here"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            PDF, DOCX, or TXT — max 10MB
          </p>
        </div>
        <label>
          <Button variant="outline" disabled={isLoading} asChild>
            <span>{isLoading ? "Analyzing..." : "Browse files"}</span>
          </Button>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleChange}
            disabled={isLoading}
          />
        </label>
      </CardContent>
    </Card>
  );
}
