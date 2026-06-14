"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { GlassCard, Badge, Button, Input } from "@/components/ui";
import { useSession } from "@/lib/useSession";
import { useAutoSave, SaveIndicator } from "@/lib/useAutoSave";
import { computeFinal, gradeRequirements, gradeColor } from "@/lib/calculations";
import { SUBJECT_TYPE_LABELS, SUBJECT_TYPE_ICONS, Subject, SubjectMarks } from "@/lib/types";

export default function SubjectDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { session, data, updateSubjects } = useSession();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [predictedEndSem, setPredictedEndSem] = useState(75);

  useEffect(() => {
    if (!data) return;
    const s = data.subjects.find((x) => x.id === params.id);
    if (!s) {
      router.replace("/subjects");
      return;
    }
    setSubject(s);
    setPredictedEndSem(s.marks.endSemester ?? 75);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const status = useAutoSave(subject, (s) => {
    if (!s) return;
    updateSubjects((subs) => subs.map((x) => (x.id === s.id ? { ...s, updatedAt: Date.now() } : x)));
  });

  // ✅ FIXED: Hook moved before the early return so it's always called
  useEffectSyncPredicted(subject, predictedEndSem, setSubject);

  if (!session || !data || !subject) {
    return (
      <AppShell>
        <div className="h-40 shimmer rounded-xl2" />
      </AppShell>
    );
  }

  const setMark = (key: keyof SubjectMarks, value: number) =>
    setSubject((s) => (s ? { ...s, marks: { ...s.marks, [key]: value } } : s));

  const setIapr = (index: number, value: number) =>
    setSubject((s) => {
      if (!s) return s;
      const arr = [...(s.marks.iapr ?? [])];
      arr[index] = value;
      return { ...s, marks: { ...s.marks, iapr: arr } };
    });

  const result = computeFinal(subject, { endSemTheory: predictedEndSem, endSemPractical: predictedEndSem });
  const requirements = gradeRequirements(subject, predictedEndSem);
  const isTCP = subject.type !== "THEORY" && subject.type !== "PRACTICAL";

  return (
    <AppShell title={subject.name}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-slate-muted">{SUBJECT_TYPE_ICONS[subject.type]} {SUBJECT_TYPE_LABELS[subject.type]}</p>
          <h1 className="font-display text-2xl mt-0.5">{subject.name}</h1>
        </div>
        <SaveIndicator status={status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-lg font-medium mb-4">Marks</h2>
          <div className="space-y-4">
            {(subject.type === "THEORY" || isTCP) && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="CIA I" type="number" min={0} max={100} value={subject.marks.cia1 ?? ""} onChange={(e) => setMark("cia1", Number(e.target.value))} />
                <Input label="CIA II" type="number" min={0} max={100} value={subject.marks.cia2 ?? ""} onChange={(e) => setMark("cia2", Number(e.target.value))} />
                <Input label="SA 1" type="number" min={0} max={100} value={subject.marks.sa1 ?? ""} onChange={(e) => setMark("sa1", Number(e.target.value))} />
                <Input label="SA 2" type="number" min={0} max={100} value={subject.marks.sa2 ?? ""} onChange={(e) => setMark("sa2", Number(e.target.value))} />
              </div>
            )}

            {(subject.type === "PRACTICAL" || isTCP) && (subject.marks.iapr?.length ?? 0) > 0 && (
              <div className="border-t pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {subject.marks.iapr!.map((v, i) => (
                  <Input key={i} label={`IAPR ${i + 1}`} type="number" min={0} max={100} value={v ?? ""} onChange={(e) => setIapr(i, Number(e.target.value))} />
                ))}
              </div>
            )}

            {subject.type === "PRACTICAL" && (
              <div className="border-t pt-4">
                <Input label="Activity marks" type="number" min={0} max={100} value={subject.marks.activity ?? ""} onChange={(e) => setMark("activity", Number(e.target.value))} className="max-w-xs" />
              </div>
            )}

            {isTCP && (
              <div className="border-t pt-4">
                <Input label="ML marks" type="number" min={0} max={100} value={subject.marks.ml ?? ""} onChange={(e) => setMark("ml", Number(e.target.value))} className="max-w-xs" />
              </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t">
            <h3 className="font-display text-base font-medium mb-3">Grade predictor</h3>
            <Input
              label="Expected end-semester mark (%)"
              type="number"
              min={0}
              max={100}
              value={predictedEndSem}
              onChange={(e) => setPredictedEndSem(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              className="max-w-xs"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
            <Stat label="Internal" value={`${result.internal.toFixed(1)} / ${result.internalMax}`} />
            <Stat label="End sem (conv.)" value={`${result.endSemConverted.toFixed(1)} / ${result.endSemMax}`} />
            <Stat label="Final mark" value={result.finalMark.toFixed(1)} />
            <Stat label="Grade" value={`${result.grade}`} color={gradeColor(result.grade)} valueClass="text-2xl" />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge tone={result.passEndSem ? "teal" : "crimson"}>End sem {result.passEndSem ? "≥ 45%" : "< 45%"}</Badge>
            <Badge tone={result.passTotal ? "teal" : "crimson"}>Total {result.passTotal ? "≥ 50%" : "< 50%"}</Badge>
            <Badge tone={result.passed ? "teal" : "crimson"}>{result.passed ? "Pass" : "At risk"}</Badge>
            <Badge tone="gold">{result.gradePoint.toFixed(1)} GP</Badge>
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
        </GlassCard>

        <GlassCard>
          <h3 className="font-display text-base font-medium mb-4">Credits</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-slate-muted">Theory</span><span className="font-mono-num">{subject.theoryCredits}</span></li>
            <li className="flex justify-between"><span className="text-slate-muted">Practical</span><span className="font-mono-num">{subject.practicalCredits}</span></li>
            <li className="flex justify-between pt-2 border-t font-medium"><span>Total</span><span className="font-mono-num">{subject.credits}</span></li>
          </ul>
          <div className="mt-5 pt-5 border-t">
            <Button variant="secondary" className="w-full" onClick={() => router.push("/subjects")}>
              ← Back to subjects
            </Button>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}

function useEffectSyncPredicted(subject: Subject | null, predicted: number, setSubject: (fn: (s: Subject | null) => Subject | null) => void) {
  useEffect(() => {
    if (!subject) return;
    if (subject.marks.endSemester !== predicted) {
      setSubject((s) => (s ? { ...s, marks: { ...s.marks, endSemester: predicted } } : s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [predicted]);
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
