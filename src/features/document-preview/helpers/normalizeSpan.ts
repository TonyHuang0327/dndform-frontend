export function normalizeSpan(span?: number): number {
  return Math.min(12, Math.max(1, span ?? 12));
}
