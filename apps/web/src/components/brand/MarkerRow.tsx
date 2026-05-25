import type { ScoredMarker } from '@br-bioage/shared';
import { formatDelta } from '@br-bioage/shared';
import { StatusBadge } from './StatusBadge';

export function MarkerRow({ marker }: { marker: ScoredMarker }) {
  return (
    <div className="flex min-h-[44px] items-center justify-between gap-3 border-b border-borderDark py-3 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="truncate font-poppins text-sm text-ivory">{marker.label}</p>
        <p className="font-orbitron text-xs text-sandstone">
          {marker.value} {marker.unit}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="font-orbitron text-sm font-bold text-ivory">{formatDelta(marker.score)}</span>
        <StatusBadge status={marker.status} />
      </div>
    </div>
  );
}
