import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { UploadZone } from '@/components/labs/UploadZone';
import { ExtractionReview } from '@/components/labs/ExtractionReview';
import { useApi } from '@/hooks/useApiToken';

export default function PatientUploadPage() {
  const request = useApi();
  const [step, setStep] = useState<'upload' | 'review' | 'done'>('upload');
  const [loading, setLoading] = useState(false);
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [markerCount, setMarkerCount] = useState(0);
  const [unmappedCount, setUnmappedCount] = useState(0);
  const [labSource, setLabSource] = useState<string | null>(null);

  const fileToBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1] ?? '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const { uploadUrl, upload } = await request<{
        uploadUrl: string;
        upload: { id: string };
      }>('/api/labs/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, fileType: file.type || 'application/octet-stream' }),
      });

      await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      const base64 = await fileToBase64(file);
      const mediaType = file.type || 'application/pdf';
      const result = await request<{
        markerCount: number;
        unmappedCount: number;
        upload: { labSource?: string | null };
      }>('/api/labs/extract', {
        method: 'POST',
        body: JSON.stringify({ uploadId: upload.id, base64Data: base64, mediaType }),
      });

      setUploadId(upload.id);
      setMarkerCount(result.markerCount);
      setUnmappedCount(result.unmappedCount);
      setLabSource(result.upload.labSource ?? null);
      setStep('review');
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!uploadId) return;
    setLoading(true);
    try {
      await request(`/api/labs/uploads/${uploadId}/patient-confirm`, { method: 'POST' });
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Lab Upload">
      <p className="section-label mb-2">Lab Results</p>
      <h1 className="font-orbitron text-2xl font-bold">Upload Your Bloodwork</h1>
      <p className="mt-2 text-sm text-sandstone">
        Secure upload · AI-assisted extraction · Clinician review before scoring
      </p>

      <div className="mt-8 max-w-xl">
        {step === 'upload' && <UploadZone onFile={handleFile} disabled={loading} />}
        {step === 'review' && (
          <ExtractionReview
            labSource={labSource}
            markerCount={markerCount}
            unmappedCount={unmappedCount}
            onConfirm={handleConfirm}
            loading={loading}
          />
        )}
        {step === 'done' && (
          <div className="rounded-card border border-borderDark bg-cardDark p-6 text-center">
            <p className="font-orbitron text-lg text-brGreen">Thank You</p>
            <p className="mt-2 text-sm text-sandstone">
              Your lab report has been submitted. Your clinician will finalize your BioAge report.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
