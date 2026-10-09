'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { CATEGORY_ORDER, SQL_NOTES, type NoteCategory } from '@/lib/sqlNotes';
import { NoteCard } from '@/components/NotesCorner';

const Scene = dynamic(() => import('@/components/three/Scene').then((m) => m.Scene), { ssr: false });

export default function NotesPage() {
  const [filter, setFilter] = useState<NoteCategory | 'All'>('All');

  const categories = CATEGORY_ORDER.filter((cat) => SQL_NOTES.some((n) => n.category === cat));
  const shown = filter === 'All' ? categories : categories.filter((c) => c === filter);

  return (
    <main className="relative min-h-dvh">
      <Scene />
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="text-sm text-foreground/50 hover:text-accent transition-colors">
          &larr; All challenges
        </Link>

        <header className="mb-8 mt-4">
          <p className="text-xs font-mono uppercase tracking-widest text-accent mb-2">Notes Corner</p>
          <h1 className="glow-text text-3xl font-bold text-foreground">SQL topics, defined with examples</h1>
          <p className="mt-3 text-foreground/60">
            Every concept the {SQL_NOTES.length} curriculum topics build on — each with a plain-English
            definition, its syntax, and a runnable example you can paste into any challenge&apos;s editor.
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter notes by category">
          <FilterChip label="All" active={filter === 'All'} onClick={() => setFilter('All')} />
          {categories.map((cat) => (
            <FilterChip key={cat} label={cat} active={filter === cat} onClick={() => setFilter(cat)} />
          ))}
        </div>

        <div className="space-y-8">
          {shown.map((cat) => (
            <section key={cat} aria-labelledby={`cat-${cat}`}>
              <h2 id={`cat-${cat}`} className="mb-3 text-lg font-semibold text-foreground/90">
                {cat}
              </h2>
              <div className="space-y-2">
                {SQL_NOTES.filter((n) => n.category === cat).map((note) => (
                  <NoteCard key={note.topic} note={note} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
        active ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-primary/60 text-foreground/70 hover:bg-muted'
      }`}
    >
      {label}
    </button>
  );
}
