'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MarketData, ReportData, ArchiveEntry } from '@/types';
import MarketDataSection from './MarketDataSection';
import ReportEditor from './ReportEditor';
import GenerateButton from './GenerateButton';
import NewsSection from './NewsSection';
import RateHistoryCard from './RateHistoryCard';
import EmailModal from './EmailModal';

interface DashboardProps {
  initialMarketData: MarketData;
}

type ActiveTab = 'data' | 'editor' | 'archive';

function getDefaultReportData(): ReportData {
  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.ceil((now.getMonth() + 1) / 3);
  return {
    edition: `Q${quarter} ${year}`,
    date: now.toISOString().split('T')[0],
    areaSpotlight: 'Chianti',
    sections: {
      italyOverview: '',
      tuscanyFocus: '',
      norwegianBuyers: '',
      areaSpotlight: '',
      editorialComment: '',
    },
    manualData: {},
  };
}

export default function Dashboard({ initialMarketData }: DashboardProps) {
  const router = useRouter();
  const [marketData, setMarketData] = useState<MarketData>(initialMarketData);
  const [reportData, setReportData] = useState<ReportData>(getDefaultReportData());
  const [activeTab, setActiveTab] = useState<ActiveTab>('data');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Email modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Archive
  const [archiveEntries, setArchiveEntries] = useState<ArchiveEntry[]>([]);
  const [archiveStatus, setArchiveStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'not_configured'>('idle');
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [isSavingToArchive, setIsSavingToArchive] = useState(false);
  const [archiveSaveResult, setArchiveSaveResult] = useState<{ success: boolean; message: string } | null>(null);

  // Manual overrides stored as strings for input compatibility
  const [manualEurNok, setManualEurNok] = useState('');
  const [manualHPI, setManualHPI] = useState('');
  const [manualTuscanyPrice, setManualTuscanyPrice] = useState('');

  // Sync manual data back into reportData for PDF generation
  const syncManualData = useCallback(
    (eurNok: string, hpi: string, tuscany: string) => {
      setReportData((prev) => ({
        ...prev,
        manualData: {
          eurNok: eurNok ? parseFloat(eurNok) : undefined,
          italyHPI: hpi ? parseFloat(hpi) : undefined,
          tuscanyAvgPrice: tuscany ? parseFloat(tuscany) : undefined,
        },
      }));
    },
    []
  );

  const handleManualEurNokChange = (value: string) => {
    setManualEurNok(value);
    syncManualData(value, manualHPI, manualTuscanyPrice);
  };

  const handleManualHPIChange = (value: string) => {
    setManualHPI(value);
    syncManualData(manualEurNok, value, manualTuscanyPrice);
  };

  const handleManualTuscanyPriceChange = (value: string) => {
    setManualTuscanyPrice(value);
    syncManualData(manualEurNok, manualHPI, value);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/market-data');
      if (response.ok) {
        const freshData = await response.json();
        setMarketData(freshData);
      }
    } catch (error) {
      console.error('Failed to refresh market data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/callback', { method: 'DELETE' });
      router.push('/login');
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  };

  const handleSaveToArchive = async () => {
    setIsSavingToArchive(true);
    setArchiveSaveResult(null);
    try {
      const response = await fetch('/api/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportData }),
      });
      const data = await response.json();
      if (response.ok) {
        setArchiveSaveResult({
          success: true,
          message: `Rapport lagret til arkiv${data.notionUrl ? ' – se Notion' : ''}.`,
        });
      } else {
        setArchiveSaveResult({
          success: false,
          message: data.error ?? 'Klarte ikke å lagre til arkiv.',
        });
      }
    } catch (err) {
      setArchiveSaveResult({
        success: false,
        message: err instanceof Error ? err.message : 'Nettverksfeil.',
      });
    } finally {
      setIsSavingToArchive(false);
    }
  };

  const handleLoadArchive = async () => {
    setArchiveStatus('loading');
    setArchiveError(null);
    try {
      const response = await fetch('/api/archive');
      const data = await response.json();
      if (response.ok) {
        setArchiveEntries(data.entries ?? []);
        setArchiveStatus(data.status ?? 'success');
        if (data.status === 'not_configured') {
          setArchiveError(data.errorMessage ?? null);
        }
      } else {
        setArchiveStatus('error');
        setArchiveError(data.error ?? 'Klarte ikke å hente arkiv.');
      }
    } catch (err) {
      setArchiveStatus('error');
      setArchiveError(err instanceof Error ? err.message : 'Nettverksfeil.');
    }
  };

  // Load archive when switching to archive tab
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'archive' && archiveStatus === 'idle') {
      handleLoadArchive();
    }
  };

  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'data',
      label: 'Markedsdata',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'editor',
      label: 'Rapportinnhold',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      id: 'archive',
      label: 'Arkiv',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ];

  const effectiveMarketData: MarketData = {
    ...marketData,
    eurNok: {
      ...marketData.eurNok,
      data: {
        rate: manualEurNok ? parseFloat(manualEurNok) : (marketData.eurNok.data?.rate ?? 0),
        date: marketData.eurNok.data?.date ?? '',
      },
    },
    italyHPI: {
      ...marketData.italyHPI,
      data: marketData.italyHPI.data
        ? {
            ...marketData.italyHPI.data,
            value: manualHPI ? parseFloat(manualHPI) : marketData.italyHPI.data.value,
          }
        : manualHPI
        ? { value: parseFloat(manualHPI), period: 'Manuelt', yearOnYear: null }
        : null,
    },
    tuscanyData: {
      ...marketData.tuscanyData,
      data: manualTuscanyPrice
        ? { avgPricePerSqm: parseFloat(manualTuscanyPrice), trend: 'Manuelt oppgitt' }
        : marketData.tuscanyData.data,
    },
  };

  const hasManualInputs = manualEurNok || manualHPI || manualTuscanyPrice;
  const autoSuccessCount = [
    marketData.eurNok.status === 'success' ? 1 : 0,
    marketData.italyHPI.status === 'success' ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-brand-bg-primary flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="bg-brand-burgundy text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-inter text-sm font-bold tracking-widest text-white">
                  KÄMPE ESTATES
                </span>
                <span className="ml-3 font-inter text-xs text-white/50 hidden sm:inline">
                  Markedsrapport Italia
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefreshData}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs font-inter text-white/70 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/10 rounded-sm"
                title="Oppdater markedsdata"
              >
                <svg
                  className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isRefreshing ? 'Oppdaterer…' : 'Oppdater data'}
                </span>
              </button>
              <div className="w-px h-5 bg-white/20" />
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-1.5 text-xs font-inter text-white/70 hover:text-white transition-colors px-3 py-1.5 hover:bg-white/10 rounded-sm"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span className="hidden sm:inline">
                  {isLoggingOut ? 'Logger ut…' : 'Logg ut'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-brand-line-secondary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="section-label text-brand-burgundy mb-1">
                RAPPORT · {reportData.edition}
              </p>
              <h1 className="font-cormorant text-display-md text-brand-text-primary font-light">
                Kämpe Estates Markedsrapport
              </h1>
              <p className="font-inter text-sm text-brand-text-muted mt-1">
                Italiensk luksus eiendom · Norsk markedsanalyse
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {autoSuccessCount > 0 && (
                <div className="flex items-center gap-1.5 text-xs font-inter text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-sm">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {autoSuccessCount} kilde{autoSuccessCount > 1 ? 'r' : ''} hentet automatisk
                </div>
              )}
              {hasManualInputs && (
                <div className="flex items-center gap-1.5 text-xs font-inter text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-sm">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Manuelle data registrert
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* ── LEFT: TABS + CONTENT ── */}
          <div className="flex-1 min-w-0">
            {/* Tab bar */}
            <div className="flex border-b border-brand-line-primary mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-inter font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-brand-burgundy text-brand-burgundy'
                      : 'border-transparent text-brand-text-muted hover:text-brand-text-secondary hover:border-brand-line-primary'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === 'data' && (
                <>
                  <MarketDataSection
                    marketData={marketData}
                    manualEurNok={manualEurNok}
                    manualHPI={manualHPI}
                    manualTuscanyPrice={manualTuscanyPrice}
                    onManualEurNokChange={handleManualEurNokChange}
                    onManualHPIChange={handleManualHPIChange}
                    onManualTuscanyPriceChange={handleManualTuscanyPriceChange}
                  />
                  <NewsSection />
                </>
              )}
              {activeTab === 'editor' && (
                <ReportEditor
                  reportData={reportData}
                  onReportDataChange={setReportData}
                />
              )}
              {activeTab === 'archive' && (
                <div>
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <h2 className="font-cormorant text-xl text-brand-text-primary font-medium">
                      Rapportarkiv
                    </h2>
                    <button
                      type="button"
                      onClick={handleLoadArchive}
                      disabled={archiveStatus === 'loading'}
                      className="flex items-center gap-1.5 text-xs font-inter text-brand-text-muted hover:text-brand-text-primary transition-colors border border-brand-line-primary px-3 py-1.5"
                    >
                      <svg
                        className={`h-3.5 w-3.5 ${archiveStatus === 'loading' ? 'animate-spin' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Oppdater
                    </button>
                  </div>

                  {archiveStatus === 'loading' && (
                    <div className="flex items-center gap-2 py-8 text-brand-text-muted">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span className="text-sm font-inter">Henter arkiv…</span>
                    </div>
                  )}

                  {(archiveStatus === 'not_configured' || archiveStatus === 'error') && (
                    <div className={`px-5 py-4 text-sm font-inter leading-relaxed border ${
                      archiveStatus === 'not_configured'
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {archiveError ?? 'Klarte ikke å hente arkiv.'}
                    </div>
                  )}

                  {archiveStatus === 'success' && archiveEntries.length === 0 && (
                    <div className="bg-brand-bg-secondary border border-brand-line-secondary px-5 py-8 text-center">
                      <p className="font-inter text-sm text-brand-text-muted">
                        Ingen lagrede rapporter ennå.
                      </p>
                      <p className="font-inter text-xs text-brand-text-muted mt-1">
                        Bruk &quot;Lagre til arkiv&quot; i sidepanelet for å arkivere rapporter.
                      </p>
                    </div>
                  )}

                  {archiveStatus === 'success' && archiveEntries.length > 0 && (
                    <div className="border border-brand-line-secondary">
                      <div className="bg-brand-burgundy px-5 py-3 flex gap-4 text-xs font-inter font-semibold text-white uppercase tracking-wider">
                        <span className="flex-1">Utgave</span>
                        <span className="w-28">Dato</span>
                        <span className="w-32 hidden sm:block">Fokusområde</span>
                        <span className="w-28 hidden md:block">Opprettet</span>
                        <span className="w-16 text-right">Lenke</span>
                      </div>
                      {archiveEntries.map((entry, idx) => (
                        <div
                          key={entry.id}
                          className={`flex items-center gap-4 px-5 py-3 border-b border-brand-line-secondary last:border-b-0 ${
                            idx % 2 === 1 ? 'bg-brand-bg-secondary' : 'bg-white'
                          }`}
                        >
                          <span className="flex-1 text-sm font-inter font-medium text-brand-text-primary">
                            {entry.edition}
                          </span>
                          <span className="w-28 text-xs font-inter text-brand-text-muted">
                            {entry.date
                              ? new Date(entry.date).toLocaleDateString('nb-NO')
                              : '–'}
                          </span>
                          <span className="w-32 text-xs font-inter text-brand-text-muted hidden sm:block truncate">
                            {entry.areaSpotlight}
                          </span>
                          <span className="w-28 text-xs font-inter text-brand-text-muted hidden md:block">
                            {entry.createdAt
                              ? new Date(entry.createdAt).toLocaleDateString('nb-NO')
                              : '–'}
                          </span>
                          <div className="w-16 text-right">
                            {entry.notionUrl ? (
                              <a
                                href={entry.notionUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-inter text-brand-burgundy hover:underline"
                              >
                                Notion →
                              </a>
                            ) : (
                              <span className="text-xs font-inter text-brand-text-muted">–</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="w-80 flex-shrink-0 space-y-6">
            {/* Generate PDF card */}
            <div className="bg-white border border-brand-line-secondary p-6">
              <div className="mb-4">
                <div className="h-0.5 w-8 bg-brand-burgundy mb-3" />
                <h2 className="font-cormorant text-xl text-brand-text-primary font-medium mb-1">
                  Generer rapport
                </h2>
                <p className="text-xs font-inter text-brand-text-muted leading-relaxed">
                  Alle data og redaksjonelt innhold kombineres til en PDF-rapport klar for distribusjon.
                </p>
              </div>

              {/* Report summary */}
              <div className="bg-brand-bg-secondary border border-brand-line-secondary p-3 mb-4 space-y-1.5">
                <div className="flex justify-between text-xs font-inter">
                  <span className="text-brand-text-muted">Utgave</span>
                  <span className="text-brand-text-primary font-medium">
                    {reportData.edition || '–'}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-inter">
                  <span className="text-brand-text-muted">Dato</span>
                  <span className="text-brand-text-primary font-medium">
                    {reportData.date
                      ? new Date(reportData.date).toLocaleDateString('nb-NO')
                      : '–'}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-inter">
                  <span className="text-brand-text-muted">Fokusområde</span>
                  <span className="text-brand-text-primary font-medium">
                    {reportData.areaSpotlight || '–'}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-inter">
                  <span className="text-brand-text-muted">EUR/NOK</span>
                  <span className="text-brand-text-primary font-medium tabular-nums">
                    {manualEurNok
                      ? `${parseFloat(manualEurNok).toFixed(4)} (manuell)`
                      : effectiveMarketData.eurNok.data?.rate != null
                      ? `${effectiveMarketData.eurNok.data.rate.toFixed(4)}`
                      : '–'}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-inter">
                  <span className="text-brand-text-muted">Avsnitt fylt ut</span>
                  <span className="text-brand-text-primary font-medium">
                    {Object.values(reportData.sections).filter((s) => s.trim()).length} / 5
                  </span>
                </div>
              </div>

              <GenerateButton
                reportData={reportData}
                marketData={effectiveMarketData}
              />

              {/* Email & Archive actions */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-inter font-medium border border-brand-line-primary text-brand-text-secondary hover:bg-brand-bg-secondary transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send e-post
                </button>
                <button
                  type="button"
                  onClick={handleSaveToArchive}
                  disabled={isSavingToArchive}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-inter font-medium border transition-colors ${
                    isSavingToArchive
                      ? 'border-brand-line-primary text-brand-text-muted cursor-not-allowed'
                      : 'border-brand-line-primary text-brand-text-secondary hover:bg-brand-bg-secondary'
                  }`}
                >
                  {isSavingToArchive ? (
                    <>
                      <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Lagrer…
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      Lagre til arkiv
                    </>
                  )}
                </button>
              </div>

              {/* Archive save feedback */}
              {archiveSaveResult && (
                <div
                  className={`mt-2 px-3 py-2 text-xs font-inter leading-relaxed ${
                    archiveSaveResult.success
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {archiveSaveResult.message}
                </div>
              )}
            </div>

            {/* EUR/NOK 90-day history */}
            <RateHistoryCard />

            {/* Checklist */}
            <div className="bg-brand-bg-secondary border border-brand-line-secondary p-5">
              <h3 className="font-inter text-xs font-semibold text-brand-text-secondary uppercase tracking-wider mb-3">
                Sjekkliste
              </h3>
              <ul className="space-y-2">
                {[
                  {
                    label: 'Utgavenummer satt',
                    done: !!reportData.edition.trim(),
                  },
                  {
                    label: 'Rapportdato valgt',
                    done: !!reportData.date,
                  },
                  {
                    label: 'Fokusområde satt',
                    done: !!reportData.areaSpotlight.trim(),
                  },
                  {
                    label: 'EUR/NOK-kurs tilgjengelig',
                    done:
                      !!manualEurNok ||
                      marketData.eurNok.status === 'success',
                  },
                  {
                    label: 'Italia HPI tilgjengelig',
                    done:
                      !!manualHPI ||
                      marketData.italyHPI.status === 'success',
                  },
                  {
                    label: 'Toscana pris oppgitt',
                    done: !!manualTuscanyPrice,
                  },
                  {
                    label: 'Markedsoversikt Italia',
                    done: !!reportData.sections.italyOverview.trim(),
                  },
                  {
                    label: 'Toscana i fokus',
                    done: !!reportData.sections.tuscanyFocus.trim(),
                  },
                  {
                    label: 'Norske kjøpere',
                    done: !!reportData.sections.norwegianBuyers.trim(),
                  },
                  {
                    label: 'Områdesøkelys',
                    done: !!reportData.sections.areaSpotlight.trim(),
                  },
                  {
                    label: 'Redaksjonell vurdering',
                    done: !!reportData.sections.editorialComment.trim(),
                  },
                ].map((item) => (
                  <li key={item.label} className="flex items-center gap-2 text-xs font-inter">
                    <span
                      className={`flex-shrink-0 h-4 w-4 flex items-center justify-center rounded-full border ${
                        item.done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-brand-line-primary bg-white text-transparent'
                      }`}
                    >
                      <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className={item.done ? 'text-brand-text-secondary' : 'text-brand-text-muted'}>
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Data sources info */}
            <div className="border border-brand-line-secondary p-5">
              <h3 className="font-inter text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-3">
                Datakilder
              </h3>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-xs font-inter">
                  <span
                    className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      marketData.eurNok.status === 'success'
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-brand-text-muted">
                    Norges Bank (EUR/NOK)
                  </span>
                </li>
                <li className="flex items-center gap-2 text-xs font-inter">
                  <span
                    className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      marketData.italyHPI.status === 'success'
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-brand-text-muted">
                    Eurostat (HPI Italia)
                  </span>
                </li>
                <li className="flex items-center gap-2 text-xs font-inter">
                  <span className="h-1.5 w-1.5 rounded-full flex-shrink-0 bg-blue-400" />
                  <span className="text-brand-text-muted">
                    Banca d&apos;Italia (manuell)
                  </span>
                </li>
                <li className="flex items-center gap-2 text-xs font-inter">
                  <span
                    className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                      marketData.notionProperties.length > 0
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-brand-text-muted">
                    Notion ({marketData.notionProperties.length} eiendommer)
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-brand-burgundy py-5 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-inter text-xs font-semibold tracking-widest text-white">
            KÄMPE ESTATES
          </span>
          <span className="font-inter text-xs text-white/40">
            Konfidensielt internsystem · Kun for autorisert bruk
          </span>
        </div>
      </footer>

      {/* ── EMAIL MODAL ── */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        reportData={reportData}
        marketData={effectiveMarketData}
      />
    </div>
  );
}
