"use client";

import { useState, useEffect } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Category,
  Transaction,
  TransactionType,
} from "@/lib/types";
import { X } from "lucide-react";

interface EditTransactionModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (id: string, t: Omit<Transaction, "id" | "createdAt">) => void;
}

export function EditTransactionModal({ transaction, onClose, onSave }: EditTransactionModalProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");

  const categoryOptions = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setNote(transaction.note);
      setDate(transaction.date);
    }
  }, [transaction]);

  if (!transaction) return null;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(next === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) return;
    onSave(transaction!.id, {
      type,
      amount: numeric,
      category,
      note,
      date,
      currency: transaction!.currency,
      originalAmount: transaction!.originalAmount,
      exchangeRate: transaction!.exchangeRate,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-ledger-line bg-ledger-surface p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
            Edit entry
          </h2>
          <button
            onClick={onClose}
            className="text-ledger-muted hover:text-ledger-text transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
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
              onClick={() => handleTypeChange("income")}
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
              <label className="block text-xs text-ledger-muted mb-1">
                Amount ({transaction.currency !== "PHP" ? `${transaction.currency} → ` : ""}₱)
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="tabular font-mono w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text focus:outline-none focus:border-ledger-gold/60"
              />
              {transaction.currency !== "PHP" && transaction.originalAmount != null && (
                <p className="text-[11px] text-ledger-muted mt-1">
                  Original: {transaction.originalAmount.toLocaleString()} {transaction.currency}
                </p>
              )}
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
              {categoryOptions.map((c) => (
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
              className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text focus:outline-none focus:border-ledger-gold/60"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md bg-ledger-surface-2 text-ledger-muted font-medium py-2.5 text-sm hover:text-ledger-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-md bg-ledger-gold text-ledger-bg font-medium py-2.5 text-sm hover:bg-ledger-gold-soft transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}