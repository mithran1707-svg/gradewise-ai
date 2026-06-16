"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { GlassCard, Button } from "@/components/ui";
import GradeRing from "@/components/GradeRing";
import { calculateGPA, calculateCGPA, computeFinal } from "@/lib/calculations";
import { GRADE_SCALE } from "@/lib/types";
import { useSession } from "@/lib/useSession";
import { searchSubjects } from "@/lib/subjectsDb";

interface ManualEntry {
  id: number;
  subjectName: string;
  credits: number;
  gradePoint: number;
  showSuggestions?: boolean;
}

interface SemEntry {
  id: number;
  label: string;
  credits: number;
  gpa: number;
}

let gpaEntryId = 0;
let semEntryId = 0;

export default function GPACalculatorPage() {
  const { session, data } = useSession();

  const [entries, setEntries] = useState<ManualEntry[]>([
    { id: ++gpaEntryId, subjectName: "", credits: 3, gradePoint: 9, showSuggestions: false },
  ]);

  const [semEntries, setSemEntries] = useState<SemEntry[]>([
    { id: ++semEntryId, label: "Semester 1", credits: 24, gpa: 8.5 },
  ]);

  const addEntry = () =>
    setEntries((e) => [...e, { id: ++gpaEntryId, subjectName: "", credits: 3, gradePoint: 9, showSuggestions: false }]);

  const removeEntry = (id: number) => setEntries((e) => e.filter((x) => x.id !== id));

  const updateEntry = (id: number, field: keyof ManualEntry, value: string | number | boolean) =>
    setEntries((e) => e.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const addSem = () =>
    setSemEntries((s) => [...s, { id: ++semEntryId, label: `Semester ${s.length + 1}`, credits: 24, gpa: 8.0 }]);

  const removeSem = (id: number) => setSemEntries((s) => s.filter((x) => x.id !== id));

  const updateSem = (id: number, field: keyof SemEntry, value: string | number) =>
    setSemEntries((s) => s.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  const gpa = calculateGPA(entries.filter((e) => e.credits > 0));
  const cgpa = calculateCGPA(semEntries.filter((s) => s.credits > 0));

  const loadFromSubjects = () => {
    if (!data?.subjects.length) return;
    const loaded = data.subjects.map((s) => {
      const r = computeFinal(s, { endSemTheory: s.marks.endSemester ?? 75 });
      return { id: ++gpaEntryId, subjectName: s.name, credits: s.credits, gradePoint: r.gradePoint, showSuggestions: false };
    });
    setEntries(loaded);
  };

  return (
    <AppShell title="GPA Calculator">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-deep dark:text-gold font-semibold">Calculators</p>
        <h1 className="font-display text-3xl mt-0.5">GPA & CGPA Calculator</h1>
        <p className="text-sm text-slate-muted mt-1">
          Type a subject name to auto-fill credits, or enter manually.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium">GPA Calculator</h2>
              {data?.subjects.length ? (
                <Button variant="secondary" className="text-xs" onClick={loadFromSubjects}>
                  Load my subjects
                </Button>
              ) : null}
            </div>
            <p className="text-xs text-slate-muted mb-4">
              Formula: Σ(Credit × Grade Point) ÷ Σ(Credits)
            </p>

            <div className="flex flex-wrap gap-2 mb-5 pb-4 border-b">
              {GRADE_SCALE.map((g) => (
                <span key={g.letter} className="text-xs bg-ink/5 dark:bg-paper/10 rounded-full px-2.5 py-1">
                  {g.letter} = {g.point}
                </span>
              ))}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_80px_90px_32px] gap-2 text-xs text-slate-muted px-1">
                <span>Subject</span>
                <span>Credits</span>
                <span>Grade Point</span>
                <span />
              </div>
              {entries.map((e) => {
                const suggestions = searchSubjects(e.subjectName);
                return (
                  <div key={e.id} className="grid grid-cols-[1fr_80px_90px_32px] gap-2 items-start">
                    {/* Subject name with autocomplete */}
                    <div className="relative">
                      <input
                        value={e.subjectName}
                        onChange={(ev) => {
                          updateEntry(e.id, "subjectName", ev.target.value);
                          updateEntry(e.id, "showSuggestions", true);
                        }}
                        onFocus={() => updateEntry(e.id, "showSuggestions", true)}
                        onBlur={() => setTimeout(() => updateEntry(e.id, "showSuggestions", false), 150)}
                        placeholder="Type subject name..."
                        autoComplete="off"
                        className="w-full rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3 py-2 text-sm outline-none focus:border-gold"
                      />
                      {e.showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 rounded-xl border border-ink/10 dark:border-paper/15 bg-paper dark:bg-ink-soft shadow-glass overflow-y-auto max-h-60">
                          {suggestions.map((s) => (
                            <button
                              key={s.name}
                              type="button"
                              onMouseDown={(ev) => ev.preventDefault()}
                              onClick={() => {
                                updateEntry(e.id, "subjectName", s.name);
                                updateEntry(e.id, "credits", s.theory + s.practical);
                                updateEntry(e.id, "showSuggestions", false);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gold/10 transition-colors border-b border-ink/5 dark:border-paper/5 last:border-0"
                            >
                              <p className="text-xs font-medium">{s.name}</p>
                              <p className="text-xs text-slate-muted">
                                T:{s.theory} P:{s.practical} | Total: {s.theory + s.practical} credits
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Credits */}
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={e.credits}
                      onChange={(ev) => updateEntry(e.id, "credits", Number(ev.target.value))}
                      onFocus={(ev) => ev.target.select()}
                      className="rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3 py-2 text-sm outline-none focus:border-gold text-center font-mono-num"
                    />

                    {/* Grade point */}
                    <select
                      value={e.gradePoint}
                      onChange={(ev) => updateEntry(e.id, "gradePoint", Number(ev.target.value))}
                      className="rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3 py-2 text-sm outline-none focus:border-gold"
                    >
                      {GRADE_SCALE.map((g) => (
                        <option key={g.letter} value={g.point}>
                          {g.letter} ({g.point})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => removeEntry(e.id)}
                      disabled={entries.length === 1}
                      className="text-slate-muted hover:text-crimson disabled:opacity-30 text-lg leading-none mt-2"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <Button variant="secondary" onClick={addEntry} className="mt-4 w-full">
              + Add subject
            </Button>
          </GlassCard>

          {/* CGPA section */}
          <GlassCard>
            <h2 className="font-display text-lg font-medium mb-1">CGPA Calculator</h2>
            <p className="text-xs text-slate-muted mb-5">
              Formula: Σ(All Semester Credits × GPA) ÷ Σ(All Credits)
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_90px_90px_32px] gap-2 text-xs text-slate-muted px-1">
                <span>Semester</span>
                <span>Credits</span>
                <span>GPA</span>
                <span />
              </div>
              {semEntries.map((s) => (
                <div key={s.id} className="grid grid-cols-[1fr_90px_90px_32px] gap-2 items-center">
                  <input
                    value={s.label}
                    onChange={(ev) => updateSem(s.id, "label", ev.target.value)}
                    placeholder="Semester label"
                    className="rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3 py-2 text-sm outline-none focus:border-gold"
                  />
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={s.credits}
                    onChange={(ev) => updateSem(s.id, "credits", Number(ev.target.value))}
                    onFocus={(ev) => ev.target.select()}
                    className="rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3 py-2 text-sm outline-none focus:border-gold text-center font-mono-num"
                  />
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step={0.01}
                    value={s.gpa}
                    onChange={(ev) => updateSem(s.id, "gpa", Number(ev.target.value))}
                    onFocus={(ev) => ev.target.select()}
                    className="rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3 py-2 text-sm outline-none focus:border-gold text-center font-mono-num"
                  />
                  <button
                    onClick={() => removeSem(s.id)}
                    disabled={semEntries.length === 1}
                    className="text-slate-muted hover:text-crimson disabled:opacity-30 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <Button variant="secondary" onClick={addSem} className="mt-4 w-full">
              + Add semester
            </Button>
          </GlassCard>
        </div>

        {/* Result cards */}
        <div className="space-y-4">
          <GlassCard className="flex items-center justify-center py-8">
            <GradeRing
              value={gpa}
              max={10}
              label="GPA"
              sublabel={`${entries.length} subject${entries.length !== 1 ? "s" : ""}`}
              accent="gold"
              size={150}
            />
          </GlassCard>

          <GlassCard className="flex items-center justify-center py-8">
            <GradeRing
              value={cgpa}
              max={10}
              label="CGPA"
              sublabel={`${semEntries.length} semester${semEntries.length !== 1 ? "s" : ""}`}
              accent="teal"
              size={150}
            />
          </GlassCard>

          <GlassCard>
            <h3 className="font-display text-base font-medium mb-3">Summary</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-slate-muted">Total credits (GPA)</span>
                <span className="font-mono-num">{entries.reduce((a, b) => a + b.credits, 0)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-slate-muted">Weighted GP sum</span>
                <span className="font-mono-num">
                  {entries.reduce((a, b) => a + b.credits * b.gradePoint, 0).toFixed(1)}
                </span>
              </li>
              <li className="flex justify-between pt-2 border-t font-semibold">
                <span>GPA</span>
                <span className="font-mono-num">{gpa.toFixed(4)}</span>
              </li>
              <li className="flex justify-between pt-2 border-t font-semibold">
                <span>CGPA</span>
                <span className="font-mono-num">{cgpa.toFixed(4)}</span>
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
