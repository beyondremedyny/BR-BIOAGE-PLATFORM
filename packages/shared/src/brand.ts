export const BRAND = {
  charcoal: '#383838',
  purple: '#7a5fff',
  purpleDark: '#5a3fd4',
  purpleLight: '#b8a4ff',
  ivory: '#fafafa',
  sandstone: '#e3cbbe',
  green: '#4ade80',
  orange: '#fb923c',
  red: '#f87171',
  yellow: '#fbbf24',
  muted: '#9ca3af',
} as const;

export type MarkerStatusLabel = 'optimal' | 'good' | 'watch' | 'risk' | 'pending';

export function formatDelta(delta: number | null | undefined): string {
  if (delta === null || delta === undefined) return 'Pending — Labs Required';
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${delta.toFixed(1)}`;
}
