import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/query-provider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'HRIS & ERP Enterprise Management System',
  description: 'Enterprise HRIS and ERP core portal for workforce, attendance, leave, and payroll management.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
