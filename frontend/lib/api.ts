// On Vercel the frontend and backend deploy as two services behind one domain,
// so the browser calls the backend same-origin at /api/* — no base URL needed.
// NEXT_PUBLIC_API_URL still overrides it (e.g. pointing at a separately hosted
// API), and local split-server dev falls back to the Express port on :4000.
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : '');

export type Tier = 'beginner' | 'intermediate' | 'advanced';

export interface ChallengeSummary {
  id: number;
  tier: Tier;
  title: string;
  topics: string[];
  prompt: string;
}

export interface ChallengeDetail extends ChallengeSummary {
  starterQuery: string;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  truncatedAt: number | null;
  durationMs: number;
}

export interface QueryError {
  error: string;
}

export interface CheckResult {
  /** false = this challenge is exploratory (conceptual/DDL or too large to grade). */
  checkable: boolean;
  correct?: boolean;
  /** Why it was wrong (shape/value/order mismatch), when known. */
  reason?: string | null;
  /** A Postgres error from the submitted query, if it failed to run. */
  error?: string;
  expectedRowCount?: number;
  yourRowCount?: number;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || 'Request failed.');
  }
  return res.json();
}

export function listChallenges() {
  return getJson<ChallengeSummary[]>('/api/challenges');
}

export function getChallenge(id: number) {
  return getJson<ChallengeDetail>(`/api/challenges/${id}`);
}

export function getHint(id: number) {
  return getJson<{ hint: string }>(`/api/challenges/${id}/hint`);
}

export function getApproach(id: number) {
  return getJson<{ approach: string }>(`/api/challenges/${id}/approach`);
}

export function getSolution(id: number) {
  return getJson<{ solution: string }>(`/api/challenges/${id}/solution`);
}

export async function runQuery(query: string): Promise<QueryResult> {
  const res = await fetch(`${API_URL}/api/query/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Query failed.');
  return body;
}

export async function checkAnswer(id: number, query: string): Promise<CheckResult> {
  const res = await fetch(`${API_URL}/api/challenges/${id}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error || 'Check failed.');
  return body;
}
