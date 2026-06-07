import type { DataFetchResult, TuscanyData } from '@/types';

const BANCA_ITALIA_URL =
  'https://www.bancaditalia.it/statistiche/tematiche/moneta-credito-liquidita/index.html';

export async function fetchTuscanyData(): Promise<DataFetchResult<TuscanyData>> {
  // Banca d'Italia has no structured public API for regional housing price data.
  // Data must be retrieved manually from their statistical publications.
  return {
    data: null,
    status: 'manual',
    source: "Banca d'Italia – Statistikk for boligmarkedet",
    errorMessage:
      "Banca d'Italia har ikke et åpent API for Toscana-data. " +
      `Gå til ${BANCA_ITALIA_URL} og oppgi gjennomsnittlig pris per kvm i euro-feltet nedenfor.`,
  };
}
