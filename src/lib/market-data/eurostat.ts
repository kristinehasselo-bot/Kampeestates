import type { DataFetchResult } from '@/types';

// Eurostat: targeted query — only Italy (geo=IT) and annual rate of change (unit=RCH_A)
// With geo and unit fixed to single values, the flat JSON-stat array maps directly to time periods.
const EUROSTAT_URL =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/prc_hpi_a?format=JSON&geo=IT&unit=RCH_A&lastTimePeriod=5';

// OECD fallback
const OECD_URL =
  'https://stats.oecd.org/sdmx-json/data/HOUSE_PRICES/ITA.NHP.A/all?startTime=2015&format=json';

interface ItalyHPIData {
  value: number;
  period: string;
  yearOnYear: number | null;
}

async function tryEurostat(signal: AbortSignal): Promise<ItalyHPIData | null> {
  try {
    const response = await fetch(EUROSTAT_URL, {
      signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;

    const json = await response.json();

    const dimIds: string[] = json.id ?? [];
    const dimSizes: number[] = json.size ?? [];
    const rawValues = json.value;

    if (!rawValues || dimIds.length === 0) return null;

    // Time dimension
    const timeCat = json.dimension?.time?.category;
    const timeIndex: Record<string, number> = timeCat?.index ?? {};
    const timeLabels: Record<string, string> = timeCat?.label ?? {};
    const timeDimPos = dimIds.indexOf('time');
    if (timeDimPos === -1 || Object.keys(timeIndex).length === 0) return null;

    // Compute strides for flat-array indexing
    const strides = new Array(dimIds.length).fill(1);
    for (let i = dimIds.length - 2; i >= 0; i--) {
      strides[i] = strides[i + 1] * dimSizes[i + 1];
    }

    // Handle optional 'purchase' dimension (TOTAL vs. new/existing split)
    // geo=IT and unit=RCH_A are filtered to index 0, contributing 0 to flat index
    const purchaseCat = json.dimension?.purchase?.category;
    const purchaseIdxMap: Record<string, number> = purchaseCat?.index ?? {};
    const purchaseDimPos = dimIds.indexOf('purchase');
    const purchaseTotalPos = purchaseIdxMap['TOTAL'] ?? 0;

    const getVal = (flatIdx: number): number | null => {
      const v = Array.isArray(rawValues) ? rawValues[flatIdx] : rawValues[String(flatIdx)];
      return v != null && v !== '' && !isNaN(Number(v)) ? Number(v) : null;
    };

    const getValForTime = (tPos: number): number | null => {
      let flatIdx = tPos * strides[timeDimPos];
      if (purchaseDimPos >= 0) flatIdx += purchaseTotalPos * strides[purchaseDimPos];
      return getVal(flatIdx);
    };

    const periods = Object.entries(timeIndex)
      .map(([period, tPos]) => ({ period, value: getValForTime(tPos) }))
      .filter((p): p is { period: string; value: number } => p.value !== null)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (periods.length === 0) return null;

    const latest = periods[periods.length - 1];
    // RCH_A is already the annual rate of change (year-on-year %)
    return {
      value: latest.value,
      period: timeLabels[latest.period] ?? latest.period,
      yearOnYear: latest.value,
    };
  } catch {
    return null;
  }
}

async function tryOECD(signal: AbortSignal): Promise<ItalyHPIData | null> {
  try {
    const response = await fetch(OECD_URL, {
      signal,
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 },
    });
    if (!response.ok) return null;

    const json = await response.json();

    // OECD SDMX-JSON: observation dimensions — take first (usually TIME_PERIOD)
    const obsDims: { id: string; values: { id: string; name?: string }[] }[] =
      json.structure?.dimensions?.observation ?? [];
    const timeDim =
      obsDims.find((d) => ['TIME_PERIOD', 'TIME', 'PERIOD', 'YEAR'].includes(d.id)) ??
      obsDims[0];
    const timeValues = timeDim?.values ?? [];
    if (timeValues.length === 0) return null;

    const allSeries: Record<string, { observations: Record<string, unknown[]> }> =
      json.dataSets?.[0]?.series ?? {};
    const seriesKey = Object.keys(allSeries)[0];
    if (!seriesKey) return null;

    const observations = allSeries[seriesKey]?.observations ?? {};

    const dataPoints = Object.entries(observations)
      .map(([obsIdx, vals]) => {
        const period = timeValues[Number(obsIdx)]?.id;
        const rawVal = Array.isArray(vals) ? vals[0] : null;
        const value = rawVal != null && !isNaN(Number(rawVal)) ? Number(rawVal) : null;
        return { period, value };
      })
      .filter((p): p is { period: string; value: number } => p.period != null && p.value != null)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (dataPoints.length === 0) return null;

    const latest = dataPoints[dataPoints.length - 1];
    const previous = dataPoints.length >= 2 ? dataPoints[dataPoints.length - 2] : null;
    const yearOnYear =
      previous != null
        ? Number((((latest.value - previous.value) / previous.value) * 100).toFixed(1))
        : null;

    return { value: yearOnYear ?? 0, period: latest.period, yearOnYear };
  } catch {
    return null;
  }
}

export async function fetchItalyHPI(): Promise<DataFetchResult<ItalyHPIData>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    // Try Eurostat first (fastest, most authoritative for EU data)
    const eurostat = await tryEurostat(controller.signal);
    if (eurostat) {
      clearTimeout(timeoutId);
      return {
        data: eurostat,
        status: 'success',
        source: 'Eurostat PRC_HPI_A (Italia, RCH_A)',
      };
    }

    // Fallback: OECD
    const oecd = await tryOECD(controller.signal);
    if (oecd) {
      clearTimeout(timeoutId);
      return {
        data: oecd,
        status: 'success',
        source: 'OECD Boligprisindeks (NHP Italia)',
      };
    }

    throw new Error('Ingen gyldige data fra Eurostat eller OECD');
  } catch (error) {
    clearTimeout(timeoutId);
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('HPI fetch error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'Eurostat / OECD Boligprisindeks',
      errorMessage: `Henting feilet (${msg}). Oppgi årsendringen manuelt – se kildelenke nedenfor.`,
    };
  }
}
