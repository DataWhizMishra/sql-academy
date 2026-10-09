'use client';

import { useState } from 'react';
import { notesForTopics, type SqlNote } from '@/lib/sqlNotes';
import { BookOpenIcon, ChevronDownIcon, PlayIcon } from './icons';

/**
 * The Notes Corner: a reference panel explaining the SQL topics this
 * challenge uses, each with a definition, syntax, and a runnable example.
 *
 * On a challenge page, pass that challenge's `topics` and an `onUse` handler
 * so a learner can drop any example straight into the editor. On the standalone
 * /notes page, render <NoteCard> directly with no editor handler.
 */
export function NotesCorner({
  topics,
  onUse,
}: {
  topics: string[];
  onUse?: (sql: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const notes = notesForTopics(topics);
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="notes-corner-heading" className="rounded-lg border border-border bg-primary/40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer min-h-[44px]"
      >
        <span className="flex items-center gap-2">
          <BookOpenIcon className="h-4 w-4 text-accent" />
          <span id="notes-corner-heading" className="text-sm font-semibold text-foreground">
            Notes Corner
          </span>
          <span className="text-xs text-foreground/50">
            {notes.length} topic{notes.length === 1 ? '' : 's'} in this challenge
          </span>
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-foreground/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-2 border-t border-border px-3 pb-3 pt-3">
          {notes.map((note) => (
            <NoteCard key={note.topic} note={note} onUse={onUse} />
          ))}
        </div>
      )}
    </section>
  );
}

export function NoteCard({
  note,
  onUse,
  defaultOpen = false,
}: {
  note: SqlNote;
  onUse?: (sql: string) => void;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const runnable = note.example.runnable !== false;

  return (
    <div className="rounded-md border border-border bg-background/60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left cursor-pointer min-h-[44px]"
      >
        <span className="flex items-center gap-2">
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-accent">{note.topic}</code>
          <span className="text-xs text-foreground/40">{note.category}</span>
        </span>
        <ChevronDownIcon className={`h-3.5 w-3.5 text-foreground/40 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="space-y-3 px-3 pb-3 text-sm">
          <p className="leading-relaxed text-foreground/80">{note.definition}</p>

          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/40">Syntax</p>
            <pre className="overflow-x-auto rounded bg-background px-3 py-2 font-mono text-xs text-foreground/70">{note.syntax}</pre>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/40">Example</p>
              {runnable && onUse && (
                <button
                  type="button"
                  onClick={() => onUse(note.example.sql)}
                  className="inline-flex items-center gap-1.5 rounded border border-accent/40 px-2 py-1 text-xs font-medium text-accent transition-colors hover:bg-accent/10 cursor-pointer"
                >
                  <PlayIcon className="h-3 w-3" />
                  Load into editor
                </button>
              )}
            </div>
            <pre className="overflow-x-auto rounded bg-background px-3 py-2 font-mono text-xs text-foreground/90">{note.example.sql}</pre>
            <p className="mt-1.5 text-xs italic text-foreground/50">{note.example.note}</p>
          </div>
        </div>
      )}
    </div>
  );
}
