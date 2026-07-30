"use client";

import { Transaction } from "@/lib/types";
import { Trash2, Pencil } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

export function TransactionList({ transactions, onDelete, onEdit }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-ledger-line bg-ledger-surface p-8 text-center">
        <p className="text-ledger-muted text-sm">
          No entries yet. Add your first transaction to start the ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface overflow-hidden">
      <div className="divide-y divide-ledger-line">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="group flex items-center justify-between px-5 py-3.5 hover:bg-ledger-surface-2/60 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className={`h-2 w-2 rounded-full shrink-0 ${
                  t.type === "income" ? "bg-ledger-gold" : "bg-ledger-slate"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm text-ledger-text truncate">
                  {t.note || t.category}
                </p>
                <p className="text-xs text-ledger-muted">
                  {t.category} · {new Date(t.date).toLocaleDateString("en-PH", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`tabular font-mono text-sm font-medium ${
                  t.type === "income" ? "text-ledger-gold-soft" : "text-ledger-slate-soft"
                }`}
              >
                {t.type === "income" ? "+" : "−"}
                {t.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
              <button
                onClick={() => onEdit(t)}
                className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-gold-soft transition-opacity"
                aria-label="Edit entry"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => onDelete(t.id)}
                className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-slate-soft transition-opacity"
                aria-label="Delete entry"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}