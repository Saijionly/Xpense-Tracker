"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Category,
  RecurringTransaction,
  TransactionType,
} from "@/lib/types";
import { Plus, X, Repeat, CheckCircle2, Pencil } from "lucide-react";

interface RecurringPanelProps {
  recurring: RecurringTransaction[];
  onAdd: (t: Omit<RecurringTransaction, "id">) => void;
  onUpdate: (id: string, t: Omit<RecurringTransaction, "id">) => void;
  onDelete: (id: string) => void;
  onMarkPaid: (item: RecurringTransaction) => void;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusLabel(days: number): { text: string; className: string } {
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, className: "text-red-400" };
  if (days === 0) return { text: "Due today", className: "text-red-400" };
  if (days <= 3) return { text: `in ${days}d`, className: "text-ledger-gold-soft" };
  return { text: `in ${days}d`, className: "text-ledger-muted" };
}

export function RecurringPanel({ recurring, onAdd, onUpdate, onDelete, onMarkPaid }: RecurringPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Bills");
  const [note, setNote] = useState("");
  const [nextDueDate, setNextDueDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDate, setEditDate] = useState("");

  const categoryOptions = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(next === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) return;
    onAdd({ type, amount: numeric, category, note, nextDueDate });
    setAmount("");
    setNote("");
    setShowForm(false);
  }

  function startEdit(item: RecurringTransaction) {
    setEditingId(item.id);
    setEditAmount(String(item.amount));
    setEditDate(item.nextDueDate);
  }

  function saveEdit(item: RecurringTransaction) {
    const numeric = parseFloat(editAmount);
    if (!numeric || numeric <= 0 || !editDate) return;
    onUpdate(item.id, {
      type: item.type,
      amount: numeric,
      category: item.category,
      note: item.note,
      nextDueDate: editDate,
    });
    setEditingId(null);
  }

  const sorted = [...recurring].sort(
    (a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime(),
  );

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
          Bills & Subscriptions
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 text-xs text-ledger-gold-soft hover:text-ledger-gold transition-colors"
        >
          <Plus size={13} />
          Add
        </button>
      </div>
      <p className="text-[11px] text-ledger-muted mb-4">
        Set the billing date once — it repeats every month on that date.
      </p>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
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
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                type === "income"
                  ? "bg-ledger-gold/20 text-ledger-gold-soft border border-ledger-gold/40"
                  : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
              }`}
            >
              Income
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="tabular font-mono rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
            />
            <div>
              <input
                type="date"
                required
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
              />
              <p className="text-[10px] text-ledger-muted mt-1">First billing date</p>
            </div>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Spotify Premium"
            className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-ledger-gold text-ledger-bg py-1.5 text-xs font-medium hover:bg-ledger-gold-soft transition-colors"
          >
            Add bill
          </button>
        </form>
      )}

      {sorted.length === 0 ? (
        <p className="text-xs text-ledger-muted">
          No bills or subscriptions yet. Add one to track it every month.
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => {
            const days = daysUntil(r.nextDueDate);
            const status = statusLabel(days);
            const isEditing = editingId === r.id;

            return (
              <div key={r.id} className="rounded-md bg-ledger-surface-2 px-3 py-2.5">
                {isEditing ? (
                  <div className="space-y-2">
                    <p className="text-xs text-ledger-text font-medium">{r.note || r.category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="tabular font-mono rounded-md bg-ledger-surface border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
                      />
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="rounded-md bg-ledger-surface border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(r)}
                        className="flex-1 rounded-md bg-ledger-gold text-ledger-bg py-1.5 text-[11px] font-medium hover:bg-ledger-gold-soft transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-md border border-ledger-line text-ledger-muted py-1.5 text-[11px] hover:text-ledger-text transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Repeat size={13} className="text-ledger-muted shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-ledger-text truncate">{r.note || r.category}</p>
                        <p className="text-[10px] text-ledger-muted">
                          Bills on the{" "}
                          {new Date(r.nextDueDate).getDate()}
                          {["st", "nd", "rd"][((new Date(r.nextDueDate).getDate() + 90) % 10) - 1] || "th"}
                          {" · "}
                          <span className={status.className}>{status.text}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`tabular font-mono text-xs ${
                          r.type === "income" ? "text-ledger-gold-soft" : "text-ledger-slate-soft"
                        }`}
                      >
                        {r.type === "income" ? "+" : "−"}
                        {r.amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                      </span>
                      <button
                        onClick={() => onMarkPaid(r)}
                        className="text-ledger-muted hover:text-ledger-gold-soft transition-colors"
                        aria-label="Mark as paid"
                        title="Mark as paid — moves billing date to next month"
                      >
                        <CheckCircle2 size={14} />
                      </button>
                      <button
                        onClick={() => startEdit(r)}
                        className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-gold-soft transition-opacity"
                        aria-label="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(r.id)}
                        className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-slate-soft transition-opacity"
                        aria-label="Remove"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}