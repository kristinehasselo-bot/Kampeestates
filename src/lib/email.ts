import { Resend } from 'resend';
import type { ReportData } from '@/types';

export async function sendReportEmail(params: {
  to: string;
  subject: string;
  reportData: ReportData;
  pdfBuffer: Buffer;
  fileName: string;
}): Promise<{ success: boolean; errorMessage?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      errorMessage:
        'RESEND_API_KEY er ikke konfigurert. Opprett en gratis konto på resend.com (opptil 3 000 e-poster/mnd) og legg til API-nøkkelen i miljøvariablene.',
    };
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? 'rapport@kampeestates.no';

  const resend = new Resend(apiKey);

  const formattedDate = new Date(params.reportData.date).toLocaleDateString(
    'nb-NO',
    { year: 'numeric', month: 'long', day: 'numeric' }
  );

  const htmlBody = `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${params.subject}</title>
</head>
<body style="margin:0;padding:0;background:#FBFBF8;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBFBF8;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #E5E2D8;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:#4B1F26;padding:24px 36px;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:18px;font-weight:bold;letter-spacing:3px;color:#ffffff;">
                KÄMPE ESTATES
              </p>
              <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.65);letter-spacing:1px;">
                LUKSUS EIENDOM · ITALIA
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px;">
              <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:11px;color:#7A7A7A;letter-spacing:2px;text-transform:uppercase;">
                MARKEDSRAPPORT · ${params.reportData.edition}
              </p>
              <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:normal;color:#1F1F1F;line-height:1.25;">
                Kämpe Estates<br>Markedsrapport Italia
              </h1>
              <hr style="border:none;border-top:1px solid #E5E2D8;margin:0 0 20px;" />
              <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:14px;color:#3A3A3A;line-height:1.6;">
                Vedlagt finner du Kämpe Estates markedsrapport for Italia, utgave <strong>${params.reportData.edition}</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="background:#F4F2EB;border:1px solid #E5E2D8;width:100%;margin:0 0 20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:11px;color:#7A7A7A;padding-bottom:6px;">Utgave</td>
                        <td style="font-family:Arial,sans-serif;font-size:11px;color:#1F1F1F;font-weight:bold;text-align:right;padding-bottom:6px;">${params.reportData.edition}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:11px;color:#7A7A7A;padding-bottom:6px;">Dato</td>
                        <td style="font-family:Arial,sans-serif;font-size:11px;color:#1F1F1F;font-weight:bold;text-align:right;padding-bottom:6px;">${formattedDate}</td>
                      </tr>
                      <tr>
                        <td style="font-family:Arial,sans-serif;font-size:11px;color:#7A7A7A;">Fokusområde</td>
                        <td style="font-family:Arial,sans-serif;font-size:11px;color:#1F1F1F;font-weight:bold;text-align:right;">${params.reportData.areaSpotlight}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:13px;color:#3A3A3A;line-height:1.6;">
                Rapporten er vedlagt som PDF og inneholder markedsanalyse, Toscana-fokus, informasjon relevant for norske kjøpere og et redaksjonelt bidrag.
              </p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#7A7A7A;line-height:1.5;">
                Med vennlig hilsen,<br>
                <strong style="color:#4B1F26;">Kämpe Estates</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#4B1F26;padding:16px 36px;text-align:center;">
              <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.5);">
                Konfidensielt dokument · Kämpe Estates · Kun for autorisert bruk
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: [params.to],
      subject: params.subject,
      html: htmlBody,
      attachments: [
        {
          filename: params.fileName,
          content: params.pdfBuffer,
        },
      ],
    });

    if (result.error) {
      return {
        success: false,
        errorMessage: `Resend-feil: ${result.error.message ?? JSON.stringify(result.error)}`,
      };
    }

    return { success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Ukjent feil';
    console.error('Email send error:', msg);
    return {
      success: false,
      errorMessage: `Klarte ikke å sende e-post: ${msg}`,
    };
  }
}
