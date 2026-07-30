"use client";
import { useCallback, useMemo, useState } from "react";
import { useTransactions } from "@/lib/useTransactions";
import { useBudgets } from "@/lib/useBudgets";
import { useRecurring } from "@/lib/useRecurring";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFilters } from "@/components/TransactionFilters";
import { CategoryChart } from "@/components/CategoryChart";
import { TrendsChart } from "@/components/TrendsChart";
import { InsightsPanel } from "@/components/InsightsPanel";
import { BudgetPanel } from "@/components/BudgetPanel";
import { RecurringPanel } from "@/components/RecurringPanel";
import { UserMenu } from "@/components/UserMenu";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { Category, Transaction, TransactionType } from "@/lib/types";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function Home() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loaded, refetch } =
    useTransactionsWithRefetch();
  const { budgets, setBudget, deleteBudget, loaded: budgetsLoaded } = useBudgets();
  const { recurring, addRecurring, deleteRecurring, loaded: recurringLoaded } =
    useRecurring(refetch);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "All">("All");

  const { income, expenses, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        search.trim() === "" ||
        t.note.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
      const matchesType = typeFilter === "All" || t.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, search, categoryFilter, typeFilter]);

  const hasActiveFilters = search.trim() !== "" || categoryFilter !== "All" || typeFilter !== "All";

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setTypeFilter("All");
  }

  if (!loaded || !budgetsLoaded || !recurringLoaded) {
    return null;
  }

  return (
    <div className="min-h-full">
      <header className="border-b border-ledger-line">
        <div className="mx-auto max-w-5xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Xpense logo" className="h-9 w-auto" />
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-ledger-text">
                Xpense
              </h1>
              <p className="text-xs text-ledger-muted mt-0.5">Your online tracker buddy</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <p className="hidden sm:block text-xs text-ledger-muted">
              {new Date().toLocaleDateString("en-PH", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <UserMenu />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard label="Balance" amount={balance} icon={Wallet} accent="text" />
          <SummaryCard label="Income" amount={income} icon={TrendingUp} accent="gold" />
          <SummaryCard label="Expenses" amount={expenses} icon={TrendingDown} accent="slate" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
          <div className="space-y-6">
            <TransactionForm onAdd={addTransaction} />
            <InsightsPanel transactions={transactions} />
            <BudgetPanel
              budgets={budgets}
              transactions={transactions}
              onSet={setBudget}
              onDelete={deleteBudget}
            />
            <RecurringPanel
              recurring={recurring}
              onAdd={addRecurring}
              onDelete={deleteRecurring}
            />
            <CategoryChart transactions={transactions} />
            <TrendsChart transactions={transactions} />
          </div>
          <div>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted mb-3">
              Recent entries
            </h2>
            <TransactionFilters
              search={search}
              onSearchChange={setSearch}
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              type={typeFilter}
              onTypeChange={setTypeFilter}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
            <TransactionList
              transactions={filteredTransactions}
              onDelete={deleteTransaction}
              onEdit={setEditingTransaction}
            />
          </div>
        </div>
      </main>
      <footer className="mt-auto border-t border-ledger-line">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <p className="text-xs text-ledger-muted">
            Your data is private and stored securely, scoped to your account.
          </p>
        </div>
      </footer>

      <EditTransactionModal
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={updateTransaction}
      />
    </div>
  );
}

function useTransactionsWithRefetch() {
  const hook = useTransactions();
  const refetch = useCallback(() => {
    window.location.reload();
  }, []);
  return { ...hook, refetch };
}