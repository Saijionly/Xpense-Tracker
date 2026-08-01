"use client";

import { useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { exportTransactionsToCSV } from "@/lib/exportUtils";
import { ThemeToggleInline } from "@/components/ThemeToggleInline";
import { LanguageToggleInline } from "@/components/LanguageToggleInline";
import { X, Download, User } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { profile, updateFullName, transactions } = useAppData();
  const [nameInput, setNameInput] = useState(profile.fullName ?? "");
  const [saved, setSaved] = useState(false);

  if (!open) return null;

  function handleSaveName() {
    if (nameInput.trim()) {
      updateFullName(nameInput.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md rounded-lg border border-ledger-line bg-ledger-surface p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
              Settings
            </h2>
            <button onClick={onClose} className="text-ledger-muted hover:text-ledger-text transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-ledger-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={13} /> Display name
              </p>
              <div className="flex gap-2">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
                />
                <button
                  onClick={handleSaveName}
                  className="rounded-md bg-ledger-gold text-ledger-bg px-3 text-xs font-medium hover:bg-ledger-gold-soft transition-colors"
                >
                  {saved ? "Saved" : "Save"}
                </button>
              </div>
              <p className="text-[11px] text-ledger-muted mt-1">{profile.email}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-ledger-muted uppercase tracking-wider mb-2">
                Language
              </p>
              <LanguageToggleInline />
            </div>

            <div>
              <p className="text-xs font-semibold text-ledger-muted uppercase tracking-wider mb-2">
                Appearance
              </p>
              <div className="flex items-center gap-2">
                <ThemeToggleInline />
                <span className="text-xs text-ledger-muted">Toggle light / dark mode</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-ledger-muted uppercase tracking-wider mb-2">
                Your data
              </p>
              <button
                onClick={() => exportTransactionsToCSV(transactions)}
                className="flex items-center gap-2 rounded-md border border-ledger-line px-3 py-2 text-xs text-ledger-muted hover:text-ledger-text hover:border-ledger-gold/60 transition-colors"
              >
                <Download size={14} /> Export all transactions (CSV)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}