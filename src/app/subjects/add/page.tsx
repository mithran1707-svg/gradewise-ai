"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import { GlassCard, Button, Input, Badge } from "@/components/ui";
import { useSession } from "@/lib/useSession";
import {
  SUBJECT_TYPE_LABELS,
  SUBJECT_TYPE_ICONS,
  SubjectType,
  SubjectMarks,
  Subject,
} from "@/lib/types";
import { computeFinal, gradeRequirements, resolveCredits, gradeColor } from "@/lib/calculations";
import { newSubjectId, upsertSubject } from "@/lib/storage";

const TYPE_ORDER: SubjectType[] = ["THEORY", "PRACTICAL", "T1P1", "T1P2", "T2P1", "T3P1", "T2P2", "T3P2"];

const TYPE_DESCRIPTIONS: Record<SubjectType, string> = {
  THEORY: "CIA I & II, SA, end semester exam.",
  PRACTICAL: "IAPR assessments + activity marks.",
  T1P1: "1 theory credit + 1 practical credit.",
  T1P2: "1 theory credit + 2 practical credits.",
  T2P1: "2 theory credits + 1 practical credit.",
  T3P1: "3 theory credits + 1 practical credit.",
  T2P2: "2 theory credits + 2 practical credits.",
  T3P2: "3 theory credits + 2 practical credits.",
};

export default function AddSubjectPage() {
  const router = useRouter();
  const { session, updateSubjects } = useSession();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [type, setType] = useState<SubjectType | null>(null);
  const [marks, setMarks] = useState<SubjectMarks>({});
  const [credits, setCredits] = useState<number>(3);
  const [iaprCount, setIaprCount] = useState<number>(1);
  const [predictedEndSem, setPredictedEndSem] = useState<number>(75);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const creditSplit = useMemo(
    () => (type ? resolveCredits(type, { total: credits }) : { theory: 0, practical: 0, total: 0 }),
    [type, credits]
  );

  const result = useMemo(() => {
    if (!type) return null;
    const r = computeFinal({ type, marks }, { endSemTheory: predictedEndSem, endSemPractical: predictedEndSem });
    // Round to avoid floating point display issues like 49.9999999
    r.internal = Math.round(r.internal * 100) / 100;
    r.finalMark = Math.round(r.finalMark * 100) / 100;
    r.endSemConverted = Math.round(r.endSemConverted * 100) / 100;
    return r;
  }, [type, marks, predictedEndSem]);

  const requirements = useMemo(() => {
    if (!type) return [];
    return gradeRequirements({ type, marks }, predictedEndSem);
  }, [type, marks, predictedEndSem]);

  const setMark = (key: keyof SubjectMarks, value: number) => setMarks((m) => ({ ...m, [key]: value }));

  const setIapr = (index: number, value: number) =>
    setMarks((m) => {
      const arr = [...(m.iapr ?? [])];
      arr[index] = value;
      return { ...m, iapr: arr };
    });

  const isTCP = type && type !== "THEORY" && type !== "PRACTICAL";

  // Validate marks before going to step 4
  const validateMarks = (): string | null => {
    if (!type) return null;

    if (type === "THEORY" || isTCP) {
      if (marks.cia1 === undefined || marks.cia1 === null || isNaN(marks.cia1)) return "Please fill in CIA I.";
      if (marks.cia2 === undefined || marks.cia2 === null || isNaN(marks.cia2)) return "Please fill in CIA II.";
      if (marks.sa1 === undefined || marks.sa1 === null || isNaN(marks.sa1)) return "Please fill in SA 1.";
      if (marks.sa2 === undefined || marks.sa2 === null || isNaN(marks.sa2)) return "Please fill in SA 2.";
    }

    if (type === "PRACTICAL" || isTCP) {
      const iapr = marks.iapr ?? [];
      for (let i = 0; i < iaprCount; i++) {
        if (iapr[i] === undefined || iapr[i] === null || isNaN(iapr[i])) {
          return `Please fill in IAPR ${i + 1}.`;
        }
      }
    }

    if (type === "PRACTICAL") {
      if (marks.activity === undefined || marks.activity === null || isNaN(marks.activity)) return "Please fill in Activity marks.";
    }

    if (isTCP) {
      if (marks.ml === undefined || marks.ml === null || isNaN(marks.ml)) return "Please fill in ML marks.";
    }

    return null;
  };

  const handleProceedToResult = () => {
    const error = validateMarks();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setStep(4);
  };

  const handleSave = () => {
    if (!session || !type) return;
    const split = resolveCredits(type, { total: credits });
    const subject: Subject = {
      id: newSubjectId(),
      name: name.trim() || "Untitled subject",
      type,
      marks,
      credits: split.total,
      theoryCredits: split.theory,
      practicalCredits: split.practical,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateSubjects((subs) => [...subs, subject]);
    setSaved(true);
    setTimeout(() => router.push(`/subjects/${subject.id}`), 700);
  };

  const steps = ["Subject", "Type", "Marks", "Result"];

  return (
    <AppShell title="Add subject">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold font-mono-num transition-colors ${
                step > i + 1
                  ? "bg-teal text-white"
                  : step === i + 1
                  ? "bg-gold text-ink"
                  : "bg-ink/5 dark:bg-paper/10 text-slate-muted"
              }`}
            >
              {step > i + 1 ? "✓" : i + 1}
            </div>
            <span className="text-xs text-slate-muted hidden sm:inline">{label}</span>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-ink/10 dark:bg-paper/10" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <GlassCard className="max-w-lg">
              <h2 className="font-display text-xl font-medium mb-1">What&apos;s the subject called?</h2>
              <p className="text-sm text-slate-muted mb-5">e.g. Physics, Python Programming, Machine Learning</p>
              <Input
                label="Subject name"
                placeholder="e.g. Machine Learning"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <Button className="mt-6 w-full" disabled={!name.trim()} onClick={() => setStep(2)}>
                Continue
              </Button>
            </GlassCard>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
            <h2 className="font-display text-xl font-medium mb-1">Select the subject type</h2>
            <p className="text-sm text-slate-muted mb-5">This decides which marks we ask for, and the credit split.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TYPE_ORDER.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setType(t);
                    setMarks({});
                    if (t === "THEORY" || t === "PRACTICAL") setCredits(3);
                    else setCredits(resolveCredits(t, {}).total);
                  }}
                  className={`text-left rounded-xl2 border p-4 transition-all duration-200 hover:-translate-y-0.5 ${
                    type === t
                      ? "border-gold bg-gold/10 shadow-glass"
                      : "border-ink/10 dark:border-paper/15 glass"
                  }`}
                >
                  <div className="text-2xl mb-2">{SUBJECT_TYPE_ICONS[t]}</div>
                  <p className="font-medium text-sm">{SUBJECT_TYPE_LABELS[t]}</p>
                  <p className="text-xs text-slate-muted mt-1">{TYPE_DESCRIPTIONS[t]}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!type} onClick={() => setStep(3)}>Continue</Button>
            </div>
          </motion.div>
        )}

        {step === 3 && type && (
          <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2">
              <h2 className="font-display text-xl font-medium mb-1">Enter marks for {name}</h2>
              <p className="text-sm text-slate-muted mb-5">All marks are out of 100. Fill all fields to continue.</p>

              <div className="space-y-4">
                {(type === "THEORY" || isTCP) && (
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="CIA I" type="number" min={0} max={100} placeholder="0–100" value={marks.cia1 ?? ""} onChange={(e) => setMark("cia1", Number(e.target.value))} />
                    <Input label="CIA II" type="number" min={0} max={100} placeholder="0–100" value={marks.cia2 ?? ""} onChange={(e) => setMark("cia2", Number(e.target.value))} />
                    <Input label="SA 1" type="number" min={0} max={100} placeholder="0–100" value={marks.sa1 ?? ""} onChange={(e) => setMark("sa1", Number(e.target.value))} />
                    <Input label="SA 2" type="number" min={0} max={100} placeholder="0–100" value={marks.sa2 ?? ""} onChange={(e) => setMark("sa2", Number(e.target.value))} />
                  </div>
                )}

                {(type === "PRACTICAL" || isTCP) && (
                  <div className="border-t pt-4">
                    <Input
                      label="Number of IAPR assessments (1–15)"
                      type="number"
                      min={1}
                      max={15}
                      value={iaprCount}
                      onChange={(e) => {
                        const n = Math.max(1, Math.min(15, Number(e.target.value) || 1));
                        setIaprCount(n);
                        setMarks((m) => ({ ...m, iapr: Array.from({ length: n }, (_, i) => m.iapr?.[i] ?? undefined as unknown as number) }));
                      }}
                      className="mb-4 max-w-xs"
                    />
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {Array.from({ length: iaprCount }).map((_, i) => (
                        <Input
                          key={i}
                          label={`IAPR ${i + 1}`}
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0–100"
                          value={marks.iapr?.[i] ?? ""}
                          onChange={(e) => setIapr(i, Number(e.target.value))}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {type === "PRACTICAL" && (
                  <div className="border-t pt-4">
                    <Input label="Activity marks" type="number" min={0} max={100} placeholder="0–100" value={marks.activity ?? ""} onChange={(e) => setMark("activity", Number(e.target.value))} className="max-w-xs" />
                  </div>
                )}

                {isTCP && (
                  <div className="border-t pt-4">
                    <Input label="ML marks" type="number" min={0} max={100} placeholder="0–100" value={marks.ml ?? ""} onChange={(e) => setMark("ml", Number(e.target.value))} className="max-w-xs" />
                  </div>
                )}

                {(type === "THEORY" || type === "PRACTICAL") && (
                  <div className="border-t pt-4">
                    <Input label="Credits" type="number" min={1} max={6} value={credits} onChange={(e) => setCredits(Number(e.target.value) || 0)} className="max-w-xs" />
                  </div>
                )}
              </div>

              {validationError && (
                <p className="mt-4 text-sm text-crimson bg-crimson/10 rounded-lg px-3 py-2">
                  ⚠️ {validationError}
                </p>
              )}

              <div className="flex gap-2 mt-6">
                <Button variant="secondary" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleProceedToResult}>Predict result</Button>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-display text-base font-medium mb-3">Credit split</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-muted">Theory</span>
                  <span className="font-mono-num">{creditSplit.theory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">Practical</span>
                  <span className="font-mono-num">{creditSplit.practical}</span>
                </div>
                <div className="flex justify-between pt-2 border-t font-medium">
                  <span>Total credits</span>
                  <span className="font-mono-num">{creditSplit.total}</span>
                </div>
              </div>
              {result && (
                <div className="mt-5 pt-5 border-t">
                  <p className="text-xs uppercase tracking-wide text-slate-muted mb-2">Internal so far</p>
                  <p className="font-mono-num text-2xl font-semibold">
                    {result.internal.toFixed(2)} <span className="text-sm text-slate-muted">/ {result.internalMax}</span>
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}

        {step === 4 && type && result && (
          <motion.div key="s4" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} className="grid lg:grid-cols-3 gap-4">
            <GlassCard className="lg:col-span-2">
              <h2 className="font-display text-xl font-medium mb-1">Predicted result</h2>
              <p className="text-sm text-slate-muted mb-5">Adjust your expected end-semester mark to see how the grade changes.</p>

              <Input
                label="Expected end-semester mark (%)"
                type="number"
                min={0}
                max={100}
                value={predictedEndSem}
                onChange={(e) => setPredictedEndSem(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                className="max-w-xs mb-6"
              />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="Internal" value={`${result.internal.toFixed(2)} / ${result.internalMax}`} />
                <Stat label="End sem (conv.)" value={`${result.endSemConverted.toFixed(2)} / ${result.endSemMax}`} />
                <Stat label="Final mark" value={result.finalMark.toFixed(2)} />
                <Stat label="Grade" value={result.grade} valueClass="text-2xl" color={gradeColor(result.grade)} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2 items-center">
                <Badge tone={result.passEndSem ? "teal" : "crimson"}>End sem {result.passEndSem ? "≥ 45%" : "< 45% required"}</Badge>
                <Badge tone={result.passTotal ? "teal" : "crimson"}>Total {result.passTotal ? "≥ 50%" : "< 50% required"}</Badge>
                <Badge tone={result.passed ? "teal" : "crimson"}>{result.passed ? "Pass" : "At risk"}</Badge>
                <Badge tone="gold">{result.gradePoint.toFixed(1)} grade points</Badge>
              </div>

              <div className="mt-6 pt-5 border-t">
                <h3 className="font-display text-base font-medium mb-3">What you need for each grade</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {requirements.map((r) => (
                    <div key={r.letter} className="rounded-xl border border-ink/5 dark:border-paper/10 px-3 py-2.5">
                      <p className="text-xs text-slate-muted">Grade {r.letter}</p>
                      <p className="font-mono-num text-sm font-medium mt-0.5">
                        {r.alreadyAchieved ? "Achieved ✓" : r.unattainable ? "Not possible" : `Need ${r.requiredEndSemMark?.toFixed(1)}%`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button variant="secondary" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={handleSave} disabled={saved}>{saved ? "✓ Saved" : "Save subject"}</Button>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="font-display text-base font-medium mb-4">Summary</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between"><span className="text-slate-muted">Name</span><span className="font-medium">{name}</span></li>
                <li className="flex justify-between"><span className="text-slate-muted">Type</span><span className="font-medium">{SUBJECT_TYPE_LABELS[type]}</span></li>
                <li className="flex justify-between"><span className="text-slate-muted">Theory credit</span><span className="font-mono-num">{creditSplit.theory}</span></li>
                <li className="flex justify-between"><span className="text-slate-muted">Practical credit</span><span className="font-mono-num">{creditSplit.practical}</span></li>
                <li className="flex justify-between pt-2 border-t font-medium"><span>Total credit</span><span className="font-mono-num">{creditSplit.total}</span></li>
              </ul>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

function Stat({ label, value, valueClass, color }: { label: string; value: string; valueClass?: string; color?: string }) {
  return (
    <div className="rounded-xl border border-ink/5 dark:border-paper/10 px-3 py-3">
      <p className="text-xs text-slate-muted">{label}</p>
      <p className={`font-mono-num font-semibold mt-0.5 ${valueClass ?? "text-lg"}`} style={color ? { color } : undefined}>
        {value}
      </p>
    </div>
  );
}
