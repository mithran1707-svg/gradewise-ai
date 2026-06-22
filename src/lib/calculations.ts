import {
  GRADE_SCALE,
  GradeLetter,
  GradeRequirement,
  Subject,
  SubjectMarks,
  TCP_WEIGHTAGES,
  CREDIT_SPLITS,
  SubjectType,
} from "./types";

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

const average = (values: (number | undefined)[]): number => {
  const nums = values.filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
};

/** Resolve grade band from a final percentage (0-100). */
export function getGrade(percentage: number): { letter: GradeLetter; point: number } {
  const pct = clamp(Math.round(percentage * 100) / 100, 0, 100);
  // GRADE_SCALE is sorted highest to lowest; find first band where pct >= min
  const band = GRADE_SCALE.find((b) => pct >= b.min);
  return band ? { letter: band.letter, point: band.point } : { letter: "U", point: 0 };
}

/** Determine theory/practical/total credit split for a subject type + raw credit input(s). */
export function resolveCredits(
  type: SubjectType,
  rawCredits: { total?: number; theory?: number; practical?: number }
): { theory: number; practical: number; total: number } {
  if (type === "THEORY" || type === "PRACTICAL") {
    const total = rawCredits.total ?? 0;
    return type === "THEORY"
      ? { theory: total, practical: 0, total }
      : { theory: 0, practical: total, total };
  }
  const split = CREDIT_SPLITS[type];
  return { theory: split.theory, practical: split.practical, total: split.theory + split.practical };
}

/**
 * Internal score for a pure THEORY course, expressed as a percentage (0-100)
 * = CIA1*35% + CIA2*35% + (avg SA)*30%
 */
export function theoryInternalPercent(marks: SubjectMarks): number {
  const cia1 = marks.cia1 ?? 0;
  const cia2 = marks.cia2 ?? 0;
  const saAvg = average([marks.sa1, marks.sa2]);
  return cia1 * 0.35 + cia2 * 0.35 + saAvg * 0.3;
}

/**
 * Internal score for a pure PRACTICAL course, expressed as a percentage (0-100)
 * = (avg IAPR)*75% + Activity*25%
 */
export function practicalInternalPercent(marks: SubjectMarks): number {
  const iaprAvg = average(marks.iapr ?? []);
  const activity = marks.activity ?? 0;
  return iaprAvg * 0.75 + activity * 0.25;
}

export interface FinalCalcInput {
  /** Predicted/actual end semester theory mark, percentage 0-100 */
  endSemTheory?: number;
  /** Predicted/actual end semester practical mark, percentage 0-100 (TCP with practical end sem) */
  endSemPractical?: number;
}

export interface FinalCalcOutput {
  internal: number; // marks out of internalMax
  internalMax: number;
  internalPercent: number; // internal as % of internalMax
  endSemConverted: number; // marks out of endSemMax
  endSemMax: number;
  finalMark: number; // out of 100
  grade: GradeLetter;
  gradePoint: number;
  passEndSem: boolean;
  passTotal: boolean;
  passed: boolean;
  /** Fixed (already-locked-in) portion of the final mark, independent of end-sem input */
  fixedComponent: number;
  /** Combined weight (0-1) applied to end-semester mark(s) to produce finalMark */
  endSemWeight: number;
}

/**
 * Compute the full result for a subject given its type, marks, and an
 * (actual or hypothetical) end-semester mark.
 */
export function computeFinal(subject: Pick<Subject, "type" | "marks">, input: FinalCalcInput): FinalCalcOutput {
  const { type, marks } = subject;
  const endTheory = clamp(input.endSemTheory ?? 0, 0, 100);
  const endPractical = clamp(input.endSemPractical ?? endTheory, 0, 100);

  if (type === "THEORY") {
    const internalPercent = theoryInternalPercent(marks);
    const internalMax = 40;
    const endSemMax = 60;
    const internal = (internalPercent / 100) * internalMax;
    const endSemConverted = (endTheory / 100) * endSemMax;
    const finalMark = internal + endSemConverted;
    const { letter, point } = getGrade(finalMark);
    const passEndSem = endTheory >= 45;
    const passTotal = finalMark >= 50;
    return {
      internal,
      internalMax,
      internalPercent,
      endSemConverted,
      endSemMax,
      finalMark,
      grade: letter,
      gradePoint: point,
      passEndSem,
      passTotal,
      passed: passEndSem && passTotal,
      fixedComponent: internal,
      endSemWeight: endSemMax / 100,
    };
  }

  if (type === "PRACTICAL") {
    const internalPercent = practicalInternalPercent(marks);
    const internalMax = 60;
    const endSemMax = 40;
    const internal = (internalPercent / 100) * internalMax;
    const endSemConverted = (endTheory / 100) * endSemMax;
    const finalMark = internal + endSemConverted;
    const { letter, point } = getGrade(finalMark);
    const passEndSem = endTheory >= 45;
    const passTotal = finalMark >= 50;
    return {
      internal,
      internalMax,
      internalPercent,
      endSemConverted,
      endSemMax,
      finalMark,
      grade: letter,
      gradePoint: point,
      passEndSem,
      passTotal,
      passed: passEndSem && passTotal,
      fixedComponent: internal,
      endSemWeight: endSemMax / 100,
    };
  }

  // Theory-cum-practical types
  const w = TCP_WEIGHTAGES[type];
  const ciaAvg = average([marks.cia1, marks.cia2]);
  const saAvg = average([marks.sa1, marks.sa2]);
  const iaprAvg = average(marks.iapr ?? []);
  const ml = marks.ml ?? 0;

  const internalContribution =
    ciaAvg * w.cia + saAvg * w.sa + iaprAvg * w.iapr + ml * w.ml;
  const internalWeight = w.cia + w.sa + w.iapr + w.ml;
  const endSemWeight = w.endSemTheory + w.endSemPractical;

  const endSemContribution = endTheory * w.endSemTheory + endPractical * w.endSemPractical;

  const finalMark = internalContribution + endSemContribution;
  const { letter, point } = getGrade(finalMark);

  // For TCP, "internal" is reported as marks out of 100 * internalWeight (its share of the 100-mark total)
  const internalMax = internalWeight * 100;
  const internal = internalContribution;
  const endSemMax = endSemWeight * 100;
  const endSemConverted = endSemContribution;

  // Pass condition: weighted end-sem average >= 45, total >= 50
  const endSemAvgPercent = endSemWeight > 0 ? endSemContribution / endSemWeight : 0;
  const passEndSem = endSemAvgPercent >= 45;
  const passTotal = finalMark >= 50;

  return {
    internal,
    internalMax,
    internalPercent: internalMax > 0 ? (internal / internalMax) * 100 : 0,
    endSemConverted,
    endSemMax,
    finalMark,
    grade: letter,
    gradePoint: point,
    passEndSem,
    passTotal,
    passed: passEndSem && passTotal,
    fixedComponent: internalContribution,
    endSemWeight,
  };
}

/**
 * For each grade band above U, compute the end-semester mark (0-100, on the
 * theory/primary end-sem scale) required to achieve that grade, holding the
 * internal score fixed.
 */
export function gradeRequirements(subject: Pick<Subject, "type" | "marks">, currentEndSem = 0): GradeRequirement[] {
  const current = computeFinal(subject, { endSemTheory: currentEndSem, endSemPractical: currentEndSem });
  const fixed = current.fixedComponent;
  const weight = current.endSemWeight;

  return GRADE_SCALE.filter((b) => b.letter !== "U").map((band) => {
    const alreadyAchieved = current.finalMark >= band.min;
    if (alreadyAchieved || weight <= 0) {
      return {
        letter: band.letter,
        point: band.point,
        requiredEndSemMark: alreadyAchieved ? 0 : null,
        alreadyAchieved,
        unattainable: !alreadyAchieved && weight <= 0,
      };
    }
    const required = (band.min - fixed) / weight;
    const unattainable = required > 100;
    return {
      letter: band.letter,
      point: band.point,
      requiredEndSemMark: unattainable ? null : Math.max(0, Math.ceil(required * 100) / 100),
      alreadyAchieved: false,
      unattainable,
    };
  });
}

/** GPA = Σ(Credit × GradePoint) / Σ(Credits) for a set of subjects + their final results */
export function calculateGPA(entries: { credits: number; gradePoint: number }[]): number {
  const totalCredits = entries.reduce((sum, e) => sum + e.credits, 0);
  if (totalCredits === 0) return 0;
  const weighted = entries.reduce((sum, e) => sum + e.credits * e.gradePoint, 0);
  return weighted / totalCredits;
}

/** CGPA = Σ(All Semester Credit × GradePoint) / Σ(All Credits) across semesters + current */
export function calculateCGPA(semesters: { credits: number; gpa: number }[]): number {
  const totalCredits = semesters.reduce((sum, s) => sum + s.credits, 0);
  if (totalCredits === 0) return 0;
  const weighted = semesters.reduce((sum, s) => sum + s.credits * s.gpa, 0);
  return weighted / totalCredits;
}

export function gradeColor(letter: GradeLetter): string {
  switch (letter) {
    case "S":
      return "#3FA796";
    case "A+":
      return "#4CB8A4";
    case "A":
      return "#7FC6A4";
    case "B+":
      return "#D4A24E";
    case "B":
      return "#E0B868";
    case "C+":
      return "#E8C68A";
    case "C":
      return "#EAB08A";
    default:
      return "#C1554D";
  }
}
