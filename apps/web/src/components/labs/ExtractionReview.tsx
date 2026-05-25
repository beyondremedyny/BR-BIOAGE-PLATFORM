interface ExtractionReviewProps {
  labSource?: string | null;
  markerCount: number;
  unmappedCount: number;
  onConfirm: () => void;
  loading?: boolean;
}

export function ExtractionReview({
  labSource,
  markerCount,
  unmappedCount,
  onConfirm,
  loading,
}: ExtractionReviewProps) {
  return (
    <div className="rounded-card border border-borderDark bg-cardDark p-6 shadow-card">
      <p className="section-label">Extraction Complete</p>
      <h2 className="mt-2 font-orbitron text-xl font-bold">
        We Found {markerCount} Markers
        {labSource && labSource !== 'Unknown' ? ` In Your ${labSource} Report` : ''}
      </h2>
      {unmappedCount > 0 && (
        <p className="mt-2 text-sm text-sandstone">
          {unmappedCount} additional values will be reviewed by your clinician.
        </p>
      )}
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="mt-6 min-h-[44px] w-full rounded-pill bg-purple px-6 font-orbitron text-sm font-semibold tracking-wider text-ivory transition hover:bg-purpleDark disabled:opacity-50"
      >
        {loading ? 'Confirming…' : 'Confirm & Submit'}
      </button>
    </div>
  );
}
