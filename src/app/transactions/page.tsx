"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { useLanguage } from "@/lib/LanguageContext";
import { TransactionForm } from "@/components/TransactionForm";
import { TransactionList } from "@/components/TransactionList";
import { TransactionFilters, DateRangeOption } from "@/components/TransactionFilters";
import { EditTransactionModal } from "@/components/EditTransactionModal";
import { ImportCSVModal } from "@/components/ImportCSVModal";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Category, Transaction, TransactionType } from "@/lib/types";
import { Upload } from "lucide-react";

export default function TransactionsPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, wallets, loaded } =
    useAppData();
  const { t } = useLanguage();

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [typeFilter, setTypeFilter] = useState<TransactionType | "All">("All");
  const [dateRange, setDateRange] = useState<DateRangeOption>("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [walletFilter, setWalletFilter] = useState<string>("All");

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
      const matchesWallet = walletFilter === "All" || t.walletId === walletFilter;

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

      return matchesSearch && matchesCategory && matchesType && matchesDate && matchesWallet;
    });
  }, [transactions, search, categoryFilter, typeFilter, dateRange, customStart, customEnd, walletFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "All" ||
    typeFilter !== "All" ||
    dateRange !== "all" ||
    walletFilter !== "All";

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setTypeFilter("All");
    setDateRange("all");
    setCustomStart("");
    setCustomEnd("");
    setWalletFilter("All");
  }

  if (!loaded) return null;

  return (
    <div className="min-h-full">
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ledger-text">
            Transactions
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
          <RevealOnScroll direction="left">
            <TransactionForm onAdd={addTransaction} wallets={wallets} />
          </RevealOnScroll>

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
              wallets={wallets}
              walletFilter={walletFilter}
              onWalletFilterChange={setWalletFilter}
              onClear={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
            <RevealOnScroll direction="right">
              <TransactionList
                transactions={filteredTransactions}
                onDelete={deleteTransaction}
                onEdit={setEditingTransaction}
                wallets={wallets}
              />
            </RevealOnScroll>
          </div>
        </div>
      </main>

      <EditTransactionModal
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={updateTransaction}
        wallets={wallets}
      />

      <ImportCSVModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={addTransaction}
      />
    </div>
  );
}