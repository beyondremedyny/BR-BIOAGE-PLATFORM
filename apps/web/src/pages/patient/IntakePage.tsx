import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { INTAKE_SECTIONS, detectRedFlags, type IntakeAnswers } from '@br-bioage/shared';
import { AppShell } from '@/components/layout/AppShell';
import { SectionNav } from '@/components/intake/SectionNav';
import { QuestionBlock } from '@/components/intake/QuestionBlock';
import { RedFlagScreen } from '@/components/intake/RedFlagScreen';
import { useApi } from '@/hooks/useApiToken';

export default function PatientIntakePage() {
  const { sessionId: paramSessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const request = useApi();
  const sex = (user?.publicMetadata?.sex as string) ?? 'Male';

  const visibleSections = useMemo(
    () =>
      INTAKE_SECTIONS.filter(
        (s) => !s.nurseOnly && (!s.sexFilter || s.sexFilter === sex)
      ),
    [sex]
  );

  const [sessionId, setSessionId] = useState<string | null>(paramSessionId ?? null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [redFlag, setRedFlag] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const section = visibleSections[sectionIndex] ?? visibleSections[0];

  useEffect(() => {
    if (paramSessionId) return;
    request<{ id: string }>('/api/intake/sessions', { method: 'POST' })
      .then((s) => {
        setSessionId(s.id);
        navigate(`/patient/intake/${s.id}`, { replace: true });
      })
      .catch(console.error);
  }, [paramSessionId, request, navigate]);

  useEffect(() => {
    if (!paramSessionId) return;
    request<{ answers: IntakeAnswers; redFlagTriggered: boolean }>(
      `/api/intake/sessions/${paramSessionId}`
    )
      .then((s) => {
        setAnswers((s.answers as IntakeAnswers) ?? {});
        setRedFlag(s.redFlagTriggered);
        setSessionId(paramSessionId);
      })
      .catch(console.error);
  }, [paramSessionId, request]);

  const save = useCallback(async () => {
    if (!sessionId) return;
    setSaving(true);
    try {
      await request(`/api/intake/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify({ answers }),
      });
    } finally {
      setSaving(false);
    }
  }, [sessionId, answers, request]);

  useEffect(() => {
    if (!sessionId) return;
    const t = setInterval(save, 30000);
    return () => clearInterval(t);
  }, [sessionId, save]);

  const setAnswer = (id: string, value: IntakeAnswers[string]) => {
    const next = { ...answers, [id]: value };
    setAnswers(next);
    if (section?.id === 'redFlags') {
      const flags = detectRedFlags(next);
      if (flags.length > 0) setRedFlag(true);
    }
  };

  const filterQuestions = section?.questions.filter(
    (q) => !q.sexFilter || q.sexFilter === sex
  ) ?? [];

  const handleNext = async () => {
    if (redFlag) return;
    setCompleted((c) => new Set(c).add(section.id));
    await save();

    if (section.id === 'redFlags') {
      const flags = detectRedFlags(answers);
      if (flags.length > 0) {
        setRedFlag(true);
        if (sessionId) {
          await request(`/api/intake/sessions/${sessionId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ answers }),
          }).catch(console.error);
        }
        return;
      }
    }

    if (sectionIndex < visibleSections.length - 1) {
      setSectionIndex((i) => i + 1);
      return;
    }

    // Final section — submit and always show confirmation
    if (sessionId) {
      await request(`/api/intake/sessions/${sessionId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers }),
      }).catch(console.error);
    }
    setDone(true);
  };

  if (redFlag) {
    return (
      <AppShell title="Clinical Safety">
        <RedFlagScreen onBack={() => setRedFlag(false)} />
      </AppShell>
    );
  }

  if (done) {
    return (
      <AppShell>
        <div className="mx-auto max-w-lg rounded-card border border-borderDark bg-cardDark p-8 text-center">
          <p className="section-label text-brGreen">Intake Complete</p>
          <p className="mt-4 font-poppins text-sandstone">
            Your intake is complete. Your clinical team will reach out within 24 hours to schedule
            your bloodwork panel.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="BioAge Intake">
      <div className="flex gap-8 pb-28 md:pb-8">
        <SectionNav
          sections={visibleSections}
          currentIndex={sectionIndex}
          completed={completed}
          onSelect={setSectionIndex}
        />
        <div className="min-w-0 flex-1">
          {section && (
            <>
              <p className="section-label">{section.title}</p>
              {section.subtitle && (
                <p className="mt-1 text-sm text-sandstone">{section.subtitle}</p>
              )}
              <div className="mt-8 space-y-8">
                {filterQuestions.map((q) => (
                  <QuestionBlock
                    key={q.id}
                    question={q}
                    value={answers[q.id]}
                    onChange={setAnswer}
                  />
                ))}
              </div>
              <div className="mt-10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  disabled={sectionIndex === 0}
                  onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
                  className="min-h-[44px] rounded-pill border border-borderDark px-6 text-sm text-sandstone disabled:opacity-30"
                >
                  Back
                </button>
                <span className="text-xs text-brMuted">{saving ? 'Saving…' : 'Auto-save on'}</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="min-h-[44px] rounded-pill bg-purple px-8 font-orbitron text-sm font-semibold tracking-wider"
                >
                  {sectionIndex === visibleSections.length - 1 ? 'Submit' : 'Continue'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
