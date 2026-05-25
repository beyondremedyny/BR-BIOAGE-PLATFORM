interface BiometricChipProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: 'optimal' | 'good' | 'watch' | 'risk';
}

const dot: Record<string, string> = {
  optimal: 'bg-brGreen',
  good: 'bg-brYellow',
  watch: 'bg-brOrange',
  risk: 'bg-brRed',
};

export function BiometricChip({ label, value, unit, status = 'good' }: BiometricChipProps) {
  return (
    <div className="min-w-[120px] rounded-card border border-borderDark bg-cardDark px-4 py-3">
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot[status]}`} />
        <p className="text-xs text-sandstone">{label}</p>
      </div>
      <p className="font-orbitron text-xl font-bold">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-brMuted">{unit}</span>}
      </p>
    </div>
  );
}
