import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useApi } from '@/hooks/useApiToken';

interface LabUpload {
  id: string;
  confirmedAt: string | null;
}

interface IntakeSession {
  submittedAt: string | null;
  clinicalRiskTier: string | null;
  redFlagTriggered: boolean | null;
}

interface ReportCard {
  id: string;
  status: string;
  biologicalAge: number | null;
  createdAt: string;
}

interface PatientRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  updatedAt: string;
  labUploads: LabUpload[];
  intakeSessions: IntakeSession[];
  reportCards: ReportCard[];
}

const RISK_COLOR: Record<string, string> = {
  Low: 'text-brGreen',
  Moderate: 'text-brYellow',
  Elevated: 'text-brOrange',
  High: 'text-brRed',
};

export default function ClinicianDashboardPage() {
  const callApi = useApi();
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    callApi<PatientRow[]>('/api/patients')
      .then(setPatients)
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [callApi]);

  const pendingLabCount = patients.reduce((n, p) => n + p.labUploads.length, 0);
  const redFlagCount = patients.filter(
    (p) => p.intakeSessions[0]?.redFlagTriggered
  ).length;
  const highRiskCount = patients.filter(
    (p) => p.intakeSessions[0]?.clinicalRiskTier === 'High'
  ).length;
  const draftReportCount = patients.filter(
    (p) => p.reportCards[0]?.status === 'draft'
  ).length;

  return (
    <AppShell title="Clinical Dashboard">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-orbitron text-2xl font-bold">Clinical Command Center</h1>
          <Link
            to="/clinician/patients"
            className="inline-flex min-h-[44px] items-center rounded-pill bg-purple px-6 font-orbitron text-sm font-semibold tracking-wider"
          >
            All Patients →
          </Link>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label="Pending Labs"
            value={loading ? '…' : String(pendingLabCount)}
            accent={pendingLabCount > 0 ? 'text-brYellow' : 'text-brGreen'}
            to="/clinician/labs"
          />
          <StatCard
            label="Draft Reports"
            value={loading ? '…' : String(draftReportCount)}
            accent={draftReportCount > 0 ? 'text-purple' : 'text-brGreen'}
          />
          <StatCard
            label="Red Flags"
            value={loading ? '…' : String(redFlagCount)}
            accent={redFlagCount > 0 ? 'text-brRed' : 'text-brGreen'}
          />
          <StatCard
            label="High Risk"
            value={loading ? '…' : String(highRiskCount)}
            accent={highRiskCount > 0 ? 'text-brOrange' : 'text-brGreen'}
          />
        </div>

        {/* Recent patient activity */}
        <div>
          <h2 className="section-label mb-3">Recent Activity</h2>
          {loading ? (
            <p className="text-sm text-brMuted">Loading…</p>
          ) : patients.length === 0 ? (
            <p className="text-sm text-brMuted">No patients yet.</p>
          ) : (
            <ul className="space-y-3">
              {patients.slice(0, 10).map((p) => {
                const intake = p.intakeSessions[0];
                const report = p.reportCards[0];
                const riskTier = intake?.clinicalRiskTier;
                return (
                  <li key={p.id}>
                    <Link
                      to={`/clinician/patient/${p.id}`}
                      className="flex min-h-[56px] items-center justify-between rounded-card border border-borderDark bg-cardDark px-5 py-4 transition hover:border-purple/40"
                    >
                      {/* Name + flags */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple/20 font-orbitron text-sm font-bold text-purple">
                          {p.firstName[0]}
                          {p.lastName[0]}
                        </div>
                        <div>
                          <p className="font-poppins text-sm font-semibold">
                            {p.firstName} {p.lastName}
                          </p>
                          <p className="text-xs text-brMuted">{p.email}</p>
                        </div>
                        {intake?.redFlagTriggered && (
                          <span className="rounded-full bg-brRed/20 px-2 py-0.5 text-[10px] font-bold uppercase text-brRed">
                            ⚠ Red Flag
                          </span>
                        )}
                      </div>

                      {/* Status chips */}
                      <div className="flex items-center gap-3 text-xs">
                        {p.labUploads.length > 0 && (
                          <span className="rounded-full bg-brYellow/10 px-2 py-1 text-brYellow">
                            {p.labUploads.length} lab{p.labUploads.length !== 1 ? 's' : ''} pending
                          </span>
                        )}
                        {riskTier && (
                          <span className={`font-semibold ${RISK_COLOR[riskTier] ?? 'text-brMuted'}`}>
                            {riskTier} risk
                          </span>
                        )}
                        {report && (
                          <span
                            className={`rounded-full px-2 py-1 ${
                              report.status === 'published'
                                ? 'bg-brGreen/10 text-brGreen'
                                : 'bg-purple/10 text-purple'
                            }`}
                          >
                            {report.status === 'published'
                              ? `BioAge ${report.biologicalAge ?? '?'}`
                              : 'Draft report'}
                          </span>
                        )}
                        <span className="text-brMuted">→</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  accent,
  to,
}: {
  label: string;
  value: string;
  accent: string;
  to?: string;
}) {
  const inner = (
    <div className="rounded-card border border-borderDark bg-cardDark p-4 transition hover:border-purple/30">
      <p className="section-label">{label}</p>
      <p className={`mt-2 font-orbitron text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <div>{inner}</div>;
}
