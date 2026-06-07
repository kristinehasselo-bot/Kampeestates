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

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  url: string | null;
  lastEdited: string;
}

export interface RateHistoryPoint {
  date: string;
  rate: number;
}

export interface ArchiveEntry {
  id: string;
  edition: string;
  date: string;
  areaSpotlight: string;
  createdAt: string;
  notionUrl: string | null;
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
