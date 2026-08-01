"use client";

import { useMemo, useState } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { Calculator, PlusCircle, CheckCircle2 } from "lucide-react";

type TermUnit = "months" | "years";

export function LoanCalculator() {
  const { addDebt } = useAppData();

  const [name, setName] = useState("");
  const [principal, setPrincipal] = useState("");
  const [rate, setRate] = useState("");
  const [term, setTerm] = useState("");
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const [added, setAdded] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(principal);
    const r = parseFloat(rate);
    const t = parseFloat(term);
    if (!p || p <= 0 || !r || r < 0 || !t || t <= 0) return null;

    const termMonths = termUnit === "years" ? t * 12 : t;
    const years = termMonths / 12;

    // Flat/simple interest — the common method used for motor, appliance,
    // and informal personal loans in the Philippines.
    const totalInterest = p * (r / 100) * years;
    const totalPayable = p + totalInterest;
    const monthlyPayment = totalPayable / termMonths;

    return { termMonths, totalInterest, totalPayable, monthlyPayment };
  }, [principal, rate, term, termUnit]);

  function handleAddToTracker() {
    if (!result) return;
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + Math.round(result.termMonths));

    addDebt({
      name: name.trim() || "Loan",
      totalAmount: Math.round(result.totalPayable * 100) / 100,
      dueDate: dueDate.toISOString().slice(0, 10),
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5">
      <div className="flex items-center gap-1.5 mb-1">
        <Calculator size={14} className="text-ledger-gold-soft" />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
          Loan Calculator
        </h2>
      </div>
      <p className="text-[11px] text-ledger-muted mb-4">
        Estimate total cost of a loan, then track it like a debt with a payment progress bar.
      </p>

      <div className="space-y-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Motorcycle loan"
          className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
        />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-ledger-muted mb-1">Loan amount (₱)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="100000"
              className="tabular font-mono w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
            />
          </div>
          <div>
            <label className="block text-xs text-ledger-muted mb-1">Interest rate (% per year)</label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="12"
              className="tabular font-mono w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-ledger-muted mb-1">Loan term</label>
            <input
              type="number"
              inputMode="decimal"
              step="1"
              min="0"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="2"
              className="tabular font-mono w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
            />
          </div>
          <div>
            <label className="block text-xs text-ledger-muted mb-1">Unit</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTermUnit("years")}
                className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                  termUnit === "years"
                    ? "bg-ledger-gold/20 text-ledger-gold-soft border border-ledger-gold/40"
                    : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
                }`}
              >
                Years
              </button>
              <button
                type="button"
                onClick={() => setTermUnit("months")}
                className={`flex-1 rounded-md py-2 text-xs font-medium transition-colors ${
                  termUnit === "months"
                    ? "bg-ledger-gold/20 text-ledger-gold-soft border border-ledger-gold/40"
                    : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
                }`}
              >
                Months
              </button>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="rounded-md bg-ledger-surface-2 p-3 mb-4 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-ledger-muted">Total interest</span>
            <span className="tabular font-mono text-ledger-slate-soft">
              ₱{result.totalInterest.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-ledger-muted">Total payable</span>
            <span className="tabular font-mono text-ledger-text font-medium">
              ₱{result.totalPayable.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-xs pt-1.5 border-t border-ledger-line">
            <span className="text-ledger-muted">Estimated monthly payment</span>
            <span className="tabular font-mono text-ledger-gold-soft font-medium">
              ₱{result.monthlyPayment.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[10px] text-ledger-muted pt-1">
            Based on flat interest over {result.termMonths} month{result.termMonths !== 1 ? "s" : ""}. Actual bank/lender terms may compute interest differently.
          </p>
        </div>
      )}

      <button
        onClick={handleAddToTracker}
        disabled={!result}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-ledger-gold text-ledger-bg font-medium py-2.5 text-sm hover:bg-ledger-gold-soft transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {added ? (
          <>
            <CheckCircle2 size={16} /> Added to Debts
          </>
        ) : (
          <>
            <PlusCircle size={16} /> Track this loan
          </>
        )}
      </button>
      <p className="text-[10px] text-ledger-muted mt-2 text-center">
        This adds it to your Debts list below, where you can log payments and watch the progress bar fill up as you pay it off.
      </p>
    </div>
  );
}