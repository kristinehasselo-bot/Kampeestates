import type { DataFetchResult } from '@/types';

const NORGES_BANK_URL =
  'https://data.norges-bank.no/api/data/EXR/B.EUR.NOK.SP?format=sdmx-json&lastNObservations=1';

interface EurNokData {
  rate: number;
  date: string;
}

export async function fetchEurNokRate(): Promise<DataFetchResult<EurNokData>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
