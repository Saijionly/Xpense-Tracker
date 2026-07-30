"use client";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Wallet } from "./types";

export function useWallets() {
  const supabase = createClient();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchWallets = useCallback(async () => {
    const { data, error } = await supabase
      .from("wallets")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setWallets(data.map((row) => ({ id: row.id, name: row.name })));
    }
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchWallets();
  }, [fetchWallets]);

  const addWallet = useCallback(
    async (name: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase.from("wallets").insert({
        user_id: user.id,
        name,
      });
      if (!error) {
        await fetchWallets();
      }
    },
    [supabase, fetchWallets],
  );

  const deleteWallet = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("wallets").delete().eq("id", id);
      if (!error) {
        setWallets((prev) => prev.filter((w) => w.id !== id));
      }
    },
    [supabase],
  );

  return { wallets, addWallet, deleteWallet, loaded };
}