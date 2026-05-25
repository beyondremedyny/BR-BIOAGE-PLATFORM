import { useState } from 'react';
import type { ScoredMarker } from '@br-bioage/shared';
import { MARKER_LABELS, PLAUSIBILITY_RANGES } from '@br-bioage/shared';
import { StatusBadge } from '@/components/brand/StatusBadge';
import { formatDelta } from '@br-bioage/shared';

interface MarkerEditorProps {
  markers: Record<string, ScoredMarker>;
  onSaveMarker: (markerId: string, value: number) => Promise<void>;
  readOnly?: boolean;
}

export function MarkerEditor({ markers, onSaveMarker, readOnly }: MarkerEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sorted = Object.values(markers).sort((a, b) => a.label.localeCompare(b.label));

  const startEdit = (m: ScoredMarker) => {
    setEditingId(m.id);
    setDraftValue(String(m.value));
    setError(null);
  };

  const save = async (markerId: string) => {
    const num = parseFloat(draftValue);
    if (Number.isNaN(num)) {
      setError('Enter a valid number');
      return;
    }
    const range = PLAUSIBILITY_RANGES[markerId];
    if (range && (num < range.min || num > range.max)) {
      setError(`Plausible range: ${range.min}–${range.max}`);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSaveMarker(markerId, num);
      setEditingId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const addMarker = () => {
    const id = prompt('Marker ID (e.g. fastingGlucose, hba1c):');
    if (!id || !MARKER_LABELS[id]) {
      alert('Unknown marker ID. Use internal marker keys from the scoring system.');
      return;
    }
    const val = prompt('Numeric value:');
    if (!val) return;
    const num = parseFloat(val);
    if (Number.isNaN(num)) return;
    onSaveMarker(id, num).catch(console.error);
  };

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-brMuted">No markers extracted yet.</p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="section-label">Extracted Markers</p>
        {!readOnly && (
          <button
            type="button"
            onClick={addMarker}
            className="text-xs text-purpleLight hover:text-purple"
          >
            + Add Marker
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-borderDark text-xs text-sandstone">
              <th className="pb-2 pr-4 font-orbitron tracking-wide">Marker</th>
              <th className="pb-2 pr-4 font-orbitron tracking-wide">Value</th>
              <th className="pb-2 pr-4 font-orbitron tracking-wide">Delta</th>
              <th className="pb-2 font-orbitron tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m) => (
              <tr key={m.id} className="border-b border-borderDark/50">
                <td className="py-3 pr-4 font-poppins">{m.label}</td>
                <td className="py-3 pr-4">
                  {editingId === m.id && !readOnly ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="any"
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        className="w-24 min-h-[40px] rounded-lg border border-purple/50 bg-white/5 px-2 font-orbitron text-ivory"
                        autoFocus
                      />
                      <span className="text-xs text-brMuted">{m.unit}</span>
                      <button
                        type="button"
                        onClick={() => save(m.id)}
                        disabled={saving}
                        className="text-xs text-brGreen"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-xs text-brMuted"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => !readOnly && startEdit(m)}
                      className="font-orbitron text-ivory disabled:cursor-default"
                    >
                      {m.value} {m.unit}
                      {!readOnly && <span className="ml-2 text-xs text-purpleLight">Edit</span>}
                    </button>
                  )}
                </td>
                <td className="py-3 pr-4 font-orbitron font-bold">{formatDelta(m.score)}</td>
                <td className="py-3">
                  <StatusBadge status={m.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="mt-3 text-sm text-brRed">{error}</p>}
    </div>
  );
}
