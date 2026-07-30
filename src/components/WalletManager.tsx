"use client";

import { useState } from "react";
import { useMemo } from "react";
import { Transaction, Wallet } from "@/lib/types";
import { Plus, X, Wallet as WalletIcon } from "lucide-react";

interface WalletManagerProps {
  wallets: Wallet[];
  transactions: Transaction[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
}

export function WalletManager({ wallets, transactions, onAdd, onDelete }: WalletManagerProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const balances = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactions) {
      const key = t.walletId ?? "unassigned";
      const delta = t.type === "income" ? t.amount : -t.amount;
      map[key] = (map[key] ?? 0) + delta;
    }
    return map;
  }, [transactions]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
    setShowForm(false);
  }

  const unassignedBalance = balances["unassigned"] ?? 0;
  const hasUnassigned = transactions.some((t) => !t.walletId);

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <WalletIcon size={14} className="text-ledger-gold-soft" />
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
            Wallets
          </h2>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-1 text-xs text-ledger-gold-soft hover:text-ledger-gold transition-colors"
        >
          <Plus size={13} />
          Add wallet
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. GCash, BDO Savings"
            className="flex-1 rounded-md bg-ledger-surface-2 border border-ledger-line px-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
          />
          <button
            type="submit"
            className="rounded-md bg-ledger-gold text-ledger-bg px-3 text-xs font-medium hover:bg-ledger-gold-soft transition-colors"
          >
            Add
          </button>
        </form>
      )}

      {wallets.length === 0 && !hasUnassigned ? (
        <p className="text-xs text-ledger-muted">
          No wallets yet. Add one to start organizing by account (cash, bank, e-wallet, etc).
        </p>
      ) : (
        <div className="space-y-2">
          {wallets.map((w) => {
            const bal = balances[w.id] ?? 0;
            return (
              <div
                key={w.id}
                className="group flex items-center justify-between rounded-md bg-ledger-surface-2 px-3 py-2"
              >
                <span className="text-xs text-ledger-text truncate">{w.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`tabular font-mono text-xs ${
                      bal >= 0 ? "text-ledger-gold-soft" : "text-ledger-slate-soft"
                    }`}
                  >
                    ₱{bal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => onDelete(w.id)}
                    className="opacity-0 group-hover:opacity-100 text-ledger-muted hover:text-ledger-slate-soft transition-opacity"
                    aria-label="Remove wallet"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            );
          })}
          {hasUnassigned && (
            <div className="flex items-center justify-between rounded-md bg-ledger-surface-2 px-3 py-2 opacity-70">
              <span className="text-xs text-ledger-muted truncate">Unassigned</span>
              <span
                className={`tabular font-mono text-xs ${
                  unassignedBalance >= 0 ? "text-ledger-gold-soft" : "text-ledger-slate-soft"
                }`}
              >
                ₱{unassignedBalance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}