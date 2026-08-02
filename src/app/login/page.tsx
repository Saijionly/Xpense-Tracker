"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
      setMessage("Account created. Check your email to confirm, then sign in.");
      setMode("signin");
    }
  }

  async function handleGoogleSignIn() {
    setError(null);
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
    // On success, the browser redirects to Google — no further code runs here.
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/logo.png" alt="Xpense logo" className="h-14 w-auto mb-3" />
          <h1 className="font-display text-xl font-semibold text-ledger-text">Xpense</h1>
          <p className="text-xs text-ledger-muted mt-1">Your online tracker buddy</p>
        </div>

        <div className="rounded-lg border border-ledger-line bg-ledger-surface p-6">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-ledger-line bg-ledger-surface-2 py-2.5 text-sm font-medium text-ledger-text hover:border-ledger-gold/60 transition-colors disabled:opacity-60 mb-4"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.7 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.5 0 10.5-1.9 14.3-5.1l-6.6-5.6c-2 1.4-4.6 2.2-7.7 2.2-5.2 0-9.6-3.3-11.3-7.9l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.3-4.1 5.7l6.6 5.6C40.9 36.5 44 30.8 44 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
            {googleLoading ? "Please wait…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-ledger-line" />
            <span className="text-[10px] text-ledger-muted uppercase">or</span>
            <div className="h-px flex-1 bg-ledger-line" />
          </div>

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
              Sign in
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
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs text-ledger-muted mb-1">Email</label>
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
              <label className="block text-xs text-ledger-muted mb-1">Password</label>
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
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-xs text-ledger-muted text-center mt-4">
          Your data is private and scoped to your account.
        </p>
      </div>
    </div>
  );
}