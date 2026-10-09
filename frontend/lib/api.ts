const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
