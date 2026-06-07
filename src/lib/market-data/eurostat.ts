import type { DataFetchResult } from '@/types';

// RCH_A = annual rate of change — Italy has data for this unit
const EUROSTAT_URL =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_a?geo=IT&unit=RCH_A';

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

    const getValue = (idx: number): number | null => {
      const v = Array.isArray(rawValues) ? rawValues[idx] : rawValues[String(idx)];
      return v != null ? Number(v) : null;
    };

    const timeIndex: Record<string, number> = timeDimension.index ?? {};
    const timeLabels: Record<string, string> = timeDimension.label ?? {};

    // RCH_A = annual rate of change (e.g. 3.2 means +3.2% YoY)
    const periods = Object.entries(timeIndex)
      .map(([period, idx]) => ({ period, value: getValue(idx) }))
      .filter((p) => p.value !== null)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (periods.length === 0) throw new Error('Ingen gyldige HPI-verdier for Italia');

    const latest = periods[periods.length - 1];

    return {
      data: {
        value: latest.value!,
        period: timeLabels[latest.period] ?? latest.period,
        yearOnYear: latest.value,  // value IS the YoY rate of change
      },
      status: 'success',
      source: 'Eurostat HPI Årsendring (PRC_HPI_A)',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Eurostat API error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'Eurostat HPI Årsendring (PRC_HPI_A)',
      errorMessage: `Kunne ikke hente boligprisindeks fra Eurostat: ${msg}. Oppgi verdien manuelt.`,
    };
  }
}
