"use client";
import { useCallback, useMemo, useState } from "react";
import { useTransactions } from "@/lib/useTransactions";
import { useBudgets } from "@/lib/useBudgets";
import { useRecurring } from "@/lib/useRecurring";
import { useDebts } from "@/lib/useDebts";
import { useLanguage } from "@/lib/LanguageContext";
import { SummaryCard } from "@/components/SummaryCard";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFilters, DateRangeOption } from "@/components/TransactionFilters";
import { CategoryChart } from "@/components/CategoryChart";
import { TrendsChart } from "@/components/TrendsChart";
import { InsightsPanel } from "@/components/InsightsPanel";
import { ForecastPanel } from "@/components/ForecastPanel";
import { RecapPanel } from "@/components/RecapPanel";
import { BudgetPanel } from "@/components/BudgetPanel";
import { BudgetAlerts } from "@/components/BudgetAlerts";
import { RecurringReminders } from "@/components/RecurringReminders";
import { SavingsGoals } from "@/components/SavingsGoals";
import { RecurringPanel } from "@/components/RecurringPanel";
import { DebtTracker } from "@/components/DebtTracker";
import { UserMenu } from "@/components/UserMenu";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { ImportCSVModal } from "@/components/ImportCSVModal";
import { WelcomeGreeting } from "@/components/WelcomeGreeting";
import { Category, Transaction, TransactionType } from "@/lib/types";
import { Wallet, TrendingUp, TrendingDown, Upload } from "lucide-react";

export default function Home() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, loaded, refetch } =
    useTransactionsWithRefetch();
  const { budgets, setBudget, deleteBudget, loaded: budgetsLoaded } = useBudgets();
  const { recurring, addRecurring, deleteRecurring, loaded: recurringLoaded } =
    useRecurring(refetch);
  const { debts, addDebt, addPayment, deleteDebt, loaded: debtsLoaded } = useDebts();
  const { t } = useLanguage();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "All">("All");
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

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
    const now = new Date();

    const dayOfWeek = now.getDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter((t) => {
      const matchesSearch =
        search.trim() === "" ||
        t.note.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
      const matchesType = typeFilter === "All" || t.type === typeFilter;

      let matchesDate = true;
      const tDate = new Date(t.date);

      if (dateRange === "thisWeek") {
        matchesDate = tDate >= startOfWeek;
      } else if (dateRange === "thisMonth") {
        matchesDate = tDate >= startOfMonth;
      } else if (dateRange === "custom") {
        if (customStart) {
          matchesDate = matchesDate && tDate >= new Date(customStart);
        }
        if (customEnd) {
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && tDate <= end;
        }
      }

      return matchesSearch && matchesCategory && matchesType && matchesDate;
    });
  }, [transactions, search, categoryFilter, typeFilter, dateRange, customStart, customEnd]);

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "All" ||
    typeFilter !== "All" ||
    dateRange !== "all";

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setTypeFilter("All");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
  }

  if (!loaded || !budgetsLoaded || !recurringLoaded || !debtsLoaded) {
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
              <WelcomeGreeting />
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
        <BudgetAlerts budgets={budgets} transactions={transactions} />
        <RecurringReminders recurring={recurring} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard label={t("balance")} amount={balance} icon={Wallet} accent="text" />
          <SummaryCard label={t("incomeLabel")} amount={income} icon={TrendingUp} accent="gold" />
          <SummaryCard label={t("expensesLabel")} amount={expenses} icon={TrendingDown} accent="slate" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
          <div className="space-y-6">
            <TransactionForm onAdd={addTransaction} />
            <RecapPanel transactions={transactions} />
            <InsightsPanel transactions={transactions} />
            <ForecastPanel transactions={transactions} />
            <SavingsGoals />
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
             <DebtTracker
              debts={debts}
              onAdd={addDebt}
              onPay={addPayment}
              onDelete={deleteDebt}
            />
            <CategoryChart transactions={transactions} />
            <TrendsChart transactions={transactions} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
                {t("recentEntries")}
              </h2>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1 text-xs text-ledger-muted hover:text-ledger-gold-soft transition-colors"
              >
                <Upload size={12} /> {t("importCsv")}
              </button>
            </div>
            <TransactionFilters
              search={search}
              onSearchChange={setSearch}
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              type={typeFilter}
              onTypeChange={setTypeFilter}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              customStart={customStart}
              onCustomStartChange={setCustomStart}
              customEnd={customEnd}
              onCustomEndChange={setCustomEnd}
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

      <ImportCSVModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={addTransaction}
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