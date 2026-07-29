"use client";

import { Transaction } from "@/lib/types";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryChartProps {
  transactions: Transaction[];
}

const COLORS = [
  "#C9A227",
  "#6F93B8",
  "#8FB0D1",
  "#E0C168",
  "#4E6E8F",
  "#A98B2A",
  "#3E5975",
  "#B8965C",
];

export function CategoryChart({ transactions }: CategoryChartProps) {
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});

  const data = Object.entries(expensesByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5 flex items-center justify-center h-[280px]">
        <p className="text-ledger-muted text-sm text-center">
          Add expenses to see your category breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted mb-2">
        By category
      </h2>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`₱${Number(value ?? 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, ""]}
              contentStyle={{
                background: "#1A212B",
                border: "1px solid #2A3441",
                borderRadius: 8,
                fontSize: 12,
                color: "#E7EDF3",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 space-y-1.5">
        {data.slice(0, 5).map((d, i) => (
          <div key={d.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="text-ledger-muted">{d.name}</span>
            </div>
            <span className="tabular font-mono text-ledger-text">
              ₱{d.value.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
