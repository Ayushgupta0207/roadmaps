"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setDark(
      root.classList.contains("dark") ||
        (!root.classList.contains("light") &&
          matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    const root = document.documentElement;
    root.classList.toggle("dark", next);
    root.classList.toggle("light", !next);
    document.cookie = `theme=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-card"
    >
      {dark ? "☀ Light" : "☾ Dark"}
    </button>
  );
}