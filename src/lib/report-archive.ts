import type { ReportData, ArchiveEntry } from '@/types';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_ARCHIVE_DB_ID = process.env.NOTION_ARCHIVE_DB_ID;

interface NotionPage {
  id: string;
  url: string;
  created_time: string;
  properties: Record<string, {
    type: string;
    title?: Array<{ plain_text: string }>;
    rich_text?: Array<{ plain_text: string }>;
    date?: { start: string };
  }>;
}

function extractText(
  prop: { title?: Array<{ plain_text: string }>; rich_text?: Array<{ plain_text: string }> } | undefined,
  type: 'title' | 'rich_text'
): string {
  const arr = type === 'title' ? prop?.title : prop?.rich_text;
  return (arr ?? []).map((rt) => rt.plain_text).join('');
}

export async function saveToArchive(reportData: ReportData): Promise<{
  success: boolean;
  notionUrl?: string;
  errorMessage?: string;
}> {
  if (!NOTION_API_KEY || !NOTION_ARCHIVE_DB_ID) {
    return {
      success: false,
      errorMessage:
        'NOTION_ARCHIVE_DB_ID eller NOTION_API_KEY er ikke konfigurert. Legg til disse i miljøvariablene for å aktivere rapportarkiv.',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_ARCHIVE_DB_ID },
        properties: {
          Utgave: {
            title: [{ text: { content: reportData.edition } }],
          },
          Dato: {
            date: { start: reportData.date },
          },
          Fokusområde: {
            rich_text: [{ text: { content: reportData.areaSpotlight } }],
          },
          Opprettet: {
            date: { start: new Date().toISOString() },
          },
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Notion API feil: HTTP ${response.status} – ${errBody.slice(0, 200)}`);
    }

    const page = (await response.json()) as NotionPage;

    return { success: true, notionUrl: page.url };
  } catch (error) {
    clearTimeout(timeoutId);
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Archive save error:', msg);
    return {
      success: false,
      errorMessage: `Kunne ikke lagre til arkiv: ${msg}`,
    };
  }
}

export async function fetchArchive(): Promise<{
  entries: ArchiveEntry[];
  status: 'success' | 'error' | 'not_configured';
  errorMessage?: string;
}> {
  if (!NOTION_API_KEY || !NOTION_ARCHIVE_DB_ID) {
    return {
      entries: [],
      status: 'not_configured',
      errorMessage:
        'Rapportarkiv er ikke konfigurert. Legg til NOTION_ARCHIVE_DB_ID i miljøvariablene.',
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${NOTION_ARCHIVE_DB_ID}/query`,
      {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sorts: [{ property: 'Opprettet', direction: 'descending' }],
          page_size: 50,
        }),
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Notion API feil: HTTP ${response.status}`);
    }

    const json = await response.json();
    const pages: NotionPage[] = json.results ?? [];

    const entries: ArchiveEntry[] = pages.map((page) => {
      const props = page.properties;
      return {
        id: page.id,
        edition: extractText(props['Utgave'], 'title') || '–',
        date: props['Dato']?.date?.start ?? '',
        areaSpotlight: extractText(props['Fokusområde'], 'rich_text') || '–',
        createdAt: props['Opprettet']?.date?.start ?? page.created_time,
        notionUrl: page.url ?? null,
      };
    });

    return { entries, status: 'success' };
  } catch (error) {
    clearTimeout(timeoutId);
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Archive fetch error:', msg);
    return {
      entries: [],
      status: 'error',
      errorMessage: `Kunne ikke hente arkiv: ${msg}`,
    };
  }
}
