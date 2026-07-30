"use client";

import { useMemo } from "react";
import { Transaction } from "@/lib/types";
import { exportTransactionsToCSV, exportTransactionsToPDF } from "@/lib/exportUtils";
import { TrendingUp, TrendingDown, Download, FileDown, Minus } from "lucide-react";

interface InsightsPanelProps {
  transactions: Transaction[];
}

export function InsightsPanel({ transactions }: InsightsPanelProps) {
  const insights = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonth = lastMonthDate.getMonth();
    const lastMonthYear = lastMonthDate.getFullYear();

    const expenses = transactions.filter((t) => t.type === "expense");

    const thisMonthTotal = expenses
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, t) => s + t.amount, 0);

    const lastMonthTotal = expenses
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
      })
      .reduce((s, t) => s + t.amount, 0);

    const pctChange =
      lastMonthTotal === 0
        ? thisMonthTotal > 0
          ? 100
          : 0
        : ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    const byDay: Record<string, number> = {};
    for (const t of expenses) {
      byDay[t.date] = (byDay[t.date] ?? 0) + t.amount;
    }
    const dayEntries = Object.entries(byDay);
    const topDay = dayEntries.sort((a, b) => b[1] - a[1])[0];
    const avgDaily =
      dayEntries.length > 0 ? dayEntries.reduce((s, [, v]) => s + v, 0) / dayEntries.length : 0;

    return { thisMonthTotal, lastMonthTotal, pctChange, topDay, avgDaily };
  }, [transactions]);

  const monthName = new Date().toLocaleDateString("en-PH", { month: "long" });
  const lastMonthName = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1,
  ).toLocaleDateString("en-PH", { month: "long" });

  const trendUp = insights.pctChange > 0;
  const trendFlat = insights.pctChange === 0;

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
          Insights
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportTransactionsToCSV(transactions)}
            className="flex items-center gap-1 text-xs text-ledger-muted hover:text-ledger-text border border-ledger-line rounded-md px-2 py-1 transition-colors"
          >
            <Download size={12} /> CSV
          </button>
          <button
            onClick={() => exportTransactionsToPDF(transactions)}
            className="flex items-center gap-1 text-xs text-ledger-muted hover:text-ledger-text border border-ledger-line rounded-md px-2 py-1 transition-colors"
          >
            <FileDown size={12} /> PDF
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="text-ledger-muted text-sm text-center py-6">
          Add transactions to see your insights.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-xs text-ledger-muted mb-1">
              {monthName} vs {lastMonthName}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg text-ledger-text">
                ₱{insights.thisMonthTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center gap-1 text-xs font-medium ${
                  trendFlat
                    ? "text-ledger-muted"
                    : trendUp
                      ? "text-red-400"
                      : "text-green-400"
                }`}
              >
                {trendFlat ? <Minus size={12} /> : trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(insights.pctChange).toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-ledger-line">
            <div>
              <p className="text-xs text-ledger-muted mb-1">Top spending day</p>
              {insights.topDay ? (
                <>
                  <p className="font-mono text-sm text-ledger-text">
                    ₱{insights.topDay[1].toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-ledger-muted">
                    {new Date(insights.topDay[0]).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-ledger-muted">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-ledger-muted mb-1">Avg. daily spend</p>
              <p className="font-mono text-sm text-ledger-text">
                ₱{insights.avgDaily.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}