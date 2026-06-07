import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchNotionProperties } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Verify authentication via iron-session
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: 'Ikke autorisert. Vennligst logg inn.' },
      { status: 401 }
    );
  }

  try {
    const result = await fetchNotionProperties();

    if (result.status === 'error') {
      return NextResponse.json(
        {
          properties: [],
          status: 'error',
          error: result.errorMessage || 'Klarte ikke å hente eiendommer fra Notion.',
        },
        { status: 200 } // Return 200 so client can still render
      );
    }

    return NextResponse.json({
      properties: result.properties,
      status: 'success',
      count: result.properties.length,
    });
  } catch (error) {
    console.error('Notion API route error:', error);
    return NextResponse.json(
      {
        properties: [],
        status: 'error',
        error: 'Klarte ikke å hente eiendommer fra Notion. Sjekk at NOTION_API_KEY er konfigurert.',
        details: error instanceof Error ? error.message : 'Ukjent feil',
      },
      { status: 200 }
    );
  }
}
