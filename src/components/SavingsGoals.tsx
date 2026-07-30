"use client";

import { useState } from "react";
import { useSavingsGoals } from "@/lib/useSavingsGoals";
import { Plus, Trash2, Target } from "lucide-react";

export function SavingsGoals() {
  const { goals, loaded, addGoal, addContribution, deleteGoal } = useSavingsGoals();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [contributingId, setContributingId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState("");

  if (!loaded) return null;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !targetAmount || !deadline) return;
    addGoal({ name: name.trim(), targetAmount: Number(targetAmount), deadline });
    setName("");
    setTargetAmount("");
    setDeadline("");
    setShowForm(false);
  }

  function handleContribute(id: string) {
    const amount = Number(contributionAmount);
    if (!amount || amount <= 0) return;
    addContribution(id, amount);
    setContributionAmount("");
    setContributingId(null);
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
          Savings goals
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1 text-xs text-ledger-gold hover:opacity-80 transition-opacity"
        >
          <Plus size={14} /> New goal
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="mb-4 space-y-2 border border-ledger-line rounded-md p-3">
          <input
            type="text"
            placeholder="Goal name (e.g. Emergency fund)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm bg-transparent border border-ledger-line rounded-md px-2 py-1.5 text-ledger-text placeholder:text-ledger-muted"
          />
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Target amount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-1/2 text-sm bg-transparent border border-ledger-line rounded-md px-2 py-1.5 text-ledger-text placeholder:text-ledger-muted"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-1/2 text-sm bg-transparent border border-ledger-line rounded-md px-2 py-1.5 text-ledger-text"
            />
          </div>
          <button
            type="submit"
            className="w-full text-xs font-medium bg-ledger-gold text-ledger-bg rounded-md py-1.5 hover:opacity-90 transition-opacity"
          >
            Add goal
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <p className="text-ledger-muted text-sm text-center py-4">
          No savings goals yet. Add one to start tracking.
        </p>
      ) : (
        <div className="space-y-4">
          {goals.map((g) => {
            const pct = Math.min(100, (g.currentAmount / g.targetAmount) * 100);
            const daysLeft = Math.ceil(
              (new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );
            return (
              <div key={g.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Target size={13} className="text-ledger-gold" />
                    <span className="text-sm text-ledger-text font-medium">{g.name}</span>
                  </div>
                  <button
                    onClick={() => deleteGoal(g.id)}
                    className="text-ledger-muted hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="h-2 rounded-full bg-ledger-line overflow-hidden">
                  <div
                    className="h-full bg-ledger-gold transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-ledger-muted">
                  <span>
                    ₱{g.currentAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} / ₱
                    {g.targetAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })} ({pct.toFixed(0)}%)
                  </span>
                  <span>{daysLeft > 0 ? `${daysLeft}d left` : "Past due"}</span>
                </div>

                {contributingId === g.id ? (
                  <div className="flex gap-2 pt-1">
                    <input
                      type="number"
                      autoFocus
                      placeholder="Amount"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="flex-1 text-xs bg-transparent border border-ledger-line rounded-md px-2 py-1 text-ledger-text placeholder:text-ledger-muted"
                    />
                    <button
                      onClick={() => handleContribute(g.id)}
                      className="text-xs bg-ledger-gold text-ledger-bg rounded-md px-2 py-1"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setContributingId(null)}
                      className="text-xs text-ledger-muted px-2 py-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setContributingId(g.id)}
                    className="text-xs text-ledger-gold hover:opacity-80 pt-0.5"
                  >
                    + Add contribution
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}