"use client";

import { useEffect, useState } from "react";
import { SavingsGoal } from "@/lib/types";

const STORAGE_KEY = "xpense-savings-goals";

export function useSavingsGoals() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setGoals(JSON.parse(raw));
    } catch {
      // ignore corrupted data
    }
    setLoaded(true);
  }, []);

  function persist(next: SavingsGoal[]) {
    setGoals(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function addGoal(goal: Omit<SavingsGoal, "id" | "currentAmount">) {
    const newGoal: SavingsGoal = {
      ...goal,
      id: crypto.randomUUID(),
      currentAmount: 0,
    };
    persist([...goals, newGoal]);
  }

  function addContribution(id: string, amount: number) {
    persist(
      goals.map((g) =>
        g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g,
      ),
    );
  }

  function deleteGoal(id: string) {
    persist(goals.filter((g) => g.id !== id));
  }

  return { goals, loaded, addGoal, addContribution, deleteGoal };
}