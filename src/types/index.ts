export interface MarketData {
  eurNok: {
    rate: number | null;
    date: string | null;
    source: string;
    status: 'success' | 'error' | 'manual';
    errorMessage?: string;
  };
  italyHPI: {
    value: number | null;
    period: string | null;
    yearOnYear: number | null;
    source: string;
    status: 'success' | 'error' | 'manual';
    errorMessage?: string;
  };
  tuscanyData: {
    avgPricePerSqm: number | null;
    trend: string | null;
    source: string;
    status: 'success' | 'error' | 'manual';
    errorMessage?: string;
  };
  notionProperties: NotionProperty[];
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

export interface DataFetchResult<T> {
  data: T | null;
  status: 'success' | 'error' | 'manual';
  errorMessage?: string;
}
