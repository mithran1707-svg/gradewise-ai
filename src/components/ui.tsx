import { clsx } from "clsx";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={clsx(
        "glass rounded-xl2 shadow-glass dark:shadow-glass-dark p-5 sm:p-6",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles: Record<string, string> = {
    primary:
      "bg-ink text-paper dark:bg-gold dark:text-ink hover:opacity-90 shadow-sm",
    secondary:
      "bg-transparent border border-ink/15 dark:border-paper/15 hover:bg-ink/5 dark:hover:bg-paper/5",
    ghost: "bg-transparent hover:bg-ink/5 dark:hover:bg-paper/5",
    danger: "bg-crimson text-white hover:opacity-90",
  };
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "gold" | "teal" | "crimson" }) {
  const tones: Record<string, string> = {
    neutral: "bg-ink/5 dark:bg-paper/10 text-ink dark:text-paper",
    gold: "bg-gold/15 text-gold-deep dark:text-gold",
    teal: "bg-teal/15 text-teal-deep dark:text-teal",
    crimson: "bg-crimson/15 text-crimson",
  };
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", tones[tone])}>
      {children}
    </span>
  );
}

export function Input({
  label,
  hint,
  className,
  onFocus,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; hint?: string }) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus so typing immediately replaces the value (no leading zeros)
    e.target.select();
    onFocus?.(e);
  };

  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-ink/80 dark:text-paper/80">{label}</span>}
      <input
        className={clsx(
          "w-full rounded-xl border border-ink/10 dark:border-paper/15 bg-paper/60 dark:bg-ink-soft/60 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-gold",
          className
        )}
        onFocus={handleFocus}
        {...props}
      />
      {hint && <span className="mt-1 block text-xs text-slate-muted">{hint}</span>}
    </label>
  );
}
