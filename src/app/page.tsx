"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import GradeRing from "@/components/GradeRing";
import { Button, GlassCard } from "@/components/ui";
import { startGuestSession } from "@/lib/storage";

export default function LandingPage() {
  const router = useRouter();
  const [confirmGuest, setConfirmGuest] = useState(false);

  const continueAsGuest = () => {
    startGuestSession();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-ledger relative overflow-hidden">
      <header className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <span className="font-display text-lg font-semibold tracking-tight">
          GradeWise <span className="italic text-gold">AI</span>
        </span>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-10 sm:pt-20 pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-deep dark:text-gold mb-4">
            Ledger 01 — Academic Year
          </p>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            Know your grade
            <br />
            <span className="italic">before</span> it&apos;s final.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-muted max-w-md">
            Enter your internal marks once. GradeWise AI works out your internal score, predicts
            your final grade, and keeps a running GPA and CGPA — updated the moment you type.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/login">
              <Button className="w-full sm:w-auto px-6">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="w-full sm:w-auto px-6">
                Create account
              </Button>
            </Link>
          </div>

          <div className="mt-4">
            {!confirmGuest ? (
              <button
                onClick={() => setConfirmGuest(true)}
                className="text-sm font-medium text-slate-muted hover:text-ink dark:hover:text-paper underline underline-offset-4 transition-colors"
              >
                Continue as guest
              </button>
            ) : (
              <GlassCard className="mt-2 max-w-md !p-4 animate-fade-up">
                <p className="text-sm">
                  Create an account to save your academic progress. Guest data stays only on this
                  device and can be lost if you clear your browser.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" onClick={continueAsGuest} className="text-xs px-3 py-2">
                    Continue anyway
                  </Button>
                  <Link href="/signup">
                    <Button className="text-xs px-3 py-2">Create account instead</Button>
                  </Link>
                </div>
              </GlassCard>
            )}
          </div>
        </div>

        <div className="flex justify-center lg:justify-end animate-fade-up [animation-delay:150ms]">
          <GlassCard className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-display text-lg font-medium">Semester 4</p>
                <p className="text-xs text-slate-muted">Predicted outcome</p>
              </div>
              <span className="font-mono-num text-xs px-2 py-1 rounded-full bg-teal/15 text-teal-deep dark:text-teal">
                On track
              </span>
            </div>
            <div className="grid grid-cols-2 gap-6 place-items-center">
              <GradeRing value={8.42} max={10} label="Current GPA" sublabel="6 subjects" accent="gold" size={140} />
              <GradeRing value={8.1} max={10} label="Predicted CGPA" sublabel="across 4 sems" accent="teal" size={140} />
            </div>
            <div className="mt-6 pt-5 border-t flex items-center justify-between text-sm">
              <span className="text-slate-muted">Credits earned</span>
              <span className="font-mono-num font-semibold">88 / 160</span>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
