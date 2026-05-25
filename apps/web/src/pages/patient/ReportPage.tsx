import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ScoredMarker } from '@br-bioage/shared';
import { AppShell } from '@/components/layout/AppShell';
import { ReportView } from '@/components/report/ReportView';
import { useApi } from '@/hooks/useApiToken';

interface Report {
  biologicalAge: number | null;
  chronologicalAge: number | null;
  masterDelta: number | null;
  confidence: number | null;
  d1Delta: number | null;
  d2Delta: number | null;
  d3Delta: number | null;
  d4Delta: number | null;
  d5Delta: number | null;
  markers: Record<string, ScoredMarker> | null;
  biometrics: Record<string, unknown> | null;
  assessmentDate: string;
  status: string;
  pdfUrl: string | null;
  patient: { firstName: string; lastName: string };
}

export default function PatientReportPage() {
  const { reportId } = useParams();
  const request = useApi();
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!reportId) return;
    request<Report>(`/api/reports/${reportId}`)
      .then(setReport)
      .catch(console.error);
  }, [reportId, request]);

  if (!report) {
    return (
      <AppShell>
        <p className="text-brMuted">Loading report…</p>
      </AppShell>
    );
  }

  if (report.status !== 'final') {
    return (
      <AppShell>
        <p className="text-sandstone">Your report is being prepared by your clinical team.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {report.pdfUrl && (
        <a
          href={report.pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-6 inline-flex min-h-[44px] items-center rounded-pill border border-purple/50 px-6 font-orbitron text-xs tracking-wider text-purpleLight"
        >
          Download PDF Report
        </a>
      )}
      <ReportView
        patientName={`${report.patient.firstName} ${report.patient.lastName}`}
        assessmentDate={report.assessmentDate}
        biologicalAge={report.biologicalAge}
        chronologicalAge={report.chronologicalAge}
        masterDelta={report.masterDelta}
        confidence={report.confidence ?? 0}
        deltas={{
          d1: report.d1Delta,
          d2: report.d2Delta,
          d3: report.d3Delta,
          d4: report.d4Delta,
          d5: report.d5Delta,
        }}
        markers={report.markers ?? {}}
        biometrics={report.biometrics}
      />
    </AppShell>
  );
}
