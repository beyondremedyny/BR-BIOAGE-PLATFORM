import type { ScoredMarker } from '@br-bioage/shared';
import { BioAgeOrb } from '@/components/brand/BioAgeOrb';
import { DomainSummaryBar } from '@/components/brand/DomainSummaryBar';
import { DomainCard } from '@/components/brand/DomainCard';
import { BiometricChip } from '@/components/brand/BiometricChip';

interface ReportViewProps {
  patientName: string;
  assessmentDate: string;
  biologicalAge: number | null;
  chronologicalAge: number | null;
  masterDelta: number | null;
  confidence: number;
  deltas: Partial<Record<string, number | null>>;
  markers: Record<string, ScoredMarker>;
  biometrics?: Record<string, unknown> | null;
}

export function ReportView({
  patientName,
  assessmentDate,
  biologicalAge,
  chronologicalAge,
  masterDelta,
  confidence,
  deltas,
  markers,
  biometrics,
}: ReportViewProps) {
  const byDomain = (d: string) =>
    Object.values(markers).filter((m) => m.domain === d);

  return (
    <div className="space-y-8 pb-24">
      <div className="text-center">
        <p className="section-label">Beyond Remedy BioAge Report</p>
        <h1 className="mt-2 font-orbitron text-2xl font-bold">{patientName}</h1>
        <p className="text-sm text-sandstone">{new Date(assessmentDate).toLocaleDateString()}</p>
      </div>

      <div className="flex justify-center">
        <BioAgeOrb
          biologicalAge={biologicalAge}
          chronologicalAge={chronologicalAge}
          masterDelta={masterDelta}
          confidence={confidence}
        />
      </div>

      <DomainSummaryBar deltas={deltas} />

      {biometrics && Object.keys(biometrics).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(biometrics).map(([k, v]) => (
            <BiometricChip key={k} label={k.replace(/_/g, ' ')} value={String(v)} />
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <DomainCard domain="d1" delta={deltas.d1 ?? null} markers={byDomain('d1')} />
        <DomainCard domain="d2" delta={deltas.d2 ?? null} markers={byDomain('d2')} />
        <DomainCard domain="d3" delta={deltas.d3 ?? null} markers={byDomain('d3')} />
        <DomainCard domain="d4" delta={deltas.d4 ?? null} markers={byDomain('d4')} />
      </div>

      {deltas.d5 !== null && deltas.d5 !== undefined && (
        <DomainCard domain="d5" delta={deltas.d5} markers={[]} />
      )}
    </div>
  );
}
