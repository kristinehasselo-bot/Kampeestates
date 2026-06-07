import type { DataFetchResult, NewsArticle } from '@/types';

interface NewsAPIArticle {
  title: string;
  description: string | null;
  url: string;
  publishedAt: string;
  source: { name: string };
}

interface NewsAPIResponse {
  status: string;
  articles: NewsAPIArticle[];
}

export async function fetchNews(): Promise<DataFetchResult<{ articles: NewsArticle[] }>> {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    return {
      data: null,
      status: 'manual',
      source: 'NewsAPI.org',
      errorMessage:
        'NEWSAPI_KEY er ikke konfigurert. Opprett en gratis konto på newsapi.org og legg til nøkkelen i miljøvariablene for å aktivere automatiske nyheter.',
    };
  }

  const fetchArticles = async (
    query: string,
    language: string
  ): Promise<NewsAPIArticle[]> => {
    const url =
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}` +
      `&language=${language}&sortBy=publishedAt&pageSize=${language === 'it' ? 5 : 8}` +
      `&apiKey=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
        next: { revalidate: 1800 },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`NewsAPI error (${language}): HTTP ${response.status}`);
        return [];
      }

      const json: NewsAPIResponse = await response.json();
      if (json.status !== 'ok') return [];
      return json.articles ?? [];
    } catch (err) {
      clearTimeout(timeoutId);
      console.error(`NewsAPI fetch error (${language}):`, err);
      return [];
    }
  };

  try {
    const [enArticles, itArticles] = await Promise.all([
      fetchArticles('Italy real estate Tuscany property', 'en'),
      fetchArticles('mercato immobiliare Italia Toscana', 'it'),
    ]);

    const allRaw = [...enArticles, ...itArticles];

    const seen = new Set<string>();
    const articles: NewsArticle[] = allRaw
      .filter((a) => {
        if (!a.url || seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
      })
      .map((a) => ({
        title: a.title,
        description: a.description ?? null,
        url: a.url,
        publishedAt: a.publishedAt,
        source: a.source?.name ?? 'Ukjent kilde',
      }))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

    return {
      data: { articles },
      status: 'success',
      source: 'NewsAPI.org',
    };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('NewsAPI error:', msg);
    return {
      data: null,
      status: 'error',
      source: 'NewsAPI.org',
      errorMessage: `Kunne ikke hente nyheter: ${msg}`,
    };
  }
}
