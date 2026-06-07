import type { DataFetchResult, RateHistoryPoint } from '@/types';

const NORGES_BANK_URL =
  'https://data.norges-bank.no/api/data/EXR/B.EUR.NOK.SP?format=sdmx-json&lastNObservations=1';

interface EurNokData {
  rate: number;
  date: string;
}

export async function fetchEurNokRate(): Promise<DataFetchResult<EurNokData>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(NORGES_BANK_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    const series = json?.dataSets?.[0]?.series;
    if (!series) throw new Error('Ingen tidsserier i svaret fra Norges Bank');

    const observations = series[Object.keys(series)[0]]?.observations;
    if (!observations) throw new Error('Ingen observasjoner funnet');

    const obsKeys = Object.keys(observations);
    if (obsKeys.length === 0) throw new Error('Tom observasjonsliste');

    const latestKey = obsKeys[obsKeys.length - 1];
    const rate = observations[latestKey]?.[0];

    if (rate == null || isNaN(Number(rate))) throw new Error('Ugyldig valutakurs');

    const timeDimension = json?.structure?.dimensions?.observation?.find(
      (d: { id: string }) => d.id === 'TIME_PERIOD'
    );
    const dateValue =
      timeDimension?.values?.[parseInt(latestKey)]?.id ??
      new Date().toISOString().split('T')[0];

    return {
      data: { rate: Number(rate), date: dateValue },
      status: 'success',
      source: 'Norges Bank Exchange Rate API',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Norges Bank API error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'Norges Bank Exchange Rate API',
      errorMessage: `Kunne ikke hente EUR/NOK-kurs: ${msg}. Oppgi kursen manuelt.`,
    };
  }
}

export async function fetchEurNokHistory(): Promise<
  DataFetchResult<{ points: RateHistoryPoint[]; avg90d: number }>
> {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const url =
      `https://data.norges-bank.no/api/data/EXR/B.EUR.NOK.SP?format=sdmx-json` +
      `&startPeriod=${fmt(startDate)}&endPeriod=${fmt(endDate)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();

    const series = json?.dataSets?.[0]?.series;
    if (!series) throw new Error('Ingen tidsserier i svaret fra Norges Bank');

    const observations = series[Object.keys(series)[0]]?.observations;
    if (!observations) throw new Error('Ingen observasjoner funnet');

    const timeDimension = json?.structure?.dimensions?.observation?.find(
      (d: { id: string }) => d.id === 'TIME_PERIOD'
    );

    const dateValues: Record<string, string> = {};
    if (timeDimension?.values) {
      timeDimension.values.forEach((v: { id: string }, idx: number) => {
        dateValues[String(idx)] = v.id;
      });
    }

    const points: RateHistoryPoint[] = Object.entries(observations)
      .map(([key, val]) => {
        const rate = (val as number[])[0];
        const date = dateValues[key] ?? '';
        return { date, rate: Number(rate) };
      })
      .filter((p) => p.date && !isNaN(p.rate))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (points.length === 0) throw new Error('Ingen historikkpunkter funnet');

    const avg90d =
      points.reduce((sum, p) => sum + p.rate, 0) / points.length;

    return {
      data: { points, avg90d: Math.round(avg90d * 10000) / 10000 },
      status: 'success',
      source: 'Norges Bank Exchange Rate API (90 dager)',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Norges Bank history API error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'Norges Bank Exchange Rate API (90 dager)',
      errorMessage: `Kunne ikke hente EUR/NOK historikk: ${msg}`,
    };
  }
}
