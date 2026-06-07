const NORGES_BANK_URL =
  'https://data.norges-bank.no/api/data/EXR/B.EUR.NOK.SP?format=sdmx-json&lastNObservations=1';

interface NorgesBankResult {
  rate: number | null;
  date: string | null;
  source: string;
  status: 'success' | 'error' | 'manual';
  errorMessage?: string;
}

export async function fetchEurNokRate(): Promise<NorgesBankResult> {
  const source = 'Norges Bank Exchange Rate API';

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(NORGES_BANK_URL, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse SDMX-JSON format from Norges Bank
    // Structure: data.dataSets[0].series["0:0:0:0"].observations
    const dataSets = data?.dataSets;
    if (!dataSets || dataSets.length === 0) {
      throw new Error('Ingen datasett i svaret fra Norges Bank');
    }

    const series = dataSets[0]?.series;
    if (!series) {
      throw new Error('Ingen tidsserier i svaret fra Norges Bank');
    }

    // Get the first (and only) series
    const seriesKey = Object.keys(series)[0];
    const observations = series[seriesKey]?.observations;

    if (!observations) {
      throw new Error('Ingen observasjoner funnet i tidsserien');
    }

    const obsKeys = Object.keys(observations);
    if (obsKeys.length === 0) {
      throw new Error('Tom observasjonsliste fra Norges Bank');
    }

    // Get the latest observation
    const latestKey = obsKeys[obsKeys.length - 1];
    const latestObs = observations[latestKey];
    const rate = latestObs?.[0];

    if (rate === null || rate === undefined || isNaN(Number(rate))) {
      throw new Error('Ugyldig valutakurs i svaret');
    }

    // Get date from structure
    const structure = data?.structure;
    const timeDimension = structure?.dimensions?.observation?.find(
      (d: { id: string }) => d.id === 'TIME_PERIOD'
    );
    const dateValues = timeDimension?.values || [];
    const dateValue = dateValues[parseInt(latestKey)]?.id || dateValues[parseInt(latestKey)]?.name;

    return {
      rate: Number(rate),
      date: dateValue || new Date().toISOString().split('T')[0],
      source,
      status: 'success',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Ukjent feil ved henting av valutakurs';

    console.error('Norges Bank API error:', errorMessage);

    return {
      rate: null,
      date: null,
      source,
      status: 'error',
      errorMessage: `Kunne ikke hente EUR/NOK-kurs fra Norges Bank: ${errorMessage}. Vennligst oppgi kursen manuelt.`,
    };
  }
}
