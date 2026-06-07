'use client';

import { useState } from 'react';
import { ReportData, MarketData } from '@/types';

interface GenerateButtonProps {
  reportData: ReportData;
  marketData: MarketData;
}

export default function GenerateButton({ reportData, marketData }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
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

  const fetchPdfBlob = async (): Promise<{ blob: Blob; filename: string } | null> => {
    const response = await fetch('/api/generate-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportData, marketData }),
    });

    if (!response.ok) {
      let errorMessage = 'Klarte ikke å generere PDF-rapporten.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch { /* use default */ }
      throw new Error(errorMessage);
    }

    const blob = await response.blob();
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'kampe-estates-markedsrapport.pdf';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match?.[1]) filename = match[1];
    }
    return { blob, filename };
  };

  const handlePreview = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setIsPreviewing(true);
    try {
      const result = await fetchPdfBlob();
      if (!result) return;
      const url = URL.createObjectURL(result.blob);
      window.open(url, '_blank');
      // Keep the URL alive for a few minutes so the tab can load it
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Feil ved forhåndsvisning.');
    } finally {
      setIsPreviewing(false);
    }
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
      const result = await fetchPdfBlob();
      if (!result) return;
      const { blob, filename } = result;
      const url = URL.createObjectURL(blob);

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
      setError(err instanceof Error ? err.message : 'En uventet feil oppsto under PDF-generering.');
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

      {/* Preview button */}
      <button
        type="button"
        onClick={handlePreview}
        disabled={isPreviewing || isGenerating}
        className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-inter font-medium border border-brand-line-primary text-brand-text-secondary hover:bg-brand-bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPreviewing ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Forbereder forhåndsvisning…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Forhåndsvis PDF i ny fane
          </>
        )}
      </button>

      {/* Generate / download button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || isPreviewing}
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Genererer PDF-rapport…
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Last ned PDF-rapport
          </>
        )}
      </button>

      <p className="text-xs font-inter text-brand-text-muted text-center">
        A4-format på norsk · Forhåndsvis i nettleser eller last ned direkte
      </p>
    </div>
  );
}
