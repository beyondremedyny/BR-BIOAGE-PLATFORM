import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useApi } from '@/hooks/useApiToken';

export default function ClinicianPatientPage({ tab }: { tab?: string }) {
  const { patientId } = useParams();
  const request = useApi();
  const [patient, setPatient] = useState<{
    firstName: string;
    lastName: string;
    intakeSessions: { id: string; completedAt: string | null; domain5Tier: string | null }[];
    labUploads: { id: string; fileName: string; confirmedAt: string | null }[];
    reportCards: { id: string; status: string; biologicalAge: number | null }[];
  } | null>(null);

  useEffect(() => {
    if (!patientId) return;
    request(`/api/patients/${patientId}`)
      .then(setPatient)
      .catch(console.error);
  }, [patientId, request]);

  if (!patient) {
    return (
      <AppShell>
        <p className="text-brMuted">Loading…</p>
      </AppShell>
    );
  }

  const intake = patient.intakeSessions[0];

  return (
    <AppShell title={`${patient.firstName} ${patient.lastName}`}>
      <h1 className="font-orbitron text-2xl font-bold">
        {patient.firstName} {patient.lastName}
      </h1>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          to={`/clinician/patient/${patientId}/labs`}
          className="rounded-pill border border-purple/40 px-5 py-2 text-sm"
        >
          Review Labs
        </Link>
        <Link
          to={`/clinician/patient/${patientId}/report`}
          className="rounded-pill bg-purple px-5 py-2 text-sm font-orbitron font-semibold"
        >
          Build Report Card
        </Link>
      </div>

      {tab === 'intake' && intake && (
        <pre className="mt-8 overflow-auto rounded-card border border-borderDark bg-cardDark p-4 text-xs">
          {JSON.stringify(intake, null, 2)}
        </pre>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-card border border-borderDark bg-cardDark p-4">
          <p className="section-label">Intake</p>
          <p className="mt-2 text-sm">
            {intake?.completedAt ? `Complete · ${intake.domain5Tier}` : 'In progress'}
          </p>
        </div>
        <div className="rounded-card border border-borderDark bg-cardDark p-4">
          <p className="section-label">Labs</p>
          <p className="mt-2 text-sm">{patient.labUploads.length} uploads</p>
        </div>
      </div>
    </AppShell>
  );
}
