import type { IntakeQuestion, IntakeAnswers } from '@br-bioage/shared';

interface QuestionBlockProps {
  question: IntakeQuestion;
  value: IntakeAnswers[string];
  onChange: (id: string, value: IntakeAnswers[string]) => void;
}

const BASE_OPTION =
  'flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition';
const CHECKED_OPTION = 'has-[:checked]:border-purple has-[:checked]:bg-purple/10';
const REDFLAG_OPTION = 'border-brRed/40 hover:border-brRed/70';
const NORMAL_OPTION = 'border-borderDark hover:border-purple/40';

const INPUT_BASE =
  'w-full min-h-[44px] rounded-lg border border-borderDark bg-white/5 px-4 text-ivory outline-none focus:border-purple';

export function QuestionBlock({ question, value, onChange }: QuestionBlockProps) {
  const id = question.id;

  // ── Info banner ──────────────────────────────────────────────────────────
  if (question.type === 'info') {
    return (
      <div className="rounded-lg border border-purple/20 bg-purple/5 px-4 py-3 font-poppins text-sm text-brMuted">
        {question.label}
      </div>
    );
  }

  // ── Label + optional nurse badge helper ──────────────────────────────────
  const labelEl = (
    <span className="mb-2 block font-poppins text-sm text-ivory">
      {question.label}
      {question.nurseField && (
        <span className="ml-2 rounded-full bg-purple/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple">
          Nurse
        </span>
      )}
      {question.isRedFlag && (
        <span className="ml-2 rounded-full bg-brRed/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brRed">
          Safety
        </span>
      )}
    </span>
  );

  // ── Radio ────────────────────────────────────────────────────────────────
  if (question.type === 'radio' && question.options) {
    return (
      <fieldset className="space-y-2">
        <legend className="mb-3 font-poppins text-sm text-ivory">
          {question.label}
          {question.isRedFlag && (
            <span className="ml-2 rounded-full bg-brRed/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brRed">
              Safety
            </span>
          )}
        </legend>
        {question.options.map((opt) => {
          const isRedFlagOpt = opt.redFlag === true;
          const checked = String(value) === String(opt.value);
          return (
            <label
              key={String(opt.value)}
              className={`${BASE_OPTION} ${CHECKED_OPTION} ${isRedFlagOpt ? REDFLAG_OPTION : NORMAL_OPTION}`}
            >
              <input
                type="radio"
                name={id}
                value={String(opt.value)}
                checked={checked}
                onChange={() => onChange(id, opt.value)}
                className="accent-purple"
              />
              <span className="font-poppins text-sm">{opt.label}</span>
              {isRedFlagOpt && (
                <span className="ml-auto text-xs text-brRed">⚠</span>
              )}
            </label>
          );
        })}
      </fieldset>
    );
  }

  // ── Multiselect ──────────────────────────────────────────────────────────
  if (question.type === 'multiselect' && question.options) {
    const selected: string[] = Array.isArray(value) ? (value as string[]).map(String) : [];
    return (
      <fieldset className="space-y-2">
        <legend className="mb-3 font-poppins text-sm text-ivory">{question.label}</legend>
        {question.options.map((opt) => {
          const isRedFlagOpt =
            opt.redFlag === true ||
            (question.redFlagOptions?.includes(String(opt.value)) ?? false);
          const checked = selected.some((v) => String(v) === String(opt.value));
          return (
            <label
              key={String(opt.value)}
              className={`${BASE_OPTION} ${isRedFlagOpt ? REDFLAG_OPTION : NORMAL_OPTION} ${checked ? 'border-purple bg-purple/10' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {
                  const next = checked
                    ? selected.filter((v) => v !== String(opt.value))
                    : [...selected, String(opt.value)];
                  onChange(id, next);
                }}
                className="accent-purple"
              />
              <span className="font-poppins text-sm">{opt.label}</span>
              {isRedFlagOpt && (
                <span className="ml-auto text-xs text-brRed">⚠</span>
              )}
            </label>
          );
        })}
      </fieldset>
    );
  }

  // ── Select (dropdown) ────────────────────────────────────────────────────
  if (question.type === 'select' && question.options) {
    return (
      <label className="block">
        {labelEl}
        <select
          value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${INPUT_BASE} font-poppins`}
        >
          <option value="" disabled>
            {question.placeholder ?? 'Select…'}
          </option>
          {question.options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  // ── Date ─────────────────────────────────────────────────────────────────
  if (question.type === 'date') {
    return (
      <label className="block">
        {labelEl}
        <input
          type="date"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(id, e.target.value)}
          className={`${INPUT_BASE} font-poppins`}
        />
      </label>
    );
  }

  // ── Number ───────────────────────────────────────────────────────────────
  if (question.type === 'number') {
    return (
      <label className="block">
        {labelEl}
        <input
          type="number"
          min={question.min}
          max={question.max}
          placeholder={question.placeholder}
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => onChange(id, e.target.value ? Number(e.target.value) : null)}
          className={`${INPUT_BASE} font-orbitron`}
        />
        {question.unit && (
          <span className="mt-1 block text-xs text-brMuted">{question.unit}</span>
        )}
      </label>
    );
  }

  // ── Text / Textarea ──────────────────────────────────────────────────────
  if (question.type === 'textarea' || question.type === 'text') {
    const Tag = question.type === 'textarea' ? 'textarea' : 'input';
    return (
      <label className="block">
        {labelEl}
        <Tag
          placeholder={question.placeholder}
          value={typeof value === 'string' ? value : ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
            onChange(id, e.target.value)
          }
          rows={question.type === 'textarea' ? 4 : undefined}
          className={`${INPUT_BASE} font-poppins py-3`}
        />
      </label>
    );
  }

  return null;
}
