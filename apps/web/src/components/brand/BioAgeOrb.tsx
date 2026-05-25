import { formatDelta } from '@br-bioage/shared';
import { ConfidenceStars } from './ConfidenceStars';

interface BioAgeOrbProps {
  biologicalAge: number | null;
  chronologicalAge: number | null;
  masterDelta: number | null;
  confidence: number;
}

export function BioAgeOrb({ biologicalAge, chronologicalAge, masterDelta, confidence }: BioAgeOrbProps) {
  const deltaColor =
    masterDelta === null
      ? 'text-brMuted'
      : masterDelta <= 0
        ? 'text-brGreen'
        : masterDelta <= 2
          ? 'text-brYellow'
          : 'text-brOrange';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-2 border-purple/60 shadow-glow">
        <div className="absolute inset-2 rounded-full border border-purpleLight/30" />
        {biologicalAge !== null ? (
          <span className="font-orbitron text-5xl font-bold text-ivory">{biologicalAge}</span>
        ) : (
          <span className="px-4 text-center font-poppins text-sm text-brMuted">Pending — Labs Required</span>
        )}
      </div>
      <p className="section-label">Biological Age</p>
      {chronologicalAge !== null && (
        <p className="text-sm text-sandstone">
          Chronological: <span className="font-orbitron font-bold">{chronologicalAge}</span>
        </p>
      )}
      <p className={`font-orbitron text-lg font-bold ${deltaColor}`}>{formatDelta(masterDelta)}</p>
      <ConfidenceStars confidence={confidence} />
    </div>
  );
}
