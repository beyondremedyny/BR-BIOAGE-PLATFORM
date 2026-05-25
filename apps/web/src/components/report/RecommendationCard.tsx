interface RecommendationCardProps {
  recommendations: string[];
  onChange: (items: string[]) => void;
  readOnly?: boolean;
}

export function RecommendationCard({
  recommendations,
  onChange,
  readOnly,
}: RecommendationCardProps) {
  const add = () => onChange([...recommendations, '']);
  const update = (index: number, value: string) => {
    const next = [...recommendations];
    next[index] = value;
    onChange(next);
  };
  const remove = (index: number) => onChange(recommendations.filter((_, i) => i !== index));

  return (
    <div className="rounded-card border border-borderDark bg-cardDark p-6 shadow-card">
      <p className="section-label">Protocol Recommendations</p>
      <p className="mt-1 text-sm text-sandstone">
        Personalized guidance for the patient report (does not affect BioAge score).
      </p>
      <ul className="mt-4 space-y-3">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex gap-2">
            <input
              type="text"
              value={rec}
              readOnly={readOnly}
              onChange={(e) => update(i, e.target.value)}
              placeholder="Recommendation…"
              className="min-h-[44px] flex-1 rounded-lg border border-borderDark bg-white/5 px-4 font-poppins text-sm text-ivory outline-none focus:border-purple"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => remove(i)}
                className="min-h-[44px] px-3 text-sm text-brMuted hover:text-brRed"
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <button
          type="button"
          onClick={add}
          className="mt-4 text-sm text-purpleLight hover:text-purple"
        >
          + Add Recommendation
        </button>
      )}
    </div>
  );
}
