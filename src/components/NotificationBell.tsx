"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { Bell, AlertTriangle, AlertCircle, Repeat } from "lucide-react";

export function NotificationBell() {
  const { budgets, transactions, recurring } = useAppData();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notifications = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const budgetItems = budgets
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
        return { category: b.category, pct };
      })
      .filter((a) => a.pct >= 80)
      .map((a) => ({
        id: `budget-${a.category}`,
        icon: a.pct >= 100 ? AlertCircle : AlertTriangle,
        text:
          a.pct >= 100
            ? `Over budget on ${a.category} (${a.pct.toFixed(0)}%)`
            : `Nearing budget limit on ${a.category} (${a.pct.toFixed(0)}%)`,
        urgent: a.pct >= 100,
      }));

    const in7 = new Date(now);
    in7.setHours(0, 0, 0, 0);
    const weekAhead = new Date(in7);
    weekAhead.setDate(in7.getDate() + 7);

    const recurringItems = recurring
      .filter((r) => {
        const d = new Date(r.nextDueDate);
        return d >= in7 && d <= weekAhead;
      })
      .map((r) => {
        const daysLeft = Math.ceil(
          (new Date(r.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return {
          id: `recurring-${r.id}`,
          icon: Repeat,
          text: `${r.note || r.category} due ${daysLeft === 0 ? "today" : `in ${daysLeft}d`} (₱${r.amount.toLocaleString("en-PH")})`,
          urgent: daysLeft <= 1,
        };
      });

    return [...recurringItems, ...budgetItems];
  }, [budgets, transactions, recurring]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ledger-muted hover:text-ledger-text hover:bg-ledger-surface-2 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-ledger-gold" />
        )}
      </button>

      {open && (
        <div className="absolute z-50 w-72 rounded-lg border border-ledger-line bg-ledger-surface shadow-xl p-2 top-full right-0 mt-2 max-h-80 overflow-y-auto">
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-ledger-muted">
            Notifications
          </p>
          {notifications.length === 0 ? (
            <p className="px-2 py-4 text-xs text-ledger-muted text-center">
              You are all caught up.
            </p>
          ) : (
            <div className="space-y-1">
              {notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-2 rounded-md px-2 py-2 text-xs ${
                      n.urgent ? "text-red-400" : "text-ledger-gold-soft"
                    }`}
                  >
                    <Icon size={14} className="mt-0.5 shrink-0" />
                    <span className="text-ledger-text">{n.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}