"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { GlassCard, Button, Input } from "@/components/ui";
import ThemeToggle from "@/components/ThemeToggle";
import { login, startGuestSession } from "@/lib/storage";

const ADMIN_REGISTER = (process.env.NEXT_PUBLIC_ADMIN_REGISTER ?? "ADMIN").toUpperCase();
const ADMIN_PASSWORD = "admin1234@1234";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Admin hardcoded login
    if (identifier.trim().toUpperCase() === ADMIN_REGISTER) {
      if (password === ADMIN_PASSWORD) {
        window.localStorage.setItem(
          "gradewise:session",
          JSON.stringify({ uid: "__admin__", isGuest: false, isAdmin: true })
        );
        router.push("/admin");
        return;
      } else {
        setError("Incorrect admin password.");
        return;
      }
    }

    // Normal user login
    const result = login(identifier, password);
    if (!result.ok) {
      const messages: Record<string, string> = {
        NOT_FOUND: "No account found with that register number or email.",
        WRONG_PASSWORD: "Incorrect password. Try again.",
      };
      setError(messages[result.error] ?? "Something went wrong. Please try again.");
      return;
    }
    if (!remember) {
      window.addEventListener("beforeunload", () => {
        window.localStorage.removeItem("gradewise:session");
      });
    }
    router.push("/dashboard");
  };

  const handleForgotPassword = () => {
    setResetSent(true);
    setTimeout(() => setResetSent(false), 4000);
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
        <h1 className="font-display text-2xl font-medium mt-4">Welcome back</h1>
        <p className="text-sm text-slate-muted mt-1">Log in to pick up right where you left off.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Register number or email"
            placeholder="Your register number or email"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="accent-gold h-4 w-4"
              />
              Remember me
            </label>
            <button type="button" onClick={handleForgotPassword} className="text-slate-muted hover:text-ink dark:hover:text-paper underline underline-offset-4">
              Forgot password?
            </button>
          </div>

          {resetSent && (
            <p className="text-sm text-teal-deep dark:text-teal bg-teal/10 rounded-lg px-3 py-2">
              If an account exists for that email, a reset link has been sent.
            </p>
          )}

          {error && <p className="text-sm text-crimson bg-crimson/10 rounded-lg px-3 py-2">{error}</p>}

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => {
              startGuestSession();
              router.push("/dashboard");
            }}
            className="text-sm text-slate-muted hover:text-ink dark:hover:text-paper underline underline-offset-4"
          >
            Continue as guest instead
          </button>
        </div>

        <p className="mt-5 text-center text-sm text-slate-muted">
          New here?{" "}
          <Link href="/signup" className="font-medium text-ink dark:text-paper underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </GlassCard>
    </div>
  );
}
