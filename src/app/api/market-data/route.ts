import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchAllMarketData } from '@/lib/market-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ikke autorisert. Vennligst logg inn.' }, { status: 401 });
  }

  try {
    const marketData = await fetchAllMarketData();

    return NextResponse.json(marketData, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json(
      {
        error: 'Klarte ikke å hente markedsdata. Prøv igjen senere.',
        details: error instanceof Error ? error.message : 'Ukjent feil',
      },
      { status: 500 }
    );
  }
}
