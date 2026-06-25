"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import GradeRing from "@/components/GradeRing";
import { Button, GlassCard } from "@/components/ui";
import { startGuestSession } from "@/lib/storage";

const QUOTES = [
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
  { text: "Study hard, for the well is deep and our brains are shallow.", author: "Richard Baxter" },
  { text: "Genius is 1% inspiration and 99% perspiration.", author: "Thomas Edison" },
];

export default function LandingPage() {
  const router = useRouter();
  const [confirmGuest, setConfirmGuest] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Pick a random quote on load
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
  }, []);

  const changeQuote = () => {
    setFade(false);
    setTimeout(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
      setFade(true);
    }, 300);
  };

  const continueAsGuest = () => {
    startGuestSession();
    router.push("/dashboard");
  };

  const quote = QUOTES[quoteIndex];

  return (
    <div className="min-h-screen bg-ledger relative overflow-hidden">
      <header className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
        <span className="font-display text-lg font-semibold tracking-tight">
          GradeWise <span className="italic text-gold">AI</span>
        </span>
        <div className="flex items-center gap-3">
          <Link href="/contact" className="text-sm text-slate-muted hover:text-ink dark:hover:text-paper transition-colors">
            Contact
          </Link>
          <ThemeToggle />
        </div>
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

          {/* Rotating quote */}
          <div
            className="mt-6 p-4 rounded-xl border border-ink/5 dark:border-paper/10 bg-ink/2 dark:bg-paper/5 transition-opacity duration-300 cursor-pointer group"
            style={{ opacity: fade ? 1 : 0 }}
            onClick={changeQuote}
            title="Click for next quote"
          >
            <p className="text-sm text-slate-muted italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
            <p className="mt-2 text-xs font-semibold text-gold-deep dark:text-gold tracking-wide">— {quote.author}</p>
            <p className="mt-1 text-xs text-slate-muted opacity-0 group-hover:opacity-100 transition-opacity">Click for next quote ↻</p>
          </div>

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
