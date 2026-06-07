import { MarketData } from '@/types';
import { fetchEurNokRate } from './norges-bank';
import { fetchItalyHPI } from './eurostat';
import { fetchTuscanyData } from './banca-italia';
import { fetchNotionProperties } from '@/lib/notion';

export async function fetchAllMarketData(): Promise<MarketData> {
  const [eurNokResult, italyHPIResult, tuscanyResult, notionResult] =
    await Promise.allSettled([
      fetchEurNokRate(),
      fetchItalyHPI(),
      fetchTuscanyData(),
      fetchNotionProperties(),
    ]);

  const eurNok =
    eurNokResult.status === 'fulfilled'
      ? eurNokResult.value
      : {
          data: null,
          status: 'error' as const,
          source: 'Norges Bank Exchange Rate API',
          errorMessage: 'Ukjent feil ved henting av EUR/NOK-kurs.',
        };

  const italyHPI =
    italyHPIResult.status === 'fulfilled'
      ? italyHPIResult.value
      : {
          data: null,
          status: 'error' as const,
          source: 'Eurostat House Price Index (PRC_HPI_A)',
          errorMessage: 'Ukjent feil ved henting av Eurostat-data.',
        };

  const tuscanyData =
    tuscanyResult.status === 'fulfilled'
      ? tuscanyResult.value
      : {
          data: null,
          status: 'error' as const,
          source: 'Banca d\'Italia',
          errorMessage: 'Ukjent feil. Oppgi Toscana-data manuelt.',
        };

  const notionProperties =
    notionResult.status === 'fulfilled' ? notionResult.value.properties : [];
  const notionStatus =
    notionResult.status === 'fulfilled' ? notionResult.value.status : 'error';
  const notionError =
    notionResult.status === 'fulfilled'
      ? notionResult.value.errorMessage
      : 'Ukjent feil ved henting av eiendommer fra Notion.';

  return { eurNok, italyHPI, tuscanyData, notionProperties, notionStatus, notionError };
}

export { fetchEurNokRate } from './norges-bank';
export { fetchItalyHPI } from './eurostat';
export { fetchTuscanyData } from './banca-italia';
