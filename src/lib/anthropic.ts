import Anthropic from '@anthropic-ai/sdk';
import type { MarketData, KnowledgeBaseArticle, NewsArticle, ReportData } from '@/types';

const SECTION_PROMPTS: Record<string, string> = {
  italyOverview: `Du er Kristine Hasselo, eiendomsekspert for Kämpe Estates som spesialiserer seg på italiensk luksus eiendom for norske kjøpere. Skriv "Markedsoversikt Italia"-avsnittet for en kvartalsrapport på norsk bokmål. Bruk tall fra markedsdata nedenfor. Tone: profesjonell, innsiktsfull, tillitsvekkende. Lengde: 200-280 ord.`,
  tuscanyFocus: `Skriv "Toscana i fokus"-avsnittet for Kämpe Estates kvartalsrapport på norsk bokmål. Fokuser på Toscanas eiendomsmarked spesifikt, prisnivåer, populære områder, trender. Tone: entusiastisk men faktabasert. Lengde: 200-280 ord.`,
  norwegianBuyers: `Skriv "Relevant for norske kjøpere"-avsnittet på norsk bokmål. Dekk: EUR/NOK-kurs og hva det betyr for kjøpekraft, skatt og juridiske forhold ved kjøp i Italia (Codice Fiscale, notarius, IMU-skatt, gevinstbeskatning), praktiske tips. Lengde: 220-300 ord.`,
  areaSpotlight: `Skriv "Områdesøkelys"-avsnittet for {area} på norsk bokmål. Beskriv området, eiendomsmarkedet, prisnivåer, infrastruktur, livsstil, hva som gjør det attraktivt for norske kjøpere. Lengde: 200-260 ord.`,
  editorialComment: `Skriv "Redaksjonell vurdering"-avsnittet som Kristines personlige ekspertanalyse på norsk bokmål. Dette er hennes subjektive vurdering basert på erfaring, ikke bare tall. Inkluder anbefaling til norske kjøpere nå. Tone: personlig, direkte, ekspert. Lengde: 150-200 ord.`,
};

function buildContext(
  marketData: MarketData,
  knowledgeBase: KnowledgeBaseArticle[],
  news: NewsArticle[],
  manualData?: ReportData['manualData']
): string {
  const lines: string[] = ['=== MARKEDSDATA ==='];

  const eurNokRate =
    manualData?.eurNok ??
    marketData.eurNok.data?.rate;
  if (eurNokRate != null) {
    lines.push(`EUR/NOK-kurs: ${eurNokRate.toFixed(4)}`);
  }

  const hpiValue =
    manualData?.italyHPI ??
    marketData.italyHPI.data?.value;
  const hpiPeriod = marketData.italyHPI.data?.period;
  const hpiYoY = marketData.italyHPI.data?.yearOnYear;
  if (hpiValue != null) {
    lines.push(`Italia boligprisindeks (HPI): ${hpiValue}${hpiPeriod ? ` (periode: ${hpiPeriod})` : ''}`);
    if (hpiYoY != null) {
      lines.push(`Årsendring HPI: ${hpiYoY >= 0 ? '+' : ''}${hpiYoY}%`);
    }
  }

  const tuscanyPrice =
    manualData?.tuscanyAvgPrice ??
    marketData.tuscanyData.data?.avgPricePerSqm;
  const tuscanyTrend = marketData.tuscanyData.data?.trend;
  if (tuscanyPrice != null) {
    lines.push(`Toscana gjennomsnittspris: ${tuscanyPrice} EUR/kvm${tuscanyTrend ? ` (trend: ${tuscanyTrend})` : ''}`);
  }

  if (marketData.notionProperties.length > 0) {
    lines.push(`\nAktuelle eiendommer (${marketData.notionProperties.length} totalt):`);
    marketData.notionProperties.slice(0, 5).forEach((p) => {
      lines.push(
        `- ${p.address} (${p.area}): ${p.price != null ? `${p.price} ${p.currency}` : 'pris ikke oppgitt'}, ${p.sqm != null ? `${p.sqm} m²` : ''} – Status: ${p.status}`
      );
    });
  }

  if (knowledgeBase.length > 0) {
    lines.push('\n=== KUNNSKAPSBASE ===');
    knowledgeBase.slice(0, 5).forEach((article) => {
      lines.push(`\nArtikkel: ${article.title}`);
      if (article.content) {
        lines.push(article.content.slice(0, 400));
      }
    });
  }

  if (news.length > 0) {
    lines.push('\n=== AKTUELLE NYHETER ===');
    news.slice(0, 6).forEach((article) => {
      lines.push(`- ${article.title} (${article.source}, ${new Date(article.publishedAt).toLocaleDateString('nb-NO')})`);
      if (article.description) {
        lines.push(`  ${article.description.slice(0, 150)}`);
      }
    });
  }

  return lines.join('\n');
}

export async function generateSectionDraft(params: {
  section: keyof typeof SECTION_PROMPTS;
  marketData: MarketData;
  knowledgeBase: KnowledgeBaseArticle[];
  news: NewsArticle[];
  areaSpotlight?: string;
  manualData?: ReportData['manualData'];
}): Promise<{ draft: string; tokensUsed: number }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY er ikke konfigurert. Hent nøkkelen fra console.anthropic.com og legg den til i miljøvariablene.');
  }

  const client = new Anthropic({ apiKey });

  let systemPrompt = SECTION_PROMPTS[params.section];
  if (params.section === 'areaSpotlight' && params.areaSpotlight) {
    systemPrompt = systemPrompt.replace('{area}', params.areaSpotlight);
  }

  const context = buildContext(
    params.marketData,
    params.knowledgeBase,
    params.news,
    params.manualData
  );

  const userMessage = `${context}\n\nSkriv avsnittet nå basert på dataene ovenfor. Svar kun med selve teksten – ingen overskrift, ingen innledende forklaring.`;

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textContent = message.content.find((c) => c.type === 'text');
  const draft = textContent && textContent.type === 'text' ? textContent.text : '';
  const tokensUsed =
    (message.usage?.input_tokens ?? 0) + (message.usage?.output_tokens ?? 0);

  return { draft, tokensUsed };
}
