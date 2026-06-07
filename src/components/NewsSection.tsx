'use client';

import { useEffect, useState } from 'react';
import type { NewsArticle, DataFetchResult } from '@/types';
import DataStatusBadge from './DataStatusBadge';

interface NewsResult extends DataFetchResult<{ articles: NewsArticle[] }> {}

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'I dag';
    if (diffDays === 1) return 'I går';
    if (diffDays < 7) return `${diffDays} dager siden`;
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
}

export default function NewsSection() {
  const [result, setResult] = useState<NewsResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (response.ok) {
          const data: NewsResult = await response.json();
          setResult(data);
        } else {
          setResult({
            data: null,
            status: 'error',
            source: 'NewsAPI.org',
            errorMessage: 'Klarte ikke å hente nyheter.',
          });
        }
      } catch {
        setResult({
          data: null,
          status: 'error',
          source: 'NewsAPI.org',
          errorMessage: 'Nettverksfeil ved henting av nyheter.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, []);

  const articles = (result?.data?.articles ?? []).slice(0, 6);

  return (
    <div className="bg-white border border-brand-line-secondary p-5 mt-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-inter text-sm font-semibold text-brand-text-primary">
            Aktuelle nyheter
          </h3>
          {result && (
            <DataStatusBadge
              status={result.status}
              message={result.errorMessage}
              compact
            />
          )}
        </div>
        {articles.length > 0 && (
          <span className="text-xs font-inter text-brand-text-muted">
            {articles.length} artikler
          </span>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 py-4">
          <svg
            className="h-4 w-4 animate-spin text-brand-text-muted"
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
          <span className="text-xs font-inter text-brand-text-muted">
            Henter nyheter…
          </span>
        </div>
      )}

      {!isLoading && result?.status === 'manual' && (
        <div className="bg-blue-50 border border-blue-200 px-4 py-3 text-xs font-inter text-blue-700 leading-relaxed">
          <strong>Nyheter ikke konfigurert.</strong>{' '}
          {result.errorMessage}
        </div>
      )}

      {!isLoading && result?.status === 'error' && (
        <div className="bg-red-50 border border-red-200 px-4 py-3 text-xs font-inter text-red-700 leading-relaxed">
          {result.errorMessage ?? 'Klarte ikke å hente nyheter.'}
        </div>
      )}

      {!isLoading && articles.length > 0 && (
        <ul className="divide-y divide-brand-line-secondary">
          {articles.map((article, idx) => (
            <li key={`${article.url}-${idx}`} className="py-3 first:pt-0 last:pb-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
              >
                <p className="text-sm font-inter font-medium text-brand-text-primary group-hover:text-brand-burgundy transition-colors leading-snug mb-1">
                  {article.title}
                </p>
                {article.description && (
                  <p className="text-xs font-inter text-brand-text-muted leading-relaxed line-clamp-2 mb-1.5">
                    {article.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs font-inter text-brand-text-muted">
                  <span className="font-medium text-brand-text-secondary">
                    {article.source}
                  </span>
                  <span>·</span>
                  <span>{formatRelativeDate(article.publishedAt)}</span>
                  <span
                    className="ml-auto text-brand-burgundy opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && result?.status === 'success' && articles.length === 0 && (
        <p className="text-xs font-inter text-brand-text-muted py-4 text-center">
          Ingen nyhetsartikler funnet for øyeblikket.
        </p>
      )}
    </div>
  );
}
