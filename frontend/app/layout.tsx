import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SQL Scrabble Academy',
  description: 'Learn SQL from basics to advanced by querying a dictionary and a Scrabble bag.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-background text-foreground min-h-dvh">
        {children}
      </body>
    </html>
  );
}
