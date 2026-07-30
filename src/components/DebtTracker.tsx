"use client";

import { useState } from "react";
import { Debt } from "@/lib/types";
import { Plus, X, CreditCard, CheckCircle2 } from "lucide-react";

interface DebtTrackerProps {
  debts: Debt[];
  onAdd: (d: Omit<Debt, "id" | "paidAmount">) => void;
  onPay: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

export function DebtTracker({ debts, onAdd, onPay, onDelete }: DebtTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentInputs, setPaymentInputs] = useState<Record<string, string>>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = parseFloat(totalAmount);
    if (!name.trim() || !numeric || numeric <= 0) return;
    onAdd({ name: name.trim(), totalAmount: numeric, dueDate: dueDate || null });
    setName("");
    setTotalAmount("");
    setDueDate("");
    setShowForm(false);
  }

  function handlePay(id: string) {
    const raw = paymentInputs[id];
    const numeric = parseFloat(raw);
    if (!numeric || numeric <= 0) return;
    onPay(id, numeric);
    setPaymentInputs((prev) => ({ ...prev, [id]: "" }));
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <CreditCard size={14} className="text-ledger-slate-soft" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
            Debts
          </h2>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 text-xs text-ledger-gold-soft hover:text-ledger-gold transition-colors"
        >
          <Plus size={13} />
          Add debt
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 space-y-2">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Credit card, Loan from Ana"
            className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="Total amount"
              className="tabular font-mono rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
            />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-ledger-gold text-ledger-bg py-1.5 text-xs font-medium hover:bg-ledger-gold-soft transition-colors"
          >
            Add debt
          </button>
        </form>
      )}

      {debts.length === 0 ? (
        <p className="text-xs text-ledger-muted">
          No debts tracked. Add loans or credit card balances you're paying off.
        </p>
      ) : (
        <div className="space-y-4">
          {debts.map((d) => {
            const remaining = d.totalAmount - d.paidAmount;
            const pct = Math.min((d.paidAmount / d.totalAmount) * 100, 100);
            const isPaidOff = remaining <= 0;

            return (
              <div key={d.id} className="group">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isPaidOff && (
                      <CheckCircle2 size={12} className="text-ledger-gold-soft shrink-0" />
                    )}
                    <span className="text-xs text-ledger-text truncate">{d.name}</span>
                  </div>
                  <button
                    onClick={() => onDelete(d.id)}
                    className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-slate-soft transition-opacity shrink-0"
                    aria-label="Remove debt"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-1 text-[11px] text-ledger-muted">
                  <span>
                    Paid ₱{d.paidAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 })} / ₱
                    {d.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
                  </span>
                  {d.dueDate && (
                    <span>
                      Due{" "}
                      {new Date(d.dueDate).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>

                <div className="h-1.5 rounded-full bg-ledger-surface-2 overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPaidOff ? "bg-ledger-gold" : "bg-ledger-slate-soft"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {!isPaidOff && (
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={paymentInputs[d.id] ?? ""}
                      onChange={(e) =>
                        setPaymentInputs((prev) => ({ ...prev, [d.id]: e.target.value }))
                      }
                      placeholder="Payment amount"
                      className="flex-1 tabular font-mono rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1 text-[11px] text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
                    />
                    <button
                      onClick={() => handlePay(d.id)}
                      className="rounded-md bg-ledger-surface-2 border border-ledger-line px-2.5 text-[11px] text-ledger-gold-soft hover:border-ledger-gold/60 transition-colors"
                    >
                      Pay
                    </button>
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