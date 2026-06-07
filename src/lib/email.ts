import nodemailer from 'nodemailer';
import type { ReportData } from '@/types';

function createTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === '465',
    auth: { user, pass },
  });
}

export async function sendReportEmail(params: {
  to: string;
  subject: string;
  reportData: ReportData;
  pdfBuffer: Uint8Array;
  fileName: string;
}): Promise<{ success: boolean; errorMessage?: string }> {
  const transporter = createTransport();

  if (!transporter) {
    return {
      success: false,
      errorMessage:
        'E-post er ikke konfigurert. Legg til SMTP_HOST, SMTP_USER og SMTP_PASS i Vercel.',
    };
  }

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #4B1F26; padding: 24px 32px;">
        <p style="color: white; font-family: Arial, sans-serif; font-size: 11px; letter-spacing: 3px; margin: 0;">
          KÄMPE ESTATES · LUKSUS EIENDOM ITALIA
        </p>
      </div>
      <div style="padding: 32px; background: #FBFBF8; border: 1px solid #E5E2D8;">
        <h1 style="font-size: 24px; color: #1F1F1F; font-weight: 400; margin-bottom: 8px;">
          ${params.reportData.edition}
        </h1>
        <p style="color: #7A7A7A; font-family: Arial, sans-serif; font-size: 14px; margin-bottom: 24px;">
          Kämpe Estates Markedsrapport – ${params.reportData.date}
        </p>
        <p style="color: #3A3A3A; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;">
          Vedlagt finner du kvartalsrapporten for det italienske luksuseiendomsmarkedet.
          Rapporten dekker markedsoversikt Italia, Toscana i fokus, relevante forhold
          for norske kjøpere, og områdesøkelys for ${params.reportData.areaSpotlight}.
        </p>
      </div>
      <div style="background: #4B1F26; padding: 12px 32px;">
        <p style="color: rgba(255,255,255,0.6); font-family: Arial, sans-serif; font-size: 11px; margin: 0;">
          Kämpe Estates · Kristine Hasselø · Konfidensielt dokument
        </p>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Kämpe Estates" <${process.env.SMTP_USER}>`,
      to: params.to,
      subject: params.subject,
      html,
      attachments: [
        {
          filename: params.fileName,
          content: Buffer.from(params.pdfBuffer),
          contentType: 'application/pdf',
        },
      ],
    });

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('SMTP email error:', msg);
    return {
      success: false,
      errorMessage: `Klarte ikke å sende e-post: ${msg}`,
    };
  }
}
