import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useApi } from '@/hooks/useApiToken';

interface ReportCard {
  id: string;
  biologicalAge: number | null;
  masterDelta: number | null;
  status: string;
  createdAt: string;
}

interface IntakeSession {
  id: string;
  submittedAt: string | null;
  domain5Tier: string | null;
  clinicalRiskTier: string | null;
}

interface LabUpload {
  id: string;
  fileName: string;
  confirmedAt: string | null;
  patientConfirmedAt: string | null;
  createdAt: string;
}

interface PatientMe {
  id: string;
  firstName: string;
  lastName: string;
  intakeSessions: IntakeSession[];
  labUploads: LabUpload[];
  reportCards: ReportCard[];
}

const TIER_COLOR: Record<string, string> = {
  Low: 'text-brGreen',
  Moderate: 'text-brYellow',
  Elevated: 'text-brOrange',
  High: 'text-brRed',
};

export default function PatientDashboardPage() {
  const callApi = useApi();
  const [data, setData] = useState<PatientMe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callApi<PatientMe>('/api/patients/me')
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [callApi]);

  const latestIntake = data?.intakeSessions[0] ?? null;
  const latestReport = data?.reportCards[0] ?? null;
  const pendingLabs = data?.labUploads.filter((u) => !u.patientConfirmedAt) ?? [];

  const intakeDone = latestIntake?.submittedAt != null;
  const hasLabs = (data?.labUploads.length ?? 0) > 0;

  return (
    <AppShell title="My Dashboard">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-orbitron text-2xl font-bold">
            {loading ? 'Loading…' : `Welcome${data ? `, ${data.firstName}` : ''}`}
          </h1>
          <p className="mt-1 text-sm text-brMuted">Your biological age journey</p>
        </div>

        {/* Latest BioAge report */}
        {latestReport ? (
          <Link
            to={`/patient/report/${latestReport.id}`}
            className="block rounded-card border border-purple/30 bg-purple/10 p-6 transition hover:border-purple/60"
          >
            <p className="section-label">Latest Report</p>
            <div className="mt-3 flex items-end gap-4">
              <span className="font-orbitron text-5xl font-bold text-purple">
                {latestReport.biologicalAge ?? '—'}
              </span>
              <span className="mb-1 font-poppins text-sm text-brMuted">biological age</span>
              {latestReport.masterDelta != null && (
                <span
                  className={`mb-1 ml-auto font-poppins text-sm font-semibold ${
                    latestReport.masterDelta <= 0 ? 'text-brGreen' : 'text-brOrange'
                  }`}
                >
                  {latestReport.masterDelta > 0 ? '+' : ''}
                  {latestReport.masterDelta.toFixed(1)} yrs
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-brMuted">
              {new Date(latestReport.createdAt).toLocaleDateString()} · Tap to view full report →
            </p>
          </Link>
        ) : (
          <div className="rounded-card border border-borderDark bg-cardDark p-6">
            <p className="section-label">Your BioAge Score</p>
            <p className="mt-3 font-poppins text-sm text-brMuted">
              Complete intake and upload labs — your score appears here once your clinician
              publishes your report.
            </p>
          </div>
        )}

        {/* Journey steps */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Step 1 — Intake */}
          <Link
            to="/patient/intake"
            className={`rounded-card border p-6 transition hover:border-purple/40 ${
              intakeDone
                ? 'border-brGreen/30 bg-brGreen/5'
                : 'border-borderDark bg-cardDark'
            }`}
          >
            <p className="section-label flex items-center gap-2">
              Step 1
              {intakeDone && <span className="text-brGreen">✓</span>}
            </p>
            <p className="mt-2 font-orbitron font-semibold">Clinical Intake</p>
            {intakeDone ? (
              <p className="mt-1 text-xs text-brGreen">Submitted</p>
            ) : (
              <p className="mt-1 text-xs text-brMuted">19-section health survey</p>
            )}
            {latestIntake?.clinicalRiskTier && (
              <p className={`mt-2 text-xs font-semibold ${TIER_COLOR[latestIntake.clinicalRiskTier] ?? 'text-brMuted'}`}>
                Risk tier: {latestIntake.clinicalRiskTier}
              </p>
            )}
          </Link>

          {/* Step 2 — Labs */}
          <Link
            to="/patient/upload"
            className={`rounded-card border p-6 transition hover:border-purple/40 ${
              hasLabs ? 'border-brGreen/30 bg-brGreen/5' : 'border-borderDark bg-cardDark'
            }`}
          >
            <p className="section-label flex items-center gap-2">
              Step 2
              {hasLabs && <span className="text-brGreen">✓</span>}
            </p>
            <p className="mt-2 font-orbitron font-semibold">Upload Labs</p>
            {hasLabs ? (
              <p className="mt-1 text-xs text-brMuted">
                {data!.labUploads.length} upload{data!.labUploads.length !== 1 ? 's' : ''}
              </p>
            ) : (
              <p className="mt-1 text-xs text-brMuted">PDF or image of your lab results</p>
            )}
          </Link>
        </div>

        {/* Pending confirmations */}
        {pendingLabs.length > 0 && (
          <div className="rounded-card border border-brYellow/30 bg-brYellow/5 p-4">
            <p className="font-poppins text-sm font-semibold text-brYellow">
              Action needed — {pendingLabs.length} lab upload{pendingLabs.length !== 1 ? 's' : ''}{' '}
              awaiting your review
            </p>
            <div className="mt-3 space-y-2">
              {pendingLabs.map((u) => (
                <Link
                  key={u.id}
                  to={`/patient/upload`}
                  className="flex items-center justify-between rounded-lg border border-borderDark bg-cardDark px-4 py-2 text-sm transition hover:border-purple/40"
                >
                  <span className="font-poppins text-ivory">{u.fileName}</span>
                  <span className="text-xs text-brMuted">Review →</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All published reports */}
        {(data?.reportCards.length ?? 0) > 1 && (
          <div>
            <h2 className="section-label mb-3">Past Reports</h2>
            <div className="space-y-2">
              {data!.reportCards.slice(1).map((r) => (
                <Link
                  key={r.id}
                  to={`/patient/report/${r.id}`}
                  className="flex items-center justify-between rounded-lg border border-borderDark bg-cardDark px-4 py-3 transition hover:border-purple/40"
                >
                  <span className="font-poppins text-sm text-ivory">
                    BioAge {r.biologicalAge ?? '—'}
                  </span>
                  <span className="text-xs text-brMuted">
                    {new Date(r.createdAt).toLocaleDateString()} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
