'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getChallenge, runQuery, type ChallengeDetail, type QueryResult } from '@/lib/api';
import { SqlEditor } from '@/components/SqlEditor';
import { ChallengeActions } from '@/components/ChallengeActions';
import { ResultTable } from '@/components/ResultTable';

const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), { ssr: false });

const TIER_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function ChallengePage({ params }: { params: { id: string } }) {
  const challengeId = Number(params.id);

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    getChallenge(challengeId)
      .then((c) => {
        setChallenge(c);
        setQuery(c.starterQuery);
      })
      .catch((e) => setLoadError(e.message));
  }, [challengeId]);

  async function handleRun() {
    setRunning(true);
    setRunError(null);
    try {
      const res = await runQuery(query);
      setResult(res);
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'Query failed.');
      setResult(null);
    } finally {
      setRunning(false);
    }
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-destructive" role="alert">Couldn&apos;t load this challenge: {loadError}</p>
        <Link href="/" className="text-accent underline mt-4 inline-block">Back to all challenges</Link>
      </main>
    );
  }

  if (!challenge) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-foreground/50" role="status">Loading challenge...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-dvh">
      <Scene />
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm text-foreground/50 hover:text-accent transition-colors">
          &larr; All challenges
        </Link>

        <div className="mt-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono text-foreground/50">Challenge #{challenge.id}</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-accent">{TIER_LABEL[challenge.tier]}</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">{challenge.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {challenge.topics.map((topic) => (
              <span key={topic} className="rounded-full border border-border px-2.5 py-0.5 text-xs font-mono text-foreground/60">
                {topic}
              </span>
            ))}
          </div>
          <p className="mt-4 text-foreground/80 leading-relaxed">{challenge.prompt}</p>
        </div>

        <div className="space-y-4">
          <SqlEditor value={query} onChange={setQuery} onRunShortcut={handleRun} />
          <ChallengeActions challengeId={challenge.id} onRun={handleRun} running={running} />
          <ResultTable result={result} error={runError} loading={running} />
        </div>
      </div>
    </main>
  );
}
