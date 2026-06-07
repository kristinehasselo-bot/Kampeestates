import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generatePDF } from '@/lib/pdf/template';
import { sendReportEmail } from '@/lib/email';
import type { ReportData, MarketData } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface EmailRequest {
  to: string;
  subject: string;
  reportData: ReportData;
  marketData: MarketData;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { error: 'Ikke autorisert. Vennligst logg inn.' },
      { status: 401 }
    );
  }

  let body: EmailRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Ugyldig forespørselsformat. Forventet JSON.' },
      { status: 400 }
    );
  }

  const { to, subject, reportData, marketData } = body;

  if (!to || !subject || !reportData || !marketData) {
    return NextResponse.json(
      { error: 'Mangler mottaker, emne, rapportdata eller markedsdata.' },
      { status: 400 }
    );
  }

  if (!reportData.edition || !reportData.date) {
    return NextResponse.json(
      { error: 'Mangler utgavenummer eller dato i rapportdataene.' },
      { status: 400 }
    );
  }

  // Validate email address (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return NextResponse.json(
      { error: 'Ugyldig e-postadresse.' },
      { status: 400 }
    );
  }

  try {
    // Generate PDF
    const pdfUint8 = await generatePDF(reportData, marketData);
    const pdfBuffer = Buffer.from(pdfUint8);

    // Build filename
    const safeEdition = reportData.edition
      .replace(/[^a-zA-Z0-9\-_æøåÆØÅ]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50);
    const dateStr = new Date(reportData.date).toISOString().split('T')[0];
    const fileName = `kampe-estates-markedsrapport-${safeEdition}-${dateStr}.pdf`;

    const result = await sendReportEmail({
      to,
      subject,
      reportData,
      pdfBuffer,
      fileName,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.errorMessage ?? 'Klarte ikke å sende e-post.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, fileName });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Email route error:', msg);
    return NextResponse.json(
      { error: `Intern feil: ${msg}` },
      { status: 500 }
    );
  }
}
