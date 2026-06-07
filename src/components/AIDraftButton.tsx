'use client';

import { useState } from 'react';
import type { MarketData, ReportData } from '@/types';

interface AIDraftButtonProps {
  section: keyof ReportData['sections'];
  reportData: ReportData;
  marketData: MarketData;
  onDraftGenerated: (draft: string) => void;
}

export default function AIDraftButton({
  section,
  reportData,
  marketData,
  onDraftGenerated,
}: AIDraftButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, reportData, marketData }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Klarte ikke å generere utkast.');
        return;
      }

      onDraftGenerated(data.draft as string);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Nettverksfeil – prøv igjen.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        title="Generer AI-utkast for dette avsnittet"
        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-inter font-medium rounded-sm border transition-colors ${
          isLoading
            ? 'bg-brand-bg-secondary border-brand-line-primary text-brand-text-muted cursor-not-allowed'
            : 'bg-brand-bg-secondary border-brand-line-primary text-brand-olive hover:bg-[#3F4A3F] hover:text-white hover:border-[#3F4A3F]'
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="h-3 w-3 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Genererer…
          </>
        ) : (
          <>
            <span aria-hidden="true">✨</span>
            AI-utkast
          </>
        )}
      </button>
      {error && (
        <p className="text-xs font-inter text-red-600 max-w-xs text-right leading-snug">
          {error}
        </p>
      )}
    </div>
  );
}
