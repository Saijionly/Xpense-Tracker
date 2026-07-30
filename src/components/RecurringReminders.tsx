"use client";

import { useMemo } from "react";
import { RecurringTransaction } from "@/lib/types";
import { Bell } from "lucide-react";

interface RecurringRemindersProps {
  recurring: RecurringTransaction[];
}

export function RecurringReminders({ recurring }: RecurringRemindersProps) {
  const upcoming = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const in7 = new Date(now);
    in7.setDate(now.getDate() + 7);

    return recurring
      .filter((r) => {
        const d = new Date(r.nextDueDate);
        return d >= now && d <= in7;
      })
      .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  }, [recurring]);

  if (upcoming.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {upcoming.map((r) => {
        const daysLeft = Math.ceil(
          (new Date(r.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return (
          <div
            key={r.id}
            className="flex items-center gap-2 rounded-md border border-ledger-gold/40 bg-ledger-gold/10 text-ledger-gold px-3 py-2 text-xs"
          >
            <Bell size={14} />
            <span>
              Upcoming {r.type === "income" ? "income" : "bill"}:{" "}
              <strong>{r.note || r.category}</strong> — ₱{r.amount.toLocaleString("en-PH")}{" "}
              {daysLeft === 0 ? "due today" : `in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}