import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ScoredMarker } from '@br-bioage/shared';
import { AppShell } from '@/components/layout/AppShell';
import { LabImageViewer } from '@/components/labs/LabImageViewer';
import { MarkerEditor } from '@/components/labs/MarkerEditor';
import { useApi } from '@/hooks/useApiToken';

interface LabUploadDetail {
  id: string;
  fileName: string;
  labSource: string | null;
  aiNotes: string | null;
  confirmedAt: string | null;
  extractedMarkers: Record<string, ScoredMarker> | null;
  imageUrl?: string;
}

export default function ClinicianLabsPage() {
  const { patientId } = useParams();
  const request = useApi();
  const [uploads, setUploads] = useState<LabUploadDetail[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const loadUploads = useCallback(async () => {
    if (!patientId) return;
    const p = await request<{ labUploads: { id: string }[] }>(`/api/patients/${patientId}`);
    const detailed = await Promise.all(
      p.labUploads.map((u) =>
        request<LabUploadDetail>(`/api/labs/uploads/${u.id}`)
      )
    );
    setUploads(detailed);
    setActiveId((prev) => prev ?? detailed[0]?.id ?? null);
  }, [patientId, request]);

  useEffect(() => {
    loadUploads().catch(console.error);
  }, [loadUploads]);

  const active = uploads.find((u) => u.id === activeId) ?? uploads[0];
  const markers = active?.extractedMarkers ?? {};

  const saveMarker = async (markerId: string, value: number) => {
    if (!active) return;
    const res = await request<{ marker: ScoredMarker; upload: LabUploadDetail }>(
      `/api/labs/uploads/${active.id}/markers/${markerId}`,
      { method: 'PATCH', body: JSON.stringify({ value }) }
    );
    setUploads((prev) =>
      prev.map((u) =>
        u.id === active.id
          ? { ...u, extractedMarkers: res.upload.extractedMarkers as Record<string, ScoredMarker> }
          : u
      )
    );
  };

  const confirm = async () => {
    if (!active?.extractedMarkers) return;
    setConfirming(true);
    try {
      await request(`/api/labs/uploads/${active.id}/confirm`, {
        method: 'PUT',
        body: JSON.stringify({ markers: active.extractedMarkers }),
      });
      await loadUploads();
    } finally {
      setConfirming(false);
    }
  };

  return (
    <AppShell title="Lab Review">
      <h1 className="font-orbitron text-2xl font-bold">Lab Extraction Review</h1>
      <p className="mt-2 text-sm text-sandstone">
        Edit any value before confirming. Invalid values are rejected by plausibility checks.
      </p>

      {uploads.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {uploads.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setActiveId(u.id)}
              className={`min-h-[44px] rounded-pill px-4 text-xs font-orbitron ${
                u.id === active?.id ? 'bg-purple text-ivory' : 'border border-borderDark text-sandstone'
              }`}
            >
              {u.fileName}
              {u.confirmedAt ? ' ✓' : ''}
            </button>
          ))}
        </div>
      )}

      {active && (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {active.imageUrl && (
            <LabImageViewer imageUrl={active.imageUrl} fileName={active.fileName} />
          )}
          <div className="rounded-card border border-borderDark bg-cardDark p-5 shadow-card">
            <p className="font-orbitron font-semibold">{active.fileName}</p>
            {active.labSource && (
              <p className="mt-1 text-xs text-sandstone">Source: {active.labSource}</p>
            )}
            {active.aiNotes && (
              <p className="mt-2 rounded-lg bg-white/5 p-3 text-xs text-sandstone">{active.aiNotes}</p>
            )}

            <div className="mt-6">
              <MarkerEditor
                markers={markers}
                onSaveMarker={saveMarker}
                readOnly={!!active.confirmedAt}
              />
            </div>

            {!active.confirmedAt && (
              <button
                type="button"
                onClick={confirm}
                disabled={confirming || Object.keys(markers).length === 0}
                className="mt-6 min-h-[44px] w-full rounded-pill bg-purple font-orbitron text-sm font-semibold tracking-wider disabled:opacity-40"
              >
                {confirming ? 'Confirming…' : 'Confirm Extraction'}
              </button>
            )}
            {active.confirmedAt && (
              <p className="mt-4 text-center text-sm text-brGreen">Confirmed by clinician</p>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
}
