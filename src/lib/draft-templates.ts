import type { MarketData, ReportData } from '@/types';

type SectionKey = keyof ReportData['sections'];

function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('nb-NO', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function priceStr(n: number | undefined): string {
  if (n == null) return '';
  return `${Math.round(n).toLocaleString('nb-NO')} EUR/kvm`;
}

export function generateDraft(
  section: SectionKey,
  marketData: MarketData,
  reportData: ReportData
): string {
  const md = reportData.manualData ?? {};

  const rate = md.eurNok ?? marketData.eurNok.data?.rate;
  const hpi  = md.italyHPI ?? marketData.italyHPI.data?.value;
  const hpiPeriod = marketData.italyHPI.data?.period ?? '';

  const tuscanyPrice = md.tuscanyAvgPrice ?? marketData.tuscanyData.data?.avgPricePerSqm;
  const villa     = md.tuscanyVilla;
  const apartment = md.tuscanyApartment;
  const rustico   = md.tuscanyRustico;
  const farm      = md.tuscanyFarm;

  const italyPrice     = md.italyAvgPrice;
  const italyVilla     = md.italyVilla;
  const italyApartment = md.italyApartment;

  const area    = reportData.areaSpotlight;
  const edition = reportData.edition || '';

  const rateStr  = rate != null ? `${fmt(rate, 4)} NOK` : '[EUR/NOK-kurs]';
  const rateShort = rate != null ? fmt(rate, 2) : '[kurs]';

  const hpiStr = hpi != null
    ? `${hpi >= 0 ? '+' : ''}${fmt(hpi, 1)}%${hpiPeriod ? ` (${hpiPeriod})` : ''}`
    : '[HPI-årsendring]';
  const hpiTrend = hpi != null
    ? hpi >= 2 ? 'en klar oppgang'
      : hpi >= 0 ? 'en moderat prisvekst'
      : 'en svak prisnedgang'
    : 'en endring i prisnivå';

  // Tuscany property type block
  const propLines: string[] = [];
  if (villa)     propLines.push(`• Villa / luksusbolig: ${priceStr(villa)}`);
  if (apartment) propLines.push(`• Leilighet / appartamento: ${priceStr(apartment)}`);
  if (rustico)   propLines.push(`• Rustico / casale: ${priceStr(rustico)}`);
  if (farm)      propLines.push(`• Tenuta / agriturismo: ${priceStr(farm)}`);
  const propPriceBlock = propLines.length > 0
    ? `\n\nSnittpriser Toscana per eiendomstype:\n${propLines.join('\n')}`
    : '';

  // Italy national price block
  const italyPriceStr = italyPrice != null
    ? `${Math.round(italyPrice).toLocaleString('nb-NO')} EUR/kvm`
    : null;
  const italyPropLines: string[] = [];
  if (italyVilla)     italyPropLines.push(`• Villa / luksusbolig: ${priceStr(italyVilla)}`);
  if (italyApartment) italyPropLines.push(`• Leilighet: ${priceStr(italyApartment)}`);
  const italyPropBlock = italyPropLines.length > 0
    ? `\n\nNasjonale snittpriser Italia per eiendomstype:\n${italyPropLines.join('\n')}`
    : '';

  switch (section) {
    case 'italyOverview':
      return `Det italienske boligmarkedet viser${
        hpi != null ? ` ${hpiTrend} med ${hpiStr}` : ''
      } ifølge boligprisindeksen for Italia. Sammenlignet med mange andre europeiske markeder har Italia hatt en relativt dempet prisutvikling de siste årene, noe som delvis skyldes lavere urbaniseringsgrad, høy eierboligandel og begrenset nybygging i de mest attraktive regionene.${
        italyPriceStr ? `\n\nGjennomsnittlig kvadratmeterpris for boligeiendommer i Italia nasjonalt ligger rundt ${italyPriceStr}, med betydelige regionale variasjoner – fra lavere prisnivå i Sør-Italia til vesentlig høyere priser i de mest attraktive regionene.` : ''
      }${italyPropBlock}

Luksussegmentet skiller seg imidlertid markant fra det generelle markedet. I Toscana, Umbria og langs kysten i Puglia og Sicilia opplever vi fortsatt sterk etterspørsel fra internasjonale kjøpere, særlig fra Nord-Europa, USA og Midtøsten. Tilbudet av historiske eiendommer av høy kvalitet er begrenset, noe som understøtter prisnivået selv i perioder med svakere generell veksttakt.

Den europeiske sentralbankens (ECB) rentebeslutninger gjennom ${hpiPeriod || 'siste periode'} har hatt en merkbar effekt på finansieringsmarkedet. Rentenivåene er fremdeles vesentlig høyere enn i nullrente-perioden, men mange kjøpere i luksussegmentet finansierer kjøp med egenkapital og er dermed langt mindre eksponert mot renteendringer enn gjennomsnittskjøperen.

Politisk stabilitet, gunstige skatteordninger for tilflyttere (særlig «Regime Forfettario» og flat-tax-ordningen for utenlandske inntekter) og Italias vedvarende appell som livsstilsdestinasjon gjør landet til et stadig mer attraktivt marked for velstående nordeuropeiske kjøpere. Vi forventer at luksussegmentet i Toscana og Umbria vil holde seg stabilt eller svakt stigende i kommende kvartal.`;

    case 'tuscanyFocus':
      return `Toscana forblir den mest ettertraktede regionen for internasjonale luksuskjøpere i Italia, og ${edition ? `dette ${edition}-kvartalet` : 'dette kvartalet'} er intet unntak. Regionen – fra Chianti-beltets vinranker i nord til Maremmas kystlandskap i sør – tilbyr en kombinasjon av kulturarv, kulinarisk tradisjon og tilgjengelighet som er vanskelig å matche.${
        tuscanyPrice != null
          ? `\n\nGjennomsnittlig kvadratmeterpris for eiendommer i Toscana ligger rundt ${priceStr(tuscanyPrice)}, men med store variasjoner mellom delsegmenter og soner.`
          : ''
      }${propPriceBlock}

De mest attraktive markedene internt i Toscana inkluderer:
• Val d'Orcia og Siena-provinsen: UNESCO-vernede landskap, stabil prisutvikling og sterk appell til kjøpere som søker autentisk toskansk karakter. Kjerneområdet for klassisk toskansk eiendom.
• Chianti Classico: Høy etterspørsel og begrenset tilbud av topp-eiendommer. Prestisjefylt vinstatus understøtter prisnivået, særlig for restaurerte casali og villaer.
• Lucca og Versilia: Populær kombinasjon av kyst og hinterland, etterspurt av internasjonale kjøpere – særlig britiske og skandinaviske.
• Arezzo og Casentino: Lavere prisnivå enn Chianti og Val d'Orcia, men voksende interesse fra kjøpere som ønsker mer areal for pengene.
• Maremma og Monte Argentario: Kysteiendommer med stor leiepotensiell, tiltrekker seg kjøpere med fokus på investering og utleie.

Markedet for casali (bondegårder) og rustici (rå landeiendommer med potensial) er særlig aktivt. Mange kjøpere ser verdien i eiendommer som kan rehabiliteres, men prosessen krever solid planlegging med lokale fagfolk og i samarbeid med kulturminnemyndighetene (Soprintendenza).`;

    case 'norwegianBuyers':
      return `For norske kjøpere er valutakursen en av de viktigste parameterne å følge nøye. EUR/NOK-kursen står per rapportdato på ${rateStr}. ${
        rate != null
          ? rate > 11.8
            ? `Dette er et relativt høyt nivå historisk sett, noe som gjør italienske eiendommer dyrere målt i norske kroner enn for noen år tilbake. Vi anbefaler kjøpere å vurdere valutasikring av kjøpssummen dersom kjøpet finansieres i NOK.`
            : rate > 11.0
            ? `Kursen ligger på et moderat nivå. Norske kjøpere bør følge utviklingen tett og vurdere timing på valutaveksling ved større transaksjoner.`
            : `Dette representerer et relativt gunstig nivå for norske kjøpere, og bidrar til å styrke kjøpekraften i det italienske markedet.`
          : 'Kursforholdet mellom norske kroner og euro er en sentral faktor å følge ved planlegging av kjøp.'
      }

Juridiske og skattemessige forhold ved kjøp i Italia:

Alle kjøpere – uavhengig av nasjonalitet – må ha et italiensk personnummer, Codice Fiscale, som enkelt utstedes av nærmeste italienske konsulat i Norge. Kjøpsprosessen gjennomføres formelt via en notarpublikum (notaio) og innebærer typisk tre steg: foreløpig avtale (Proposta d'acquisto), forpliktende privatavtale (Compromesso/Contratto preliminare) og endelig kjøpsavtale (Rogito notarile).

Registreringsavgift (Imposta di Registro):
- 9 % av matrikkelverdi for utenlandske kjøpere uten fast bopel i Italia («seconda casa»)
- 2 % for kjøpere som melder fast adresse og oppfyller «prima casa»-kravene

Løpende eiendomsskatt (IMU): 0,4–1,06 % av matrikkelverdi per år, fastsatt av den enkelte kommunen.

Gevinstbeskatning: 26 % på gevinst ved salg innen 5 år etter kjøp. Etter 5 år er gevinsten skattefri i Italia. Norsk skatt etter norske regler gjelder i tillegg, men dobbeltbeskatningsavtalen mellom Norge og Italia sikrer normalt kreditering av skatt betalt i Italia.`;

    case 'areaSpotlight':
      if (!area) {
        return 'Fyll inn et fokusområde i feltet «Områdesøkelys» ovenfor for å generere dette utkastet.';
      }
      return `${area} er ${edition ? `dette ${edition}-kvartalets` : 'dette kvartalets'} fokusområde – og med god grunn. Området representerer noe av det beste Toscana har å by på: et autentisk kulturlandskap, sterk lokal identitet og et eiendomsmarked med begrenset tilbud av kvalitetsobjekter.

Geografisk er ${area} kjennetegnet av kuperte åser, sypresser, olivenlunder og vinranker som har definert toskansk identitet i hundrevis av år. Infrastrukturen er god, med tilgang til nærmeste by innen rimelig kjøreavstand og flyplass innen 1–2 timers reisetid, samtidig som området bevarer en rolig, lite overturistisk atmosfære.

Eiendomsmarkedet i ${area}:

Markedet domineres av et spekter fra restaurerte landbrukseiendommer (casali og poderi) til historiske villaer og, i de mer urbane kjerneområdene, palazzo-seksjoner og tavernette. Prisnivå for veletablerte objekter i god stand starter gjerne fra EUR 400 000–600 000 for mellomstore landeiendommer (400–800 kvm inkl. tomt), og strekker seg til EUR 2–5 millioner og mer for de mest eksklusive eiendommene med panoramautsikt, basseng og komplett restaurering.${
  villa || apartment || rustico
    ? `\n\nTypiske prisnivåer for ulike objekttyper i området:\n${
        villa ? `• Villa / luksusbolig: ${priceStr(villa)}\n` : ''
      }${apartment ? `• Leilighet: ${priceStr(apartment)}\n` : ''}${
        rustico ? `• Rustico / casale: ${priceStr(rustico)}\n` : ''
      }${farm ? `• Tenuta / agriturismo: ${priceStr(farm)}` : ''}`
    : ''
}

Leie- og investeringspotensial:

Vellykkede ferieutleieeiendommer i ${area} kan oppnå belegg på 80–90 % i sesongen (april–oktober) og generere bruttoinntekter på EUR 50 000–150 000 per år avhengig av standard og kapasitet. For kjøpere som ønsker å kombinere eget bruk og utleie, er dette et viktig element i investeringskalkylen. Plattformer som Airbnb, Booking.com og spesialiserte luksusutleiebyråer er aktuelle kanaler.`;

    case 'editorialComment':
      return `Etter å ha fulgt det toskanske og italienske eiendomsmarkedet tett gjennom ${edition || 'dette kvartalet'}, sitter jeg igjen med et klart inntrykk: markedet er i balanse, men med tydelig retningssignal oppover for de rette objektene i de rette sonene.

Det som bekymrer meg litt, er den kumulerte effekten av rentene og valutautviklingen på den samlede etterspørselen. Kjøpere fra USA og UK møter en kombinasjon av sterkere hjemlig valuta og lavere renter hjemme – noe som faktisk er gunstig for dem. For norske kjøpere${
  rate != null ? ` med en EUR/NOK på ${rateShort}` : ''
} er situasjonen mer nyansert: kjøpekraften${
  rate != null && rate > 11.8
    ? ' er noe svakere enn for tre–fire år siden, men vi ser likevel at motivasjonen er sterk – særlig blant kjøpere med ferdig egenkapital'
    : ' holder seg solid, og vi ser ingen tegn til at nordmenn trekker seg tilbake fra dette markedet'
}.

Min anbefaling til norske kjøpere som vurderer Toscana nå: ikke vent på det perfekte markedstimingspunktet. De eiendommene som virkelig holder klasse – med unik beliggenhet, god tilstand og historisk karakter – forsvinner raskt og prises hardere for hvert år som går. Det vi kan gjøre for deg som klient, er å sikre at kjøpsprosessen er grundig forankret: juridisk due diligence, teknisk tilstandsvurdering og en realistisk plan for eget bruk, utleie eller videreforedling.

Markedet belønner dem som er forberedt og handler rasjonelt. Det er der Kämpe Estates kommer inn.

Kristine Hasselø, Kämpe Estates`;

    default:
      return '';
  }
}
