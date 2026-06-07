import type { KnowledgeBaseArticle } from '@/types';

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_KNOWLEDGE_DB_ID = process.env.NOTION_KNOWLEDGE_DB_ID;

interface NotionBlock {
  type: string;
  [key: string]: unknown;
}

interface NotionRichText {
  plain_text: string;
}

function extractTextFromBlocks(blocks: NotionBlock[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    const type = block.type as string;
    const blockData = block[type] as { rich_text?: NotionRichText[] } | undefined;
    const richTexts = blockData?.rich_text ?? [];
    const text = richTexts.map((rt) => rt.plain_text).join('');
    if (text.trim()) lines.push(text.trim());
  }
  return lines.join('\n\n');
}

async function fetchPageContent(pageId: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `https://api.notion.com/v1/blocks/${pageId}/children?page_size=20`,
      {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          Accept: 'application/json',
        },
      }
    );
    clearTimeout(timeoutId);

    if (!response.ok) return '';

    const json = await response.json();
    const blocks: NotionBlock[] = json.results ?? [];
    return extractTextFromBlocks(blocks);
  } catch {
    clearTimeout(timeoutId);
    return '';
  }
}

interface NotionSearchResult {
  id: string;
  url: string;
  last_edited_time: string;
  properties?: Record<string, {
    type: string;
    title?: NotionRichText[];
    rich_text?: NotionRichText[];
    name?: string;
  }>;
}

function extractTitle(page: NotionSearchResult): string {
  if (!page.properties) return 'Uten tittel';
  for (const prop of Object.values(page.properties)) {
    if (prop.type === 'title' && prop.title && prop.title.length > 0) {
      return prop.title.map((rt) => rt.plain_text).join('');
    }
  }
  return 'Uten tittel';
}

export async function fetchKnowledgeBase(): Promise<{
  articles: KnowledgeBaseArticle[];
  status: 'success' | 'error' | 'not_configured';
  errorMessage?: string;
}> {
  if (!NOTION_API_KEY) {
    return {
      articles: [],
      status: 'not_configured',
      errorMessage:
        'NOTION_API_KEY er ikke konfigurert. Legg til nøkkelen fra notion.so/my-integrations.',
    };
  }

  try {
    let pages: NotionSearchResult[] = [];

    if (NOTION_KNOWLEDGE_DB_ID) {
      // Query the specific database
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(
        `https://api.notion.com/v1/databases/${NOTION_KNOWLEDGE_DB_ID}/query`,
        {
          method: 'POST',
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page_size: 10 }),
        }
      );
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Notion database feil: HTTP ${response.status}`);
      }

      const json = await response.json();
      pages = (json.results ?? []) as NotionSearchResult[];
    } else {
      // Fall back to search API
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'eiendom Italia marked',
          filter: { value: 'page', property: 'object' },
          page_size: 10,
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Notion søk feil: HTTP ${response.status}`);
      }

      const json = await response.json();
      pages = (json.results ?? []) as NotionSearchResult[];
    }

    const articles: KnowledgeBaseArticle[] = await Promise.all(
      pages.slice(0, 10).map(async (page) => {
        const content = await fetchPageContent(page.id);
        return {
          id: page.id,
          title: extractTitle(page),
          content: content.slice(0, 2000),
          url: page.url ?? null,
          lastEdited: page.last_edited_time ?? new Date().toISOString(),
        };
      })
    );

    return { articles, status: 'success' };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Notion knowledge base error:', msg);
    return {
      articles: [],
      status: 'error',
      errorMessage: `Kunne ikke hente kunnskapsbase: ${msg}`,
    };
  }
}
