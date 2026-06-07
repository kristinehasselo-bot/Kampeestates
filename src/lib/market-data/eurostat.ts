import type { DataFetchResult } from '@/types';

// No unit filter — let Eurostat return whatever units Italy has data for,
// then we pick the best one with proper multi-dimensional index calculation.
const EUROSTAT_URL =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_a?geo=IT&sinceTimePeriod=2010';

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

    // JSON-stat standard fields for dimension/size layout
    const dimIds: string[] = json.id ?? [];
    const dimSizes: number[] = json.size ?? [];
    const rawValues = json.value;
    const dimensions = json.dimension ?? {};

    if (!rawValues || dimIds.length === 0) {
      throw new Error('Uventet dataformat fra Eurostat (mangler id/value)');
    }

    // Compute strides for flat-array indexing
    const strides: number[] = new Array(dimIds.length).fill(1);
    for (let i = dimIds.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * dimSizes[i + 1];
    }

    const getFlatIndex = (dimMap: Record<string, number>): number =>
      dimIds.reduce((sum, id, i) => sum + (dimMap[id] ?? 0) * strides[i], 0);

    const getVal = (flatIdx: number): number | null => {
      const v = Array.isArray(rawValues) ? rawValues[flatIdx] : rawValues[String(flatIdx)];
      return v != null && v !== '' && !isNaN(Number(v)) ? Number(v) : null;
    };

    // Time dimension
    const timeCat = dimensions.time?.category;
    if (!timeCat) throw new Error('Ingen tidsdimensjon funnet i Eurostat-svaret');
    const timeIndex: Record<string, number> = timeCat.index ?? {};
    const timeLabels: Record<string, string> = timeCat.label ?? {};
    const hasTimeDim = dimIds.includes('time');

    // Unit dimension (may or may not exist after filtering)
    const unitCat = dimensions.unit?.category;
    const unitIndex: Record<string, number> = unitCat?.index ?? {};
    const hasUnitDim = dimIds.includes('unit') && Object.keys(unitIndex).length > 0;

    // Try units in preferred order: rate-of-change first, then index units
    const PREF = ['RCH_A', 'I15_A', 'I10_A', 'I05_A'];
    const unitsToTry: (string | null)[] = hasUnitDim
      ? [
          ...PREF.filter((u) => u in unitIndex),
          ...Object.keys(unitIndex).filter((u) => !PREF.includes(u)),
        ]
      : [null];

    for (const unit of unitsToTry) {
      const uIdx = unit != null && hasUnitDim ? unitIndex[unit] : 0;

      const periods = Object.entries(timeIndex)
        .map(([period, tIdx]) => {
          const dimMap: Record<string, number> = {};
          if (hasTimeDim) dimMap.time = tIdx;
          if (hasUnitDim) dimMap.unit = uIdx;
          return { period, value: getVal(getFlatIndex(dimMap)) };
        })
        .filter((p): p is { period: string; value: number } => p.value !== null)
        .sort((a, b) => a.period.localeCompare(b.period));

      if (periods.length === 0) continue;

      const latest = periods[periods.length - 1];
      const previous = periods.length >= 2 ? periods[periods.length - 2] : null;
      const isRateOfChange = unit === 'RCH_A';

      let displayValue: number;
      let yearOnYear: number | null;

      if (isRateOfChange) {
        displayValue = latest.value;
        yearOnYear = latest.value;
      } else if (previous != null) {
        yearOnYear = Number(
          (((latest.value - previous.value) / previous.value) * 100).toFixed(1)
        );
        displayValue = yearOnYear;
      } else {
        displayValue = latest.value;
        yearOnYear = null;
      }

      return {
        data: {
          value: displayValue,
          period: timeLabels[latest.period] ?? latest.period,
          yearOnYear,
        },
        status: 'success',
        source: `Eurostat HPI PRC_HPI_A${unit ? ` (${unit})` : ''}`,
      };
    }

    throw new Error('Ingen gyldige HPI-verdier for Italia funnet i noen enhet');
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
