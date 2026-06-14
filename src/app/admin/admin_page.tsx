"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { GlassCard, Badge } from "@/components/ui";
import { getAdminUserList, getSession, getUsers } from "@/lib/storage";

const ADMIN_REGISTER = (process.env.NEXT_PUBLIC_ADMIN_REGISTER ?? "ADMIN").toUpperCase();

interface AdminUser {
  fullName: string;
  registerNumber: string;
  lastLogin: number;
  createdAt: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const session = getSession();
    if (!session || session.isGuest) {
      router.replace("/login");
      return;
    }

    // Check hardcoded admin session OR register number match
    const isHardcodedAdmin = (session as any).isAdmin === true;
    const allUsers = getUsers();
    const currentUser = allUsers.find((u) => u.uid === session.uid);
    const isRegAdmin = currentUser?.registerNumber?.toUpperCase() === ADMIN_REGISTER;

    if (!isHardcodedAdmin && !isRegAdmin) {
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
    setUsers(getAdminUserList());
  }, [router]);

  if (authorized === null) {
    return (
      <AppShell title="Admin">
        <div className="h-40 shimmer rounded-xl2" />
      </AppShell>
    );
  }

  if (!authorized) {
    return (
      <AppShell title="Admin">
        <GlassCard className="text-center py-16">
          <p className="text-2xl mb-2">🔒</p>
          <p className="font-display text-lg font-medium">Access denied</p>
          <p className="text-sm text-slate-muted mt-1">You do not have admin privileges.</p>
        </GlassCard>
      </AppShell>
    );
  }

  const today = new Date().setHours(0, 0, 0, 0);
  const newToday = users.filter((u) => u.createdAt >= today).length;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activeMonth = users.filter((u) => u.lastLogin >= monthAgo).length;

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.registerNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell title="Admin Dashboard">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-deep dark:text-gold font-semibold">
          Admin View
        </p>
        <h1 className="font-display text-3xl mt-0.5">User Management</h1>
        <p className="text-sm text-slate-muted mt-1">
          Academic data (marks, GPA, CGPA, grades) is never shown here — by design.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <GlassCard className="text-center animate-fade-up">
          <p className="font-mono-num text-3xl font-bold">{users.length}</p>
          <p className="text-xs text-slate-muted mt-1 uppercase tracking-wide">Total users</p>
        </GlassCard>
        <GlassCard className="text-center animate-fade-up [animation-delay:60ms]">
          <p className="font-mono-num text-3xl font-bold">{newToday}</p>
          <p className="text-xs text-slate-muted mt-1 uppercase tracking-wide">New today</p>
        </GlassCard>
        <GlassCard className="text-center animate-fade-up [animation-delay:120ms]">
          <p className="font-mono-num text-3xl font-bold">{activeMonth}</p>
          <p className="text-xs text-slate-muted mt-1 uppercase tracking-wide">Active (30d)</p>
        </GlassCard>
      </div>

      <GlassCard className="animate-fade-up [animation-delay:160ms] overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-medium">Registered Users</h2>
          <input
            placeholder="Search name or reg no…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-48 rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </div>

        <div className="mb-4 rounded-xl bg-teal/10 border border-teal/30 px-4 py-3 text-sm">
          <span className="font-semibold">🔒 Privacy enforced:</span> CIA, SA, IAPR, ML, internal marks, GPA, CGPA, and grade predictions are never accessible from this panel.
        </div>

        {users.length === 0 ? (
          <p className="text-slate-muted text-sm text-center py-8">No registered accounts yet.</p>
        ) : (
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="text-left text-xs text-slate-muted uppercase tracking-wide border-b">
                <th className="pb-2 pr-6 font-medium">Name</th>
                <th className="pb-2 pr-6 font-medium">Register No.</th>
                <th className="pb-2 pr-6 font-medium">Joined</th>
                <th className="pb-2 font-medium">Last login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5 dark:divide-paper/5">
              {filtered.map((u, i) => {
                const recentlyActive = Date.now() - u.lastLogin < 7 * 24 * 60 * 60 * 1000;
                return (
                  <tr key={i} className="group hover:bg-ink/2 dark:hover:bg-paper/2">
                    <td className="py-3 pr-6 font-medium">{u.fullName}</td>
                    <td className="py-3 pr-6 font-mono-num text-slate-muted">{u.registerNumber}</td>
                    <td className="py-3 pr-6 text-slate-muted">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${recentlyActive ? "bg-teal" : "bg-slate-muted"}`} />
                        {new Date(u.lastLogin).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filtered.length === 0 && users.length > 0 && (
          <p className="text-slate-muted text-sm text-center py-4">No users match your search.</p>
        )}
      </GlassCard>
    </AppShell>
  );
}
