"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  Category,
  Transaction,
  TransactionType,
} from "@/lib/types";
import { SUPPORTED_CURRENCIES, CurrencyCode, getExchangeRateToPHP } from "@/lib/currency";
import { uploadReceipt } from "@/lib/receipts";
import { parseQuickAdd } from "@/lib/quickAdd";
import { Plus, Loader2, Paperclip, X, Zap } from "lucide-react";

interface TransactionFormProps {
  onAdd: (t: Omit<Transaction, "id" | "createdAt">) => void;
}

export function TransactionForm({ onAdd }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("PHP");
  const [category, setCategory] = useState<Category>("Food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [quickText, setQuickText] = useState("");

  const categoryOptions = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    setType(next);
    setCategory(next === "expense" ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]);
  }

  function handleQuickAdd() {
    const parsed = parseQuickAdd(quickText);
    if (!parsed) return;
    setType(parsed.type);
    setAmount(String(parsed.amount));
    setCategory(parsed.category);
    setNote(parsed.note);
    setCurrency("PHP");
    setQuickText("");
  }

  function handleQuickKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleQuickAdd();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  }

  function clearReceipt() {
    setReceiptFile(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (!numeric || numeric <= 0) return;

    setSubmitting(true);
    try {
      let receiptUrl: string | null = null;
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile);
      }

      if (currency === "PHP") {
        onAdd({
          type,
          amount: numeric,
          category,
          note,
          date,
          currency: "PHP",
          originalAmount: null,
          exchangeRate: null,
          receiptUrl,
        });
      } else {
        const rate = await getExchangeRateToPHP(currency);
        const converted = numeric * rate;
        onAdd({
          type,
          amount: converted,
          category,
          note,
          date,
          currency,
          originalAmount: numeric,
          exchangeRate: rate,
          receiptUrl,
        });
      }
      setAmount("");
      setNote("");
      setCurrency("PHP");
      clearReceipt();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-ledger-line bg-ledger-surface p-5"
    >
      <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted mb-4">
        New entry
      </h2>

      <div className="mb-4">
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Zap size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ledger-muted" />
            <input
              type="text"
              value={quickText}
              onChange={(e) => setQuickText(e.target.value)}
              onKeyDown={handleQuickKeyDown}
              placeholder="Quick add: e.g. 300 grocery"
              className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line pl-8 pr-2 py-1.5 text-xs text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
            />
          </div>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="rounded-md bg-ledger-surface-2 border border-ledger-line px-3 text-xs text-ledger-muted hover:text-ledger-gold-soft hover:border-ledger-gold/60 transition-colors"
          >
            Fill
          </button>
        </div>
        <p className="text-[10px] text-ledger-muted mt-1">
          Type amount + keyword, press Enter to auto-fill the fields below.
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => handleTypeChange("expense")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            type === "expense"
              ? "bg-ledger-slate/20 text-ledger-slate-soft border border-ledger-slate/40"
              : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
          }`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("income")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            type === "income"
              ? "bg-ledger-gold/20 text-ledger-gold-soft border border-ledger-gold/40"
              : "bg-ledger-surface-2 text-ledger-muted border border-transparent"
          }`}
        >
          Income
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-ledger-muted mb-1">Amount</label>
          <div className="flex gap-1.5">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="tabular font-mono w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="rounded-md bg-ledger-surface-2 border border-ledger-line px-2 text-xs text-ledger-text focus:outline-none focus:border-ledger-gold/60"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-ledger-muted mb-1">Date</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text focus:outline-none focus:border-ledger-gold/60"
          />
        </div>
      </div>

      {currency !== "PHP" && (
        <p className="text-[11px] text-ledger-muted mb-3">
          Awtomatikong ico-convert sa PHP gamit ang live exchange rate pag na-submit.
        </p>
      )}

      <div className="mb-3">
        <label className="block text-xs text-ledger-muted mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Category)}
          className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text focus:outline-none focus:border-ledger-gold/60"
        >
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="block text-xs text-ledger-muted mb-1">Note (optional)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Lunch with friends"
          className="w-full rounded-md bg-ledger-surface-2 border border-ledger-line px-3 py-2 text-sm text-ledger-text placeholder:text-ledger-muted/50 focus:outline-none focus:border-ledger-gold/60"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs text-ledger-muted mb-1">Receipt (optional)</label>
        {receiptPreview ? (
          <div className="relative inline-block">
            <img
              src={receiptPreview}
              alt="Receipt preview"
              className="h-20 w-20 object-cover rounded-md border border-ledger-line"
            />
            <button
              type="button"
              onClick={clearReceipt}
              className="absolute -top-1.5 -right-1.5 bg-ledger-bg border border-ledger-line rounded-full p-0.5 text-ledger-muted hover:text-ledger-slate-soft"
              aria-label="Remove receipt"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 rounded-md border border-dashed border-ledger-line px-3 py-2 text-xs text-ledger-muted cursor-pointer hover:border-ledger-gold/60 hover:text-ledger-text transition-colors w-fit">
            <Paperclip size={13} />
            Attach photo
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-ledger-gold text-ledger-bg font-medium py-2.5 text-sm hover:bg-ledger-gold-soft transition-colors disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Saving…
          </>
        ) : (
          <>
            <Plus size={16} />
            Add entry
          </>
        )}
      </button>
    </form>
  );
}