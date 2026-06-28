"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import ThemeToggle from "./ThemeToggle";
import { logout } from "@/lib/storage";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/subjects", label: "Subjects", icon: "▤" },
  { href: "/subjects/add", label: "Add", icon: "+" },
  { href: "/semester", label: "Semester", icon: "◔" },
  { href: "/profile", label: "Profile", icon: "◈" },
  { href: "/contact", label: "Contact", icon: "✉" },
];

const DESKTOP_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/subjects", label: "Subjects" },
  { href: "/semester", label: "Semester" },
  { href: "/gpa", label: "Calculator" },
  { href: "/profile", label: "Profile" },
  { href: "/contact", label: "Contact" },
];

export default function AppShell({ children, title }: { children: React.ReactNode; title?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 glass-strong border-b">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/dashboard" className="flex items-center gap-1.5 shrink-0">
            <span className="font-display text-lg font-semibold tracking-tight">GradeWise</span>
            <span className="font-display text-lg italic text-gold">AI</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
            {DESKTOP_NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                    active
                      ? "bg-gold/15 text-gold-deep dark:text-gold"
                      : "text-slate-muted hover:text-ink dark:hover:text-paper hover:bg-ink/5 dark:hover:bg-paper/5"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="hidden sm:inline-flex h-9 items-center rounded-full border border-ink/10 dark:border-paper/15 px-4 text-sm font-medium hover:bg-ink/5 dark:hover:bg-paper/5 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 pb-28 sm:pb-12">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 glass-strong border-t">
        <div className="mx-auto max-w-5xl grid grid-cols-5">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/subjects/add" &&
                pathname.startsWith(item.href));
            const isAdd = item.href === "/subjects/add";
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
                  active ? "text-gold-deep dark:text-gold" : "text-slate-muted"
                )}
              >
                <span
                  className={clsx(
                    "text-lg leading-none",
                    isAdd &&
                      "h-7 w-7 rounded-full bg-ink text-paper dark:bg-gold dark:text-ink flex items-center justify-center -mt-1 text-base"
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
