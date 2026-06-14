"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("gradewise:theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="relative h-9 w-9 rounded-full border border-ink/10 dark:border-paper/15 flex items-center justify-center hover:bg-ink/5 dark:hover:bg-paper/5 transition-colors"
    >
      <span className="text-base leading-none">{dark ? "☾" : "☀"}</span>
    </button>
  );
}
