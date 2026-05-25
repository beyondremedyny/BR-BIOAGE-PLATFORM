import { formatDelta } from '@br-bioage/shared';

const DOMAINS = [
  { key: 'd1', label: 'Metabolic' },
  { key: 'd2', label: 'Cardio' },
  { key: 'd3', label: 'Hormonal' },
  { key: 'd4', label: 'Cellular' },
  { key: 'd5', label: 'Lifestyle' },
] as const;

export function DomainSummaryBar({
  deltas,
}: {
  deltas: Partial<Record<string, number | null>>;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {DOMAINS.map(({ key, label }) => {
        const d = deltas[key];
        const color =
          d === null || d === undefined
            ? 'text-brMuted'
            : d <= 0
              ? 'text-brGreen'
              : d <= 2
                ? 'text-brYellow'
                : 'text-brOrange';
        return (
          <div
            key={key}
            className="rounded-card border border-borderDark bg-cardDark px-3 py-4 text-center"
          >
            <p className="section-label text-[0.6rem]">{label}</p>
            <p className={`mt-1 font-orbitron text-lg font-bold ${color}`}>
              {d === null || d === undefined ? '—' : formatDelta(d)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
