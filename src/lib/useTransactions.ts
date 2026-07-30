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
          currency: row.currency ?? "PHP",
          originalAmount: row.original_amount != null ? Number(row.original_amount) : null,
          exchangeRate: row.exchange_rate != null ? Number(row.exchange_rate) : null,
          receiptUrl: row.receipt_url ?? null,
          tags: row.tags ?? [],
          walletId: row.wallet_id ?? null,
        })),
      );
    }
    setLoaded(true);
  }, [supabase]);

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
        currency: t.currency,
        original_amount: t.originalAmount,
        exchange_rate: t.exchangeRate,
        receipt_url: t.receiptUrl,
        tags: t.tags,
        wallet_id: t.walletId,
      });
      if (!error) {
        await fetchTransactions();
      }
    },
    [supabase, fetchTransactions],
  );

  const updateTransaction = useCallback(
    async (id: string, t: Omit<Transaction, "id" | "createdAt">) => {
      const { error } = await supabase
        .from("transactions")
        .update({
          type: t.type,
          amount: t.amount,
          category: t.category,
          note: t.note,
          date: t.date,
          currency: t.currency,
          original_amount: t.originalAmount,
          exchange_rate: t.exchangeRate,
          receipt_url: t.receiptUrl,
          tags: t.tags,
          wallet_id: t.walletId,
        })
        .eq("id", id);
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

  return { transactions, addTransaction, updateTransaction, deleteTransaction, loaded };
}