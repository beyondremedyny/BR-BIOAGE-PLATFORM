import type { LabExtractionResult, RawMarker, ScoredMarker } from '../types';
import {
  MARKER_ALIASES,
  MARKER_DOMAINS,
  SCORING_RULES,
  markerStatus,
  scoreMarker,
} from '../scoring';
import { MARKER_LABELS } from '../scoring/markerLabels';

export function mapAndScoreMarkers(extracted: LabExtractionResult): {
  mapped: Record<string, ScoredMarker>;
  unmapped: RawMarker[];
} {
  const mapped: Record<string, ScoredMarker> = {};
  const unmapped: RawMarker[] = [];

  for (const rawMarker of extracted.markers ?? []) {
    const key = rawMarker.name.toLowerCase().trim();
    const markerId = MARKER_ALIASES[key];
    const numValue = parseFloat(rawMarker.value);

    if (markerId && !Number.isNaN(numValue)) {
      const score = scoreMarker(markerId, numValue);
      if (score !== null && SCORING_RULES[markerId]) {
        mapped[markerId] = {
          id: markerId,
          domain: MARKER_DOMAINS[markerId],
          label: MARKER_LABELS[markerId] ?? markerId,
          unit: rawMarker.unit,
          value: numValue,
          rawValue: rawMarker.value,
          flag: rawMarker.flag,
          referenceRange: rawMarker.reference_range,
          score,
          status: markerStatus(score),
        };
        continue;
      }
    }
    unmapped.push(rawMarker);
  }

  return { mapped, unmapped };
}
