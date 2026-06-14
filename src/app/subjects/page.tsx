"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import { GlassCard, Badge, Button } from "@/components/ui";
import { useSession } from "@/lib/useSession";
import { computeFinal, gradeRequirements, gradeColor } from "@/lib/calculations";
import { SUBJECT_TYPE_LABELS, SUBJECT_TYPE_ICONS } from "@/lib/types";
import { deleteSubject } from "@/lib/storage";

const DEFAULT_PREDICTED_END_SEM = 75;

export default function SubjectsPage() {
  const { session, data, updateSubjects } = useSession();

  if (!session || !data) {
    return (
      <AppShell title="Subjects">
        <div className="h-40 shimmer rounded-xl2" />
      </AppShell>
    );
  }

  const { subjects } = data;

  return (
    <AppShell title="Subjects">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-2xl">Your subjects</h1>
        <Link href="/subjects/add">
          <Button>+ Add subject</Button>
        </Link>
      </div>

      {subjects.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-slate-muted mb-4">You haven&apos;t added any subjects yet.</p>
          <Link href="/subjects/add">
            <Button>Add your first subject</Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((s, i) => {
            const result = computeFinal(s, { endSemTheory: s.marks.endSemester ?? DEFAULT_PREDICTED_END_SEM });
            const reqs = gradeRequirements(s, s.marks.endSemester ?? DEFAULT_PREDICTED_END_SEM);
            const next = reqs.find((r) => !r.alreadyAchieved && !r.unattainable);
            return (
              <GlassCard key={s.id} className="animate-fade-up flex flex-col" style={{ animationDelay: `${i * 50}ms` } as React.CSSProperties}>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xl">{SUBJECT_TYPE_ICONS[s.type]}</span>
                    <h3 className="font-display text-lg font-medium mt-1">{s.name}</h3>
                    <p className="text-xs text-slate-muted">{SUBJECT_TYPE_LABELS[s.type]}</p>
                  </div>
                  <Badge tone={result.grade === "U" ? "crimson" : "gold"}>{result.grade}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-lg bg-ink/5 dark:bg-paper/5 py-2">
                    <p className="text-xs text-slate-muted">Theory</p>
                    <p className="font-mono-num font-medium">{s.theoryCredits}</p>
                  </div>
                  <div className="rounded-lg bg-ink/5 dark:bg-paper/5 py-2">
                    <p className="text-xs text-slate-muted">Practical</p>
                    <p className="font-mono-num font-medium">{s.practicalCredits}</p>
                  </div>
                  <div className="rounded-lg bg-ink/5 dark:bg-paper/5 py-2">
                    <p className="text-xs text-slate-muted">Total</p>
                    <p className="font-mono-num font-medium">{s.credits}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-muted">Internal marks</span>
                  <span className="font-mono-num font-medium">{result.internal.toFixed(1)} / {result.internalMax}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-muted">Predicted grade</span>
                  <span className="font-mono-num font-medium" style={{ color: gradeColor(result.grade) }}>
                    {result.grade} ({result.gradePoint})
                  </span>
                </div>
                {next && (
                  <div className="mt-1.5 flex items-center justify-between text-sm">
                    <span className="text-slate-muted">Next grade {next.letter}</span>
                    <span className="font-mono-num font-medium">+{next.requiredEndSemMark?.toFixed(0)}% end sem</span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Link href={`/subjects/${s.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full">
                      Open
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Remove ${s.name}?`)) {
                        deleteSubject(session.uid, s.id);
                        updateSubjects((subs) => subs.filter((x) => x.id !== s.id));
                      }
                    }}
                  >
                    🗑
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
