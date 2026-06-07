export interface DataFetchResult<T> {
  data: T | null;
  status: 'success' | 'error' | 'manual';
  source: string;
  errorMessage?: string;
}

export interface EurNokData {
  rate: number;
  date: string;
}

export interface ItalyHPIData {
  value: number;
  period: string;
  yearOnYear: number | null;
}

export interface TuscanyData {
  avgPricePerSqm: number;
  trend: string;
}

export interface MarketData {
  eurNok: DataFetchResult<EurNokData>;
  italyHPI: DataFetchResult<ItalyHPIData>;
  tuscanyData: DataFetchResult<TuscanyData>;
  notionProperties: NotionProperty[];
  notionStatus: 'success' | 'error';
  notionError?: string;
}

export interface NotionProperty {
  id: string;
  address: string;
  area: string;
  price: number | null;
  currency: string;
  sqm: number | null;
  status: string;
  url: string | null;
}

export interface ReportData {
  edition: string;
  date: string;
  areaSpotlight: string;
  sections: {
    italyOverview: string;
    tuscanyFocus: string;
    norwegianBuyers: string;
    areaSpotlight: string;
    editorialComment: string;
  };
  manualData: {
    eurNok?: number;
    italyHPI?: number;
    tuscanyAvgPrice?: number;
  };
}
