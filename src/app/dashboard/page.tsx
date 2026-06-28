"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import GradeRing from "@/components/GradeRing";
import { GlassCard, Badge, Button } from "@/components/ui";
import { useSession } from "@/lib/useSession";
import { calculateCGPA, calculateGPA, computeFinal } from "@/lib/calculations";
import { SUBJECT_TYPE_LABELS } from "@/lib/types";
import { useState, useEffect } from "react";
import { saveGuestVisitor } from "@/lib/storage";

const DEFAULT_PREDICTED_END_SEM = 75;

export default function DashboardPage() {
  const { session, data, updateProfile } = useSession();
  const [showGuestNameModal, setShowGuestNameModal] = useState(false);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    if (session?.isGuest && data?.profile?.fullName === "Guest Student") {
      setShowGuestNameModal(true);
    }
  }, [session, data]);

  if (!session || !data) {
    return (
      <AppShell>
        <div className="h-40 shimmer rounded-xl2" />
      </AppShell>
    );
  }

  const { profile, subjects, semesterHistory } = data;

  const gpaEntries = subjects.map((s) => {
    const result = computeFinal(s, {
      endSemTheory: s.marks.endSemester ?? DEFAULT_PREDICTED_END_SEM,
    });
    return { credits: s.credits, gradePoint: result.gradePoint, result };
  });

  const currentGPA = calculateGPA(gpaEntries);
  const creditsEarned = semesterHistory.reduce((sum, s) => sum + s.totalCredits, 0);
  const totalCreditsThisSem = subjects.reduce((a, b) => a + b.credits, 0);
  const predictedCGPA = calculateCGPA([
    ...semesterHistory.map((s) => ({ credits: s.totalCredits, gpa: s.gpa })),
    ...(totalCreditsThisSem > 0 ? [{ credits: totalCreditsThisSem, gpa: currentGPA }] : []),
  ]);
  const recent = [...subjects].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 4);

  return (
    <AppShell title="Dashboard">
      <div className="animate-fade-up">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep dark:text-gold">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl mt-1">
          Welcome back, {profile?.fullName?.split(" ")[0] || "Student"}
        </h1>
        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-muted">
          <span>
            Reg No:{" "}
            <span className="font-mono-num text-ink dark:text-paper">{profile?.registerNumber}</span>
          </span>
          <span>
            Member since{" "}
            <span className="text-ink dark:text-paper">
              {profile ? new Date(profile.memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"}
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <GlassCard className="animate-fade-up [animation-delay:60ms] flex items-center justify-center">
          <GradeRing value={currentGPA} max={10} label="Current GPA" sublabel={`${subjects.length} subjects`} accent="gold" />
        </GlassCard>
        <GlassCard className="animate-fade-up [animation-delay:120ms] flex items-center justify-center">
          <GradeRing value={predictedCGPA} max={10} label="Predicted CGPA" sublabel={`${semesterHistory.length + 1} semesters`} accent="teal" />
        </GlassCard>
        <GlassCard className="animate-fade-up [animation-delay:180ms] flex items-center justify-center">
          <GradeRing
            value={creditsEarned + totalCreditsThisSem}
            max={Math.max(creditsEarned + totalCreditsThisSem, 160)}
            label="Credits earned"
            sublabel="toward your degree"
            accent="gold"
            formatValue={(v) => v.toFixed(0)}
          />
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <GlassCard className="lg:col-span-2 animate-fade-up [animation-delay:240ms]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-medium">Recent activity</h2>
            <Link href="/subjects" className="text-sm text-gold-deep dark:text-gold font-medium underline underline-offset-4">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-muted text-sm mb-4">No subjects yet. Add your first subject to get started.</p>
              <Link href="/subjects/add">
                <Button>+ Add subject</Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((s) => {
                const result = computeFinal(s, { endSemTheory: s.marks.endSemester ?? DEFAULT_PREDICTED_END_SEM });
                return (
                  <li key={s.id}>
                    <Link
                      href={`/subjects/${s.id}`}
                      className="flex items-center justify-between rounded-xl border border-ink/5 dark:border-paper/10 px-4 py-3 hover:bg-ink/5 dark:hover:bg-paper/5 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-sm">{s.name}</p>
                        <p className="text-xs text-slate-muted">{SUBJECT_TYPE_LABELS[s.type]} · {s.credits} credits</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-num text-sm">{result.finalMark.toFixed(1)}</span>
                        <Badge tone={result.grade === "U" ? "crimson" : "gold"}>{result.grade}</Badge>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="animate-fade-up [animation-delay:300ms]">
          <h2 className="font-display text-lg font-medium mb-4">Quick actions</h2>
          <div className="flex flex-col gap-2">
            <Link href="/subjects/add">
              <Button className="w-full justify-start">+ Add a subject</Button>
            </Link>
            <Link href="/semester">
              <Button variant="secondary" className="w-full justify-start">
                View semester dashboard
              </Button>
            </Link>
            <Link href="/subjects">
              <Button variant="secondary" className="w-full justify-start">
                All subjects &amp; predictors
              </Button>
            </Link>
          </div>
        </GlassCard>
      </div>
      {/* Guest name modal */}
      {showGuestNameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 dark:bg-ink/60 backdrop-blur-sm px-4">
          <div className="glass rounded-xl2 shadow-glass p-6 w-full max-w-sm animate-fade-up">
            <h2 className="font-display text-xl font-medium mb-1">Welcome, Guest! 👋</h2>
            <p className="text-sm text-slate-muted mb-4">Please enter your name to continue.</p>
            <input
              autoFocus
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && guestName.trim()) {
                  saveGuestVisitor(guestName.trim());
                  updateProfile({ fullName: guestName.trim() });
                  setShowGuestNameModal(false);
                }
              }}
              placeholder="Your name"
              className="w-full rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold mb-4"
            />
            <button
              disabled={!guestName.trim()}
              onClick={() => {
                saveGuestVisitor(guestName.trim());
                updateProfile({ fullName: guestName.trim() });
                setShowGuestNameModal(false);
              }}
              className="w-full rounded-xl bg-ink text-paper dark:bg-gold dark:text-ink px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              Continue →
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
