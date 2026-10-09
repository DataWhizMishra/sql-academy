'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { checkAnswer, getChallenge, runQuery, type ChallengeDetail, type QueryResult } from '@/lib/api';
import { SqlEditor } from '@/components/SqlEditor';
import { ChallengeActions } from '@/components/ChallengeActions';
import { ResultTable } from '@/components/ResultTable';
import { NotesCorner } from '@/components/NotesCorner';
import { AnswerFeedback, type Feedback } from '@/components/AnswerFeedback';

const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), { ssr: false });

const TIER_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TIER_COLOR: Record<string, string> = {
  beginner: 'text-accent',
  intermediate: 'text-amber',
  advanced: 'text-rose',
};

export default function ChallengePage({ params }: { params: { id: string } }) {
  const challengeId = Number(params.id);

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

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

  async function handleCheck() {
    setChecking(true);
    try {
      // Also surface the rows so a learner sees what they submitted.
      const [res, check] = await Promise.allSettled([runQuery(query), checkAnswer(challengeId, query)]);
      if (res.status === 'fulfilled') {
        setResult(res.value);
        setRunError(null);
      }

      const nonce = Date.now();
      if (check.status === 'rejected') {
        setFeedback({ status: 'error', message: 'Could not check that.', detail: check.reason?.message, nonce });
      } else {
        const c = check.value;
        if (!c.checkable) {
          setFeedback({ status: 'exploratory', message: 'Exploratory challenge', detail: c.reason ?? undefined, nonce });
        } else if (c.error) {
          setRunError(c.error);
          setFeedback({ status: 'error', message: 'Your query didn’t run', detail: c.error, nonce });
        } else if (c.correct) {
          setFeedback({ status: 'correct', message: 'Correct — nailed it!', detail: 'Your result matches the expected answer exactly.', nonce });
        } else {
          setFeedback({
            status: 'wrong',
            message: 'Not quite yet',
            detail: c.reason ?? 'Your result doesn’t match the expected answer. Try the Hint or Approach.',
            nonce,
          });
        }
      }
    } finally {
      setChecking(false);
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
            <span className={`text-xs font-semibold uppercase tracking-wide ${TIER_COLOR[challenge.tier] ?? 'text-accent'}`}>
              {TIER_LABEL[challenge.tier]}
            </span>
          </div>
          <h1 className="gradient-text text-2xl font-bold">{challenge.title}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {challenge.topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-cyan/30 bg-cyan/5 px-2.5 py-0.5 text-xs font-mono text-cyan/90"
              >
                {topic}
              </span>
            ))}
          </div>
          <p className="mt-4 text-foreground/80 leading-relaxed">{challenge.prompt}</p>
        </div>

        <div className="space-y-4">
          <NotesCorner topics={challenge.topics} onUse={setQuery} />
          <SqlEditor value={query} onChange={setQuery} onRunShortcut={handleRun} />
          <ChallengeActions
            challengeId={challenge.id}
            onRun={handleRun}
            running={running}
            onCheck={handleCheck}
            checking={checking}
          />
          <AnswerFeedback feedback={feedback} />
          <ResultTable result={result} error={runError} loading={running || checking} />
        </div>
      </div>
    </main>
  );
}
