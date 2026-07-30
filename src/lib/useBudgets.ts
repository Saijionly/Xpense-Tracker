"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Budget, Category } from "./types";

export function useBudgets() {
  const supabase = createClient();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchBudgets = useCallback(async () => {
    const { data, error } = await supabase.from("budgets").select("*").order("category");

    if (!error && data) {
      setBudgets(
        data.map((row) => ({
          id: row.id,
          category: row.category,
          monthlyLimit: Number(row.monthly_limit),
        })),
      );
    }
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBudgets();
  }, [fetchBudgets]);

  const setBudget = useCallback(
    async (category: Category, monthlyLimit: number) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("budgets")
        .upsert(
          { user_id: user.id, category, monthly_limit: monthlyLimit },
          { onConflict: "user_id,category" },
        );

      if (!error) {
        await fetchBudgets();
      }
    },
    [supabase, fetchBudgets],
  );

  const deleteBudget = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (!error) {
        setBudgets((prev) => prev.filter((b) => b.id !== id));
      }
    },
    [supabase],
  );

  return { budgets, setBudget, deleteBudget, loaded };
}