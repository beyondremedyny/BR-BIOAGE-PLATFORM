import { isPlausible } from './plausibility';

export { MARKER_LABELS } from './markerLabels';
export { PLAUSIBILITY_RANGES, isPlausible } from './plausibility';

export const DOMAIN_WEIGHTS = {
  d1: 0.25,
  d2: 0.25,
  d3: 0.2,
  d4: 0.2,
  d5: 0.1,
} as const;

export const SCORING_RULES: Record<string, (v: number) => number> = {
  fastingGlucose: (v) => (v < 85 ? -0.3 : v <= 99 ? 0 : v <= 125 ? 2 : 4),
  hba1c: (v) => (v < 5.3 ? -0.5 : v <= 5.6 ? 0 : v <= 6.4 ? 2 : 4),
  fastingInsulin: (v) => (v < 5 ? -0.5 : v <= 10 ? 1 : v <= 20 ? 2.5 : 4),
  triglycerides: (v) => (v < 100 ? -0.3 : v <= 149 ? 0.5 : v <= 199 ? 1.5 : 3),
  hdl: (v) => (v >= 65 ? -0.3 : v >= 55 ? 0 : v >= 45 ? 0.5 : v >= 35 ? 1 : 2),
  apob: (v) => (v < 60 ? -0.3 : v <= 80 ? 1 : v <= 100 ? 2 : 3),
  hscrp: (v) => (v < 0.5 ? -0.3 : v <= 1 ? 1 : v <= 3 ? 2.5 : 4),
  alt: (v) => (v < 25 ? -0.2 : v <= 40 ? 0.5 : v <= 80 ? 1.5 : 3),
  ast: (v) => (v < 25 ? -0.2 : v <= 40 ? 0.5 : v <= 80 ? 1.5 : 3),
  ggt: (v) => (v < 20 ? -0.2 : v <= 40 ? 0.5 : v <= 80 ? 1.5 : 3),
  egfr: (v) => (v >= 90 ? -0.3 : v >= 60 ? 1 : v >= 45 ? 2.5 : 5),
  creatinine: (v) => (v >= 0.7 && v <= 1.2 ? 0 : v > 1.5 ? 1.5 : 0.5),
  cystatinC: (v) => (v < 0.9 ? -0.3 : v <= 1.1 ? 0.5 : v <= 1.3 ? 1.5 : 3),
  bun: (v) => (v >= 7 && v <= 20 ? 0 : v > 30 ? 1 : 0.5),
  uricAcid: (v) => (v < 5.5 ? 0 : v <= 7 ? 0.5 : v <= 9 ? 1.5 : 3),
  uacr: (v) => (v < 30 ? 0 : v <= 300 ? 1.5 : 3.5),
  alkalinePhosphatase: (v) => (v >= 44 && v <= 147 ? 0 : v > 200 ? 1 : 0.5),
  totalBilirubin: (v) => (v >= 0.2 && v <= 1.2 ? 0 : v > 2 ? 1 : 0.5),
  systolicBP: (v) => (v < 115 ? -0.3 : v <= 120 ? 0 : v <= 129 ? 0.5 : v <= 139 ? 1.5 : 3),
  diastolicBP: (v) => (v < 75 ? -0.2 : v <= 80 ? 0 : v <= 89 ? 1 : 2.5),
  restingHR: (v) => (v < 45 ? 0 : v <= 60 ? -1 : v <= 70 ? 0 : v <= 80 ? 1 : v <= 90 ? 2 : 3),
  hrv: (v) => (v >= 80 ? -1 : v >= 60 ? -0.5 : v >= 40 ? 0.5 : v >= 20 ? 1.5 : 2.5),
  vo2max: (v) => (v >= 55 ? -1.5 : v >= 45 ? -0.5 : v >= 35 ? 0.5 : v >= 25 ? 1.5 : 3),
  homocysteine: (v) => (v < 7 ? -0.3 : v <= 10 ? 1 : v <= 15 ? 2 : 4),
  lpa: (v) => (v < 30 ? 0 : v <= 75 ? 1 : 3),
  fibrinogen: (v) => (v >= 200 && v <= 400 ? 0 : v > 500 ? 1.5 : 0.5),
  ntprobnp: (v) => (v < 125 ? 0 : v <= 300 ? 1 : v <= 900 ? 2 : 3.5),
  cac: (v) => (v === 0 ? -0.5 : v <= 100 ? 1 : v <= 400 ? 2 : 4),
  totalTestosterone: (v) => (v >= 700 ? -0.5 : v >= 500 ? 1 : v >= 300 ? 2.5 : 4),
  freeTestosterone: (v) => (v >= 15 ? -0.3 : v >= 12 ? 0.5 : v >= 9 ? 1.5 : v >= 6 ? 2.5 : 4),
  shbg: (v) => (v >= 20 && v <= 40 ? 0 : 0.5),
  dheas: (v) => (v >= 300 ? -0.3 : v >= 200 ? 0 : v >= 100 ? 0.8 : 1.5),
  igf1: (v) => (v >= 150 ? -0.3 : v >= 100 ? 0 : v >= 75 ? 1 : v >= 50 ? 2 : 3),
  estradiolMale: (v) => (v >= 20 && v <= 30 ? 0 : v < 15 || v > 40 ? 1 : 0.5),
  prolactin: (v) => (v >= 4 && v <= 15 ? 0 : v > 25 ? 1.5 : 0.5),
  estradiolFemale: (v) => (v >= 50 ? -0.3 : v >= 30 ? 0 : v >= 15 ? 1 : 2),
  progesterone: (v) => (v >= 5 ? -0.2 : v >= 2 ? 0.5 : 1.5),
  fsh: (v) => (v < 10 ? 0 : v <= 20 ? 0.5 : v <= 40 ? 1 : 1.5),
  lh: (v) => (v <= 15 ? 0 : 0.5),
  testosteroneFemale: (v) => (v >= 15 && v <= 70 ? 0 : v < 10 ? 0.5 : v > 100 ? 0.5 : 0.3),
  tsh: (v) => (v >= 0.5 && v <= 2 ? 0 : v <= 3 ? 0.5 : v <= 4 ? 1 : 1.5),
  freeT3: (v) => (v >= 3.2 && v <= 4.2 ? 0 : v < 2.5 ? 1.5 : 0.5),
  freeT4: (v) => (v >= 1.0 && v <= 1.8 ? 0 : 0.5),
  reverseT3: (v) => (v < 15 ? 0 : v <= 20 ? 0.5 : 1),
  tpoAntibodies: (v) => (v < 35 ? 0 : v <= 100 ? 0.5 : 1.5),
  cortisolAM: (v) => (v >= 10 && v <= 18 ? 0 : v < 7 ? 1.5 : v < 10 ? 0.5 : v > 25 ? 1 : 0.5),
  il6: (v) => (v < 1.8 ? -0.3 : v <= 3 ? 1 : v <= 5 ? 2 : 3.5),
  ferritin: (v) => (v >= 30 && v <= 200 ? 0 : v > 300 ? 1 : v < 15 ? 0.5 : 0),
  esr: (v) => (v < 20 ? 0 : v <= 40 ? 0.5 : v <= 60 ? 1 : 2),
  vitaminD: (v) => (v >= 50 ? -0.3 : v >= 40 ? 0 : v >= 30 ? 0.5 : v >= 20 ? 1.5 : 3),
  vitaminB12: (v) => (v >= 400 && v <= 900 ? -0.2 : v < 200 ? 2 : v < 300 ? 1 : 0.5),
  rbcMagnesium: (v) => (v >= 5.2 && v <= 6.8 ? 0 : v < 4.5 ? 1.5 : 0.8),
  omega3Index: (v) => (v >= 8 ? -0.5 : v >= 6 ? 0 : v >= 4 ? 0.5 : 1.5),
  coq10: (v) => (v >= 0.8 ? 0 : v >= 0.5 ? 0.5 : 1.5),
  nad: (v) => (v >= 40 ? -0.5 : v >= 30 ? 0 : v >= 20 ? 1 : 2.5),
  zinc: (v) => (v >= 70 && v <= 120 ? 0 : v < 60 ? 1 : 0.5),
  wbc: (v) => (v >= 4.5 && v <= 6.5 ? 0 : v > 8 ? 0.5 : v < 3.5 ? 0.5 : 0),
  mcv: (v) => (v >= 80 && v <= 96 ? 0 : 0.5),
  folate: (v) => (v >= 5.4 ? 0 : v >= 3 ? 0.5 : 1.5),
  dunedinPace: (v) => (v <= 0.9 ? -2 : v <= 0.95 ? -1 : v <= 1.05 ? 0 : v <= 1.1 ? 2 : v <= 1.2 ? 4 : 6),
  grimAgeAccel: (v) => v,
  telomerePercentile: (v) => (v >= 50 ? -0.5 : v >= 25 ? 1 : v >= 10 ? 2.5 : 4),
};

export const MARKER_DOMAINS: Record<string, 'd1' | 'd2' | 'd3' | 'd4'> = {
  fastingGlucose: 'd1', hba1c: 'd1', fastingInsulin: 'd1', triglycerides: 'd1',
  hdl: 'd1', apob: 'd1', hscrp: 'd1', alt: 'd1', ast: 'd1', ggt: 'd1',
  egfr: 'd1', creatinine: 'd1', cystatinC: 'd1', bun: 'd1', uricAcid: 'd1',
  uacr: 'd1', alkalinePhosphatase: 'd1', totalBilirubin: 'd1',
  systolicBP: 'd2', diastolicBP: 'd2', restingHR: 'd2', hrv: 'd2',
  vo2max: 'd2', homocysteine: 'd2', lpa: 'd2', fibrinogen: 'd2',
  ntprobnp: 'd2', cac: 'd2',
  totalTestosterone: 'd3', freeTestosterone: 'd3', shbg: 'd3', dheas: 'd3',
  igf1: 'd3', estradiolMale: 'd3', prolactin: 'd3', estradiolFemale: 'd3',
  progesterone: 'd3', fsh: 'd3', lh: 'd3', testosteroneFemale: 'd3',
  tsh: 'd3', freeT3: 'd3', freeT4: 'd3', reverseT3: 'd3', tpoAntibodies: 'd3',
  cortisolAM: 'd3',
  il6: 'd4', ferritin: 'd4', esr: 'd4', vitaminD: 'd4', vitaminB12: 'd4',
  rbcMagnesium: 'd4', omega3Index: 'd4', coq10: 'd4', nad: 'd4', zinc: 'd4',
  wbc: 'd4', mcv: 'd4', folate: 'd4', dunedinPace: 'd4', grimAgeAccel: 'd4',
  telomerePercentile: 'd4',
};

export const MARKER_ALIASES: Record<string, string> = {
  glucose: 'fastingGlucose',
  'fasting glucose': 'fastingGlucose',
  hba1c: 'hba1c',
  'hemoglobin a1c': 'hba1c',
  a1c: 'hba1c',
  'glycated hemoglobin': 'hba1c',
  insulin: 'fastingInsulin',
  'fasting insulin': 'fastingInsulin',
  triglycerides: 'triglycerides',
  trigs: 'triglycerides',
  hdl: 'hdl',
  'hdl cholesterol': 'hdl',
  'hdl-c': 'hdl',
  apob: 'apob',
  'apolipoprotein b': 'apob',
  'apo b': 'apob',
  hscrp: 'hscrp',
  'hs-crp': 'hscrp',
  'high sensitivity crp': 'hscrp',
  'high-sensitivity c-reactive protein': 'hscrp',
  crp: 'hscrp',
  'c-reactive protein': 'hscrp',
  alt: 'alt',
  'alanine aminotransferase': 'alt',
  sgpt: 'alt',
  ast: 'ast',
  'aspartate aminotransferase': 'ast',
  sgot: 'ast',
  ggt: 'ggt',
  'gamma-glutamyl transferase': 'ggt',
  'gamma gt': 'ggt',
  egfr: 'egfr',
  'estimated gfr': 'egfr',
  'glomerular filtration rate': 'egfr',
  creatinine: 'creatinine',
  'serum creatinine': 'creatinine',
  'cystatin c': 'cystatinC',
  bun: 'bun',
  'blood urea nitrogen': 'bun',
  'uric acid': 'uricAcid',
  'serum uric acid': 'uricAcid',
  uacr: 'uacr',
  'albumin creatinine ratio': 'uacr',
  'microalbumin creatinine ratio': 'uacr',
  'alk phos': 'alkalinePhosphatase',
  'alkaline phosphatase': 'alkalinePhosphatase',
  alp: 'alkalinePhosphatase',
  bilirubin: 'totalBilirubin',
  'total bilirubin': 'totalBilirubin',
  homocysteine: 'homocysteine',
  'lp(a)': 'lpa',
  'lipoprotein a': 'lpa',
  'lipoprotein(a)': 'lpa',
  fibrinogen: 'fibrinogen',
  'nt-probnp': 'ntprobnp',
  'nt probnp': 'ntprobnp',
  probnp: 'ntprobnp',
  'coronary calcium': 'cac',
  'calcium score': 'cac',
  'cac score': 'cac',
  testosterone: 'totalTestosterone',
  'total testosterone': 'totalTestosterone',
  'free testosterone': 'freeTestosterone',
  shbg: 'shbg',
  'sex hormone binding globulin': 'shbg',
  'dhea-s': 'dheas',
  'dhea sulfate': 'dheas',
  'dehydroepiandrosterone sulfate': 'dheas',
  'igf-1': 'igf1',
  igf1: 'igf1',
  'insulin-like growth factor': 'igf1',
  tsh: 'tsh',
  'thyroid stimulating hormone': 'tsh',
  thyrotropin: 'tsh',
  'free t3': 'freeT3',
  'triiodothyronine free': 'freeT3',
  ft3: 'freeT3',
  'free t4': 'freeT4',
  'thyroxine free': 'freeT4',
  ft4: 'freeT4',
  'reverse t3': 'reverseT3',
  rt3: 'reverseT3',
  'tpo antibodies': 'tpoAntibodies',
  'thyroid peroxidase antibodies': 'tpoAntibodies',
  'anti-tpo': 'tpoAntibodies',
  cortisol: 'cortisolAM',
  'morning cortisol': 'cortisolAM',
  'am cortisol': 'cortisolAM',
  estradiol: 'estradiolMale',
  e2: 'estradiolMale',
  progesterone: 'progesterone',
  fsh: 'fsh',
  'follicle stimulating hormone': 'fsh',
  lh: 'lh',
  'luteinizing hormone': 'lh',
  prolactin: 'prolactin',
  'il-6': 'il6',
  'interleukin-6': 'il6',
  'interleukin 6': 'il6',
  ferritin: 'ferritin',
  'serum ferritin': 'ferritin',
  esr: 'esr',
  'sed rate': 'esr',
  'erythrocyte sedimentation rate': 'esr',
  'vitamin d': 'vitaminD',
  '25-oh vitamin d': 'vitaminD',
  '25-hydroxyvitamin d': 'vitaminD',
  'vitamin d3': 'vitaminD',
  '25(oh)d': 'vitaminD',
  'vitamin b12': 'vitaminB12',
  b12: 'vitaminB12',
  cobalamin: 'vitaminB12',
  cyanocobalamin: 'vitaminB12',
  'rbc magnesium': 'rbcMagnesium',
  'magnesium rbc': 'rbcMagnesium',
  'omega-3 index': 'omega3Index',
  'omega 3 index': 'omega3Index',
  coq10: 'coq10',
  'coenzyme q10': 'coq10',
  ubiquinol: 'coq10',
  'nad+': 'nad',
  nad: 'nad',
  'nicotinamide adenine dinucleotide': 'nad',
  zinc: 'zinc',
  'serum zinc': 'zinc',
  wbc: 'wbc',
  'white blood cell': 'wbc',
  'white blood cell count': 'wbc',
  leukocytes: 'wbc',
  mcv: 'mcv',
  'mean corpuscular volume': 'mcv',
  'mean cell volume': 'mcv',
  folate: 'folate',
  'folic acid': 'folate',
  'rbc folate': 'folate',
  dunedinage: 'dunedinPace',
  'dunedin pace': 'dunedinPace',
  'pace of aging': 'dunedinPace',
  grimage: 'grimAgeAccel',
  'grim age acceleration': 'grimAgeAccel',
  'telomere length percentile': 'telomerePercentile',
};

export function markerStatus(score: number | null): 'optimal' | 'good' | 'watch' | 'risk' | 'pending' {
  if (score === null) return 'pending';
  if (score <= -0.2) return 'optimal';
  if (score <= 0.3) return 'good';
  if (score <= 1.0) return 'watch';
  return 'risk';
}

export function computeDomainDelta(
  markers: Record<string, { score: number | null }>,
  domain: 'd1' | 'd2' | 'd3' | 'd4'
): number | null {
  const relevant = Object.entries(markers).filter(
    ([id, m]) => MARKER_DOMAINS[id] === domain && m.score !== null
  );
  if (relevant.length === 0) return null;
  const raw = relevant.reduce((sum, [, m]) => sum + (m.score ?? 0), 0);
  return Math.min(Math.max(raw, -8), 15);
}

export function computeMasterBioAge(
  chronologicalAge: number,
  deltas: Partial<Record<'d1' | 'd2' | 'd3' | 'd4' | 'd5', number | null>>
): { bioAge: number | null; masterDelta: number | null; confidence: number } {
  let weighted = 0;
  let totalWeight = 0;
  let domainsComplete = 0;

  for (const [domain, weight] of Object.entries(DOMAIN_WEIGHTS)) {
    const delta = deltas[domain as keyof typeof deltas];
    if (delta !== null && delta !== undefined) {
      weighted += delta * weight;
      totalWeight += weight;
      domainsComplete++;
    }
  }

  if (totalWeight === 0) return { bioAge: null, masterDelta: null, confidence: 0 };

  const fullWeight = Object.values(DOMAIN_WEIGHTS).reduce((a, b) => a + b, 0);
  const masterDelta = (weighted / totalWeight) * fullWeight;
  const clamped = Math.min(Math.max(masterDelta, -15), 20);
  const bioAge = Math.round(chronologicalAge + clamped);

  return { bioAge, masterDelta: clamped, confidence: domainsComplete };
}

export function scoreMarker(markerId: string, value: number): number | null {
  if (!isPlausible(markerId, value)) return null;
  const rule = SCORING_RULES[markerId];
  if (!rule) return null;
  return rule(value);
}

export function mergeMarkers(
  existing: Record<string, { score: number | null; value?: number }>,
  incoming: Record<string, { score: number | null; value?: number }>
): Record<string, { score: number | null; value?: number }> {
  return { ...existing, ...incoming };
}
