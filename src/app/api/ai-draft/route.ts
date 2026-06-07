import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateSectionDraft } from '@/lib/anthropic';
import { fetchKnowledgeBase } from '@/lib/notion-knowledge';
import { fetchNews } from '@/lib/market-data/news';
import type { MarketData, ReportData } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface AIDraftRequest {
  section: string;
  reportData: ReportData;
  marketData: MarketData;
}

const VALID_SECTIONS = [
  'italyOverview',
  'tuscanyFocus',
  'norwegianBuyers',
  'areaSpotlight',
  'editorialComment',
] as const;

type ValidSection = (typeof VALID_SECTIONS)[number];

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: 'Ikke autorisert. Vennligst logg inn.' },
      { status: 401 }
    );
  }

  let body: AIDraftRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Ugyldig forespørselsformat. Forventet JSON.' },
      { status: 400 }
    );
  }

  const { section, reportData, marketData } = body;

  if (!section || !(VALID_SECTIONS as readonly string[]).includes(section)) {
    return NextResponse.json(
      { error: `Ugyldig avsnitt. Gyldige valg: ${VALID_SECTIONS.join(', ')}` },
      { status: 400 }
    );
  }

  if (!reportData || !marketData) {
    return NextResponse.json(
      { error: 'Mangler rapportdata eller markedsdata.' },
      { status: 400 }
    );
  }

  try {
    // Fetch knowledge base and news in parallel
    const [knowledgeResult, newsResult] = await Promise.all([
      fetchKnowledgeBase(),
      fetchNews(),
    ]);

    const knowledgeBase = knowledgeResult.articles;
    const news = newsResult.data?.articles ?? [];

    const result = await generateSectionDraft({
      section: section as ValidSection,
      marketData,
      knowledgeBase,
      news,
      areaSpotlight: reportData.areaSpotlight,
      manualData: reportData.manualData,
    });

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('AI draft error:', msg);

    const isConfigError = msg.includes('ANTHROPIC_API_KEY');
    return NextResponse.json(
      { error: msg },
      { status: isConfigError ? 503 : 500 }
    );
  }
}
