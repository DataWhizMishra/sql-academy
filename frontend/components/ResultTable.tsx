'use client';

import type { QueryResult } from '@/lib/api';

export function ResultTable({ result, error, loading }: { result: QueryResult | null; error: string | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-primary p-6 text-sm text-foreground/60 animate-pulse" role="status">
        Running query...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive"
        role="alert"
        aria-live="assertive"
      >
        <p className="font-semibold mb-1">Query failed</p>
        <p className="font-mono text-xs whitespace-pre-wrap">{error}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-lg border border-border bg-primary/50 p-6 text-sm text-foreground/50 text-center">
        Run a query to see results here.
      </div>
    );
  }

  if (result.rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-primary/50 p-6 text-sm text-foreground/60 text-center">
        Query ran successfully but returned no rows.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto max-h-96">
        <table className="w-full text-sm text-left">
          <thead className="bg-primary sticky top-0">
            <tr>
              {result.columns.map((col) => (
                <th key={col} className="px-4 py-2 font-mono font-medium text-foreground/80 border-b border-border whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-muted/60">
                {result.columns.map((col) => (
                  <td key={col} className="px-4 py-2 font-mono text-foreground/90 whitespace-nowrap tabular-nums">
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-4 py-2 bg-primary/50 border-t border-border text-xs text-foreground/50">
        <span>
          {result.rowCount} row{result.rowCount === 1 ? '' : 's'}
          {result.truncatedAt ? ` (truncated at ${result.truncatedAt})` : ''}
        </span>
        <span>{result.durationMs}ms</span>
      </div>
    </div>
  );
}
