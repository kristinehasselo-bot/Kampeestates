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

// Register fonts - using standard built-in PDF fonts for reliability
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
  content: {
    paddingHorizontal: 48,
    paddingTop: 32,
  },
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
  tableSection: {
    marginBottom: 28,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BURGUNDY,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
});

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
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(price) + ' ' + currency;
}

// Helper to extract effective values from DataFetchResult<T> + manual overrides
function getEurNokDisplay(reportData: ReportData, marketData: MarketData): string {
  const manual = reportData.manualData?.eurNok;
  const auto = marketData.eurNok.data?.rate ?? null;
  const value = manual ?? auto;
  return value !== null ? `${value.toFixed(2)} NOK` : 'Ikke tilgjengelig';
}

function getEurNokSource(reportData: ReportData, marketData: MarketData): string {
  if (reportData.manualData?.eurNok !== undefined) return 'Manuelt oppgitt';
  if (marketData.eurNok.status === 'success' && marketData.eurNok.data?.date) {
    return `Per ${marketData.eurNok.data.date}`;
  }
  return 'Ikke tilgjengelig';
}

function getHPIDisplay(reportData: ReportData, marketData: MarketData): string {
  const manual = reportData.manualData?.italyHPI;
  const auto = marketData.italyHPI.data?.value ?? null;
  const value = manual ?? auto;
  return value !== null ? value.toFixed(1) : 'Ikke tilgjengelig';
}

function getHPIPeriod(reportData: ReportData, marketData: MarketData): string {
  if (reportData.manualData?.italyHPI !== undefined) return 'Manuelt oppgitt';
  return marketData.italyHPI.data?.period ?? '–';
}

function getYoYDisplay(marketData: MarketData): { str: string; positive: boolean } {
  const yoy = marketData.italyHPI.data?.yearOnYear ?? null;
  if (yoy === null) return { str: '–', positive: true };
  return {
    str: `${yoy >= 0 ? '+' : ''}${yoy}% ÅoÅ`,
    positive: yoy >= 0,
  };
}

function getTuscanyDisplay(reportData: ReportData, marketData: MarketData): string {
  const manual = reportData.manualData?.tuscanyAvgPrice;
  const auto = marketData.tuscanyData.data?.avgPricePerSqm ?? null;
  const value = manual ?? auto;
  return value !== null
    ? `${new Intl.NumberFormat('nb-NO').format(value)} EUR/kvm`
    : 'Ikke tilgjengelig';
}

function getTuscanySource(reportData: ReportData, marketData: MarketData): string {
  if (reportData.manualData?.tuscanyAvgPrice !== undefined) return 'Manuelt oppgitt';
  if (marketData.tuscanyData.status === 'success') return 'Auto-hentet';
  return 'Manuelt oppgitt';
}

interface PDFDocProps {
  reportData: ReportData;
  marketData: MarketData;
}

const ReportDocument: React.FC<PDFDocProps> = ({ reportData, marketData }) => {
  const eurNokDisplay = getEurNokDisplay(reportData, marketData);
  const eurNokSub = getEurNokSource(reportData, marketData);
  const hpiDisplay = getHPIDisplay(reportData, marketData);
  const hpiPeriod = getHPIPeriod(reportData, marketData);
  const { str: yoyStr, positive: yoyPositive } = getYoYDisplay(marketData);
  const tuscanyDisplay = getTuscanyDisplay(reportData, marketData);
  const tuscanySub = getTuscanySource(reportData, marketData);
  const tuscanyHasValue =
    reportData.manualData?.tuscanyAvgPrice !== undefined ||
    marketData.tuscanyData.data !== null;

  const pageFooter = (
    <View style={styles.footer} fixed>
      <Text style={styles.footerLeft}>KÄMPE ESTATES</Text>
      <Text style={styles.footerCenter}>
        Konfidensielt markedsdokument · Kun for interne og klientformål
      </Text>
      <Text style={styles.footerRight}>
        Rapport: {reportData.edition} · {formatDate(reportData.date)}
      </Text>
    </View>
  );

  const pageHeader = (
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
  );

  return (
    <Document
      title={`Kämpe Estates Markedsrapport – ${reportData.edition}`}
      author="Kämpe Estates"
      subject="Italiensk luksus eiendom – markedsrapport"
      creator="Kämpe Estates Report Generator"
    >
      {/* ── PAGE 1 ── */}
      <Page size="A4" style={styles.page}>
        {pageHeader}

        {/* Title section */}
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

        {/* Market data strip */}
        <View style={styles.dataStrip}>
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>EUR/NOK-kurs</Text>
            <Text style={styles.dataStripValue}>{eurNokDisplay}</Text>
            <Text style={styles.dataStripSub}>{eurNokSub}</Text>
          </View>
          <View style={styles.dataStripDivider} />
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>Italia HPI</Text>
            <Text style={styles.dataStripValue}>{hpiDisplay}</Text>
            <Text style={styles.dataStripSub}>{hpiPeriod}</Text>
          </View>
          <View style={styles.dataStripDivider} />
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>Årsendring HPI</Text>
            <Text style={[styles.dataStripValue, { color: yoyPositive ? OLIVE : '#8B2020' }]}>
              {yoyStr}
            </Text>
            <Text style={styles.dataStripSub}>Prisindeks</Text>
          </View>
          <View style={styles.dataStripDivider} />
          <View style={styles.dataStripItem}>
            <Text style={styles.dataStripLabel}>Toscana snitt</Text>
            <Text style={styles.dataStripValue}>{tuscanyDisplay}</Text>
            <Text style={styles.dataStripSub}>{tuscanySub}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* 01 Italy Overview */}
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

          {/* 02 Tuscany Focus */}
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

          {/* 03 Norwegian Buyers */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNumber}>03</Text>
              <Text style={styles.sectionTitle}>Relevant for norske kjøpere</Text>
              <View style={styles.sectionLine} />
            </View>

            {/* Data callout boxes */}
            <View style={styles.dataCallout}>
              <View style={styles.calloutItem}>
                <Text style={styles.calloutLabel}>EUR/NOK vekslingskurs</Text>
                <Text style={styles.calloutValue}>{eurNokDisplay}</Text>
                <Text style={styles.calloutNote}>
                  Kilde:{' '}
                  {reportData.manualData?.eurNok !== undefined
                    ? 'Manuelt oppgitt'
                    : 'Norges Bank'}
                </Text>
              </View>
              <View style={styles.calloutItem}>
                <Text style={styles.calloutLabel}>Italia HPI (indeks)</Text>
                <Text style={styles.calloutValue}>{hpiDisplay}</Text>
                <Text style={styles.calloutNote}>
                  Kilde:{' '}
                  {reportData.manualData?.italyHPI !== undefined
                    ? 'Manuelt oppgitt'
                    : 'Eurostat'}
                </Text>
              </View>
              {tuscanyHasValue && (
                <View style={styles.calloutItem}>
                  <Text style={styles.calloutLabel}>Toscana gjennomsnitt</Text>
                  <Text style={styles.calloutValue}>{tuscanyDisplay}</Text>
                  <Text style={styles.calloutNote}>Kilde: Manuelt oppgitt</Text>
                </View>
              )}
            </View>

            <Text style={styles.sectionBody}>
              {reportData.sections.norwegianBuyers || 'Ingen tekst lagt inn for dette avsnittet.'}
            </Text>
          </View>
        </View>

        {pageFooter}
      </Page>

      {/* ── PAGE 2 ── */}
      <Page size="A4" style={styles.page}>
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
          {/* 04 Area Spotlight */}
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

          {/* 05 Editorial */}
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

          {/* Notion Properties table */}
          {marketData.notionProperties.length > 0 && (
            <View style={styles.tableSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionNumber}>–</Text>
                <Text style={styles.sectionTitle}>Aktuelle eiendommer</Text>
                <View style={styles.sectionLine} />
              </View>
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
                  style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowAlt : {}]}
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
          )}

          {/* Data sources */}
          <View style={styles.sourcesSection}>
            <Text style={styles.sourcesTitle}>Datakilder</Text>
            <Text style={styles.sourceItem}>
              • EUR/NOK-kurs: Norges Bank Exchange Rate API – data.norges-bank.no
            </Text>
            <Text style={styles.sourceItem}>
              • Boligprisindeks Italia: Eurostat PRC_HPI_A – ec.europa.eu/eurostat
            </Text>
            <Text style={styles.sourceItem}>
              • Toscana markedsdata: Banca d'Italia – bancaditalia.it (manuell inndata)
            </Text>
            <Text style={styles.sourceItem}>
              • Eiendommer: Kämpe Estates Notion-database (ID: 33b1573c-e82d-80e6-ae7e-f008c4a26fa6)
            </Text>
            <Text style={[styles.sourceItem, { marginTop: 6, fontFamily: 'Helvetica-Oblique' }]}>
              Rapporten er generert {formatDate(reportData.date)} og er kun ment som et internt
              arbeidsverktøy. Informasjonen er ikke juridisk eller finansiell rådgivning.
            </Text>
          </View>
        </View>

        {pageFooter}
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
