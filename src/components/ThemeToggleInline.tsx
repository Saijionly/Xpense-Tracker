"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggleInline() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersLight = stored
      ? stored === "light"
      : window.matchMedia("(prefers-color-scheme: light)").matches;
    setIsLight(prefersLight);
  }, []);

  function toggleTheme() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark/light mode"
      className="flex h-9 w-9 items-center justify-center rounded-full text-ledger-muted hover:text-ledger-text hover:bg-ledger-surface-2 transition-colors"
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}