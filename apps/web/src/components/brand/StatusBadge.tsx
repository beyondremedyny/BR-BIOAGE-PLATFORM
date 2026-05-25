import type { MarkerStatusLabel } from '@br-bioage/shared';

const styles: Record<MarkerStatusLabel, string> = {
  optimal: 'bg-brGreen/20 text-brGreen border-brGreen/30',
  good: 'bg-brYellow/20 text-brYellow border-brYellow/30',
  watch: 'bg-brOrange/20 text-brOrange border-brOrange/30',
  risk: 'bg-brRed/20 text-brRed border-brRed/30',
  pending: 'bg-white/5 text-brMuted border-borderDark',
};

const labels: Record<MarkerStatusLabel, string> = {
  optimal: 'Optimal',
  good: 'Good',
  watch: 'Monitor',
  risk: 'Priority',
  pending: 'Pending',
};

export function StatusBadge({ status }: { status: MarkerStatusLabel }) {
  return (
    <span
      className={`inline-flex min-h-[28px] items-center rounded-pill border px-3 text-xs font-orbitron tracking-wide ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
