"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Transaction } from "./types";

export function useTransactions() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchTransactions = useCallback(async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTransactions(
        data.map((row) => ({
          id: row.id,
          type: row.type,
          amount: Number(row.amount),
          category: row.category,
          note: row.note ?? "",
          date: row.date,
          createdAt: new Date(row.created_at).getTime(),
        })),
      );
    }
    setLoaded(true);
  }, [supabase]);

  // Fetch on mount (data must be loaded client-side, scoped to the logged-in user).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (t: Omit<Transaction, "id" | "createdAt">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        note: t.note,
        date: t.date,
      });

      if (!error) {
        await fetchTransactions();
      }
    },
    [supabase, fetchTransactions],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (!error) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    },
    [supabase],
  );

  return { transactions, addTransaction, deleteTransaction, loaded };
}
