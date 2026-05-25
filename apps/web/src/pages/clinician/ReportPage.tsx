import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { ScoredMarker } from '@br-bioage/shared';
import { AppShell } from '@/components/layout/AppShell';
import { ReportView } from '@/components/report/ReportView';
import { RecommendationCard } from '@/components/report/RecommendationCard';
import { useApi } from '@/hooks/useApiToken';

interface Report {
  id: string;
  status: string;
  pdfUrl: string | null;
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
  recommendations: string[] | null;
  assessmentDate: string;
  patient: { firstName: string; lastName: string };
}

export default function ClinicianReportPage() {
  const { patientId, reportId } = useParams();
  const request = useApi();
  const [report, setReport] = useState<Report | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>(['']);
  const [publishing, setPublishing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadReport = (id: string) =>
    request<Report>(`/api/reports/${id}`).then((r) => {
      setReport(r);
      const recs = r.recommendations;
      setRecommendations(Array.isArray(recs) && recs.length > 0 ? recs : ['']);
    });

  useEffect(() => {
    if (reportId) loadReport(reportId).catch(console.error);
  }, [reportId]);

  const build = async () => {
    const patient = await request<{
      intakeSessions: { id: string }[];
      labUploads: { id: string; confirmedAt: string | null }[];
    }>(`/api/patients/${patientId}`);
    const labIds = patient.labUploads.filter((l) => l.confirmedAt).map((l) => l.id);
    const created = await request<Report>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        intakeSessionId: patient.intakeSessions[0]?.id,
        labUploadIds: labIds,
      }),
    });
    setReport(created);
    navigateToReport(created.id);
  };

  const navigateToReport = (id: string) => {
    window.history.replaceState(null, '', `/clinician/patient/${patientId}/report/${id}`);
    loadReport(id);
  };

  const saveRecommendations = async () => {
    if (!report) return;
    setSaving(true);
    try {
      const filtered = recommendations.filter((r) => r.trim());
      const updated = await request<Report>(`/api/reports/${report.id}`, {
        method: 'PUT',
        body: JSON.stringify({ recommendations: filtered }),
      });
      setReport(updated);
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!report) return;
    setPublishing(true);
    try {
      await saveRecommendations();
      const updated = await request<Report>(`/api/reports/${report.id}/publish`, {
        method: 'POST',
        body: '{}',
      });
      setReport(updated);
      alert('Report published. PDF generated and patient notified.');
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  if (!report) {
    return (
      <AppShell>
        <button
          type="button"
          onClick={build}
          className="min-h-[44px] rounded-pill bg-purple px-8 font-orbitron text-sm font-semibold tracking-wider"
        >
          Build Report Card
        </button>
      </AppShell>
    );
  }

  const isDraft = report.status !== 'final';

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link
          to={`/clinician/patient/${patientId}`}
          className="text-sm text-purpleLight hover:text-purple"
        >
          ← Back to Patient
        </Link>
        {report.pdfUrl && (
          <a
            href={report.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-sandstone underline"
          >
            Download PDF
          </a>
        )}
      </div>

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

      {isDraft && (
        <div className="mt-8 space-y-6">
          <RecommendationCard
            recommendations={recommendations}
            onChange={setRecommendations}
          />
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={saveRecommendations}
              disabled={saving}
              className="min-h-[44px] rounded-pill border border-purple/50 px-6 font-orbitron text-sm"
            >
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={publish}
              disabled={publishing}
              className="min-h-[44px] flex-1 rounded-pill bg-purple px-8 font-orbitron text-sm font-semibold tracking-wider shadow-glow sm:flex-none"
            >
              {publishing ? 'Publishing & Generating PDF…' : 'Publish & Send'}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
