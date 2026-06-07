import type { DataFetchResult, RateHistoryPoint } from '@/types';

// ECB Data Portal — D.NOK.EUR.SP00.A = daily spot EUR/NOK average
// Value: how many NOK per 1 EUR (e.g. 11.52)
const ECB_SPOT_URL =
  'https://data-api.ecb.europa.eu/service/data/EXR/D.NOK.EUR.SP00.A?format=jsondata&lastNObservations=1';

interface EurNokData {
  rate: number;
  date: string;
}

function parseEcbSdmxJson(json: any): { rate: number; date: string } {
  const series = json?.dataSets?.[0]?.series;
  if (!series) throw new Error('Ingen tidsserier i svaret fra ECB');

  const seriesKey = Object.keys(series)[0];
  const observations = series[seriesKey]?.observations;
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

  return { rate: Number(rate), date: dateValue };
}

export async function fetchEurNokRate(): Promise<DataFetchResult<EurNokData>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(ECB_SPOT_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    const { rate, date } = parseEcbSdmxJson(json);

    return {
      data: { rate, date },
      status: 'success',
      source: 'ECB (European Central Bank) – EUR/NOK dagskurs',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('ECB EUR/NOK API error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'ECB (European Central Bank) – EUR/NOK dagskurs',
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
      `https://data-api.ecb.europa.eu/service/data/EXR/D.NOK.EUR.SP00.A?format=jsondata` +
      `&startPeriod=${fmt(startDate)}&endPeriod=${fmt(endDate)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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
    if (!series) throw new Error('Ingen tidsserier i svaret fra ECB');

    const seriesKey = Object.keys(series)[0];
    const observations = series[seriesKey]?.observations;
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

    const avg90d = points.reduce((sum, p) => sum + p.rate, 0) / points.length;

    return {
      data: { points, avg90d: Math.round(avg90d * 10000) / 10000 },
      status: 'success',
      source: 'ECB (European Central Bank) – EUR/NOK 90 dager',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('ECB EUR/NOK history API error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'ECB (European Central Bank) – EUR/NOK 90 dager',
      errorMessage: `Kunne ikke hente EUR/NOK historikk: ${msg}`,
    };
  }
}
