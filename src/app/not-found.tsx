import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-8xl font-bold text-gold opacity-30">404</p>
        <h1 className="font-display text-2xl font-medium mt-4">Page not found</h1>
        <p className="text-slate-muted mt-2 text-sm">This page doesn&apos;t exist in your academic record.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-full bg-ink text-paper dark:bg-gold dark:text-ink px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
