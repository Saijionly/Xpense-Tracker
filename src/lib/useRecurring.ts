"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RecurringTransaction } from "./types";

function addOneMonth(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export function useRecurring(onTransactionAdded: () => void) {
  const supabase = createClient();
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchRecurring = useCallback(async () => {
    const { data, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .order("next_due_date");

    if (!error && data) {
      setRecurring(
        data.map((row) => ({
          id: row.id,
          type: row.type,
          amount: Number(row.amount),
          category: row.category,
          note: row.note ?? "",
          nextDueDate: row.next_due_date,
        })),
      );
    }
    setLoaded(true);
  }, [supabase]);

  const processDueRecurring = useCallback(async () => {
    const { data: dueRows, error } = await supabase
      .from("recurring_transactions")
      .select("*")
      .lte("next_due_date", new Date().toISOString().slice(0, 10));

    if (error || !dueRows || dueRows.length === 0) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    for (const row of dueRows) {
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: row.type,
        amount: row.amount,
        category: row.category,
        note: row.note,
        date: row.next_due_date,
      });

      await supabase
        .from("recurring_transactions")
        .update({ next_due_date: addOneMonth(row.next_due_date) })
        .eq("id", row.id);
    }

    onTransactionAdded();
  }, [supabase, onTransactionAdded]);

  useEffect(() => {
    async function init() {
      await processDueRecurring();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      await fetchRecurring();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addRecurring = useCallback(
    async (t: Omit<RecurringTransaction, "id">) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("recurring_transactions").insert({
        user_id: user.id,
        type: t.type,
        amount: t.amount,
        category: t.category,
        note: t.note,
        next_due_date: t.nextDueDate,
      });

      if (!error) {
        await fetchRecurring();
      }
    },
    [supabase, fetchRecurring],
  );

  const updateRecurring = useCallback(
    async (id: string, updates: Omit<RecurringTransaction, "id">) => {
      const { error } = await supabase
        .from("recurring_transactions")
        .update({
          type: updates.type,
          amount: updates.amount,
          category: updates.category,
          note: updates.note,
          next_due_date: updates.nextDueDate,
        })
        .eq("id", id);

      if (!error) {
        await fetchRecurring();
      }
    },
    [supabase, fetchRecurring],
  );

  const deleteRecurring = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("recurring_transactions").delete().eq("id", id);
      if (!error) {
        setRecurring((prev) => prev.filter((r) => r.id !== id));
      }
    },
    [supabase],
  );

  const markAsPaid = useCallback(
    async (item: RecurringTransaction) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error: insertError } = await supabase.from("transactions").insert({
        user_id: user.id,
        type: item.type,
        amount: item.amount,
        category: item.category,
        note: item.note,
        date: item.nextDueDate,
      });

      if (insertError) return;

      const { error: updateError } = await supabase
        .from("recurring_transactions")
        .update({ next_due_date: addOneMonth(item.nextDueDate) })
        .eq("id", item.id);

      if (!updateError) {
        onTransactionAdded();
        await fetchRecurring();
      }
    },
    [supabase, onTransactionAdded, fetchRecurring],
  );

  return { recurring, addRecurring, updateRecurring, deleteRecurring, markAsPaid, loaded };
}