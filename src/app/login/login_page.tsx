"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard, Button, Input } from "@/components/ui";
import { login, startGuestSession } from "@/lib/storage";

const ADMIN_REGISTER = (process.env.NEXT_PUBLIC_ADMIN_REGISTER ?? "ADMIN").toUpperCase();
const ADMIN_PASSWORD = "admin1234@1234";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    setLoading(true);

    // Admin hardcoded login
    if (identifier.trim().toUpperCase() === ADMIN_REGISTER) {
      if (password === ADMIN_PASSWORD) {
        // Set a special admin session in localStorage
        if (typeof window !== "undefined") {
          window.localStorage.setItem("gradewise:session", JSON.stringify({ uid: "__admin__", isGuest: false, isAdmin: true }));
        }
        router.replace("/admin");
        return;
      } else {
        setError("Incorrect admin password.");
        setLoading(false);
        return;
      }
    }

    // Normal user login
    const result = login(identifier, password);
    setLoading(false);
    if (result.ok) {
      router.replace("/dashboard");
    } else {
      const messages: Record<string, string> = {
        NOT_FOUND: "No account found. Check your register number or email.",
        WRONG_PASSWORD: "Incorrect password. Try again.",
      };
      setError(messages[result.error] ?? "Something went wrong.");
    }
  };

  const handleGuest = () => {
    startGuestSession();
    router.replace("/dashboard");
  };

  const handleForgotPassword = () => {
    alert("Contact your administrator to reset your password.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-3xl mb-2">📊</p>
          <h1 className="font-display text-2xl font-bold">GradeWise AI</h1>
          <p className="text-sm text-slate-muted mt-1">Sign in to your account</p>
        </div>

        <GlassCard>
          <div className="space-y-4">
            <Input
              label="Register Number or Email"
              placeholder="e.g. 22CS001 or you@email.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />

            {error && (
              <p className="text-sm text-crimson">{error}</p>
            )}

            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>

            <div className="flex items-center justify-between text-xs text-slate-muted">
              <button type="button" onClick={handleForgotPassword} className="hover:underline">
                Forgot password?
              </button>
              <a href="/signup" className="hover:underline">
                Create account →
              </a>
            </div>
          </div>
        </GlassCard>

        <div className="mt-4">
          <Button variant="secondary" className="w-full" onClick={handleGuest}>
            Continue as Guest
          </Button>
        </div>
      </div>
    </main>
  );
}
