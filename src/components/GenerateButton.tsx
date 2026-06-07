'use client';

import { useState } from 'react';
import { ReportData, MarketData } from '@/types';

interface GenerateButtonProps {
  reportData: ReportData;
  marketData: MarketData;
}

export default function GenerateButton({ reportData, marketData }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): string | null => {
    if (!reportData.edition.trim()) {
      return 'Fyll inn utgavenummer (f.eks. «Q2 2025») før du genererer rapporten.';
    }
    if (!reportData.date) {
      return 'Velg en rapportdato.';
    }
    if (!reportData.areaSpotlight.trim()) {
      return 'Fyll inn fokusområde for rapporten.';
    }
    return null;
  };

  const handleGenerate = async () => {
    setError(null);
    setSuccess(false);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reportData, marketData }),
      });

      if (!response.ok) {
        let errorMessage = 'Klarte ikke å generere PDF-rapporten.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Use default error message
        }
        throw new Error(errorMessage);
      }

      // Get the PDF blob and trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'kampe-estates-markedsrapport.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'En uventet feil oppsto under PDF-generering.';
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-inter"
        >
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Success */}
      {success && (
        <div
          role="status"
          className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 font-inter"
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          PDF-rapport generert og lastet ned!
        </div>
      )}

      {/* Generate button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base"
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Genererer PDF-rapport…
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Generer og last ned PDF-rapport
          </>
        )}
      </button>

      <p className="text-xs font-inter text-brand-text-muted text-center">
        Rapporten genereres som A4 PDF på norsk og lastes ned automatisk.
      </p>
    </div>
  );
}
