'use client';

import { MarketData } from '@/types';
import DataStatusBadge from './DataStatusBadge';

interface MarketDataSectionProps {
  marketData: MarketData;
  manualEurNok: string;
  manualHPI: string;
  manualTuscanyPrice: string;
  onManualEurNokChange: (value: string) => void;
  onManualHPIChange: (value: string) => void;
  onManualTuscanyPriceChange: (value: string) => void;
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
  manualTuscanyPrice,
  onManualEurNokChange,
  onManualHPIChange,
  onManualTuscanyPriceChange,
}: MarketDataSectionProps) {
  const { eurNok, italyHPI, tuscanyData, notionProperties } = marketData;

  // Extract nested data fields once
  const eurNokRate = eurNok.data?.rate ?? null;
  const eurNokDate = eurNok.data?.date ?? null;
  const hpiValue = italyHPI.data?.value ?? null;
  const hpiPeriod = italyHPI.data?.period ?? null;
  const hpiYoy = italyHPI.data?.yearOnYear ?? null;
  const tuscanyPrice = tuscanyData.data?.avgPricePerSqm ?? null;

  const eurNokDisplay = manualEurNok
    ? `${parseFloat(manualEurNok).toFixed(2)} NOK`
    : eurNokRate !== null
    ? `${eurNokRate.toFixed(2)} NOK`
    : 'Ikke tilgjengelig';

  const hpiDisplay = manualHPI
    ? parseFloat(manualHPI).toFixed(1)
    : hpiValue !== null
    ? hpiValue.toFixed(1)
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
            label="Italia HPI (Eurostat)"
            value={hpiDisplay}
            sub={hpiPeriod || (manualHPI ? 'Manuelt oppgitt' : undefined)}
            trend={hpiYoy}
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
          eurNok.errorMessage && (
            <DataStatusBadge status={eurNok.status} message={eurNok.errorMessage} />
          )
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
            Italia boligprisindeks (Eurostat)
          </h3>
          <DataStatusBadge status={italyHPI.status} compact message={italyHPI.errorMessage} />
        </div>
        {italyHPI.status === 'success' && hpiValue !== null ? (
          <div className="bg-brand-bg-secondary border border-brand-line-secondary p-3 text-sm font-inter text-brand-text-secondary">
            <span className="font-medium text-brand-text-primary">
              HPI: {hpiValue.toFixed(1)}
            </span>
            {hpiPeriod && (
              <span className="text-brand-text-muted ml-2">· Periode: {hpiPeriod}</span>
            )}
            {hpiYoy !== null && (
              <span
                className={`ml-2 font-medium ${hpiYoy >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
              >
                · {hpiYoy >= 0 ? '+' : ''}{hpiYoy}% ÅoÅ
              </span>
            )}
          </div>
        ) : (
          italyHPI.errorMessage && (
            <DataStatusBadge status={italyHPI.status} message={italyHPI.errorMessage} />
          )
        )}
        <div>
          <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
            Manuell overstyring (HPI-verdi)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder={hpiValue !== null ? hpiValue.toFixed(1) : 'f.eks. 115.2'}
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

      {/* ── Tuscany data section ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-inter text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">
            {"Toscana markedsdata (Banca d'Italia)"}
          </h3>
          <DataStatusBadge status="manual" compact label="Manuell inndata" />
        </div>
        <DataStatusBadge
          status="manual"
          message="Banca d'Italia tilbyr ikke et offentlig API for regionale boligprisdata. Gå til bancaditalia.it og hent siste tall for Toscana manuelt."
        />
        <div>
          <label className="block text-xs font-inter font-medium text-brand-text-muted uppercase tracking-wider mb-1">
            Gjennomsnittspris per kvm i Toscana (EUR)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              step="100"
              min="0"
              placeholder="f.eks. 3200"
              value={manualTuscanyPrice}
              onChange={(e) => onManualTuscanyPriceChange(e.target.value)}
              className="input-field max-w-xs"
            />
            {manualTuscanyPrice && (
              <button
                type="button"
                onClick={() => onManualTuscanyPriceChange('')}
                className="text-xs text-brand-text-muted hover:text-brand-burgundy transition-colors font-inter"
              >
                Tilbakestill
              </button>
            )}
          </div>
          <p className="text-xs text-brand-text-muted mt-1 font-inter">
            Kilde:{' '}
            <a
              href="https://www.bancaditalia.it/statistiche/tematiche/moneta-credito-liquidita/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-brand-burgundy transition-colors"
            >
              {"Banca d'Italia – Statistikk"}
            </a>
          </p>
        </div>
      </div>

      <hr className="divider" />

      {/* ── Notion Properties ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="font-inter text-sm font-semibold text-brand-text-secondary uppercase tracking-wider">
            Eiendommer fra Notion
          </h3>
          <DataStatusBadge
            status={notionProperties.length > 0 ? 'success' : 'error'}
            compact
            label={
              notionProperties.length > 0
                ? `${notionProperties.length} eiendommer`
                : 'Ingen data'
            }
          />
        </div>

        {notionProperties.length === 0 ? (
          <div className="bg-brand-bg-secondary border border-brand-line-secondary p-4 text-sm font-inter text-brand-text-muted">
            Ingen eiendommer funnet i Notion-databasen. Sjekk at{' '}
            <code className="bg-white px-1 py-0.5 text-xs border border-brand-line-primary">
              NOTION_API_KEY
            </code>{' '}
            er konfigurert og at databasen er delt med integrasjonen.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-inter border-collapse">
              <thead>
                <tr className="bg-brand-burgundy text-white">
                  <th className="text-left px-3 py-2 text-xs font-medium tracking-wider">Eiendom</th>
                  <th className="text-left px-3 py-2 text-xs font-medium tracking-wider">Område</th>
                  <th className="text-right px-3 py-2 text-xs font-medium tracking-wider">Pris</th>
                  <th className="text-right px-3 py-2 text-xs font-medium tracking-wider">Kvm</th>
                  <th className="text-left px-3 py-2 text-xs font-medium tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {notionProperties.map((prop, idx) => (
                  <tr
                    key={prop.id}
                    className={`border-b border-brand-line-secondary hover:bg-brand-bg-secondary transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-brand-bg-secondary/50'
                    }`}
                  >
                    <td className="px-3 py-2.5 font-medium text-brand-text-primary">
                      {prop.url ? (
                        <a
                          href={prop.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-brand-burgundy underline decoration-brand-line-primary transition-colors"
                        >
                          {prop.address}
                        </a>
                      ) : (
                        prop.address
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-brand-text-secondary">{prop.area}</td>
                    <td className="px-3 py-2.5 text-right text-brand-text-primary font-medium tabular-nums">
                      {prop.price !== null
                        ? `${prop.price.toLocaleString('nb-NO')} ${prop.currency}`
                        : '–'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-brand-text-secondary tabular-nums">
                      {prop.sqm !== null ? `${prop.sqm} m²` : '–'}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 text-xs bg-brand-bg-secondary border border-brand-line-primary text-brand-text-muted rounded-sm">
                        {prop.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
