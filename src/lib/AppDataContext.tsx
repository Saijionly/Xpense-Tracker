"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useTransactions } from "@/lib/useTransactions";
import { useBudgets } from "@/lib/useBudgets";
import { useRecurring } from "@/lib/useRecurring";
import { useDebts } from "@/lib/useDebts";
import { useWallets } from "@/lib/useWallets";
import { useSavingsGoals } from "@/lib/useSavingsGoals";
import { RecurringTransaction } from "@/lib/types";

interface UserProfile {
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
}

interface AppDataContextValue {
  transactions: ReturnType<typeof useTransactions>["transactions"];
  addTransaction: ReturnType<typeof useTransactions>["addTransaction"];
  updateTransaction: ReturnType<typeof useTransactions>["updateTransaction"];
  deleteTransaction: ReturnType<typeof useTransactions>["deleteTransaction"];

  budgets: ReturnType<typeof useBudgets>["budgets"];
  setBudget: ReturnType<typeof useBudgets>["setBudget"];
  deleteBudget: ReturnType<typeof useBudgets>["deleteBudget"];

  recurring: ReturnType<typeof useRecurring>["recurring"];
  addRecurring: ReturnType<typeof useRecurring>["addRecurring"];
  updateRecurring: (id: string, updates: Omit<RecurringTransaction, "id">) => Promise<void>;
  deleteRecurring: ReturnType<typeof useRecurring>["deleteRecurring"];
  markRecurringPaid: (item: RecurringTransaction) => Promise<void>;

  debts: ReturnType<typeof useDebts>["debts"];
  addDebt: ReturnType<typeof useDebts>["addDebt"];
  addPayment: ReturnType<typeof useDebts>["addPayment"];
  deleteDebt: ReturnType<typeof useDebts>["deleteDebt"];

  wallets: ReturnType<typeof useWallets>["wallets"];
  addWallet: ReturnType<typeof useWallets>["addWallet"];
  deleteWallet: ReturnType<typeof useWallets>["deleteWallet"];

  goals: ReturnType<typeof useSavingsGoals>["goals"];
  addGoal: ReturnType<typeof useSavingsGoals>["addGoal"];
  addContribution: ReturnType<typeof useSavingsGoals>["addContribution"];
  deleteGoal: ReturnType<typeof useSavingsGoals>["deleteGoal"];

  profile: UserProfile;
  updateFullName: (name: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;

  loaded: boolean;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const txHook = useTransactions();
  const budgetsHook = useBudgets();
  const recurringHook = useRecurring(txHook.refetch);
  const debtsHook = useDebts();
  const walletsHook = useWallets();
  const goalsHook = useSavingsGoals();

  const [profile, setProfile] = useState<UserProfile>({
    email: null,
    fullName: null,
    avatarUrl: null,
  });

  const fetchProfile = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setProfile({
      email: user.email ?? null,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
    });
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateFullName = useCallback(
    async (name: string) => {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: name },
      });
      if (!error) {
        setProfile((p) => ({ ...p, fullName: name }));
      }
    },
    [supabase],
  );

  const updateAvatar = useCallback(
    async (file: File) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) return;

      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const avatarUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl },
      });
      if (!updateError) {
        setProfile((p) => ({ ...p, avatarUrl }));
      }
    },
    [supabase],
  );

  const loaded =
    txHook.loaded &&
    budgetsHook.loaded &&
    recurringHook.loaded &&
    debtsHook.loaded &&
    walletsHook.loaded &&
    goalsHook.loaded;

  const value: AppDataContextValue = {
    transactions: txHook.transactions,
    addTransaction: txHook.addTransaction,
    updateTransaction: txHook.updateTransaction,
    deleteTransaction: txHook.deleteTransaction,

    budgets: budgetsHook.budgets,
    setBudget: budgetsHook.setBudget,
    deleteBudget: budgetsHook.deleteBudget,

    recurring: recurringHook.recurring,
    addRecurring: recurringHook.addRecurring,
    updateRecurring: recurringHook.updateRecurring,
    deleteRecurring: recurringHook.deleteRecurring,
    markRecurringPaid: recurringHook.markAsPaid,

    debts: debtsHook.debts,
    addDebt: debtsHook.addDebt,
    addPayment: debtsHook.addPayment,
    deleteDebt: debtsHook.deleteDebt,

    wallets: walletsHook.wallets,
    addWallet: walletsHook.addWallet,
    deleteWallet: walletsHook.deleteWallet,

    goals: goalsHook.goals,
    addGoal: goalsHook.addGoal,
    addContribution: goalsHook.addContribution,
    deleteGoal: goalsHook.deleteGoal,

    profile,
    updateFullName,
    updateAvatar,

    loaded,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}