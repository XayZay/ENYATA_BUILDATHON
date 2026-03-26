import type { Metadata } from 'next';
import Link from 'next/link';

import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'CrossRoute',
  description: 'Dynamic escrow and cross-border payout routing for USD to NGN freelance work.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="border-t border-line bg-white/80">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <p>CrossRoute MVP foundation for the Interswitch x Enyata hackathon.</p>
            <div className="flex gap-4">
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/signup">Signup</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
