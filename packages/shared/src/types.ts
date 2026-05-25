export type DomainKey = 'd1' | 'd2' | 'd3' | 'd4' | 'd5';

export interface RawMarker {
  name: string;
  value: string;
  unit: string;
  reference_range: string | null;
  flag: string | null;
}

export interface LabExtractionResult {
  lab_source?: string;
  report_date?: string;
  patient_name?: string;
  ordering_physician?: string;
  markers: RawMarker[];
  notes?: string;
  error?: string;
}

export interface ScoredMarker {
  id: string;
  domain: 'd1' | 'd2' | 'd3' | 'd4';
  label: string;
  unit: string;
  value: number;
  rawValue: string;
  flag: string | null;
  referenceRange: string | null;
  score: number;
  status: 'optimal' | 'good' | 'watch' | 'risk' | 'pending';
}

export type IntakeAnswers = Record<string, string | string[] | number | boolean | null>;

export interface IntakeSection {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  nurseOnly?: boolean;
  sexFilter?: 'Male' | 'Female';
  questions: IntakeQuestion[];
}

export type QuestionType =
  | 'radio'
  | 'multiselect'
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'textarea'
  | 'info';

export interface IntakeOption {
  value: string | number | boolean;
  label: string;
  /** Delta contribution: negative = younger, positive = older */
  risk?: number;
  /** Alias for risk (legacy) */
  score?: number;
  /** If true, selecting this option triggers the red-flag screen */
  redFlag?: boolean;
  /** Same as redFlag (reference file uses isFlag) */
  isFlag?: boolean;
}

export interface IntakeQuestion {
  id: string;
  label: string;
  helpText?: string;
  type: QuestionType;
  required?: boolean;
  placeholder?: string;
  /** Options for radio / multiselect / select */
  options?: IntakeOption[];
  /** Per-option risk map for multiselect questions (key = option label) */
  riskMap?: Record<string, number>;
  /** Option labels that trigger a red flag when selected in a multiselect */
  redFlagOptions?: string[];
  min?: number;
  max?: number;
  unit?: string;
  /** Only show for this biological sex */
  sexFilter?: 'Male' | 'Female';
  /** Entered by nurse/provider, not patient */
  nurseField?: boolean;
  /** This question is part of the safety-screening red-flag section */
  isRedFlag?: boolean;
  supplementOnly?: boolean;
}
