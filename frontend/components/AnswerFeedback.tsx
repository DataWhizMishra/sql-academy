'use client';

import { useMemo } from 'react';
import { CheckCircleIcon, SparklesIcon, XCircleIcon } from './icons';

export type FeedbackStatus = 'correct' | 'wrong' | 'error' | 'exploratory';

export interface Feedback {
  status: FeedbackStatus;
  message: string;
  detail?: string;
  /** Bumped on every submission so the animation re-fires even for repeats. */
  nonce: number;
}

const CONFETTI_COLORS = ['#00FF66', '#00F0FF', '#B28DFF', '#E6B981', '#FF007F'];

export function AnswerFeedback({ feedback }: { feedback: Feedback | null }) {
  // Pre-compute confetti trajectories once per correct submission.
  const confetti = useMemo(() => {
    if (!feedback || feedback.status !== 'correct') return [];
    return Array.from({ length: 16 }, (_, i) => {
      const angle = (Math.PI * (0.15 + Math.random() * 0.7)) * -1; // upward fan
      const dist = 60 + Math.random() * 90;
      return {
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: 12 + Math.random() * 76,
        cx: `${Math.cos(angle) * dist}px`,
        cy: `${Math.sin(angle) * dist}px`,
        cr: `${(Math.random() * 2 - 1) * 360}deg`,
        delay: `${Math.random() * 80}ms`,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedback?.nonce, feedback?.status]);

  if (!feedback) return null;

  const theme = STYLES[feedback.status];

  return (
    <div
      key={feedback.nonce}
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden rounded-lg border p-4 ${theme.wrap} ${
        feedback.status === 'wrong' || feedback.status === 'error' ? 'animate-shake' : 'animate-pop-in'
      } ${feedback.status === 'correct' ? 'animate-glow-pulse' : ''}`}
    >
      {feedback.status === 'correct' && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              className="confetti-piece animate-confetti absolute top-1/2 h-2 w-2 rounded-[2px]"
              style={{
                left: `${c.left}%`,
                backgroundColor: c.color,
                // @ts-expect-error custom props consumed by the keyframes
                '--cx': c.cx,
                '--cy': c.cy,
                '--cr': c.cr,
                animationDelay: c.delay,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex items-start gap-3">
        <span className={`mt-0.5 shrink-0 ${theme.icon} ${feedback.status === 'correct' ? 'animate-check-ring' : ''}`}>
          {theme.Icon}
        </span>
        <div className="min-w-0">
          <p className={`text-sm font-semibold ${theme.title}`}>{feedback.message}</p>
          {feedback.detail && <p className="mt-1 text-sm text-foreground/70">{feedback.detail}</p>}
        </div>
      </div>
    </div>
  );
}

const STYLES: Record<
  FeedbackStatus,
  { wrap: string; icon: string; title: string; Icon: React.ReactNode }
> = {
  correct: {
    wrap: 'border-success/50 bg-success/10',
    icon: 'text-success',
    title: 'text-success',
    Icon: <CheckCircleIcon className="h-6 w-6" />,
  },
  wrong: {
    wrap: 'border-destructive/50 bg-destructive/10',
    icon: 'text-destructive',
    title: 'text-destructive',
    Icon: <XCircleIcon className="h-6 w-6" />,
  },
  error: {
    wrap: 'border-amber/50 bg-amber/10',
    icon: 'text-amber',
    title: 'text-amber',
    Icon: <XCircleIcon className="h-6 w-6" />,
  },
  exploratory: {
    wrap: 'border-violet/50 bg-violet/10',
    icon: 'text-violet',
    title: 'text-violet',
    Icon: <SparklesIcon className="h-6 w-6" />,
  },
};
