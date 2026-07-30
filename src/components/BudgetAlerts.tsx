"use client";

import { useMemo } from "react";
import { Transaction, Budget } from "@/lib/types";
import { AlertTriangle, AlertCircle } from "lucide-react";

interface BudgetAlertsProps {
  budgets: Budget[];
  transactions: Transaction[];
}

export function BudgetAlerts({ budgets, transactions }: BudgetAlertsProps) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const alerts = useMemo(() => {
    return budgets
      .map((b) => {
        const spent = transactions
          .filter((t) => {
            const d = new Date(t.date);
            return (
              t.type === "expense" &&
              t.category === b.category &&
              d.getMonth() === currentMonth &&
              d.getFullYear() === currentYear
            );
          })
          .reduce((s, t) => s + t.amount, 0);

        const pct = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
        return { category: b.category, spent, limit: b.monthlyLimit, pct };
      })
      .filter((a) => a.pct >= 80)
      .sort((a, b) => b.pct - a.pct);
  }, [budgets, transactions, currentMonth, currentYear]);

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {alerts.map((a) => {
        const exceeded = a.pct >= 100;
        return (
          <div
            key={a.category}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
              exceeded
                ? "border-red-400/40 bg-red-400/10 text-red-400"
                : "border-ledger-gold/40 bg-ledger-gold/10 text-ledger-gold"
            }`}
          >
            {exceeded ? <AlertCircle size={14} /> : <AlertTriangle size={14} />}
            <span>
              {exceeded ? "Over budget: " : "Nearing budget limit: "}
              <strong>{a.category}</strong> — ₱{a.spent.toLocaleString("en-PH", { minimumFractionDigits: 2 })} of ₱
              {a.limit.toLocaleString("en-PH", { minimumFractionDigits: 2 })} ({a.pct.toFixed(0)}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}