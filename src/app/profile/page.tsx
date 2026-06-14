"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { GlassCard, Badge, Button } from "@/components/ui";
import { useSession } from "@/lib/useSession";
import { calculateGPA, calculateCGPA, computeFinal } from "@/lib/calculations";
import { logout } from "@/lib/storage";
import Link from "next/link";

const DEFAULT_END_SEM = 75;

export default function ProfilePage() {
  const { session, data } = useSession();
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);

  if (!session || !data) {
    return (
      <AppShell title="Profile">
        <div className="space-y-4">
          <div className="h-28 shimmer rounded-xl2" />
          <div className="h-40 shimmer rounded-xl2" />
        </div>
      </AppShell>
    );
  }

  const { profile, subjects, semesterHistory } = data;

  const gpaEntries = subjects.map((s) => {
    const r = computeFinal(s, {
      endSemTheory: s.marks.endSemester ?? DEFAULT_END_SEM,
      endSemPractical: s.marks.endSemester ?? DEFAULT_END_SEM,
    });
    return { credits: s.credits, gradePoint: r.gradePoint };
  });

  const currentGPA = calculateGPA(gpaEntries);
  const totalCreditsThisSem = subjects.reduce((a, b) => a + b.credits, 0);
  const predictedCGPA = calculateCGPA([
    ...semesterHistory.map((s) => ({ credits: s.totalCredits, gpa: s.gpa })),
    ...(totalCreditsThisSem > 0 ? [{ credits: totalCreditsThisSem, gpa: currentGPA }] : []),
  ]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <AppShell title="Profile">
      {/* Guest banner */}
      {profile?.isGuest && (
        <div className="mb-5 rounded-xl2 border border-gold/40 bg-gold/10 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-up">
          <div>
            <p className="font-semibold text-sm">You&apos;re in guest mode</p>
            <p className="text-xs text-slate-muted mt-0.5">
              Create an account to save your academic progress across devices and never lose your data.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/signup">
              <Button className="text-xs px-4">Create account</Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="text-xs px-4">Log in</Button>
            </Link>
          </div>
        </div>
      )}

      {/* Profile card */}
      <GlassCard className="mb-4 animate-fade-up [animation-delay:60ms]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gold to-gold-deep flex items-center justify-center text-2xl font-display font-bold text-ink shrink-0">
              {profile?.fullName?.charAt(0).toUpperCase() || "G"}
            </div>
            <div>
              <h1 className="font-display text-xl font-medium">{profile?.fullName || "Guest"}</h1>
              <p className="text-sm text-slate-muted font-mono-num">{profile?.registerNumber || "—"}</p>
              <p className="text-xs text-slate-muted mt-0.5">{profile?.email || "No email — guest mode"}</p>
            </div>
          </div>
          <Badge tone={profile?.isGuest ? "neutral" : "teal"}>
            {profile?.isGuest ? "Guest" : "Student"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t">
          <Kpi label="GPA" value={currentGPA.toFixed(2)} sub="this semester" />
          <Kpi label="CGPA" value={predictedCGPA.toFixed(2)} sub="all semesters" />
          <Kpi label="Subjects" value={String(subjects.length)} sub="added" />
          <Kpi label="Member since" value={profile ? new Date(profile.memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"} sub="joined" />
        </div>
      </GlassCard>

      {/* Semester history */}
      <GlassCard className="mb-4 animate-fade-up [animation-delay:120ms]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium">Semester History</h2>
          <Link href="/semester">
            <Button variant="secondary" className="text-xs">Manage →</Button>
          </Link>
        </div>
        {semesterHistory.length === 0 ? (
          <p className="text-sm text-slate-muted">No locked semesters. Head to the Semester page to lock your current GPA.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[360px]">
              <thead>
                <tr className="text-left text-xs text-slate-muted uppercase tracking-wide border-b">
                  <th className="pb-2 pr-4 font-medium">Semester</th>
                  <th className="pb-2 pr-4 text-right font-medium">Credits</th>
                  <th className="pb-2 text-right font-medium">GPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5 dark:divide-paper/5">
                {semesterHistory.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 pr-4">{s.label}</td>
                    <td className="py-2.5 pr-4 text-right font-mono-num">{s.totalCredits}</td>
                    <td className="py-2.5 text-right">
                      <Badge tone="gold">{s.gpa.toFixed(2)}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t">
                <tr className="font-semibold">
                  <td className="pt-3 pr-4">CGPA</td>
                  <td className="pt-3 pr-4 text-right font-mono-num">
                    {semesterHistory.reduce((a, b) => a + b.totalCredits, 0)}
                  </td>
                  <td className="pt-3 text-right">
                    <Badge tone="teal">{predictedCGPA.toFixed(2)}</Badge>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Privacy note */}
      <GlassCard className="mb-4 animate-fade-up [animation-delay:180ms]">
        <h2 className="font-display text-base font-medium mb-2">🔒 Your data is private</h2>
        <p className="text-sm text-slate-muted leading-relaxed">
          Your CIA marks, SA marks, IAPR scores, ML marks, internal marks, GPA, CGPA, and grade predictions are visible
          only to you. Admins can only see your name, register number, and last login time — never your academic data.
        </p>
      </GlassCard>

      {/* Sign out */}
      <GlassCard className="animate-fade-up [animation-delay:220ms]">
        <h2 className="font-display text-base font-medium mb-3">Session</h2>
        {!showConfirm ? (
          <Button variant="danger" onClick={() => setShowConfirm(true)}>
            Sign out
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-sm text-slate-muted">Sign out of GradeWise AI?</p>
            <Button variant="danger" onClick={handleLogout}>
              Yes, sign out
            </Button>
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
          </div>
        )}
      </GlassCard>
    </AppShell>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <p className="text-xs text-slate-muted uppercase tracking-wide">{label}</p>
      <p className="font-mono-num text-xl font-bold mt-0.5">{value}</p>
      <p className="text-xs text-slate-muted">{sub}</p>
    </div>
  );
}
