"use client";

import { useLanguage } from "@/lib/LanguageContext";

export function LanguageToggleInline() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-ledger-line px-1 py-1">
      <button
        onClick={() => setLanguage("en")}
        className={`rounded-full px-2 py-1 text-[11px] font-medium transition-colors ${
          language === "en"
            ? "bg-ledger-gold text-ledger-bg"
            : "text-ledger-muted hover:text-ledger-text"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("fil")}
        className={`rounded-full px-2 py-1 text-[11px] font-medium transition-colors ${
          language === "fil"
            ? "bg-ledger-gold text-ledger-bg"
            : "text-ledger-muted hover:text-ledger-text"
        }`}
      >
        FIL
      </button>
    </div>
  );
}