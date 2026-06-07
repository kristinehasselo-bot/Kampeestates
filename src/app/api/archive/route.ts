import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fetchArchive, saveToArchive } from '@/lib/report-archive';
import type { ReportData } from '@/types';

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

  const result = await fetchArchive();
  return NextResponse.json(result);
}

interface ArchivePostBody {
  reportData: ReportData;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: 'Ikke autorisert. Vennligst logg inn.' },
      { status: 401 }
    );
  }

  let body: ArchivePostBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Ugyldig forespørselsformat. Forventet JSON.' },
      { status: 400 }
    );
  }

  const { reportData } = body;

  if (!reportData?.edition || !reportData?.date) {
    return NextResponse.json(
      { error: 'Mangler utgavenummer eller dato i rapportdataene.' },
      { status: 400 }
    );
  }

  const result = await saveToArchive(reportData);

  if (!result.success) {
    return NextResponse.json(
      { error: result.errorMessage ?? 'Klarte ikke å lagre til arkiv.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, notionUrl: result.notionUrl ?? null });
}
