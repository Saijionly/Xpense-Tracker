"use client";

import { useMemo, useState } from "react";
import { EXPENSE_CATEGORIES, Category, Transaction, Budget } from "@/lib/types";
import { Plus, X, AlertTriangle } from "lucide-react";

interface BudgetPanelProps {
  budgets: Budget[];
  transactions: Transaction[];
  onSet: (category: Category, limit: number) => void;
  onDelete: (id: string) => void;
}

export function BudgetPanel({ budgets, transactions, onSet, onDelete }: BudgetPanelProps) {
  const [category, setCategory] = useState<Category>("Food");
  const [limit, setLimit] = useState("");
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  const currentMonthSpend = useMemo(() => {
    const spendByCategory: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type !== "expense") return;
      const d = new Date(t.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        spendByCategory[t.category] = (spendByCategory[t.category] || 0) + t.amount;
      }
    });
    return spendByCategory;
  }, [transactions]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = parseFloat(limit);
    if (!numeric || numeric <= 0) return;
    onSet(category, numeric);
    setLimit("");
    setShowForm(false);
  }

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (c) => !budgets.some((b) => b.category === c),
  );

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
          Budgets
        </h2>
        {availableCategories.length > 0 && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1 text-xs text-ledger-gold-soft hover:text-ledger-gold transition-colors"
          >
            <Plus size={13} />
            Add budget
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
          >
            {availableCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            required
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="Limit (₱)"
            className="flex-1 tabular font-mono rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
          />
          <button
            type="submit"
            className="rounded-md bg-ledger-gold text-ledger-bg px-3 py-1.5 text-xs font-medium hover:bg-ledger-gold-soft transition-colors"
          >
            Set
          </button>
        </form>
      )}

      {budgets.length === 0 ? (
        <p className="text-xs text-ledger-muted">
          No budgets set yet. Add one to track your monthly spending limits.
        </p>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => {
            const spent = currentMonthSpend[b.category] || 0;
            const pct = Math.min((spent / b.monthlyLimit) * 100, 100);
            const isOver = spent > b.monthlyLimit;
            const isNear = !isOver && pct >= 80;

            return (
              <div key={b.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {(isOver || isNear) && (
                      <AlertTriangle
                        size={12}
                        className={isOver ? "text-ledger-slate-soft" : "text-ledger-gold-soft"}
                      />
                    )}
                    <span className="text-xs text-ledger-text">{b.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tabular font-mono text-xs text-ledger-muted">
                      ₱{spent.toLocaleString("en-PH", { minimumFractionDigits: 0 })} / ₱
                      {b.monthlyLimit.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                    </span>
                    <button
                      onClick={() => onDelete(b.id)}
                      className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-slate-soft transition-opacity"
                      aria-label="Remove budget"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-ledger-surface-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOver
                        ? "bg-ledger-slate-soft"
                        : isNear
                          ? "bg-ledger-gold-soft"
                          : "bg-ledger-gold"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}