"use client";

import { useMemo, useState } from "react";
import { Transaction } from "@/lib/types";
import { Calendar } from "lucide-react";

interface RecapPanelProps {
  transactions: Transaction[];
}

type Period = "week" | "month";

export function RecapPanel({ transactions }: RecapPanelProps) {
  const [period, setPeriod] = useState<Period>("week");

  const recap = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let start: Date;
    let prevStart: Date;
    let prevEnd: Date;

    if (period === "week") {
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start = new Date(now);
      start.setDate(now.getDate() - diffToMonday);
      prevEnd = new Date(start);
      prevEnd.setDate(start.getDate() - 1);
      prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 6);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      prevEnd = new Date(start);
      prevEnd.setDate(start.getDate() - 1);
      prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);
    }

    const expenses = transactions.filter((t) => t.type === "expense");
    const current = expenses.filter((t) => new Date(t.date) >= start);
    const previous = expenses.filter((t) => {
      const d = new Date(t.date);
      return d >= prevStart && d <= prevEnd;
    });

    const currentTotal = current.reduce((s, t) => s + t.amount, 0);
    const previousTotal = previous.reduce((s, t) => s + t.amount, 0);

    const byCategory: Record<string, number> = {};
    for (const t of current) {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
    }
    const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

    const pctChange =
      previousTotal === 0 ? (currentTotal > 0 ? 100 : 0) : ((currentTotal - previousTotal) / previousTotal) * 100;

    return { currentTotal, pctChange, topCategory, count: current.length };
  }, [transactions, period]);

  const label = period === "week" ? "this week" : "this month";
  const prevLabel = period === "week" ? "last week" : "last month";

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted flex items-center gap-1.5">
          <Calendar size={13} /> Recap
        </h2>
        <div className="flex gap-1 text-xs">
          <button
            onClick={() => setPeriod("week")}
            className={`px-2 py-1 rounded-md transition-colors ${
              period === "week" ? "bg-ledger-gold/20 text-ledger-gold-soft" : "text-ledger-muted"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            className={`px-2 py-1 rounded-md transition-colors ${
              period === "month" ? "bg-ledger-gold/20 text-ledger-gold-soft" : "text-ledger-muted"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {recap.count === 0 ? (
        <p className="text-sm text-ledger-muted">No expenses {label} yet.</p>
      ) : (
        <p className="text-sm text-ledger-text leading-relaxed">
          You&apos;ve spent{" "}
          <span className="font-mono font-medium">
            ₱{recap.currentTotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </span>{" "}
          {label} across {recap.count} transaction{recap.count !== 1 ? "s" : ""}
          {recap.topCategory && (
            <>
              , mostly on <strong>{recap.topCategory[0]}</strong> (₱
              {recap.topCategory[1].toLocaleString("en-PH", { minimumFractionDigits: 2 })})
            </>
          )}
          . That&apos;s{" "}
          <span
            className={
              recap.pctChange > 0
                ? "text-red-400"
                : recap.pctChange < 0
                  ? "text-green-400"
                  : "text-ledger-muted"
            }
          >
            {recap.pctChange === 0
              ? "the same as"
              : `${Math.abs(recap.pctChange).toFixed(0)}% ${recap.pctChange > 0 ? "more than" : "less than"}`}
          </span>{" "}
          {prevLabel}.
        </p>
      )}
    </div>
  );
}