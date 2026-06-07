'use client';

import { ReportData, MarketData } from '@/types';
import { generateDraft } from '@/lib/draft-templates';

interface ReportEditorProps {
  reportData: ReportData;
  onReportDataChange: (data: ReportData) => void;
  marketData: MarketData;
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  italyOverview:
    'Gi en overordnet analyse av det italienske boligmarkedet – trender, prisutvikling, etterspørsel og makroforhold.',
  tuscanyFocus:
    'Fokuser på Toscana spesifikt: prisutvikling, attraktive områder, markedsdynamikk og langsiktige utsikter.',
  norwegianBuyers:
    'Relevant informasjon for norske kjøpere: NOK/EUR-kurs, skattemessige hensyn, juridiske forhold, finansieringsrådgivning.',
  areaSpotlight:
    'Dypdykk i det valgte fokusområdet: eiendomstyper, priser, livsstil, tilgang og nærhet til fasiliteter.',
  editorialComment:
    'Kristines personlige analyse og vurdering av markedet. Dette avsnittet signeres redaksjonelt.',
};

const SECTION_LABELS: Record<string, string> = {
  italyOverview: '01 · Markedsoversikt Italia',
  tuscanyFocus: '02 · Toscana i fokus',
  norwegianBuyers: '03 · Relevant for norske kjøpere (NOK/EUR, juridisk/skatt)',
  areaSpotlight: '04 · Områdesøkelys',
  editorialComment: '05 · Redaksjonell vurdering',
};

interface SectionEditorProps {
  sectionKey: keyof ReportData['sections'];
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  reportData: ReportData;
  marketData: MarketData;
}

function SectionEditor({
  sectionKey,
  label,
  description,
  value,
  onChange,
  reportData,
  marketData,
}: SectionEditorProps) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleFillDraft = () => {
    const draft = generateDraft(sectionKey, marketData, reportData);
    if (draft) onChange(draft);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2 flex-wrap">
        <div className="flex-1">
          <label
            htmlFor={`section-${sectionKey}`}
            className="block text-xs font-inter font-semibold text-brand-burgundy uppercase tracking-widest mb-0.5"
          >
            {label}
          </label>
          <p className="text-xs font-inter text-brand-text-muted leading-relaxed">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {wordCount > 0 && (
            <span className="text-xs font-inter text-brand-text-muted tabular-nums">
              {wordCount} ord
            </span>
          )}
          <button
            type="button"
            onClick={handleFillDraft}
            title={value ? 'Erstatt med tekstforslag' : 'Fyll inn tekstforslag'}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-inter font-medium border border-brand-line-primary text-brand-text-secondary hover:bg-brand-bg-secondary hover:text-brand-burgundy transition-colors rounded-sm"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {value ? 'Nytt forslag' : 'Fyll inn forslag'}
          </button>
        </div>
      </div>
      <textarea
        id={`section-${sectionKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Klikk «Fyll inn forslag» for å få et ferdig tekstutkast som du kan redigere, eller skriv tekst direkte her."
        rows={sectionKey === 'editorialComment' ? 10 : 8}
        className="textarea-field"
      />
      {charCount > 3000 && (
        <p className="text-xs font-inter text-amber-600">
          Avsnittet er langt ({charCount} tegn). PDF-rapporten kan bli komprimert.
        </p>
      )}
    </div>
  );
}

export default function ReportEditor({
  reportData,
  onReportDataChange,
  marketData,
}: ReportEditorProps) {
  const updateSection = (key: keyof ReportData['sections'], value: string) => {
    onReportDataChange({
      ...reportData,
      sections: { ...reportData.sections, [key]: value },
    });
  };

  const updateMeta = (field: keyof Omit<ReportData, 'sections' | 'manualData'>, value: string) => {
    onReportDataChange({ ...reportData, [field]: value });
  };

  const fillAllDrafts = () => {
    const sections = { ...reportData.sections };
    (Object.keys(SECTION_LABELS) as Array<keyof ReportData['sections']>).forEach((key) => {
      sections[key] = generateDraft(key, marketData, reportData);
    });
    onReportDataChange({ ...reportData, sections });
  };

  return (
    <div className="space-y-8">
      {/* ── Report Metadata ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-cormorant text-xl text-brand-text-primary font-medium">
            Rapportinnstillinger
          </h2>
          <div className="flex-1 h-px bg-brand-line-primary" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="report-edition"
              className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1.5"
            >
              Utgave / Nummer
            </label>
            <input
              id="report-edition"
              type="text"
              value={reportData.edition}
              onChange={(e) => updateMeta('edition', e.target.value)}
              placeholder="f.eks. Q2 2025 eller Nr. 7"
              className="input-field"
            />
          </div>
          <div>
            <label
              htmlFor="report-date"
              className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1.5"
            >
              Rapportdato
            </label>
            <input
              id="report-date"
              type="date"
              value={reportData.date}
              onChange={(e) => updateMeta('date', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label
              htmlFor="area-spotlight"
              className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1.5"
            >
              Områdesøkelys (tema)
            </label>
            <input
              id="area-spotlight"
              type="text"
              value={reportData.areaSpotlight}
              onChange={(e) => updateMeta('areaSpotlight', e.target.value)}
              placeholder="f.eks. Val d'Orcia, Siena, Maremma"
              className="input-field"
            />
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* ── Report Sections ── */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-3">
            <h2 className="font-cormorant text-xl text-brand-text-primary font-medium">
              Rapportinnhold
            </h2>
            <div className="h-px w-16 bg-brand-line-primary" />
          </div>
          <button
            type="button"
            onClick={fillAllDrafts}
            className="flex items-center gap-2 px-4 py-2 text-xs font-inter font-medium bg-brand-bg-secondary border border-brand-line-primary text-brand-text-secondary hover:bg-white hover:text-brand-burgundy hover:border-brand-burgundy transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Fyll inn alle tekstforslag
          </button>
        </div>

        <div className="space-y-8">
          {(Object.keys(SECTION_LABELS) as Array<keyof ReportData['sections']>).map((key) => (
            <SectionEditor
              key={key}
              sectionKey={key}
              label={SECTION_LABELS[key]}
              description={SECTION_DESCRIPTIONS[key]}
              value={reportData.sections[key]}
              onChange={(value) => updateSection(key, value)}
              reportData={reportData}
              marketData={marketData}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
