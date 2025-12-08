import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'True Exposure - Portfolio Analyzer',
  description: 'Reveal hidden portfolio concentration and ETF exposure.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 min-h-screen antialiased`}>
        {children}
      </body>
    </html>
  );
}
