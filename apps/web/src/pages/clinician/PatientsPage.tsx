import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useApi } from '@/hooks/useApiToken';

interface PatientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  labUploads: { id: string }[];
  intakeSessions: { completedAt: string | null }[];
}

export default function ClinicianPatientsPage() {
  const request = useApi();
  const [patients, setPatients] = useState<PatientRow[]>([]);

  useEffect(() => {
    request<PatientRow[]>('/api/patients')
      .then(setPatients)
      .catch(console.error);
  }, [request]);

  return (
    <AppShell title="Patients">
      <h1 className="font-orbitron text-2xl font-bold">Patients</h1>
      <ul className="mt-8 space-y-3">
        {patients.map((p) => (
          <li key={p.id}>
            <Link
              to={`/clinician/patient/${p.id}`}
              className="flex min-h-[44px] items-center justify-between rounded-card border border-borderDark bg-cardDark px-5 py-4 hover:border-purple/40"
            >
              <span className="font-poppins">
                {p.firstName} {p.lastName}
              </span>
              <span className="text-xs text-brMuted">
                {p.labUploads.length > 0 ? `${p.labUploads.length} labs pending` : ''}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
