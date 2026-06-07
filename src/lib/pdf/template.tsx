import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import { ReportData, MarketData } from '@/types';

// Register fonts - using standard PDF fonts for reliability
// Helvetica and Times-Roman are built into PDF spec
Font.registerHyphenationCallback((word) => [word]);

const BURGUNDY = '#4B1F26';
const OLIVE = '#3F4A3F';
const TEXT_PRIMARY = '#1F1F1F';
const TEXT_SECONDARY = '#3A3A3A';
const TEXT_MUTED = '#7A7A7A';
const BG_SECONDARY = '#F4F2EB';
const LINE_PRIMARY = '#CFC8B8';
const LINE_SECONDARY = '#E5E2D8';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FBFBF8',
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 0,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_PRIMARY,
  },
  // Header bar
  headerBar: {
    backgroundColor: BURGUNDY,
    paddingVertical: 18,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerBrand: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 3,
  },
  headerTagline: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1,
  },
  // Title section
  titleSection: {
    paddingHorizontal: 48,
    paddingTop: 36,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: LINE_PRIMARY,
  },
  reportLabel: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: BURGUNDY,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  reportTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 10,
    lineHeight: 1.2,
  },
  reportMeta: {
    flexDirection: 'row',
    gap: 24,
  },
  reportMetaItem: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_MUTED,
  },
  reportMetaValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: TEXT_SECONDARY,
  },
  // Market data summary strip
  dataStrip: {
    backgroundColor: BG_SECONDARY,
    paddingHorizontal: 48,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: LINE_SECONDARY,
  },
  dataStripItem: {
    alignItems: 'center',
    flex: 1,
  },
  dataStripLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: TEXT_MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },
  dataStripValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: BURGUNDY,
    textAlign: 'center',
  },
  dataStripSub: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: TEXT_MUTED,
    textAlign: 'center',
    marginTop: 2,
  },
  dataStripDivider: {
    width: 1,
    backgroundColor: LINE_PRIMARY,
    marginHorizontal: 8,
  },
  // Content area
  content: {
    paddingHorizontal: 48,
    paddingTop: 32,
  },
  // Section styling
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionNumber: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: BURGUNDY,
    letterSpacing: 1,
    marginRight: 10,
    minWidth: 20,
  },
  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: BURGUNDY,
    letterSpacing: 0.5,
    flex: 1,
  },
  sectionLine: {
    height: 1,
    backgroundColor: LINE_PRIMARY,
    flex: 1,
    marginLeft: 12,
  },
  sectionBody: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: TEXT_SECONDARY,
    lineHeight: 1.65,
  },
  // Properties table
  tableSection: {
    marginBottom: 28,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BURGUNDY,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE_SECONDARY,
  },
  tableRowAlt: {
    backgroundColor: BG_SECONDARY,
  },
  tableCell: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TEXT_SECONDARY,
    flex: 1,
  },
  tableCellBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: TEXT_PRIMARY,
    flex: 1,
  },
  // Sources
  sourcesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: LINE_SECONDARY,
  },
  sourcesTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: TEXT_MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sourceItem: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    color: TEXT_MUTED,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: BURGUNDY,
    paddingVertical: 12,
    paddingHorizontal: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.5,
  },
  footerCenter: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  footerRight: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'right',
  },
  // Page divider
  divider: {
    height: 1,
    backgroundColor: LINE_SECONDARY,
    marginVertical: 20,
    marginHorizontal: 48,
  },
  // Olive accent bar
  accentBar: {
    height: 3,
    backgroundColor: OLIVE,
    width: 32,
    marginBottom: 16,
  },
  // Emphasis box
  emphasisBox: {
    backgroundColor: BG_SECONDARY,
    borderLeftWidth: 3,
    borderLeftColor: BURGUNDY,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  emphasisText: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 10,
    color: TEXT_SECONDARY,
    lineHeight: 1.6,
  },
  // Inline data callout
  dataCallout: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  calloutItem: {
    flex: 1,
    backgroundColor: BG_SECONDARY,
    borderTopWidth: 2,
    borderTopColor: OLIVE,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calloutLabel: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  calloutValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: OLIVE,
  },
  calloutNote: {
    fontFamily: 'Helvetica',
    fontSize: 7,
    color: TEXT_MUTED,
    marginTop: 2,
  },
  manualNote: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 8,
    color: TEXT_MUTED,
  },
});

interface PDFTemplateProps {
  reportData: ReportData;
  marketData: MarketData;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const months = [
      'januar', 'februar', 'mars', 'april', 'mai', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'desember',
    ];
    return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
}

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return '–';
  return new Intl.NumberFormat('nb-NO', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(price) + ' ' + currency;
}

function getEffectiveEurNok(reportData: ReportData, marketData: MarketData): string {
  const value = reportData.manualData?.eurNok ?? marketData.eurNok.data?.rate;
  if (value == null) return 'Ikke tilgjengelig';
  return value.toFixed(2) + ' NOK';
}

function getEffectiveHPI(reportData: ReportData, marketData: MarketData): string {
  const value = reportData.manualData?.italyHPI ?? marketData.italyHPI.data?.value;
  if (value == null) return 'Ikke tilgjengelig';
  return value.toFixed(1);
}

function getEffectiveTuscanyPrice(reportData: ReportData, marketData: MarketData): string {
  const value = reportData.manualData?.tuscanyAvgPrice ?? marketData.tuscanyData.data?.avgPricePerSqm;
  if (value == null) return 'Ikke tilgjengelig';
  return new Intl.NumberFormat('nb-NO').format(value) + ' EUR/kvm';
}

const ReportDocument: React.FC<PDFTemplateProps> = ({ reportData, marketData }) => {
  const eurNokValue = getEffectiveEurNok(reportData, marketData);
  const hpiValue = getEffectiveHPI(reportData, marketData);
  const tuscanyPrice = getEffectiveTuscanyPrice(reportData, marketData);
  const yoy = marketData.italyHPI.data?.yearOnYear ?? null;
  const yoyStr = yoy !== null ? `${yoy > 0 ? '+' : ''}${yoy}% ÅoÅ` : '–';
  const hpiIsManual = !!reportData.manualData?.italyHPI || marketData.italyHPI.status !== 'success';
  const eurNokIsManual = !!reportData.manualData?.eurNok || marketData.eurNok.status !== 'success';
  const tuscanyIsManual = !!reportData.manualData?.tuscanyAvgPrice;

  return (
    <Document
      title={`Kämpe Estates Markedsrapport – ${reportData.edition}`}
      author="Kämpe Estates"
      subject="Italiensk luksus eiendom – markedsrapport"
      keywords="Italia, Toscana, eiendom, luksus, boligmarked"
      creator="Kämpe Estates Report Generator"
      producer="@react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        {/* ── HEADER BAR ── */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerBrand}>KÄMPE ESTATES</Text>
            <Text style={styles.headerTagline}>LUKSUS EIENDOM · ITALIA</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.headerTagline, { fontSize: 9, color: 'rgba(255,255,255,0.85)' }]}>
              MARKEDSRAPPORT
            </Text>
            <Text style={[styles.headerTagline, { marginTop: 2 }]}>
              {formatDate(reportData.date)}
            </Text>
          </View>
        </View>

        {/* ── TITLE SECTION ── */}
        <View style={styles.titleSection}>
          <Text style={styles.reportLabel}>UTGAVE · {reportData.edition}</Text>
          <Text style={styles.reportTitle}>
            Kämpe Estates{'\n'}Markedsrapport Italia
          </Text>
          <View style={styles.reportMeta}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Text style={styles.reportMetaItem}>Dato:</Text>
              <Text style={styles.reportMetaValue}>{formatDate(reportData.date)}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <Text style={styles.reportMetaItem}>Fokusområde:</Text>
              <Text style={styles.reportMetaValue}>{reportData.areaSpotlight}</Text>
            </View>
          </View>
        </View>

        {/* ── MARKET DATA STRIP ── */}
        <View style={styles.dataStrip}>
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>EUR/NOK-kurs</Text>
            <Text style={styles.dataStripValue}>{eurNokValue}</Text>
            <Text style={styles.dataStripSub}>
              {eurNokIsManual ? 'Manuelt oppgitt' : `Per ${marketData.eurNok.data?.date || 'siste'}`}
            </Text>
          </View>
          <View style={styles.dataStripDivider} />
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>Italia HPI</Text>
            <Text style={styles.dataStripValue}>{hpiValue}</Text>
            <Text style={styles.dataStripSub}>
              {marketData.italyHPI.data?.period || (hpiIsManual ? 'Manuelt' : '–')}
            </Text>
          </View>
          <View style={styles.dataStripDivider} />
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>Årsendring HPI</Text>
            <Text style={[styles.dataStripValue, { color: yoy !== null && yoy >= 0 ? OLIVE : '#8B2020' }]}>
              {yoyStr}
            </Text>
            <Text style={styles.dataStripSub}>Prisindeks</Text>
          </View>
          <View style={styles.dataStripDivider} />
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>Toscana snitt</Text>
            <Text style={styles.dataStripValue}>{tuscanyPrice}</Text>
            <Text style={styles.dataStripSub}>{tuscanyIsManual ? 'Manuelt oppgitt' : '–'}</Text>
          </View>
        </View>

        {/* ── CONTENT ── */}
        <View style={styles.content}>

          {/* SECTION 1: Italy Overview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>01</Text>
              <Text style={styles.sectionTitle}>Markedsoversikt Italia</Text>
              <View style={styles.sectionLine} />
            </View>
            <Text style={styles.sectionBody}>
              {reportData.sections.italyOverview || 'Ingen tekst lagt inn for dette avsnittet.'}
            </Text>
          </View>

          {/* SECTION 2: Tuscany */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>02</Text>
              <Text style={styles.sectionTitle}>Toscana i fokus</Text>
              <View style={styles.sectionLine} />
            </View>
            <Text style={styles.sectionBody}>
              {reportData.sections.tuscanyFocus || 'Ingen tekst lagt inn for dette avsnittet.'}
            </Text>
          </View>

          {/* SECTION 3: Norwegian Buyers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>03</Text>
              <Text style={styles.sectionTitle}>Relevant for norske kjøpere</Text>
              <View style={styles.sectionLine} />
            </View>

            {/* NOK/EUR callout box */}
            <View style={styles.dataCallout}>
              <View style={styles.calloutItem}>
                <Text style={styles.calloutLabel}>EUR/NOK vekslingskurs</Text>
                <Text style={styles.calloutValue}>{eurNokValue}</Text>
                <Text style={styles.calloutNote}>
                  Kilde: {eurNokIsManual ? 'Manuelt oppgitt' : 'Norges Bank'}
                </Text>
              </View>
              <View style={styles.calloutItem}>
                <Text style={styles.calloutLabel}>Italia HPI (indeks)</Text>
                <Text style={styles.calloutValue}>{hpiValue}</Text>
                <Text style={styles.calloutNote}>
                  Kilde: {hpiIsManual ? 'Manuelt oppgitt' : 'Eurostat'}
                </Text>
              </View>
              {tuscanyPrice !== 'Ikke tilgjengelig' && (
                <View style={styles.calloutItem}>
                  <Text style={styles.calloutLabel}>Toscana gjennomsnitt</Text>
                  <Text style={styles.calloutValue}>{tuscanyPrice}</Text>
                  <Text style={styles.calloutNote}>
                    Kilde: Manuelt oppgitt
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionBody}>
              {reportData.sections.norwegianBuyers || 'Ingen tekst lagt inn for dette avsnittet.'}
            </Text>
          </View>

        </View>

        {/* ── FOOTER PAGE 1 ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>KÄMPE ESTATES</Text>
          <Text style={styles.footerCenter}>
            Konfidensielt markedsdokument · Kun for interne og klientformål
          </Text>
          <Text style={styles.footerRight}>
            Rapport: {reportData.edition} · {formatDate(reportData.date)}
          </Text>
        </View>
      </Page>

      {/* ── PAGE 2 ── */}
      <Page size="A4" style={styles.page}>
        {/* Header bar page 2 */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerBrand}>KÄMPE ESTATES</Text>
            <Text style={styles.headerTagline}>LUKSUS EIENDOM · ITALIA</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={[styles.headerTagline, { fontSize: 9, color: 'rgba(255,255,255,0.85)' }]}>
              MARKEDSRAPPORT · FORTS.
            </Text>
            <Text style={[styles.headerTagline, { marginTop: 2 }]}>
              {formatDate(reportData.date)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>

          {/* SECTION 4: Area Spotlight */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>04</Text>
              <Text style={styles.sectionTitle}>
                Områdesøkelys – {reportData.areaSpotlight}
              </Text>
              <View style={styles.sectionLine} />
            </View>
            <Text style={styles.sectionBody}>
              {reportData.sections.areaSpotlight || 'Ingen tekst lagt inn for dette avsnittet.'}
            </Text>
          </View>

          {/* SECTION 5: Editorial */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>05</Text>
              <Text style={styles.sectionTitle}>Redaksjonell vurdering</Text>
              <View style={styles.sectionLine} />
            </View>
            <View style={styles.emphasisBox}>
              <Text style={styles.emphasisText}>
                {reportData.sections.editorialComment || 'Ingen redaksjonell tekst lagt inn.'}
              </Text>
            </View>
          </View>

          {/* ── PROPERTIES TABLE ── */}
          {marketData.notionProperties && marketData.notionProperties.length > 0 && (
            <View style={styles.tableSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionNumber}>–</Text>
                <Text style={styles.sectionTitle}>Aktuelle eiendommer</Text>
                <View style={styles.sectionLine} />
              </View>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, { flex: 2.5 }]}>Eiendom</Text>
                  <Text style={styles.tableHeaderCell}>Område</Text>
                  <Text style={styles.tableHeaderCell}>Pris</Text>
                  <Text style={styles.tableHeaderCell}>Kvm</Text>
                  <Text style={styles.tableHeaderCell}>Status</Text>
                </View>
                {marketData.notionProperties.slice(0, 8).map((prop, idx) => (
                  <View
                    key={prop.id}
                    style={[
                      styles.tableRow,
                      idx % 2 === 1 ? styles.tableRowAlt : {},
                    ]}
                  >
                    <Text style={[styles.tableCellBold, { flex: 2.5 }]} numberOfLines={2}>
                      {prop.address}
                    </Text>
                    <Text style={styles.tableCell} numberOfLines={1}>
                      {prop.area}
                    </Text>
                    <Text style={styles.tableCell}>
                      {formatPrice(prop.price, prop.currency)}
                    </Text>
                    <Text style={styles.tableCell}>
                      {prop.sqm !== null ? `${prop.sqm} m²` : '–'}
                    </Text>
                    <Text style={styles.tableCell} numberOfLines={1}>
                      {prop.status}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ── DATA SOURCES ── */}
          <View style={styles.sourcesSection}>
            <Text style={styles.sourcesTitle}>Datakilder</Text>
            <Text style={styles.sourceItem}>
              • EUR/NOK-kurs: Norges Bank Exchange Rate API –
              data.norges-bank.no/api/data/EXR/B.EUR.NOK.SP
            </Text>
            <Text style={styles.sourceItem}>
              • Boligprisindeks Italia: Eurostat PRC_HPI_A –
              ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/PRC_HPI_A
            </Text>
            <Text style={styles.sourceItem}>
              • Toscana markedsdata: Banca d'Italia –
              bancaditalia.it/statistiche/tematiche/moneta-credito-liquidita
            </Text>
            <Text style={styles.sourceItem}>
              • Eiendommer: Kämpe Estates Notion-database (ID: 33b1573c-e82d-80e6-ae7e-f008c4a26fa6)
            </Text>
            <Text style={[styles.sourceItem, { marginTop: 6, fontFamily: 'Helvetica-Oblique' }]}>
              Rapporten er generert {formatDate(reportData.date)} og er kun ment
              som et internt arbeidsverktøy for Kämpe Estates og deres klienter.
              Informasjonen er ikke juridisk eller finansiell rådgivning.
            </Text>
          </View>
        </View>

        {/* ── FOOTER PAGE 2 ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerLeft}>KÄMPE ESTATES</Text>
          <Text style={styles.footerCenter}>
            Konfidensielt markedsdokument · Kun for interne og klientformål
          </Text>
          <Text style={styles.footerRight}>
            Rapport: {reportData.edition} · {formatDate(reportData.date)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export async function generatePDF(
  reportData: ReportData,
  marketData: MarketData
): Promise<Buffer> {
  const element = React.createElement(ReportDocument, { reportData, marketData });
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
