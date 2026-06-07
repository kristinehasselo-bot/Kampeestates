import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kämpe Estates – Markedsrapport Italia',
  description:
    'Generer profesjonelle markedsrapporter for det italienske luksuseiendomsmarkedet, tilpasset norske kjøpere.',
  keywords: 'Italia, Toscana, eiendom, luksus, markedsrapport, norske kjøpere',
  authors: [{ name: 'Kämpe Estates' }],
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nb" className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body className="font-inter bg-brand-bg-primary text-brand-text-primary antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
