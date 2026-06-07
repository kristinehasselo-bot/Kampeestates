import { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';

export const metadata: Metadata = {
  title: 'Logg inn – Kämpe Estates Markedsrapport',
  description: 'Logg inn for å generere markedsrapporter for Kämpe Estates.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-brand-bg-primary flex flex-col">
      {/* Top decorative bar */}
      <div className="h-1 bg-brand-burgundy w-full" />

      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        {/* Brand header */}
        <div className="mb-12 text-center">
          <div className="mb-2">
            <span className="section-label text-brand-burgundy tracking-[0.3em]">
              LUKSUS EIENDOM · ITALIA
            </span>
          </div>
          <h1 className="font-cormorant text-display-md text-brand-text-primary font-light tracking-tight">
            Kämpe Estates
          </h1>
          <p className="mt-1 font-cormorant text-xl text-brand-text-muted italic">
            Markedsrapport
          </p>
          <div className="mt-6 h-px w-16 bg-brand-burgundy mx-auto" />
        </div>

        {/* Login card */}
        <div className="w-full max-w-md">
          <div className="bg-white border border-brand-line-secondary p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="font-cormorant text-2xl text-brand-text-primary font-medium">
                Logg inn
              </h2>
              <p className="mt-1 text-sm font-inter text-brand-text-muted">
                Skriv inn passordet ditt for å fortsette.
              </p>
            </div>
            <LoginForm />
          </div>
        </div>

        {/* Footer text */}
        <p className="mt-8 text-xs font-inter text-brand-text-muted text-center max-w-sm">
          Dette systemet er kun tilgjengelig for autoriserte Kämpe Estates-ansatte.
          Kontakt administrator hvis du har problemer med innlogging.
        </p>
      </div>

      {/* Bottom brand bar */}
      <div className="bg-brand-burgundy py-4 px-8 flex justify-between items-center">
        <span className="font-inter text-xs font-semibold tracking-widest text-white">
          KÄMPE ESTATES
        </span>
        <span className="font-inter text-xs text-white/50">
          Konfidensielt internsystem
        </span>
      </div>
    </div>
  );
}
