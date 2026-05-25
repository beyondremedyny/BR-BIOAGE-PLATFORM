export function ConfidenceStars({ confidence }: { confidence: number }) {
  const filled = Math.min(5, Math.max(0, confidence));
  return (
    <span className="font-orbitron text-sm text-purpleLight tracking-widest" aria-label={`${filled} of 5 domains`}>
      {'★'.repeat(filled)}
      {'☆'.repeat(5 - filled)}
    </span>
  );
}
