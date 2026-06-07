import type { DataFetchResult } from '@/types';

const EUROSTAT_URL =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_a?geo=IT&unit=I15_A';

interface ItalyHPIData {
  value: number;
  period: string;
  yearOnYear: number | null;
}

export async function fetchItalyHPI(): Promise<DataFetchResult<ItalyHPIData>> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(EUROSTAT_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'KampeEstates/1.0 (market-report-tool)',
      },
      next: { revalidate: 86400 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const json = await response.json();

    const rawValues = json?.value;
    const timeDimension = json?.dimension?.time?.category;
    if (rawValues == null || !timeDimension) throw new Error('Uventet dataformat fra Eurostat');

    // Eurostat may return values as array or as object with numeric string keys
    const getValue = (idx: number): number | null => {
      const v = Array.isArray(rawValues) ? rawValues[idx] : rawValues[String(idx)];
      return v != null ? Number(v) : null;
    };

    const timeIndex: Record<string, number> = timeDimension.index ?? {};
    const timeLabels: Record<string, string> = timeDimension.label ?? {};

    const periods = Object.entries(timeIndex)
      .map(([period, idx]) => ({
        period,
        value: getValue(idx),
      }))
      .filter((p) => p.value !== null)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (periods.length === 0) throw new Error('Ingen gyldige HPI-verdier for Italia');

    const latest = periods[periods.length - 1];
    const previous = periods.length >= 2 ? periods[periods.length - 2] : null;

    const yearOnYear =
      previous?.value != null && latest.value != null
        ? Number(((latest.value! - previous.value) / previous.value * 100).toFixed(1))
        : null;

    return {
      data: {
        value: latest.value!,
        period: timeLabels[latest.period] ?? latest.period,
        yearOnYear,
      },
      status: 'success',
      source: 'Eurostat House Price Index (PRC_HPI_A)',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Eurostat API error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'Eurostat House Price Index (PRC_HPI_A)',
      errorMessage: `Kunne ikke hente boligprisindeks fra Eurostat: ${msg}. Oppgi verdien manuelt.`,
    };
  }
}
