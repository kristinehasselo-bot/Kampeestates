import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generatePDF } from '@/lib/pdf/template';
import { ReportData, MarketData } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface GeneratePDFRequest {
  reportData: ReportData;
  marketData: MarketData;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: 'Ikke autorisert. Vennligst logg inn.' }, { status: 401 });
  }

  let body: GeneratePDFRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Ugyldig forespørselsformat. Forventet JSON.' },
      { status: 400 }
    );
  }

  const { reportData, marketData } = body;

  if (!reportData || !marketData) {
    return NextResponse.json(
      { error: 'Mangler rapportdata eller markedsdata i forespørselen.' },
      { status: 400 }
    );
  }

  // Validate required fields
  if (!reportData.edition || !reportData.date) {
    return NextResponse.json(
      { error: 'Mangler utgavenummer eller dato i rapportdataene.' },
      { status: 400 }
    );
  }

  try {
    const pdfBuffer = await generatePDF(reportData, marketData);

    // Sanitize edition for filename
    const safeEdition = reportData.edition
      .replace(/[^a-zA-Z0-9\-_æøåÆØÅ]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);

    const dateStr = new Date(reportData.date).toISOString().split('T')[0];
    const filename = `kampe-estates-markedsrapport-${safeEdition}-${dateStr}.pdf`;

    // Convert to Buffer for proper BodyInit compatibility
    const nodeBuffer = Buffer.from(pdfBuffer);
    return new NextResponse(nodeBuffer.buffer.slice(
      nodeBuffer.byteOffset,
      nodeBuffer.byteOffset + nodeBuffer.byteLength
    ) as ArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Klarte ikke å generere PDF-rapport. Prøv igjen.',
        details: error instanceof Error ? error.message : 'Ukjent feil',
      },
      { status: 500 }
    );
  }
}
