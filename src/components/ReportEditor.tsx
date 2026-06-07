'use client';

import { ReportData, MarketData } from '@/types';
import AIDraftButton from './AIDraftButton';

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

const SECTION_PLACEHOLDERS: Record<string, string> = {
  italyOverview:
    'Det italienske boligmarkedet viser tegn til stabilisering etter en periode med moderat vekst. Boligprisindeksen (Eurostat PRC_HPI_A) for 2023 indikerer...',
  tuscanyFocus:
    'Toscana fortsetter å tiltrekke seg internasjonale kjøpere, særlig fra Nord-Europa og USA. Chianti-regionen og Siena-provinsen opplever...',
  norwegianBuyers:
    'Med en EUR/NOK-kurs på rundt [X], er kjøpekraften for norske kjøpere [sterk/svakere] enn foregående år. Det er viktig å merke seg at...',
  areaSpotlight:
    'Dette kvartalets fokusområde er [OMRÅDE]. Karakterisert av [beskriv landskap/arkitektur/atmosfære], tilbyr dette området...',
  editorialComment:
    'Etter å ha fulgt markedet nøye dette kvartalet, er min vurdering at...',
};

interface SectionEditorProps {
  sectionKey: keyof ReportData['sections'];
  label: string;
  description: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  reportData: ReportData;
  marketData: MarketData;
}

function SectionEditor({
  sectionKey,
  label,
  description,
  placeholder,
  value,
  onChange,
  reportData,
  marketData,
}: SectionEditorProps) {
  const charCount = value.length;
  const wordCount = value.trim()
    ? value.trim().split(/\s+/).length
    : 0;

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
          <span className="text-xs font-inter text-brand-text-muted tabular-nums">
            {wordCount} ord
          </span>
          <AIDraftButton
            section={sectionKey}
            reportData={reportData}
            marketData={marketData}
            onDraftGenerated={onChange}
          />
        </div>
      </div>
      <textarea
        id={`section-${sectionKey}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={sectionKey === 'editorialComment' ? 8 : 6}
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
  const updateSection = (
    key: keyof ReportData['sections'],
    value: string
  ) => {
    onReportDataChange({
      ...reportData,
      sections: {
        ...reportData.sections,
        [key]: value,
      },
    });
  };

  const updateMeta = (field: keyof Omit<ReportData, 'sections' | 'manualData'>, value: string) => {
    onReportDataChange({
      ...reportData,
      [field]: value,
    });
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
              placeholder="f.eks. Chianti, Siena, Val d'Orcia"
              className="input-field"
            />
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* ── Report Sections ── */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-cormorant text-xl text-brand-text-primary font-medium">
            Rapportinnhold
          </h2>
          <div className="flex-1 h-px bg-brand-line-primary" />
        </div>

        <div className="space-y-8">
          {(Object.keys(SECTION_LABELS) as Array<keyof ReportData['sections']>).map(
            (key) => (
              <SectionEditor
                key={key}
                sectionKey={key}
                label={SECTION_LABELS[key]}
                description={SECTION_DESCRIPTIONS[key]}
                placeholder={SECTION_PLACEHOLDERS[key]}
                value={reportData.sections[key]}
                onChange={(value) => updateSection(key, value)}
                reportData={reportData}
                marketData={marketData}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
