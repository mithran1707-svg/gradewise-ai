"use client";

import { useState, useMemo } from "react";
import AppShell from "@/components/AppShell";
import { GlassCard, Badge, Button } from "@/components/ui";
import GradeRing from "@/components/GradeRing";
import { useSession } from "@/lib/useSession";
import {
  computeFinal,
  calculateGPA,
  calculateCGPA,
  gradeColor,
} from "@/lib/calculations";
import { GRADE_SCALE, SemesterRecord } from "@/lib/types";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { addSemesterRecord } from "@/lib/storage";
import { exportSemesterPDF } from "@/lib/pdfExport";

const DEFAULT_END_SEM = 75;

export default function SemesterPage() {
  const { session, data, setData } = useSession();
  const [semLabel, setSemLabel] = useState("Semester 1");
  const [locking, setLocking] = useState(false);

  const subjects = data?.subjects ?? [];
  const semesterHistory = data?.semesterHistory ?? [];

  const gpaEntries = useMemo(
    () =>
      subjects.map((s) => {
        const r = computeFinal(s, {
          endSemTheory: s.marks.endSemester ?? DEFAULT_END_SEM,
          endSemPractical: s.marks.endSemester ?? DEFAULT_END_SEM,
        });
        return { credits: s.credits, gradePoint: r.gradePoint, subject: s, result: r };
      }),
    [subjects]
  );

  const currentGPA = calculateGPA(gpaEntries);
  const totalCredits = gpaEntries.reduce((a, b) => a + b.credits, 0);
  const totalHistoryCredits = semesterHistory.reduce((a, b) => a + b.totalCredits, 0);

  const predictedCGPA = calculateCGPA([
    ...semesterHistory.map((s) => ({ credits: s.totalCredits, gpa: s.gpa })),
    ...(totalCredits > 0 ? [{ credits: totalCredits, gpa: currentGPA }] : []),
  ]);

  const passCount = gpaEntries.filter((e) => e.result.passed).length;
  const passPercent = gpaEntries.length > 0 ? (passCount / gpaEntries.length) * 100 : 0;

  // Grade distribution
  const gradeDistribution = GRADE_SCALE.map((band) => ({
    name: band.letter,
    count: gpaEntries.filter((e) => e.result.grade === band.letter).length,
    fill: gradeColor(band.letter),
  })).filter((d) => d.count > 0);

  // CGPA trend data
  const trendData = [
    ...semesterHistory.map((s, i) => ({ name: s.label || `Sem ${i + 1}`, gpa: +s.gpa.toFixed(2) })),
    { name: "Current", gpa: +currentGPA.toFixed(2) },
  ];

  // Radar data: internal % per subject
  const radarData = gpaEntries.slice(0, 6).map((e) => ({
    subject: e.subject.name.length > 12 ? e.subject.name.slice(0, 12) + "…" : e.subject.name,
    internal: +e.result.internalPercent.toFixed(1),
  }));

  const handleLockSemester = () => {
    if (!session || !data) return;
    setLocking(true);
    const record: SemesterRecord = {
      id: `sem_${Date.now()}`,
      label: semLabel,
      gpa: currentGPA,
      totalCredits,
      createdAt: Date.now(),
    };
    addSemesterRecord(session.uid, record);
    setData({ ...data, semesterHistory: [...data.semesterHistory, record] });
    setTimeout(() => setLocking(false), 800);
  };

  const handleExport = () => {
    if (!data) return;
    exportSemesterPDF(data, gpaEntries, currentGPA, predictedCGPA);
  };

  if (!session || !data) {
    return (
      <AppShell title="Semester">
        <div className="h-40 shimmer rounded-xl2" />
      </AppShell>
    );
  }

  return (
    <AppShell title="Semester Dashboard">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep dark:text-gold font-semibold">Semester Overview</p>
          <h1 className="font-display text-3xl mt-0.5">Academic Summary</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleExport}>
            ↓ Export PDF
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <GlassCard className="flex items-center justify-center animate-fade-up">
          <GradeRing value={currentGPA} max={10} label="GPA" sublabel="this semester" accent="gold" size={130} />
        </GlassCard>
        <GlassCard className="flex items-center justify-center animate-fade-up [animation-delay:60ms]">
          <GradeRing value={predictedCGPA} max={10} label="Predicted CGPA" sublabel="all semesters" accent="teal" size={130} />
        </GlassCard>
        <GlassCard className="animate-fade-up [animation-delay:120ms]">
          <p className="text-xs text-slate-muted uppercase tracking-wide mb-3">Credits</p>
          <p className="font-mono-num text-3xl font-bold">{totalCredits}</p>
          <p className="text-xs text-slate-muted mt-1">This semester</p>
          <div className="mt-3 pt-3 border-t">
            <p className="font-mono-num text-lg font-semibold">{totalHistoryCredits + totalCredits}</p>
            <p className="text-xs text-slate-muted">Total earned</p>
          </div>
        </GlassCard>
        <GlassCard className="animate-fade-up [animation-delay:180ms]">
          <p className="text-xs text-slate-muted uppercase tracking-wide mb-3">Pass rate</p>
          <p className="font-mono-num text-3xl font-bold">{passPercent.toFixed(0)}%</p>
          <p className="text-xs text-slate-muted mt-1">{passCount} of {gpaEntries.length} subjects</p>
          <div className="mt-3">
            <div className="h-1.5 rounded-full bg-ink/10 dark:bg-paper/10">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${passPercent}%`, background: passPercent >= 75 ? "#3FA796" : passPercent >= 50 ? "#D4A24E" : "#C1554D" }}
              />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* GPA trend */}
        <GlassCard className="lg:col-span-2 animate-fade-up [animation-delay:200ms]">
          <h2 className="font-display text-lg font-medium mb-4">GPA Trend</h2>
          {trendData.length < 2 ? (
            <div className="flex items-center justify-center h-40 text-slate-muted text-sm">
              Lock more semesters below to see your trend.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(140,140,140,0.15)" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8A93A6" }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: "#8A93A6" }} />
                <Tooltip
                  contentStyle={{ background: "rgba(18,27,46,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#FAF7F0", fontSize: 12 }}
                />
                <Bar dataKey="gpa" fill="#D4A24E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        {/* Grade distribution pie */}
        <GlassCard className="animate-fade-up [animation-delay:240ms]">
          <h2 className="font-display text-lg font-medium mb-4">Grade Distribution</h2>
          {gradeDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-slate-muted text-sm text-center">
              Add subjects with end-semester marks to see grade distribution.
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={gradeDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={36}>
                    {gradeDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "rgba(18,27,46,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#FAF7F0", fontSize: 12 }}
                    formatter={(val: number, name: string) => [`${val} subject${val !== 1 ? "s" : ""}`, `Grade ${name}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {gradeDistribution.map((d) => (
                  <span key={d.name} className="flex items-center gap-1 text-xs">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ background: d.fill }} />
                    {d.name} ({d.count})
                  </span>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </div>

      {/* Radar chart */}
      {radarData.length > 2 && (
        <GlassCard className="mb-4 animate-fade-up [animation-delay:280ms]">
          <h2 className="font-display text-lg font-medium mb-4">Internal Performance Radar</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(140,140,140,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#8A93A6" }} />
              <Radar name="Internal %" dataKey="internal" stroke="#D4A24E" fill="#D4A24E" fillOpacity={0.25} />
              <Tooltip
                contentStyle={{ background: "rgba(18,27,46,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#FAF7F0", fontSize: 12 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Subject table */}
      <GlassCard className="mb-4 animate-fade-up [animation-delay:320ms] overflow-x-auto">
        <h2 className="font-display text-lg font-medium mb-4">Subject Breakdown</h2>
        {gpaEntries.length === 0 ? (
          <p className="text-slate-muted text-sm text-center py-8">No subjects added yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[540px]">
            <thead>
              <tr className="text-left text-xs text-slate-muted uppercase tracking-wide border-b">
                <th className="pb-2 pr-4 font-medium">Subject</th>
                <th className="pb-2 pr-4 font-medium text-right">Internal</th>
                <th className="pb-2 pr-4 font-medium text-right">Final</th>
                <th className="pb-2 pr-4 font-medium text-right">Grade</th>
                <th className="pb-2 pr-4 font-medium text-right">GP</th>
                <th className="pb-2 pr-4 font-medium text-right">Credits</th>
                <th className="pb-2 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 dark:divide-paper/5">
              {gpaEntries.map(({ subject: s, result: r }) => (
                <tr key={s.id} className="group">
                  <td className="py-3 pr-4">
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-slate-muted">{s.type}</p>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono-num">
                    {r.internal.toFixed(1)}<span className="text-slate-muted">/{r.internalMax}</span>
                  </td>
                  <td className="py-3 pr-4 text-right font-mono-num font-semibold">{r.finalMark.toFixed(1)}</td>
                  <td className="py-3 pr-4 text-right font-mono-num font-bold" style={{ color: gradeColor(r.grade) }}>
                    {r.grade}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono-num">{r.gradePoint}</td>
                  <td className="py-3 pr-4 text-right font-mono-num">{s.credits}</td>
                  <td className="py-3 text-right">
                    <Badge tone={r.passed ? "teal" : "crimson"}>{r.passed ? "Pass" : "At risk"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-ink/10 dark:border-paper/10">
              <tr className="font-semibold">
                <td className="pt-3 pr-4">Total / GPA</td>
                <td />
                <td />
                <td />
                <td className="pt-3 pr-4 text-right font-mono-num">{currentGPA.toFixed(2)}</td>
                <td className="pt-3 pr-4 text-right font-mono-num">{totalCredits}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </GlassCard>

      {/* Semester history + lock */}
      <div className="grid sm:grid-cols-2 gap-4">
        <GlassCard className="animate-fade-up [animation-delay:360ms]">
          <h2 className="font-display text-lg font-medium mb-1">Lock this semester</h2>
          <p className="text-sm text-slate-muted mb-4">
            Save the current GPA ({currentGPA.toFixed(2)}) into your semester history so it factors into CGPA going forward.
          </p>
          <div className="flex gap-2">
            <input
              value={semLabel}
              onChange={(e) => setSemLabel(e.target.value)}
              placeholder="Semester label…"
              className="flex-1 rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3.5 py-2.5 text-sm outline-none focus:border-gold"
            />
            <Button onClick={handleLockSemester} disabled={locking || gpaEntries.length === 0}>
              {locking ? "Saved ✓" : "Lock"}
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="animate-fade-up [animation-delay:400ms]">
          <h2 className="font-display text-lg font-medium mb-3">Semester History</h2>
          {semesterHistory.length === 0 ? (
            <p className="text-sm text-slate-muted">No locked semesters yet.</p>
          ) : (
            <ul className="space-y-2">
              {semesterHistory.map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span>{s.label}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono-num text-slate-muted">{s.totalCredits} cr</span>
                    <Badge tone="gold">GPA {s.gpa.toFixed(2)}</Badge>
                  </span>
                </li>
              ))}
              <li className="flex items-center justify-between text-sm pt-2 border-t font-semibold">
                <span>CGPA</span>
                <Badge tone="teal">{predictedCGPA.toFixed(2)}</Badge>
              </li>
            </ul>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
