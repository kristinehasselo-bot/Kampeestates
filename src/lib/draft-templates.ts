import type { MarketData, ReportData } from '@/types';

type SectionKey = keyof ReportData['sections'];

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('nb-NO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function generateDraft(
  section: SectionKey,
  marketData: MarketData,
  reportData: ReportData
): string {
  const rate =
    reportData.manualData?.eurNok ??
    marketData.eurNok.data?.rate;

  const hpi =
    reportData.manualData?.italyHPI ??
    marketData.italyHPI.data?.value;

  const hpiPeriod = marketData.italyHPI.data?.period ?? '';

  const tuscanyPrice =
    reportData.manualData?.tuscanyAvgPrice ??
    marketData.tuscanyData.data?.avgPricePerSqm;

  const area = reportData.areaSpotlight || 'Chianti';
  const edition = reportData.edition || '';

  // EUR/NOK formatted strings
  const rateStr = rate != null ? `${fmt(rate, 4)} NOK` : '[EUR/NOK-kurs]';
  const rateShort = rate != null ? fmt(rate, 2) : '[kurs]';

  // HPI string
  const hpiStr =
    hpi != null
      ? `${hpi >= 0 ? '+' : ''}${fmt(hpi, 1)}%${hpiPeriod ? ` (${hpiPeriod})` : ''}`
      : '[HPI-årsendring]';

  const hpiTrend =
    hpi != null
      ? hpi >= 2
        ? 'en klar oppgang'
        : hpi >= 0
        ? 'en moderat prisvekst'
        : 'en svak prisnedgang'
      : 'en endring i prisnivå';

  // Tuscany price
  const tuscStr =
    tuscanyPrice != null
      ? `${Math.round(tuscanyPrice).toLocaleString('nb-NO')} EUR/kvm`
      : '[Toscana-pris]';

  switch (section) {
    case 'italyOverview':
      return `Det italienske boligmarkedet viser tegn til stabilisering${
        hpi != null ? ` med ${hpiTrend} på ${hpiStr}` : ''
      } ifølge Eurostats boligprisindeks for Italia. Sammenlignet med mange andre europeiske markeder har Italia hatt en mer dempet prisvekst de siste årene, noe som delvis skyldes lavere urbaniseringsgrad, høy eierboligandel og begrenset boligbygging i de mest attraktive regionene.

Luksussegmentet skiller seg imidlertid markant fra det generelle markedet. I Toscana, Umbria og langs kysten i Puglia og Sicilia opplever vi fortsatt sterk etterspørsel fra internasjonale kjøpere, særlig fra Nord-Europa, USA og Midtøsten. Tilbudet av historiske eiendommer av høy kvalitet er begrenset, noe som understøtter prisnivået selv i perioder med lavere global veksttakt.

Den europeiske sentralbankens (ECB) pengepolitiske kurs gjennom ${hpiPeriod || 'siste periode'} har hatt en merkbar effekt på finansieringsmarkedet. Selv om rentene er justert ned fra toppen, er de fortsatt vesentlig høyere enn i nullrente-perioden, og dette preger kjøpernes finansieringsevne. Kjøpere med egenkapital – som mange norske kjøpere av luksuseiendommer er – er imidlertid langt mindre påvirket av rentenivå enn gjennomsnittskjøperen.

Politisk stabilitet under statsminister Melonis regjering, kombinert med gunstige skatteordninger for tilflyttere (særlig «Forfait d'imposition» og flat-tax-ordningen for utenlandske inntekter), gjør Italia til et stadig mer attraktivt marked for velstående nordeuropeiske kjøpere. Vi forventer at luksussegmentet i Toscana og nærliggende regioner vil holde seg stabilt eller svakt stigende i kvartalsperioden som kommer.`;

    case 'tuscanyFocus':
      return `Toscana forblir den mest ettertraktede regionen for internasjonale luksuskjøpere i Italia, og ${edition ? `dette ${edition}-kvartalet` : 'dette kvartalet'} er intet unntak. Regionen kombinerer en unikt bevart kulturarv, eksepsjonell mat- og vinkultur, utmerket infrastruktur og relativt enkel tilgjengelighet via flyplassene i Firenze og Pisa.

Gjennomsnittsprisen for kvalitetseiendommer i Toscana ligger${
  tuscanyPrice != null ? ` rundt ${tuscStr} for etablerte landsbygdseiendommer` : ''
}. Det er imidlertid store variasjoner mellom delsegmenter. Topp-eiendommer i Chianti Classico-beltet, i nærheten av Siena eller med panoramautsikt i Val d'Orcia, omsettes til vesentlig høyere kvadratmeterpris – gjerne 20–40 % over regionsnittet for de mest eksklusive objektene.

Markedet for casali (bondegårder) og rustici (rå landeiendommer med potensial) er særlig aktivt, drevet av en kombinasjon av livsstilsetterspørsel etter pandemien og økt interesse for «slow living»-konseptet blant nordeuropeiske kjøpere. Mange av disse eiendommene krever rehabilitering, noe som gir muligheter for verdiskapning, men også krevende planleggings- og byggeprosesser i samarbeid med lokale kommuner og Soprintendenza (kulturminnemyndigheten).

Etterspørselen fra norske kjøpere spesifikt har vært stabil det siste året. Kombinasjonen av${
  rate != null ? ` en EUR/NOK-kurs på ${rateShort}` : ' valutasituasjonen'
} og Norges sterke økonomi relativt til eurosonens kjøpekraft gjør at norske kjøpere opplever Italia som konkurransedyktig priset. Vi ser stadig hyppigere at norske kunder ser på eiendom i Toscana som et kombinert livsstils- og investeringsprosjekt.`;

    case 'norwegianBuyers':
      return `For norske kjøpere er valutakursen en av de viktigste parameterne å følge nøye. EUR/NOK-kursen står per rapportdato på ${rateStr}. ${
  rate != null
    ? rate > 11.5
      ? `Dette er et relativt høyt nivå historisk sett, noe som gjør italienske eiendommer dyrere målt i norske kroner enn for noen år tilbake. Vi anbefaler kjøpere å vurdere valutasikring av kjøpssummen dersom kjøpet finansieres i NOK.`
      : `Dette representerer et forholdsvis gunstig nivå for norske kjøpere, og bidrar til å styrke kjøpekraften i det italienske markedet.`
    : 'Det er viktig å følge kursutvikling nøye ved planlegging av kjøp.'
}

**Juridiske og skattemessige forhold ved kjøp i Italia:**

Alle kjøpere – uavhengig av nasjonalitet – må ha et italiensk personnummer, Codice Fiscale, som enkelt utstedes av nærmeste italienske ambassade eller konsulat i Norge. Eiendomskjøp gjennomføres formelt via en notarpublikum (notaio), og typisk kjøpsprosess innebærer en foreløpig avtale (Proposta d'acquisto), en forpliktende privatavtale (Compromesso/Contratto preliminare) og deretter den endelige kjøpsavtalen (Rogito notarile).

Registreringsavgift (imposta di registro) utgjør normalt 9 % av eiendommens matrikkelverdi for kjøpere som ikke etablerer fast bopel i Italia, men kun 2 % for dem som melder fast adresse («prima casa»). For landbrukseiendommer kan særskilte regler gjelde. Løpende eiendomsskatt (IMU – Imposta Municipale Propria) beregnes av den enkelte kommunen og varierer, men er typisk 0,4–1,06 % av matrikkelverdi.

Gevinst ved videresalg beskattes i Italia med 26 % gevinstskatt dersom eiendommen selges innen fem år etter kjøp. Etter fem år er gevinsten skattefri i Italia. Norge skattlegger i tillegg etter norske regler, men dobbeltbeskatningsavtalen mellom Norge og Italia sikrer normalt at skatt betalt i Italia kan krediteres mot norsk skatt.`;

    case 'areaSpotlight':
      return `${area} er ${edition ? `dette ${edition}-kvartalets` : 'dette kvartalets'} fokusområde, og det er ikke uten grunn. Området kombinerer noen av Toscanas mest karakteristiske landskapstrekk med et eiendomsmarked som fortsatt tilbyr muligheter for kjøpere som søker autentisk toskansk livsstil.

Geografisk er ${area} kjennetegnet av det kuperte kulturlandskapet med sypresser, olivenlunder og vinranker som har definert regionens identitet i hundrevis av år. Infrastrukturen er god med tilgang til større byer som Firenze, Siena eller Arezzo innen rimelig kjøreavstand, samtidig som området bevarer en lokal, lite kommersialisert atmosfære som tiltrekker kjøpere på flukt fra overturisme.

Eiendomsmarkedet i ${area} domineres av et spekter fra restaurerte landbrukseiendommer (casali og poderi) til villaer med historisk preg, og i mer urbane kjerneområder også palazzo-seksjoner og tavernette. Prisnivået for veletablerte objekter i god stand starter gjerne fra EUR 400 000–600 000 for mellomstore landeiendommer (400–800 kvm med tomt), og strekker seg oppover mot EUR 2–5 millioner og mer for de mest eksklusive eiendommene med panoramautsikt, basseng og komplett restaurering.

Leietakmarkedet er solid og understøtter eiendomsprisene: vellykkede ferieutleieeiendommer i ${area} kan oppnå belegg på 80–90 % i sesongen (april–oktober) og generere bruttoinntekter på EUR 50 000–150 000 per år avhengig av standard og kapasitet. For kjøpere som ønsker å kombinere eget bruk og utleie, er dette et viktig element i investeringskalkylen.`;

    case 'editorialComment':
      return `Etter å ha fulgt det toskanske eiendomsmarkedet tett gjennom ${edition || 'dette kvartalet'}, sitter jeg igjen med et klart inntrykk: det er et marked i balanse, men med tydelig retningssignal oppover for de rette objektene.

Det som bekymrer meg litt, er den kumulerte effekten av høye renter og svakere euro på eiendommenes salgbarhet mot visse kjøpersegmenter. Kjøpere fra USA og UK, som historisk har vært sentrale i luksussegmentet, møter en kombinasjon av sterkere dollar/pund og lavere renter hjemme – noe som faktisk er gunstig for dem. For norske kjøpere${
  rate != null ? ` med en EUR/NOK på ${rateShort}` : ''
} er situasjonen mer nyansert: kjøpekraften er ${
  rate != null && rate > 11.8
    ? 'noe svakere enn for tre–fire år siden, men vi ser likevel at motivasjonen er sterk'
    : 'god relativt til historiske nivåer'
}.

Min anbefaling til norske kjøpere som vurderer Toscana nå: ikke vent på det perfekte markedstimingen. De eiendommene som virkelig holder klasse – de med unik beliggenhet, god tilstand og historisk karakter – forsvinner raskt og prises hardere for hvert år. Det vi derimot kan gjøre for kundene våre, er å sikre at kjøpsprosessen er grundig forankret: juridisk due diligence, teknisk tilstandsvurdering og en realistisk plan for enten bruk, utleie eller videreforedling.

Kämpe Estates er her for å gjøre nettopp det.

*Kristine Hasselo, Kämpe Estates*`;

    default:
      return '';
  }
}
