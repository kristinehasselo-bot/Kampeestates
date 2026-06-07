import type { DataFetchResult, RateHistoryPoint } from '@/types';

// Frankfurter.app — ECB data, free, no API key, fast
const BASE = 'https://api.frankfurter.app';

interface EurNokData {
  rate: number;
  date: string;
}

export async function fetchEurNokRate(): Promise<DataFetchResult<EurNokData>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(`${BASE}/latest?from=EUR&to=NOK`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const json = await response.json();
    const rate = json?.rates?.NOK;
    const date = json?.date;

    if (rate == null || isNaN(Number(rate))) throw new Error('Ugyldig valutakurs i svar');

    return {
      data: { rate: Number(rate), date: date ?? new Date().toISOString().split('T')[0] },
      status: 'success',
      source: 'ECB via Frankfurter.app',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('EUR/NOK fetch error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'ECB via Frankfurter.app',
      errorMessage: `Kunne ikke hente EUR/NOK-kurs: ${msg}. Oppgi kursen manuelt.`,
    };
  }
}

export async function fetchEurNokHistory(): Promise<
  DataFetchResult<{ points: RateHistoryPoint[]; avg90d: number }>
> {
  try {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 90);

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const url = `${BASE}/${fmt(start)}..${fmt(end)}?from=EUR&to=NOK`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const json = await response.json();

    const rawRates: Record<string, { NOK: number }> = json?.rates ?? {};
    const points: RateHistoryPoint[] = Object.entries(rawRates)
      .map(([date, rates]) => ({ date, rate: Number(rates.NOK) }))
      .filter((p) => p.date && !isNaN(p.rate))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (points.length === 0) throw new Error('Ingen historikkpunkter funnet');

    const avg90d = points.reduce((sum, p) => sum + p.rate, 0) / points.length;

    return {
      data: { points, avg90d: Math.round(avg90d * 10000) / 10000 },
      status: 'success',
      source: 'ECB via Frankfurter.app (90 dager)',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('EUR/NOK history error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'ECB via Frankfurter.app (90 dager)',
      errorMessage: `Kunne ikke hente EUR/NOK historikk: ${msg}`,
    };
  }
}
