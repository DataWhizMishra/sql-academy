'use client';

import Link from 'next/link';
import type { ChallengeSummary, Tier } from '@/lib/api';

const TIER_LABELS: Record<Tier, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TIER_ORDER: Tier[] = ['beginner', 'intermediate', 'advanced'];

const TIER_ACCENT: Record<Tier, string> = {
  beginner: 'border-accent/40 text-accent',
  intermediate: 'border-amber-400/40 text-amber-400',
  advanced: 'border-rose-400/40 text-rose-400',
};

export function LevelNav({ challenges }: { challenges: ChallengeSummary[] }) {
  return (
    <div className="space-y-10">
      {TIER_ORDER.map((tier) => {
        const items = challenges.filter((c) => c.tier === tier);
        if (items.length === 0) return null;
        return (
          <section key={tier} aria-labelledby={`tier-${tier}`}>
            <h2 id={`tier-${tier}`} className={`mb-4 text-lg font-semibold ${TIER_ACCENT[tier].split(' ')[1]}`}>
              {TIER_LABELS[tier]}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => (
                <Link
                  key={c.id}
                  href={`/challenge/${c.id}`}
                  className={`group rounded-lg border bg-primary/60 p-4 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${TIER_ACCENT[tier]}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono opacity-70">#{c.id}</span>
                    <span className="text-xs font-mono opacity-50">{c.topics[0]}</span>
                  </div>
                  <h3 className="mt-2 font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-1 text-sm text-foreground/60 line-clamp-2">{c.prompt}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
