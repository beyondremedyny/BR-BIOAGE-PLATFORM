import type { ScoredMarker } from '../types';
import { MARKER_DOMAINS } from '../scoring';
import { MARKER_LABELS } from '../scoring/markerLabels';
import { markerStatus, scoreMarker } from '../scoring';

export function buildScoredMarker(
  markerId: string,
  value: number,
  partial?: Partial<Pick<ScoredMarker, 'unit' | 'rawValue' | 'flag' | 'referenceRange' | 'label'>>
): ScoredMarker | null {
  const score = scoreMarker(markerId, value);
  if (score === null) return null;
  const domain = MARKER_DOMAINS[markerId];
  if (!domain) return null;

  return {
    id: markerId,
    domain,
    label: partial?.label ?? MARKER_LABELS[markerId] ?? markerId,
    unit: partial?.unit ?? '',
    value,
    rawValue: partial?.rawValue ?? String(value),
    flag: partial?.flag ?? null,
    referenceRange: partial?.referenceRange ?? null,
    score,
    status: markerStatus(score),
  };
}

export function rescoreMarkers(
  markers: Record<string, ScoredMarker>,
  edits: Record<string, { value: number }>
): { markers: Record<string, ScoredMarker>; errors: Record<string, string> } {
  const updated = { ...markers };
  const errors: Record<string, string> = {};

  for (const [markerId, { value }] of Object.entries(edits)) {
    const existing = markers[markerId];
    const rescored = buildScoredMarker(markerId, value, existing);
    if (!rescored) {
      errors[markerId] = 'Value out of plausible range or unknown marker';
      continue;
    }
    updated[markerId] = rescored;
  }

  return { markers: updated, errors };
}
