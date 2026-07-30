"use client";

import { useState } from "react";
import { CATEGORIES, Category, RecurringTransaction, TransactionType } from "@/lib/types";
import { Plus, X, Repeat } from "lucide-react";

interface RecurringPanelProps {
  recurring: RecurringTransaction[];
  onAdd: (t: Omit<RecurringTransaction, "id">) => void;
  onDelete: (id: string) => void;
}

export function RecurringPanel({ recurring, onAdd, onDelete }: RecurringPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("Bills");
  const [note, setNote] = useState("");
  const [nextDueDate, setNextDueDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) return;
    onAdd({ type, amount: numeric, category, note, nextDueDate });
    setAmount("");
    setNote("");
    setShowForm(false);
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
          Recurring
        </h2>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 text-xs text-ledger-gold-soft hover:text-ledger-gold transition-colors"
        >
          <Plus size={13} />
          Add recurring
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
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
              onClick={() => setType("income")}
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
            <input
              type="date"
              required
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Netflix subscription"
            className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-ledger-gold text-ledger-bg py-1.5 text-xs font-medium hover:bg-ledger-gold-soft transition-colors"
          >
            Add recurring entry
          </button>
        </form>
      )}

      {recurring.length === 0 ? (
        <p className="text-xs text-ledger-muted">
          No recurring entries. Add bills or subscriptions to auto-track them monthly.
        </p>
      ) : (
        <div className="space-y-2">
          {recurring.map((r) => (
            <div
              key={r.id}
              className="group flex items-center justify-between rounded-md bg-ledger-surface-2 px-3 py-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Repeat size={13} className="text-ledger-muted shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-ledger-text truncate">{r.note || r.category}</p>
                  <p className="text-[10px] text-ledger-muted">
                    Next:{" "}
                    {new Date(r.nextDueDate).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
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
                  onClick={() => onDelete(r.id)}
                  className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-slate-soft transition-opacity"
                  aria-label="Remove recurring"
                >
                  <X size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}