import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchEurNokHistory } from '@/lib/market-data/norges-bank';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: 'Ikke autorisert. Vennligst logg inn.' },
      { status: 401 }
    );
  }

  const result = await fetchEurNokHistory();
  return NextResponse.json(result);
}
