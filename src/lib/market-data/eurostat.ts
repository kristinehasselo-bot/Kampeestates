const EUROSTAT_URL =
  'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/PRC_HPI_A?geo=IT&unit=I15_A&filterNonGeo=1';

interface EurostatResult {
  value: number | null;
  period: string | null;
  yearOnYear: number | null;
  source: string;
  status: 'success' | 'error' | 'manual';
  errorMessage?: string;
}

export async function fetchItalyHPI(): Promise<EurostatResult> {
  const source = 'Eurostat House Price Index (PRC_HPI_A)';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(EUROSTAT_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'KampeEstates/1.0 (market-report-tool)',
      },
      next: { revalidate: 86400 }, // Cache for 24 hours - annual data
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Eurostat JSON-stat format parsing
    // Structure: data.value (object keyed by index), data.dimension.time.category.index
    const values = data?.value;
    const timeDimension = data?.dimension?.time?.category;

    if (!values || !timeDimension) {
      throw new Error('Uventet dataformat fra Eurostat');
    }

    const timeIndex = timeDimension.index || {};
    const timeLabels = timeDimension.label || {};

    // Build sorted list of (period, value) pairs
    const periods: Array<{ period: string; index: number; value: number | null }> = [];

    for (const [period, idx] of Object.entries(timeIndex)) {
      const val = values[String(idx)];
      periods.push({
        period,
        index: idx as number,
        value: val !== undefined && val !== null ? Number(val) : null,
      });
    }

    // Sort by period (ascending)
    periods.sort((a, b) => a.period.localeCompare(b.period));

    // Get the two most recent periods with actual values
    const validPeriods = periods.filter((p) => p.value !== null);

    if (validPeriods.length === 0) {
      throw new Error('Ingen gyldige HPI-verdier funnet for Italia');
    }

    const latest = validPeriods[validPeriods.length - 1];
    const previous = validPeriods.length >= 2 ? validPeriods[validPeriods.length - 2] : null;

    // Year-on-year change in index points (since it's already an index)
    let yearOnYear: number | null = null;
    if (previous && previous.value !== null && latest.value !== null) {
      yearOnYear = Number(((latest.value - previous.value) / previous.value * 100).toFixed(1));
    }

    const periodLabel = timeLabels[latest.period] || latest.period;

    return {
      value: latest.value,
      period: periodLabel,
      yearOnYear,
      source,
      status: 'success',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Ukjent feil ved henting av Eurostat-data';

    console.error('Eurostat API error:', errorMessage);

    return {
      value: null,
      period: null,
      yearOnYear: null,
      source,
      status: 'error',
      errorMessage: `Kunne ikke hente boligprisindeks fra Eurostat: ${errorMessage}. Vennligst oppgi indeksverdien manuelt.`,
    };
  }
}
