"use client";

import { useMemo } from "react";
import { Transaction } from "@/lib/types";
import { calculateSpendingForecast } from "@/lib/forecast";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";

interface ForecastPanelProps {
  transactions: Transaction[];
}

export function ForecastPanel({ transactions }: ForecastPanelProps) {
  const forecast = useMemo(() => calculateSpendingForecast(transactions), [transactions]);

  if (!forecast) {
    return (
      <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5 flex items-center justify-center h-[120px]">
        <p className="text-ledger-muted text-sm text-center">
          Add more expenses across a couple of months to see your spending forecast.
        </p>
      </div>
    );
  }

  const {
    currentMonthSpent,
    projectedMonthTotal,
    daysElapsed,
    daysRemaining,
    daysInMonth,
    trend,
  } = forecast;

  const progressPct = Math.min((daysElapsed / daysInMonth) * 100, 100);

  const trendConfig = {
    up: { icon: TrendingUp, color: "text-ledger-slate-soft", label: "Spending faster than usual" },
    down: { icon: TrendingDown, color: "text-ledger-gold-soft", label: "Spending slower than usual" },
    flat: { icon: Minus, color: "text-ledger-muted", label: "On par with your usual pace" },
  }[trend];

  const TrendIcon = trendConfig.icon;

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center gap-1.5 mb-4">
        <Sparkles size={14} className="text-ledger-gold-soft" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
          Spending forecast
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-ledger-muted mb-1">Spent so far</p>
          <p className="tabular font-mono text-lg font-medium text-ledger-text">
            ₱{currentMonthSpent.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p className="text-xs text-ledger-muted mb-1">Projected total</p>
          <p className="tabular font-mono text-lg font-medium text-ledger-gold-soft">
            ₱{projectedMonthTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1 text-[11px] text-ledger-muted">
          <span>Day {daysElapsed} of {daysInMonth}</span>
          <span>{daysRemaining} days left</span>
        </div>
        <div className="h-1.5 rounded-full bg-ledger-surface-2 overflow-hidden">
          <div
            className="h-full rounded-full bg-ledger-gold transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className={`flex items-center gap-1.5 text-xs ${trendConfig.color}`}>
        <TrendIcon size={13} />
        <span>{trendConfig.label}</span>
      </div>
    </div>
  );
}