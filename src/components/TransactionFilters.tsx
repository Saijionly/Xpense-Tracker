"use client";

import { CATEGORIES, Category, TransactionType } from "@/lib/types";
import { Search, X } from "lucide-react";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: Category | "All";
  onCategoryChange: (v: Category | "All") => void;
  type: TransactionType | "All";
  onTypeChange: (v: TransactionType | "All") => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}

export function TransactionFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  type,
  onTypeChange,
  onClear,
  hasActiveFilters,
}: TransactionFiltersProps) {
  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-4 mb-3">
      <div className="relative mb-3">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ledger-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search note or category…"
          className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line pl-9 pr-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as TransactionType | "All")}
          className="rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
        >
          <option value="All">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as Category | "All")}
          className="rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-xs text-ledger-muted hover:text-ledger-slate-soft transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}