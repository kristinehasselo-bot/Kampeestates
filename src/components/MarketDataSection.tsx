'use client';

import { MarketData } from '@/types';
import DataStatusBadge from './DataStatusBadge';

export interface PropertyPrices {
  // Tuscany
  villa: string;
  apartment: string;
  rustico: string;
  farm: string;
  // Italy national
  italyVilla: string;
  italyApartment: string;
}

interface MarketDataSectionProps {
  marketData: MarketData;
  manualEurNok: string;
  manualHPI: string;
  manualItalyPrice: string;
  manualTuscanyPrice: string;
  propertyPrices: PropertyPrices;
  onManualEurNokChange: (value: string) => void;
  onManualHPIChange: (value: string) => void;
  onManualItalyPriceChange: (value: string) => void;
  onManualTuscanyPriceChange: (value: string) => void;
  onPropertyPricesChange: (prices: PropertyPrices) => void;
}

function StatCard({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: number | null;
}) {
  return (
    <div className="bg-white border border-brand-line-secondary p-4 flex flex-col">
      <span className="text-xs font-inter text-brand-text-muted uppercase tracking-widest mb-2">
        {label}
      </span>
      <span className="font-cormorant text-2xl text-brand-burgundy font-medium leading-none mb-1">
        {value}
      </span>
      {sub && (
        <span className="text-xs font-inter text-brand-text-muted">{sub}</span>
      )}
      {trend !== undefined && trend !== null && (
        <span
          className={`text-xs font-inter font-medium mt-1 ${
            trend >= 0 ? 'text-emerald-600' : 'text-red-600'
          }`}
        >
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% år/år
        </span>
      )}
    </div>
  );
}

export default function MarketDataSection({
  marketData,
  manualEurNok,
  manualHPI,
  manualItalyPrice,
  manualTuscanyPrice,
  propertyPrices,
  onManualEurNokChange,
  onManualHPIChange,
  onManualItalyPriceChange,
  onManualTuscanyPriceChange,
  onPropertyPricesChange,
}: MarketDataSectionProps) {
  const { eurNok, italyHPI, tuscanyData } = marketData;

  const eurNokRate = eurNok.data?.rate ?? null;
  const eurNokDate = eurNok.data?.date ?? null;
  const hpiValue = italyHPI.data?.value ?? null;
  const hpiPeriod = italyHPI.data?.period ?? null;
  const tuscanyPrice = tuscanyData.data?.avgPricePerSqm ?? null;

  const eurNokDisplay = manualEurNok
    ? `${parseFloat(manualEurNok).toFixed(2)} NOK`
    : eurNokRate !== null
    ? `${eurNokRate.toFixed(2)} NOK`
    : 'Ikke tilgjengelig';

  const hpiDisplay = manualHPI
    ? `${parseFloat(manualHPI) >= 0 ? '+' : ''}${parseFloat(manualHPI).toFixed(1)}%`
    : hpiValue !== null
    ? `${hpiValue >= 0 ? '+' : ''}${hpiValue.toFixed(1)}%`
    : 'Ikke tilgjengelig';

  const tuscanyDisplay = manualTuscanyPrice
    ? `${parseInt(manualTuscanyPrice).toLocaleString('nb-NO')} EUR/kvm`
    : tuscanyPrice !== null
    ? `${tuscanyPrice.toLocaleString('nb-NO')} EUR/kvm`
    : 'Ikke tilgjengelig';

  return (
    <div className="space-y-8">
      {/* ── Stats Row ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-cormorant text-xl text-brand-text-primary font-medium">
            Markedsdata
          </h2>
          <div className="flex-1 h-px bg-brand-line-primary" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <StatCard
            label="EUR/NOK-kurs"
            value={eurNokDisplay}
            sub={
              eurNok.status === 'success' && eurNokDate
                ? `Per ${eurNokDate}`
                : manualEurNok
                ? 'Manuelt oppgitt'
                : undefined
            }
          />
          <StatCard
            label="Boligprisvekst Italia (OECD)"
            value={hpiDisplay}
            sub={hpiPeriod || (manualHPI ? 'Manuelt oppgitt' : undefined)}
          />
          <StatCard
            label="Toscana gjennomsnittspris"
            value={tuscanyDisplay}
            sub={manualTuscanyPrice ? 'Manuelt oppgitt' : undefined}
          />
        </div>
      </div>

      {/* ── EUR/NOK section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-inter text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">
            EUR/NOK-kurs
          </h3>
          <DataStatusBadge status={eurNok.status} compact message={eurNok.errorMessage} />
        </div>
        {eurNok.status === 'success' && eurNokRate !== null ? (
          <div className="bg-brand-bg-secondary border border-brand-line-secondary p-3 text-sm font-inter text-brand-text-secondary">
            <span className="font-medium text-brand-text-primary">
              1 EUR = {eurNokRate.toFixed(4)} NOK
            </span>
            {eurNokDate && (
              <span className="text-brand-text-muted ml-2">· Dato: {eurNokDate}</span>
            )}
            <span className="text-brand-text-muted ml-2">· Kilde: {eurNok.source}</span>
          </div>
        ) : (
          <DataStatusBadge
            status={eurNok.status}
            message={eurNok.errorMessage ?? 'Klarte ikke å hente EUR/NOK-kurs. Bruk manuell overstyring nedenfor.'}
          />
        )}
        <div>
          <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
            Manuell overstyring (EUR/NOK)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.0001"
              min="0"
              placeholder={eurNokRate !== null ? eurNokRate.toFixed(4) : 'f.eks. 11.7500'}
              value={manualEurNok}
              onChange={(e) => onManualEurNokChange(e.target.value)}
              className="input-field max-w-xs"
            />
            {manualEurNok && (
              <button
                type="button"
                onClick={() => onManualEurNokChange('')}
                className="text-xs text-brand-text-muted hover:text-brand-burgundy transition-colors font-inter"
              >
                Tilbakestill
              </button>
            )}
          </div>
          {manualEurNok && (
            <p className="text-xs text-brand-text-muted mt-1 font-inter">
              Manuell verdi brukes i PDF:{' '}
              <strong>{parseFloat(manualEurNok).toFixed(4)} NOK</strong>
            </p>
          )}
        </div>
      </div>

      <hr className="divider" />

      {/* ── Italy HPI section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-inter text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">
            Boligprisvekst Italia – årsendring (OECD)
          </h3>
          <DataStatusBadge status={italyHPI.status} compact message={italyHPI.errorMessage} />
        </div>
        {italyHPI.status === 'success' && hpiValue !== null ? (
          <div className="bg-brand-bg-secondary border border-brand-line-secondary p-3 text-sm font-inter text-brand-text-secondary">
            <span
              className={`font-medium ${hpiValue >= 0 ? 'text-emerald-700' : 'text-red-700'}`}
            >
              {hpiValue >= 0 ? '▲' : '▼'} {hpiValue >= 0 ? '+' : ''}{hpiValue.toFixed(1)}% boligprisvekst
            </span>
            {hpiPeriod && (
              <span className="text-brand-text-muted ml-2">· Periode: {hpiPeriod}</span>
            )}
            <span className="text-brand-text-muted ml-2">· Kilde: {italyHPI.source}</span>
          </div>
        ) : (
          <div className="space-y-2">
            <DataStatusBadge
              status={italyHPI.status}
              message={italyHPI.errorMessage ?? 'Klarte ikke å hente boligprisindeks. Bruk manuell overstyring nedenfor.'}
            />
            <p className="text-xs font-inter text-brand-text-muted leading-relaxed">
              Hent årsendringen manuelt fra{' '}
              <a
                href="https://ec.europa.eu/eurostat/databrowser/view/PRC_HPI_A/default/table"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-brand-burgundy hover:opacity-70"
              >
                Eurostat HPI-tabell
              </a>
              {' (velg Italia / RCH_A, siste år) eller '}
              <a
                href="https://www.oecd.org/en/data/indicators/housing-prices.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-brand-burgundy hover:opacity-70"
              >
                OECD Housing Prices
              </a>
              . Oppgi verdien i feltet nedenfor.
            </p>
          </div>
        )}
        <div>
          <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
            Manuell overstyring (årsendring i %)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              placeholder={hpiValue !== null ? hpiValue.toFixed(1) : 'f.eks. 3.2'}
              value={manualHPI}
              onChange={(e) => onManualHPIChange(e.target.value)}
              className="input-field max-w-xs"
            />
            {manualHPI && (
              <button
                type="button"
                onClick={() => onManualHPIChange('')}
                className="text-xs text-brand-text-muted hover:text-brand-burgundy transition-colors font-inter"
              >
                Tilbakestill
              </button>
            )}
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* ── Eiendomspriser Italy + Tuscany ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-inter text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">
            Eiendomspriser per type – Italia og Toscana (EUR/kvm)
          </h3>
          <DataStatusBadge status="manual" compact label="Manuell inndata" />
        </div>
        <DataStatusBadge
          status="manual"
          message="Legg inn snittpriser fra OMI (Agenzia delle Entrate) eller Banca d'Italia. Klikk kildelenkene nedenfor for å hente siste tall."
        />

        {/* ── Italia nasjonalt ── */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p className="text-xs font-inter font-semibold text-brand-text-muted uppercase tracking-wider">
              Italia nasjonalt
            </p>
            <a
              href="https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/banche-dati/quotazioni-immobiliari"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-inter text-brand-burgundy underline hover:opacity-70"
            >
              Hent tall fra OMI →
            </a>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                Italia gjennomsnitt alle typer (EUR/kvm)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="f.eks. 1800"
                  value={manualItalyPrice}
                  onChange={(e) => onManualItalyPriceChange(e.target.value)}
                  className="input-field max-w-xs"
                />
                {manualItalyPrice && (
                  <button type="button" onClick={() => onManualItalyPriceChange('')}
                    className="text-xs text-brand-text-muted hover:text-brand-burgundy transition-colors font-inter">
                    Tilbakestill
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'italyVilla' as const, label: 'Villa / Luksusbolig', placeholder: 'f.eks. 3500' },
                { key: 'italyApartment' as const, label: 'Leilighet / Appartamento', placeholder: 'f.eks. 1600' },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                    {label} (EUR/kvm)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    placeholder={placeholder}
                    value={propertyPrices[key]}
                    onChange={(e) =>
                      onPropertyPricesChange({ ...propertyPrices, [key]: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Toscana ── */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <p className="text-xs font-inter font-semibold text-brand-text-muted uppercase tracking-wider">
              Toscana
            </p>
            <a
              href="https://www.bancaditalia.it/pubblicazioni/sondaggio-abitazioni/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-inter text-brand-burgundy underline hover:opacity-70"
            >
              {"Banca d'Italia rapport →"}
            </a>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                Toscana gjennomsnitt alle typer (EUR/kvm)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="100"
                  min="0"
                  placeholder="f.eks. 2800"
                  value={manualTuscanyPrice}
                  onChange={(e) => onManualTuscanyPriceChange(e.target.value)}
                  className="input-field max-w-xs"
                />
                {manualTuscanyPrice && (
                  <button type="button" onClick={() => onManualTuscanyPriceChange('')}
                    className="text-xs text-brand-text-muted hover:text-brand-burgundy transition-colors font-inter">
                    Tilbakestill
                  </button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'villa' as const, label: 'Villa / Luksusbolig', placeholder: 'f.eks. 4500' },
                { key: 'apartment' as const, label: 'Leilighet / Appartamento', placeholder: 'f.eks. 2200' },
                { key: 'rustico' as const, label: 'Rustico / Casale', placeholder: 'f.eks. 2600' },
                { key: 'farm' as const, label: 'Tenuta / Agriturismo', placeholder: 'f.eks. 1800' },
              ] as const).map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
                    {label} (EUR/kvm)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    placeholder={placeholder}
                    value={propertyPrices[key]}
                    onChange={(e) =>
                      onPropertyPricesChange({ ...propertyPrices, [key]: e.target.value })
                    }
                    className="input-field w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-brand-text-muted font-inter leading-relaxed">
          Hent prisdata fra:{' '}
          <a
            href="https://www.agenziaentrate.gov.it/portale/schede/fabbricatiterreni/omi/banche-dati/quotazioni-immobiliari"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-burgundy transition-colors"
          >
            OMI – Quotazioni Immobiliari
          </a>
          {' (søk på region/kommune/type) · '}
          <a
            href="https://www.bancaditalia.it/pubblicazioni/sondaggio-abitazioni/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-brand-burgundy transition-colors"
          >
            {"Banca d'Italia – Sondaggio abitazioni"}
          </a>
          {' (kvartalsvise markedsdata)'}
        </p>
      </div>

    </div>
  );
}
