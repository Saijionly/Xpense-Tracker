"use client";

import { useState } from "react";
import { CATEGORIES, Category, Transaction, TransactionType } from "@/lib/types";
import { Plus } from "lucide-react";

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, "id" | "createdAt">) => void;
}

export function TransactionForm({ onAdd }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) return;

    onAdd({ type, amount: numeric, category, note, date });
    setAmount("");
    setNote("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-ledger-line bg-ledger-surface p-5"
    >
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted mb-4">
        New entry
      </h2>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            type === "expense"
              ? "bg-ledger-slate/20 text-ledger-slate-soft border border-ledger-slate/40"
              : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            type === "income"
              ? "bg-ledger-gold/20 text-ledger-gold-soft border border-ledger-gold/40"
              : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
          }`}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-ledger-muted mb-1">Amount (₱)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="tabular font-mono w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
          />
        </div>
        <div>
          <label className="block text-xs text-ledger-muted mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text focus:outline-none focus:border-ledger-gold/60"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-ledger-muted mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text focus:outline-none focus:border-ledger-gold/60"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-ledger-muted mb-1">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Lunch with friends"
          className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
        />
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center gap-2 rounded-md bg-ledger-gold text-ledger-bg font-medium py-2.5 text-sm hover:bg-ledger-gold-soft transition-colors"
      >
        <Plus size={16} />
        Add entry
      </button>
    </form>
  );
}
