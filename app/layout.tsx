import type { Metadata } from 'next';
import localFont from 'next/font/local';

import '@/app/globals.css';

const satoshi = localFont({
  src: [
    {
      path: '../fonts/Satoshi-Variable.woff2',
      weight: '300 900',
      style: 'normal'
    },
    {
      path: '../fonts/Satoshi-VariableItalic.woff2',
      weight: '300 900',
      style: 'italic'
    }
  ],
  variable: '--font-sans',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'CrossRoute',
  description: 'Dynamic escrow and cross-border payout routing for USD to NGN freelance work.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={satoshi.variable}>
      <body className="font-sans">
        {children}
        <footer className="border-t border-line bg-white/80">
          <div className="mx-auto flex max-w-7xl items-center justify-center py-4 sm:text-sm text-xs text-slate-500">
            <p>CrossRoute MVP foundation for the Interswitch x Enyata hackathon.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
