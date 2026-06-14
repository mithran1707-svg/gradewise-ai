// Core domain types for GradeWise AI

export type SubjectType =
  | "THEORY"
  | "PRACTICAL"
  | "T1P1"
  | "T1P2"
  | "T2P1"
  | "T3P1"
  | "T2P2"
  | "T3P2";

export const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  THEORY: "Theory Course",
  PRACTICAL: "Practical Course",
  T1P1: "T-1 P-1",
  T1P2: "T-1 P-2",
  T2P1: "T-2 P-1",
  T3P1: "T-3 P-1",
  T2P2: "T-2 P-2",
  T3P2: "T-3 P-2",
};

export const SUBJECT_TYPE_ICONS: Record<SubjectType, string> = {
  THEORY: "📘",
  PRACTICAL: "🧪",
  T1P1: "📚",
  T1P2: "📚",
  T2P1: "📚",
  T3P1: "📚",
  T2P2: "📚",
  T3P2: "📚",
};

// Credit split per subject type: [theoryCredit, practicalCredit]
export const CREDIT_SPLITS: Record<SubjectType, { theory: number; practical: number }> = {
  THEORY: { theory: 0, practical: 0 }, // determined by user input (single "credits" field)
  PRACTICAL: { theory: 0, practical: 0 },
  T1P1: { theory: 1, practical: 1 },
  T1P2: { theory: 1, practical: 2 },
  T2P1: { theory: 2, practical: 1 },
  T3P1: { theory: 3, practical: 1 },
  T2P2: { theory: 2, practical: 2 },
  T3P2: { theory: 3, practical: 2 },
};

export type GradeLetter = "S" | "A+" | "A" | "B+" | "B" | "C+" | "C" | "U" | "SA" | "WC";

export interface GradeBand {
  letter: GradeLetter;
  point: number;
  min: number; // inclusive lower bound of percentage range
  max: number; // inclusive upper bound
}

export const GRADE_SCALE: GradeBand[] = [
  { letter: "S", point: 10, min: 91, max: 100 },
  { letter: "A+", point: 9, min: 81, max: 90 },
  { letter: "A", point: 8, min: 71, max: 80 },
  { letter: "B+", point: 7, min: 66, max: 70 },
  { letter: "B", point: 6.5, min: 61, max: 65 },
  { letter: "C+", point: 6, min: 56, max: 60 },
  { letter: "C", point: 5, min: 50, max: 55 },
  { letter: "U", point: 0, min: 0, max: 49 },
];

// Theory-cum-practical weightage tables
export interface TCPWeightage {
  cia: number;
  sa: number;
  iapr: number;
  ml: number;
  endSemTheory: number;
  endSemPractical: number;
}

export const TCP_WEIGHTAGES: Record<string, TCPWeightage> = {
  T1P1: { cia: 0.2, sa: 0.05, iapr: 0.2, ml: 0.05, endSemTheory: 0.5, endSemPractical: 0 },
  T1P2: { cia: 0.1, sa: 0.05, iapr: 0.3, ml: 0.05, endSemTheory: 0, endSemPractical: 0.5 },
  T2P1: { cia: 0.3, sa: 0.05, iapr: 0.1, ml: 0.05, endSemTheory: 0.5, endSemPractical: 0 },
  T3P1: { cia: 0.3, sa: 0.05, iapr: 0.1, ml: 0.05, endSemTheory: 0.5, endSemPractical: 0 },
  T2P2: { cia: 0.2, sa: 0.05, iapr: 0.2, ml: 0.05, endSemTheory: 0.4, endSemPractical: 0.1 },
  T3P2: { cia: 0.3, sa: 0.05, iapr: 0.1, ml: 0.05, endSemTheory: 0.4, endSemPractical: 0.1 },
};

export interface SubjectMarks {
  // Theory
  cia1?: number;
  cia2?: number;
  sa1?: number;
  sa2?: number;
  // Practical
  iapr?: number[]; // dynamic list
  activity?: number;
  // Theory-cum-practical
  ml?: number;
  // End semester (actual or predicted)
  endSemester?: number;
}

export interface Subject {
  id: string;
  name: string;
  type: SubjectType;
  marks: SubjectMarks;
  // Credits
  credits: number; // total credits
  theoryCredits: number;
  practicalCredits: number;
  createdAt: number;
  updatedAt: number;
}

export interface SemesterRecord {
  id: string;
  label: string; // e.g. "Semester 3"
  gpa: number;
  totalCredits: number;
  createdAt: number;
}

export interface StudentProfile {
  uid: string;
  fullName: string;
  registerNumber: string;
  email: string;
  memberSince: number;
  lastLogin: number;
  isGuest: boolean;
}

export interface AppData {
  profile: StudentProfile | null;
  subjects: Subject[];
  semesterHistory: SemesterRecord[];
}

// ---------- Calculation result types ----------

export interface InternalCalcResult {
  internalScore: number; // out of internalMax (40 or 60)
  internalMax: number;
}

export interface FinalResult {
  internal: number;
  internalMax: number;
  endSemesterConverted: number;
  endSemesterMax: number;
  finalMark: number; // out of 100
  grade: GradeLetter;
  gradePoint: number;
  passEndSem: boolean;
  passTotal: boolean;
  passed: boolean;
}

export interface GradeRequirement {
  letter: GradeLetter;
  point: number;
  requiredEndSemMark: number | null; // null if unattainable (>100) or already met
  alreadyAchieved: boolean;
  unattainable: boolean;
}
