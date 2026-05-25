import type { IntakeAnswers } from '../types';
import { INTAKE_SECTIONS } from './sections';

// Medication flag rules — keyword matched against medList option strings
const MEDICATION_FLAG_KEYWORDS: Record<string, string> = {
  statin: 'On statin therapy — interpret lipids in clinical context',
  metformin: 'On metformin — glucose/HbA1c may reflect treatment effect',
  levothyroxine: 'On thyroid replacement — interpret TSH/T3/T4 in clinical context',
  synthroid: 'On thyroid replacement — interpret TSH/T3/T4 in clinical context',
  testosterone: 'On testosterone/HRT — interpret androgen panel in clinical context',
  'ace inhibitor': 'On antihypertensive — BP may reflect treatment effect',
  'beta blocker': 'On beta blocker — resting HR and BP may reflect treatment effect',
  'calcium channel blocker': 'On antihypertensive — BP may reflect treatment effect',
  diuretic: 'On diuretic — electrolytes and BP may reflect treatment effect',
  'glp-1': 'On GLP-1 agonist — weight/metabolic markers may reflect treatment',
  semaglutide: 'On GLP-1 agonist — weight/metabolic markers may reflect treatment',
  ssri: 'On SSRI/SNRI — may affect cortisol, weight, and metabolic markers',
  snri: 'On SSRI/SNRI — may affect cortisol, weight, and metabolic markers',
  corticosteroid: 'On corticosteroid — may elevate glucose, affect adrenal axis',
  prednisone: 'On corticosteroid — may elevate glucose, affect adrenal axis',
  ppi: 'On PPI — may impair B12, magnesium, and iron absorption',
  'proton pump': 'On PPI — may impair B12, magnesium, and iron absorption',
  'blood thinner': 'On anticoagulant — coagulation markers in clinical context',
  immunosuppressant: 'On immunosuppressant — immune markers require clinical interpretation',
};

/**
 * Scan all sections for red-flag triggers:
 * - Individual options with redFlag: true
 * - Multiselect answers matching question.redFlagOptions list
 */
export function detectRedFlags(answers: IntakeAnswers): string[] {
  const flags: string[] = [];
  for (const section of INTAKE_SECTIONS) {
    for (const q of section.questions) {
      const val = answers[q.id];
      if (val === undefined || val === null || val === '') continue;

      if (Array.isArray(val)) {
        // Check redFlagOptions list
        if (q.redFlagOptions?.length) {
          for (const v of val as string[]) {
            if (q.redFlagOptions.includes(v)) {
              flags.push(`${q.id}:${v}`);
            }
          }
        }
        // Check individual options with redFlag: true
        for (const v of val as string[]) {
          const opt = q.options?.find((o) => String(o.value) === String(v));
          if (opt?.redFlag) flags.push(`${q.id}:${v}`);
        }
      } else {
        const opt = q.options?.find((o) => String(o.value) === String(val));
        if (opt?.redFlag) flags.push(q.id);
      }
    }
  }
  // Deduplicate
  return [...new Set(flags)];
}

/**
 * Generate medication context flags based on medList multiselect answers.
 * These flags are surfaced on the clinician report as interpretation guidance.
 */
export function generateMedicationFlags(answers: IntakeAnswers): string[] {
  const meds = answers['medList'];
  if (!meds || !Array.isArray(meds)) return [];
  const flags: string[] = [];
  for (const med of meds as string[]) {
    const lower = med.toLowerCase();
    for (const [keyword, flag] of Object.entries(MEDICATION_FLAG_KEYWORDS)) {
      if (lower.includes(keyword) && !flags.includes(flag)) {
        flags.push(flag);
      }
    }
  }
  return flags;
}

/**
 * Compute Domain 5 delta (lifestyle / functional) from intake answers.
 *
 * Logic:
 *   • Radio questions: use opt.risk from the selected option
 *   • Multiselect with riskMap: sum riskMap[label] for each selected value
 *   • Multiselect with opt.risk: sum opt.risk for each selected option
 *   • Skip: redFlags section, biometric section, personal section, info/text/number/date/textarea types
 *
 * Returns a clamped delta in [-8, 15].
 */
export function computeDomain5Delta(answers: IntakeAnswers): number {
  const SKIP_SECTIONS = new Set(['redFlags', 'biometric', 'personal']);
  const SKIP_TYPES = new Set(['info', 'text', 'number', 'date', 'textarea']);

  let total = 0;

  for (const section of INTAKE_SECTIONS) {
    if (SKIP_SECTIONS.has(section.id)) continue;

    for (const q of section.questions) {
      if (q.supplementOnly) continue;
      if (SKIP_TYPES.has(q.type)) continue;

      const val = answers[q.id];
      if (val === undefined || val === null || val === '') continue;

      if (Array.isArray(val)) {
        // Multiselect
        if (q.riskMap) {
          for (const v of val as string[]) {
            const risk = q.riskMap[v];
            if (risk !== undefined) total += risk;
          }
        } else if (q.options) {
          for (const v of val as string[]) {
            const opt = q.options.find((o) => String(o.value) === String(v));
            const risk = opt?.risk ?? opt?.score;
            if (risk !== undefined) total += risk;
          }
        }
      } else {
        // Radio / select
        if (q.options) {
          const opt = q.options.find((o) => String(o.value) === String(val));
          const risk = opt?.risk ?? opt?.score;
          if (risk !== undefined) total += risk;
        }
      }
    }
  }

  return Math.min(Math.max(total, -8), 15);
}

export function domain5Tier(delta: number): string {
  if (delta <= -2) return 'Excellent';
  if (delta <= 1) return 'Healthy';
  if (delta <= 4) return 'At Risk';
  return 'High Priority';
}

/**
 * Compute clinical risk tier from a focused subset of high-impact conditions.
 * Used to route patients to appropriate care pathways.
 *
 * Inputs scored:
 *   - medConditions (multiselect riskMap) — specific high-risk diagnoses only
 *   - cancerPersonal (radio) — active/recent cancer
 *   - familyHeartDisease + familyDementia + familyDiabetes + familyCancer (radio)
 *   - smoking (radio) — current heavy smoking
 *   - currentMedCount (polypharmacy)
 */
export function computeClinicalRiskTier(answers: IntakeAnswers): string {
  let score = 0;

  // High-risk medical conditions — subset of medConditions riskMap
  const HIGH_RISK_CONDITIONS: Record<string, number> = {
    'Cardiovascular disease (heart attack, stent, bypass, heart failure)': 3,
    'Stroke or TIA': 2.5,
    'Type 2 diabetes': 2.5,
    'Atrial fibrillation or arrhythmia': 2,
    'Kidney disease (CKD or other)': 2,
    'Type 1 diabetes': 2,
    'Liver disease (fatty liver, cirrhosis, hepatitis)': 2,
    'Autoimmune disease': 1.5,
    'Hypertension (high blood pressure)': 1.5,
    'Obstructive sleep apnea': 1.5,
    'Inflammatory bowel disease (Crohn\'s, UC)': 1.5,
    'Hyperlipidemia (high cholesterol)': 1,
    'Thyroid disease (hypo or hyperthyroid)': 1,
    'Osteoporosis or osteopenia': 1,
    'Depression': 1,
    'Chronic pain condition': 1,
  };

  const conditions = answers['medConditions'];
  if (Array.isArray(conditions)) {
    for (const c of conditions as string[]) {
      const risk = HIGH_RISK_CONDITIONS[c];
      if (risk !== undefined) score += risk;
    }
  }

  // Cancer history
  const cancer = answers['cancerPersonal'];
  const cancerRisk: Record<string, number> = {
    active: 3,
    remission2: 2,
    remission5: 1,
    remission5plus: 0.5,
    no: 0,
  };
  if (typeof cancer === 'string' && cancerRisk[cancer] !== undefined) {
    score += cancerRisk[cancer];
  }

  // Family history — use raw option risk values
  const familyFields = ['familyHeartDisease', 'familyDementia', 'familyDiabetes', 'familyCancer'];
  for (const fieldId of familyFields) {
    const fieldVal = answers[fieldId];
    if (fieldVal === undefined || fieldVal === null) continue;
    for (const section of INTAKE_SECTIONS) {
      const q = section.questions.find((q) => q.id === fieldId);
      if (!q) continue;
      const opt = q.options?.find((o) => String(o.value) === String(fieldVal));
      const risk = opt?.risk ?? opt?.score;
      if (risk !== undefined && risk > 0) score += risk;
    }
  }

  // Smoking — current only
  const smokingVal = answers['smoking'];
  const smokingRisk: Record<string, number> = {
    '2': 2,   // former, quit within 5 years
    '3': 3,   // current occasional
    '4': 5,   // current daily
    '5': 1.5, // nicotine products
  };
  if (typeof smokingVal !== 'undefined' && smokingVal !== null) {
    const r = smokingRisk[String(smokingVal)];
    if (r !== undefined) score += r;
  }

  // Polypharmacy (6+ meds)
  if (String(answers['currentMedCount']) === '3') score += 2;

  if (score >= 10) return 'High';
  if (score >= 6) return 'Elevated';
  if (score >= 3) return 'Moderate';
  return 'Low';
}

export function processIntakeSubmission(answers: IntakeAnswers) {
  const redFlags = detectRedFlags(answers);
  if (redFlags.length > 0) {
    return {
      redFlagTriggered: true,
      redFlags,
      domain5Delta: null,
      domain5Tier: null,
      clinicalRiskTier: null,
      medicationFlags: [] as string[],
    };
  }
  const d5 = computeDomain5Delta(answers);
  return {
    redFlagTriggered: false,
    redFlags: [] as string[],
    domain5Delta: d5,
    domain5Tier: domain5Tier(d5),
    clinicalRiskTier: computeClinicalRiskTier(answers),
    medicationFlags: generateMedicationFlags(answers),
  };
}

export function getChronologicalAge(dateOfBirth: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) age--;
  return age;
}
