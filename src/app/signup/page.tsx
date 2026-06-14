"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { GlassCard, Button, Input } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { signup } from "@/lib/storage";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "One uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "One number", ok: /[0-9]/.test(password) },
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordChecks.every((c) => c.ok)) {
      setError("Password does not meet the requirements below.");
      return;
    }

    setSubmitting(true);
    const result = signup({ fullName, registerNumber, email, password });
    setSubmitting(false);

    if (!result.ok) {
      const messages: Record<string, string> = {
        REGISTER_NUMBER_TAKEN: "That register number is already registered.",
        EMAIL_TAKEN: "That email address is already registered.",
        WEAK_PASSWORD: "Password does not meet the requirements below.",
      };
      setError(messages[result.error] ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-ledger">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <GlassCard className="w-full max-w-md animate-fade-up">
        <Link href="/" className="font-display text-lg font-semibold tracking-tight">
          GradeWise <span className="italic text-gold">AI</span>
        </Link>
        <h1 className="font-display text-2xl font-medium mt-4">Create your account</h1>
        <p className="text-sm text-slate-muted mt-1">
          Your marks, GPA, and CGPA stay private — saved automatically as you go.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Full name"
            placeholder="Enter your full name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Register number"
            placeholder="21222*******"
            required
            value={registerNumber}
            onChange={(e) => setRegisterNumber(e.target.value)}
          />
          <Input
            label="Email address"
            type="email"
            placeholder="you@college.edu"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            label="Confirm password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <ul className="space-y-1">
            {passwordChecks.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-xs">
                <span className={c.ok ? "text-teal-deep dark:text-teal" : "text-slate-muted"}>
                  {c.ok ? "✓" : "○"}
                </span>
                <span className={c.ok ? "text-teal-deep dark:text-teal" : "text-slate-muted"}>{c.label}</span>
              </li>
            ))}
          </ul>

          {error && (
            <p className="text-sm text-crimson bg-crimson/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account…" : "Create my account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-ink dark:text-paper underline underline-offset-4">
            Log in
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
