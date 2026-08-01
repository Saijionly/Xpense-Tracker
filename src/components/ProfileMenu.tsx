"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAppData } from "@/lib/AppDataContext";
import { useLanguage } from "@/lib/LanguageContext";
import { LogOut, Settings, HelpCircle, Flag, Pencil, Check, X } from "lucide-react";

export function ProfileMenu() {
  const supabase = createClient();
  const router = useRouter();
  const { t } = useLanguage();
  const { profile, updateFullName, updateAvatar } = useAppData();

  const [open, setOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.fullName ?? "");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setEditingName(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile.fullName || profile.email?.split("@")[0] || "User";
  const initial = displayName.charAt(0).toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSaveName() {
    if (nameInput.trim()) {
      updateFullName(nameInput.trim());
    }
    setEditingName(false);
  }

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) updateAvatar(file);
  }

  function handleSupportClick() {
    window.location.href = "mailto:support@xpenseledgertracker.app";
  }

  function handleReportClick() {
    window.location.href =
      "mailto:support@xpenseledgertracker.app?subject=Problem%20report";
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity"
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover border border-ledger-line"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-ledger-gold/20 text-ledger-gold-soft flex items-center justify-center text-xs font-semibold">
            {initial}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute z-50 w-64 rounded-lg border border-ledger-line bg-ledger-surface shadow-xl p-2 top-full right-0 mt-2">
          <div className="px-2 py-2 border-b border-ledger-line mb-1">
            {editingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="flex-1 min-w-0 rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
                />
                <button onClick={handleSaveName} className="text-ledger-gold-soft shrink-0">
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setEditingName(false)}
                  className="text-ledger-muted shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm text-ledger-text truncate">{displayName}</p>
                  <p className="text-[11px] text-ledger-muted truncate">{profile.email}</p>
                </div>
                <button
                  onClick={() => {
                    setNameInput(profile.fullName ?? "");
                    setEditingName(true);
                  }}
                  className="text-ledger-muted hover:text-ledger-gold-soft shrink-0"
                  aria-label="Edit name"
                >
                  <Pencil size={13} />
                </button>
              </div>
            )}
            <label className="mt-2 inline-block text-[11px] text-ledger-gold-soft hover:text-ledger-gold cursor-pointer">
              Change photo
              <input type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
            </label>
          </div>

          <button className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-xs text-ledger-muted hover:bg-ledger-surface-2 hover:text-ledger-text transition-colors">
            <Settings size={14} />
            <span>Settings</span>
          </button>

          <button
            onClick={handleSupportClick}
            className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-xs text-ledger-muted hover:bg-ledger-surface-2 hover:text-ledger-text transition-colors"
          >
            <HelpCircle size={14} />
            <span>Help and Support</span>
          </button>

          <button
            onClick={handleReportClick}
            className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-xs text-ledger-muted hover:bg-ledger-surface-2 hover:text-ledger-text transition-colors"
          >
            <Flag size={14} />
            <span>Report a Problem</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-md px-2 py-2 text-xs text-ledger-slate-soft hover:bg-ledger-surface-2 transition-colors mt-1 border-t border-ledger-line pt-2"
          >
            <LogOut size={14} />
            <span>{t("signOut")}</span>
          </button>
        </div>
      )}
    </div>
  );
}