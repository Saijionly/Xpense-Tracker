"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Debt } from "./types";

export function useDebts() {
  const supabase = createClient();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchDebts = useCallback(async () => {
    const { data, error } = await supabase
      .from("debts")
      .select("*")
      .order("due_date", { ascending: true, nullsFirst: false });

    if (!error && data) {
      setDebts(
        data.map((row) => ({
          id: row.id,
          name: row.name,
          totalAmount: Number(row.total_amount),
          paidAmount: Number(row.paid_amount),
          dueDate: row.due_date,
        })),
      );
    }
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDebts();
  }, [fetchDebts]);

  const addDebt = useCallback(
    async (d: Omit<Debt, "id" | "paidAmount">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("debts").insert({
        user_id: user.id,
        name: d.name,
        total_amount: d.totalAmount,
        due_date: d.dueDate,
      });

      if (!error) {
        await fetchDebts();
      }
    },
    [supabase, fetchDebts],
  );

  const addPayment = useCallback(
    async (id: string, amount: number) => {
      const debt = debts.find((d) => d.id === id);
      if (!debt) return;

      const newPaid = Math.min(debt.paidAmount + amount, debt.totalAmount);

      const { error } = await supabase
        .from("debts")
        .update({ paid_amount: newPaid })
        .eq("id", id);

      if (!error) {
        await fetchDebts();
      }
    },
    [supabase, debts, fetchDebts],
  );

  const deleteDebt = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (!error) {
        setDebts((prev) => prev.filter((d) => d.id !== id));
      }
    },
    [supabase],
  );

  return { debts, addDebt, addPayment, deleteDebt, loaded };
}