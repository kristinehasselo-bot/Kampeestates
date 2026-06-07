'use client';

import { useEffect, useState } from 'react';
import type { RateHistoryPoint, DataFetchResult } from '@/types';

interface HistoryResult
  extends DataFetchResult<{ points: RateHistoryPoint[]; avg90d: number }> {}

function buildSparkline(points: RateHistoryPoint[], width = 20): string {
  if (points.length === 0) return '';

  // Sample evenly across all points to fit in `width` chars
  const rates = points.map((p) => p.rate);
  const min = Math.min(...rates);
  const max = Math.max(...rates);
  const range = max - min || 1;

  // Unicode block chars from low to high
  const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  // Pick `width` evenly-spaced samples
  const sampled: number[] = [];
  for (let i = 0; i < width; i++) {
    const idx = Math.round((i / (width - 1)) * (points.length - 1));
    sampled.push(rates[Math.min(idx, rates.length - 1)]);
  }

  return sampled
    .map((r) => {
      const normalised = (r - min) / range;
      const blockIdx = Math.min(
        Math.floor(normalised * blocks.length),
        blocks.length - 1
      );
      return blocks[blockIdx];
    })
    .join('');
}

export default function RateHistoryCard() {
  const [result, setResult] = useState<HistoryResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/exchange-rate/history');
        if (response.ok) {
          const data: HistoryResult = await response.json();
          setResult(data);
        } else {
          setResult({
            data: null,
            status: 'error',
            source: 'Norges Bank',
            errorMessage: 'Klarte ikke å hente kurshistorikk.',
          });
        }
      } catch {
        setResult({
          data: null,
          status: 'error',
          source: 'Norges Bank',
          errorMessage: 'Nettverksfeil.',
        });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const points = result?.data?.points ?? [];
  const avg90d = result?.data?.avg90d;
  const rates = points.map((p) => p.rate);
  const current = rates.length > 0 ? rates[rates.length - 1] : null;
  const high = rates.length > 0 ? Math.max(...rates) : null;
  const low = rates.length > 0 ? Math.min(...rates) : null;
  const sparkline = points.length > 1 ? buildSparkline(points, 20) : null;

  return (
    <div className="border border-brand-line-secondary p-5 bg-white mt-4">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-inter text-xs font-semibold text-brand-text-muted uppercase tracking-wider">
          EUR/NOK – 90 dager
        </h3>
        {result?.status === 'success' && (
          <span className="text-xs font-inter text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 leading-none">
            LIVE
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-3">
          <svg
            className="h-3.5 w-3.5 animate-spin text-brand-text-muted"
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
          <span className="text-xs font-inter text-brand-text-muted">Henter historikk…</span>
        </div>
      )}

      {!isLoading && result?.status === 'error' && (
        <p className="text-xs font-inter text-red-600 leading-relaxed">
          {result.errorMessage ?? 'Klarte ikke å hente historikk.'}
        </p>
      )}

      {!isLoading && result?.status === 'success' && points.length > 0 && (
        <>
          {/* Sparkline */}
          {sparkline && (
            <div
              className="font-mono text-brand-olive text-base leading-none tracking-tight mb-4 select-none overflow-hidden"
              title="EUR/NOK kursutvikling siste 90 dager"
              aria-label="Sparkline EUR/NOK"
            >
              {sparkline}
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                label: 'Gjeldende',
                value: current != null ? current.toFixed(4) : '–',
                highlight: true,
              },
              {
                label: '90d snitt',
                value: avg90d != null ? avg90d.toFixed(4) : '–',
                highlight: false,
              },
              {
                label: 'Høyeste',
                value: high != null ? high.toFixed(4) : '–',
                highlight: false,
              },
              {
                label: 'Laveste',
                value: low != null ? low.toFixed(4) : '–',
                highlight: false,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-brand-bg-secondary border border-brand-line-secondary px-3 py-2"
              >
                <p className="text-xs font-inter text-brand-text-muted uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p
                  className={`font-inter text-sm font-semibold tabular-nums ${
                    stat.highlight ? 'text-brand-burgundy' : 'text-brand-text-primary'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-2 text-xs font-inter text-brand-text-muted">
            {points.length} handelsdager · {points[0]?.date} – {points[points.length - 1]?.date}
          </p>
        </>
      )}
    </div>
  );
}
