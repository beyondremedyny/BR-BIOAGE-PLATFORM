import {
  computeDomainDelta,
  computeMasterBioAge,
  getChronologicalAge,
  type ScoredMarker,
} from '../../../../packages/shared/src';
import { prisma } from '../lib/prisma';

export async function buildReportFromSources(params: {
  patientId: string;
  intakeSessionId?: string;
  labUploadIds: string[];
}) {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: { id: params.patientId },
  });

  let d5Delta: number | null = null;
  let clinicalRiskTier: string | null = null;
  let biometrics: Record<string, unknown> | null = null;

  if (params.intakeSessionId) {
    const intake = await prisma.intakeSession.findUnique({
      where: { id: params.intakeSessionId },
    });
    if (intake && !intake.redFlagTriggered) {
      d5Delta = intake.domain5Delta;
      clinicalRiskTier = intake.clinicalRiskTier;
      biometrics = (intake.biometrics as Record<string, unknown>) ?? null;
    }
  }

  const mergedMarkers: Record<string, ScoredMarker> = {};
  const uploads = await prisma.labUpload.findMany({
    where: { id: { in: params.labUploadIds }, patientId: params.patientId },
    orderBy: { createdAt: 'asc' },
  });

  for (const upload of uploads) {
    const markers = upload.extractedMarkers as Record<string, ScoredMarker> | null;
    if (markers) Object.assign(mergedMarkers, markers);
  }

  const markerScores: Record<string, { score: number | null }> = {};
  for (const [id, m] of Object.entries(mergedMarkers)) {
    markerScores[id] = { score: m.score };
  }

  const d1 = computeDomainDelta(markerScores, 'd1');
  const d2 = computeDomainDelta(markerScores, 'd2');
  const d3 = computeDomainDelta(markerScores, 'd3');
  const d4 = computeDomainDelta(markerScores, 'd4');

  const chronologicalAge = getChronologicalAge(patient.dateOfBirth);
  const { bioAge, masterDelta, confidence } = computeMasterBioAge(chronologicalAge, {
    d1,
    d2,
    d3,
    d4,
    d5: d5Delta,
  });

  return {
    d1Delta: d1,
    d2Delta: d2,
    d3Delta: d3,
    d4Delta: d4,
    d5Delta: d5Delta,
    markers: mergedMarkers,
    masterDelta,
    biologicalAge: bioAge,
    chronologicalAge,
    confidence,
    clinicalRiskTier,
    biometrics,
  };
}
