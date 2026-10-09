'use client';

import { useState } from 'react';
import { getApproach, getHint, getSolution } from '@/lib/api';
import { BookOpenIcon, CheckBadgeIcon, ChevronDownIcon, EyeIcon, LightbulbIcon, PlayIcon } from './icons';

type PanelKey = 'hint' | 'approach' | 'solution';

interface RevealPanelState {
  hint: string | null;
  approach: string | null;
  solution: string | null;
}

export function ChallengeActions({
  challengeId,
  onRun,
  running,
  onCheck,
  checking,
}: {
  challengeId: number;
  onRun: () => void;
  running: boolean;
  onCheck: () => void;
  checking: boolean;
}) {
  const [panels, setPanels] = useState<RevealPanelState>({ hint: null, approach: null, solution: null });
  const [open, setOpen] = useState<PanelKey | null>(null);
  const [loading, setLoading] = useState<PanelKey | null>(null);

  async function toggle(key: PanelKey) {
    if (open === key) {
      setOpen(null);
      return;
    }
    setOpen(key);
    if (panels[key] !== null) return;

    setLoading(key);
    try {
      if (key === 'hint') {
        const { hint } = await getHint(challengeId);
        setPanels((p) => ({ ...p, hint }));
      }
      if (key === 'approach') {
        const { approach } = await getApproach(challengeId);
        setPanels((p) => ({ ...p, approach }));
      }
      if (key === 'solution') {
        const { solution } = await getSolution(challengeId);
        setPanels((p) => ({ ...p, solution }));
      }
    } catch {
      setPanels((p) => ({ ...p, [key]: 'Could not load this right now. Try again.' }));
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRun}
          disabled={running || checking}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-background transition-all hover:bg-accent/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
        >
          <PlayIcon className="h-4 w-4" />
          {running ? 'Running...' : 'Run Query'}
        </button>

        <button
          type="button"
          onClick={onCheck}
          disabled={running || checking}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-accent to-success px-4 py-2.5 text-sm font-semibold text-background shadow-sm transition-all hover:shadow-[0_0_18px_rgba(0,240,255,0.45)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
        >
          <CheckBadgeIcon className="h-4 w-4" />
          {checking ? 'Checking...' : 'Check Answer'}
        </button>

        <ActionToggle
          icon={<LightbulbIcon className="h-4 w-4" />}
          label="Hint"
          active={open === 'hint'}
          loading={loading === 'hint'}
          onClick={() => toggle('hint')}
        />
        <ActionToggle
          icon={<BookOpenIcon className="h-4 w-4" />}
          label="Approach"
          active={open === 'approach'}
          loading={loading === 'approach'}
          onClick={() => toggle('approach')}
        />
        <ActionToggle
          icon={<EyeIcon className="h-4 w-4" />}
          label="Reveal Answer"
          active={open === 'solution'}
          loading={loading === 'solution'}
          onClick={() => toggle('solution')}
          tone="magenta"
        />
      </div>

      {open === 'hint' && panels.hint && (
        <Panel tone="hint" title="Hint">
          {panels.hint}
        </Panel>
      )}
      {open === 'approach' && panels.approach && (
        <Panel tone="approach" title="Approach">
          {panels.approach}
        </Panel>
      )}
      {open === 'solution' && panels.solution && (
        <Panel tone="solution" title="Solution">
          <pre className="font-mono text-xs whitespace-pre-wrap">{panels.solution}</pre>
        </Panel>
      )}
    </div>
  );
}

function ActionToggle({
  icon,
  label,
  active,
  loading,
  onClick,
  tone = 'accent',
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  loading: boolean;
  onClick: () => void;
  tone?: 'accent' | 'magenta';
}) {
  const activeTone = tone === 'magenta' ? 'border-magenta bg-magenta/10 text-magenta' : 'border-accent bg-accent/10 text-accent';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-sm font-medium transition-all active:scale-95 cursor-pointer min-h-[44px] ${
        active ? activeTone : 'border-border bg-primary text-foreground/80 hover:bg-muted'
      }`}
    >
      {icon}
      {loading ? 'Loading...' : label}
      <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${active ? 'rotate-180' : ''}`} />
    </button>
  );
}

function Panel({ tone, title, children }: { tone: PanelKey; title: string; children: React.ReactNode }) {
  const borderColor = tone === 'solution' ? 'border-magenta/40' : 'border-border';
  return (
    <div className={`rounded-md border ${borderColor} bg-primary/60 p-4 text-sm text-foreground/90 leading-relaxed`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">{title}</p>
      {children}
    </div>
  );
}
