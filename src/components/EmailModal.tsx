'use client';

import { useState, useEffect } from 'react';
import type { MarketData, ReportData } from '@/types';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData;
  marketData: MarketData;
}

export default function EmailModal({
  isOpen,
  onClose,
  reportData,
  marketData,
}: EmailModalProps) {
  const defaultSubject = `Kämpe Estates Markedsrapport – ${reportData.edition}`;
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState(defaultSubject);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Update subject when edition changes
  useEffect(() => {
    setSubject(`Kämpe Estates Markedsrapport – ${reportData.edition}`);
  }, [reportData.edition]);

  const handleClose = () => {
    if (!isSending) {
      setFeedback(null);
      onClose();
    }
  };

  const handleSend = async () => {
    setFeedback(null);

    if (!to.trim()) {
      setFeedback({ type: 'error', message: 'Vennligst oppgi en mottakeradresse.' });
      return;
    }

    if (!subject.trim()) {
      setFeedback({ type: 'error', message: 'Vennligst oppgi et emne.' });
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: to.trim(), subject: subject.trim(), reportData, marketData }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback({
          type: 'error',
          message: data.error ?? 'Klarte ikke å sende e-post. Prøv igjen.',
        });
      } else {
        setFeedback({
          type: 'success',
          message: `Rapporten ble sendt til ${to.trim()}.`,
        });
        setTo('');
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Nettverksfeil – prøv igjen.',
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white border border-brand-line-secondary w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="bg-brand-burgundy px-6 py-4 flex items-center justify-between">
          <div>
            <h2
              id="email-modal-title"
              className="font-inter text-sm font-bold tracking-wider text-white"
            >
              Send rapport på e-post
            </h2>
            <p className="font-inter text-xs text-white/60 mt-0.5">
              Genererer PDF og sender som vedlegg
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSending}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Lukk"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Report summary */}
          <div className="bg-brand-bg-secondary border border-brand-line-secondary px-4 py-3 text-xs font-inter space-y-1">
            <div className="flex justify-between">
              <span className="text-brand-text-muted">Utgave</span>
              <span className="text-brand-text-primary font-medium">{reportData.edition || '–'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-muted">Dato</span>
              <span className="text-brand-text-primary font-medium">
                {reportData.date
                  ? new Date(reportData.date).toLocaleDateString('nb-NO')
                  : '–'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-text-muted">Fokusområde</span>
              <span className="text-brand-text-primary font-medium">{reportData.areaSpotlight || '–'}</span>
            </div>
          </div>

          {/* To field */}
          <div>
            <label
              htmlFor="email-to"
              className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1.5"
            >
              Mottaker
            </label>
            <input
              id="email-to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="mottaker@eksempel.no"
              disabled={isSending}
              className="input-field"
            />
          </div>

          {/* Subject field */}
          <div>
            <label
              htmlFor="email-subject"
              className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1.5"
            >
              Emne
            </label>
            <input
              id="email-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending}
              className="input-field"
            />
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`px-4 py-3 text-xs font-inter leading-relaxed ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSending}
            className="flex-1 px-4 py-2.5 text-sm font-inter font-medium border border-brand-line-primary text-brand-text-secondary hover:bg-brand-bg-secondary transition-colors"
          >
            Avbryt
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || !to.trim()}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-inter font-medium transition-colors ${
              isSending || !to.trim()
                ? 'bg-brand-text-muted text-white cursor-not-allowed'
                : 'bg-brand-burgundy text-white hover:bg-[#3D1820]'
            }`}
          >
            {isSending ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
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
                Sender…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send rapport
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
