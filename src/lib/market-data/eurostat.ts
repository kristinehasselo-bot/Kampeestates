import type { DataFetchResult } from '@/types';

// OECD Analytical House Prices — Italy, Nominal House Price Index, Annual
// More reliable than Eurostat PRC_HPI_A for country-level data
const OECD_URL =
  'https://stats.oecd.org/sdmx-json/data/HOUSE_PRICES/ITA.NHP.A/all?startTime=2015&format=json';

interface ItalyHPIData {
  value: number;
  period: string;
  yearOnYear: number | null;
}

export async function fetchItalyHPI(): Promise<DataFetchResult<ItalyHPIData>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(OECD_URL, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const json = await response.json();

    // OECD SDMX-JSON: structure.dimensions.observation[0] = TIME_PERIOD
    const obsDims: { id: string; values: { id: string; name?: string }[] }[] =
      json.structure?.dimensions?.observation ?? [];
    const timeDim = obsDims.find((d) => d.id === 'TIME_PERIOD');
    const timeValues = timeDim?.values ?? [];

    if (timeValues.length === 0) throw new Error('Ingen tidsperioder i OECD-svaret');

    // Single series: ITA.NHP.A → key is typically "0:0:0"
    const allSeries: Record<string, { observations: Record<string, unknown[]> }> =
      json.dataSets?.[0]?.series ?? {};
    const seriesKey = Object.keys(allSeries)[0];
    if (!seriesKey) throw new Error('Ingen seriedata funnet i OECD-svaret');

    const observations = allSeries[seriesKey]?.observations ?? {};

    // Build data points sorted chronologically
    const dataPoints = Object.entries(observations)
      .map(([obsIdx, vals]) => {
        const period = timeValues[Number(obsIdx)]?.id;
        const rawVal = Array.isArray(vals) ? vals[0] : null;
        const value = rawVal != null && !isNaN(Number(rawVal)) ? Number(rawVal) : null;
        return { period, value };
      })
      .filter((p): p is { period: string; value: number } => p.period != null && p.value != null)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (dataPoints.length === 0) throw new Error('Ingen gyldige HPI-verdier for Italia');

    const latest = dataPoints[dataPoints.length - 1];
    const previous = dataPoints.length >= 2 ? dataPoints[dataPoints.length - 2] : null;

    // NHP is an index — compute YoY% from consecutive index values
    const yearOnYear =
      previous != null
        ? Number((((latest.value - previous.value) / previous.value) * 100).toFixed(1))
        : null;

    return {
      data: {
        value: yearOnYear ?? 0,
        period: latest.period,
        yearOnYear,
      },
      status: 'success',
      source: 'OECD Boligprisindeks (NHP Italia)',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('OECD HPI fetch error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'OECD Boligprisindeks (NHP Italia)',
      errorMessage: `Kunne ikke hente boligprisindeks fra OECD: ${msg}. Oppgi verdien manuelt.`,
    };
  }
}
