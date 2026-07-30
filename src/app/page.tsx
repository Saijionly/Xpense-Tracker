"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/LanguageContext";
import { WelcomeGreeting } from "@/components/WelcomeGreeting";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t } = useLanguage();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setMessage(t("accountCreatedMsg"));
      setMode("signin");
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Xpense logo" className="h-14 w-auto mb-3" />
          <h1 className="font-display text-xl font-semibold text-ledger-text">Xpense</h1>
          <p className="text-xs text-ledger-muted mt-1">{t("appTagline")}</p>
          <WelcomeGreeting showName={false} />
        </div>

        <div className="rounded-lg border border-ledger-line bg-ledger-surface p-6">
          <div className="flex gap-2 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "signin"
                  ? "bg-ledger-gold/20 text-ledger-gold-soft border border-ledger-gold/40"
                  : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
              }`}
            >
              {t("signIn")}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setMessage(null);
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-ledger-gold/20 text-ledger-gold-soft border border-ledger-gold/40"
                  : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
              }`}
            >
              {t("signUp")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-ledger-muted mb-1">{t("email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
              />
            </div>
            <div>
              <label className="block text-xs text-ledger-muted mb-1">{t("password")}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
              />
            </div>

            {error && <p className="text-xs text-ledger-slate-soft">{error}</p>}
            {message && <p className="text-xs text-ledger-gold-soft">{message}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-ledger-gold text-ledger-bg font-medium py-2.5 text-sm hover:bg-ledger-gold-soft transition-colors disabled:opacity-60"
            >
              {loading ? t("pleaseWait") : mode === "signin" ? t("signIn") : t("createAccount")}
            </button>
          </form>
        </div>

        <p className="text-xs text-ledger-muted text-center mt-4">{t("dataPrivacyNote")}</p>
      </div>
    </div>
  );
}