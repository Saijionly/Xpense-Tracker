"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {email && <span className="text-xs text-ledger-muted hidden sm:inline">{email}</span>}
      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-xs text-ledger-muted hover:text-ledger-slate-soft transition-colors rounded-md border border-ledger-line px-3 py-1.5"
      >
        <LogOut size={13} />
        Sign out
      </button>
    </div>
  );
}
