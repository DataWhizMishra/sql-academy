'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { listChallenges, type ChallengeSummary } from '@/lib/api';
import { LevelNav } from '@/components/LevelNav';
import { BookOpenIcon } from '@/components/icons';

// The 3D scene depends on WebGL context + browser APIs — never render it
// during SSR, and keep its (larger) three.js bundle out of the main chunk.
const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), { ssr: false });

export default function HomePage() {
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listChallenges()
      .then(setChallenges)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <main className="relative min-h-dvh">
      <Scene />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-accent mb-3">SQL Scrabble Academy</p>
          <h1 className="gradient-text text-3xl sm:text-4xl font-bold">
            Learn SQL by querying one dictionary, 12 ways.
          </h1>
          <p className="mt-4 text-foreground/60 max-w-2xl mx-auto">
            From GROUP BY basics to recursive CTEs and query optimization — every challenge
            runs live against a real 466,000-word dictionary and a Scrabble tile bag.
          </p>
          <Link
            href="/notes"
            className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-primary/60 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-accent"
          >
            <BookOpenIcon className="h-4 w-4" />
            Open the Notes Corner — every SQL topic, defined
          </Link>
        </header>

        {error && (
          <div className="mb-8 rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive" role="alert">
            Couldn&apos;t reach the API ({error}). Is the backend running on the URL in
            <code className="mx-1 font-mono">NEXT_PUBLIC_API_URL</code>?
          </div>
        )}

        {challenges.length === 0 && !error ? (
          <p className="text-center text-foreground/50" role="status">Loading challenges...</p>
        ) : (
          <LevelNav challenges={challenges} />
        )}
      </div>
    </main>
  );
}
