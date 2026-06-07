import { Client } from '@notionhq/client';
import { NotionProperty } from '@/types';

const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || '33b1573c-e82d-80e6-ae7e-f008c4a26fa6';

function getNotionClient(): Client {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) {
    throw new Error('NOTION_API_KEY is not configured');
  }
  return new Client({ auth: apiKey });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPlainText(richTextArray: any[]): string {
  if (!Array.isArray(richTextArray) || richTextArray.length === 0) return '';
  return richTextArray.map((rt: { plain_text?: string }) => rt.plain_text || '').join('');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapNotionPageToProperty(page: any): NotionProperty {
  const props = page.properties || {};

  // Try common property name patterns for address
  const addressProp =
    props['Address'] ||
    props['Adresse'] ||
    props['Name'] ||
    props['Navn'] ||
    props['Title'] ||
    props['Tittel'] ||
    Object.values(props).find((p: any) => p.type === 'title');

  // Try common property name patterns for area
  const areaProp =
    props['Area'] ||
    props['Område'] ||
    props['Location'] ||
    props['Lokasjon'] ||
    props['Region'];

  // Price property
  const priceProp =
    props['Price'] ||
    props['Pris'] ||
    props['Asking Price'] ||
    props['Prisantydning'];

  // Currency property
  const currencyProp =
    props['Currency'] ||
    props['Valuta'];

  // Size/sqm property
  const sqmProp =
    props['Size'] ||
    props['Størrelse'] ||
    props['SQM'] ||
    props['Kvm'] ||
    props['Area m2'] ||
    props['Areal'];

  // Status property
  const statusProp =
    props['Status'] ||
    props['Tilstand'] ||
    props['Stage'];

  // Extract values based on Notion property types
  let address = '';
  if (addressProp) {
    if (addressProp.type === 'title') {
      address = extractPlainText(addressProp.title || []);
    } else if (addressProp.type === 'rich_text') {
      address = extractPlainText(addressProp.rich_text || []);
    }
  }

  let area = '';
  if (areaProp) {
    if (areaProp.type === 'select') {
      area = areaProp.select?.name || '';
    } else if (areaProp.type === 'rich_text') {
      area = extractPlainText(areaProp.rich_text || []);
    } else if (areaProp.type === 'multi_select') {
      area = (areaProp.multi_select || []).map((s: { name: string }) => s.name).join(', ');
    }
  }

  let price: number | null = null;
  if (priceProp) {
    if (priceProp.type === 'number') {
      price = priceProp.number;
    }
  }

  let currency = 'EUR';
  if (currencyProp) {
    if (currencyProp.type === 'select') {
      currency = currencyProp.select?.name || 'EUR';
    } else if (currencyProp.type === 'rich_text') {
      currency = extractPlainText(currencyProp.rich_text || []) || 'EUR';
    }
  }

  let sqm: number | null = null;
  if (sqmProp) {
    if (sqmProp.type === 'number') {
      sqm = sqmProp.number;
    }
  }

  let status = '';
  if (statusProp) {
    if (statusProp.type === 'select') {
      status = statusProp.select?.name || '';
    } else if (statusProp.type === 'status') {
      status = statusProp.status?.name || '';
    }
  }

  const url = page.url || null;

  return {
    id: page.id,
    address: address || 'Ukjent adresse',
    area: area || 'Ukjent område',
    price,
    currency,
    sqm,
    status: status || 'Ukjent',
    url,
  };
}

export async function fetchNotionProperties(): Promise<{
  properties: NotionProperty[];
  status: 'success' | 'error';
  errorMessage?: string;
}> {
  try {
    const notion = getNotionClient();

    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 50,
      sorts: [
        {
          timestamp: 'created_time',
          direction: 'descending',
        },
      ],
    });

    const properties = response.results.map(mapNotionPageToProperty);

    return {
      properties,
      status: 'success',
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Ukjent feil ved henting av Notion-data';

    console.error('Notion API error:', errorMessage);

    return {
      properties: [],
      status: 'error',
      errorMessage: `Kunne ikke hente eiendommer fra Notion: ${errorMessage}`,
    };
  }
}
