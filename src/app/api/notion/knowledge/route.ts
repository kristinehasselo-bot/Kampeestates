import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchKnowledgeBase } from '@/lib/notion-knowledge';

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

  const result = await fetchKnowledgeBase();
  return NextResponse.json(result);
}
