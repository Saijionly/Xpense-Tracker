"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed bottom-36 right-5 md:bottom-20 z-40 flex items-center gap-1 rounded-full border border-ledger-line bg-ledger-surface px-1.5 py-1.5 shadow-lg">
      <Languages size={14} className="text-ledger-muted ml-1 mr-0.5" />
      <button
        onClick={() => setLanguage("en")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
          language === "en"
            ? "bg-ledger-gold text-ledger-bg"
            : "text-ledger-muted hover:text-ledger-text"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("fil")}
        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
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