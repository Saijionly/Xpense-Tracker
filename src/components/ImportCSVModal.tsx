"use client";

import { useState } from "react";
import { parseTransactionsCSV, ParsedRow } from "@/lib/csvImport";
import { Transaction } from "@/lib/types";
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ImportCSVModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (t: Omit<Transaction, "id" | "createdAt">) => Promise<void> | void;
}

export function ImportCSVModal({ open, onClose, onImport }: ImportCSVModalProps) {
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setDone(false);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRows(parseTransactionsCSV(text));
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setImporting(true);
    const validRows = rows.filter((r) => r.valid);
    for (const r of validRows) {
      await onImport({
        type: r.type,
        amount: r.amount,
        category: r.category,
        note: r.note,
        date: r.date,
        currency: "PHP",
        originalAmount: null,
        exchangeRate: null,
        receiptUrl: null,
        tags: [],
      });
    }
    setImporting(false);
    setDone(true);
  }

  function handleClose() {
    setRows([]);
    setFileName("");
    setDone(false);
    onClose();
  }

  const validCount = rows.filter((r) => r.valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-lg border border-ledger-line bg-ledger-surface p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ledger-muted">
            Import CSV
          </h2>
          <button onClick={handleClose} className="text-ledger-muted hover:text-ledger-text transition-colors">
            <X size={18} />
          </button>
        </div>

        {rows.length === 0 ? (
          <>
            <p className="text-xs text-ledger-muted mb-3">
              Expected columns (with header row): <strong>Date, Type, Category, Note, Amount</strong>
              <br />
              Example: <code>2026-07-30,expense,Food,Lunch,250.00</code>
            </p>
            <label className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-ledger-line px-4 py-8 text-sm text-ledger-muted cursor-pointer hover:border-ledger-gold/60 hover:text-ledger-text transition-colors">
              <Upload size={20} />
              Click to choose a CSV file
              <input type="file" accept=".csv" onChange={handleFile} className="hidden" />
            </label>
          </>
        ) : done ? (
          <div className="text-center py-6">
            <CheckCircle2 size={32} className="text-ledger-gold mx-auto mb-2" />
            <p className="text-sm text-ledger-text">
              Imported {validCount} transaction{validCount !== 1 ? "s" : ""} successfully.
            </p>
            <button
              onClick={handleClose}
              className="mt-4 rounded-md bg-ledger-gold text-ledger-bg font-medium py-2 px-4 text-sm hover:bg-ledger-gold-soft transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-ledger-muted mb-3">
              {fileName} — <span className="text-ledger-gold-soft">{validCount} valid</span>
              {invalidCount > 0 && (
                <span className="text-red-400"> · {invalidCount} skipped (errors)</span>
              )}
            </p>
            <div className="max-h-60 overflow-y-auto border border-ledger-line rounded-md divide-y divide-ledger-line mb-4">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {r.valid ? (
                      <CheckCircle2 size={12} className="text-ledger-gold shrink-0" />
                    ) : (
                      <AlertCircle size={12} className="text-red-400 shrink-0" />
                    )}
                    <span className="text-ledger-text truncate">
                      {r.date || "?"} · {r.category} · {r.note || "(no note)"}
                    </span>
                  </div>
                  {r.valid ? (
                    <span className="text-ledger-muted shrink-0">₱{r.amount.toLocaleString()}</span>
                  ) : (
                    <span className="text-red-400 shrink-0">{r.error}</span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex-1 rounded-md bg-ledger-surface-2 text-ledger-muted font-medium py-2.5 text-sm hover:text-ledger-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validCount === 0 || importing}
                className="flex-1 flex items-center justify-center gap-2 rounded-md bg-ledger-gold text-ledger-bg font-medium py-2.5 text-sm hover:bg-ledger-gold-soft transition-colors disabled:opacity-60"
              >
                {importing ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Importing…
                  </>
                ) : (
                  `Import ${validCount} entries`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}