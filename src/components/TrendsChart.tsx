"use client";

import { useMemo } from "react";
import { Transaction } from "@/lib/types";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface TrendsChartProps {
  transactions: Transaction[];
}

export function TrendsChart({ transactions }: TrendsChartProps) {
  const data = useMemo(() => {
    if (transactions.length === 0) return [];

    const sorted = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const dailyBalance: Record<string, number> = {};
    let running = 0;

    for (const t of sorted) {
      running += t.type === "income" ? t.amount : -t.amount;
      dailyBalance[t.date] = running;
    }

    return Object.entries(dailyBalance).map(([date, balance]) => ({
      date,
      balance,
      label: new Date(date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [transactions]);

  if (data.length < 2) {
    return (
      <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5 flex items-center justify-center h-[220px]">
        <p className="text-ledger-muted text-sm text-center">
          Add more entries to see your balance trend over time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted mb-4">
        Balance trend
      </h2>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-ledger-line)" />
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--color-ledger-muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--color-ledger-line)" }}
              tickLine={false}
              minTickGap={30}
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
                "Balance",
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
            <Line
              type="monotone"
              dataKey="balance"
              stroke="var(--color-ledger-gold)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-ledger-gold)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}