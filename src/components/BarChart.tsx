"use client";

import { useMemo } from "react";
import { Transaction } from "@/lib/types";
import {
  Bar,
  BarChart as ReBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

interface BarChartProps {
  transactions: Transaction[];
}

export function BarChart({ transactions }: BarChartProps) {
  const data = useMemo(() => {
    const now = new Date();
    const months: { key: string; label: string; income: number; expense: number }[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleDateString("en-PH", { month: "short" }),
        income: 0,
        expense: 0,
      });
    }

    for (const t of transactions) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const month = months.find((m) => m.key === key);
      if (!month) continue;
      if (t.type === "income") month.income += t.amount;
      else month.expense += t.amount;
    }

    return months;
  }, [transactions]);

  const hasData = data.some((m) => m.income > 0 || m.expense > 0);

  if (!hasData) {
    return (
      <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5 flex items-center justify-center h-[280px]">
        <p className="text-ledger-muted text-sm text-center">
          Add entries across a few months to see your expense overview.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted mb-1">
        Expense overview
      </h2>
      <p className="text-xs text-ledger-muted mb-4">Last 6 months</p>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ledger-line)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--color-ledger-muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-ledger-line)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--color-ledger-muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `₱${Number(v).toLocaleString("en-PH")}`}
              width={70}
            />
            <Tooltip
              formatter={(value) => [
                `₱${Number(value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
                "",
              ]}
              contentStyle={{
                background: "var(--color-ledger-surface)",
                border: "1px solid var(--color-ledger-line)",
                borderRadius: 8,
                fontSize: 12,
                color: "var(--color-ledger-text)",
              }}
              labelStyle={{ color: "var(--color-ledger-muted)" }}
            />
            <Legend wrapperStyle={{ fontSize: 11, color: "var(--color-ledger-muted)" }} />
            <Bar dataKey="income" name="Income" fill="var(--color-ledger-gold)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Expense" fill="var(--color-ledger-slate)" radius={[4, 4, 0, 0]} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}