"use client";

import { useState } from "react";
import AppShell from "@/components/AppShell";
import { GlassCard, Button, Input } from "@/components/ui";
import { saveContactMessage } from "@/lib/storage";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSend = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    saveContactMessage({ name, email, message, createdAt: Date.now() });
    setSent(true);
  };

  return (
    <AppShell title="Contact Us">
      <div className="max-w-lg mx-auto mt-6">
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep dark:text-gold font-semibold">Support</p>
          <h1 className="font-display text-3xl mt-1">Contact Us</h1>
          <p className="text-sm text-slate-muted mt-2">Have a question or feedback? We'd love to hear from you.</p>
        </div>

        <GlassCard>
          {sent ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">✅</p>
              <h2 className="font-display text-xl font-medium">Message sent!</h2>
              <p className="text-sm text-slate-muted mt-2">We've received your message and will get back to you soon.</p>
              <Button className="mt-6" onClick={() => { setSent(false); setName(""); setEmail(""); setMessage(""); }}>
                Send another
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b">
                <div className="h-10 w-10 rounded-xl bg-teal/15 flex items-center justify-center text-teal text-xl">💬</div>
                <h2 className="font-display text-lg font-medium">Send us a Message</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-muted mb-1.5">Full Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Thomas"
                  className="w-full rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-muted mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="thomas@example.com"
                  className="w-full rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest text-slate-muted mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more..."
                  rows={5}
                  className="w-full rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-4 py-3 text-sm outline-none focus:border-gold transition-colors resize-none"
                />
              </div>

              {error && <p className="text-sm text-crimson bg-crimson/10 rounded-lg px-3 py-2">{error}</p>}

              <Button className="w-full mt-2" onClick={handleSend}>
                Send Message &nbsp;✈
              </Button>
            </div>
          )}
        </GlassCard>
      </div>
    </AppShell>
  );
}
