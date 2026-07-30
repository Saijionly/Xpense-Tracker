import { Category, CATEGORIES, Transaction, TransactionType } from "@/lib/types";

export interface ParsedRow {
  type: TransactionType;
  amount: number;
  category: Category;
  note: string;
  date: string;
  valid: boolean;
  error?: string;
}

function normalizeCategory(raw: string): Category | null {
  const match = CATEGORIES.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  return match ?? null;
}

function normalizeDate(raw: string): string | null {
  const trimmed = raw.trim();
  // Accept yyyy-mm-dd directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  // Try parsing other common formats (mm/dd/yyyy, etc.)
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

// Expects CSV with header row: Date,Type,Category,Note,Amount
export function parseTransactionsCSV(csvText: string): ParsedRow[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length < 2) return [];

  const rows = lines.slice(1); // skip header
  return rows.map((line) => {
    // Basic CSV split that respects quoted commas
    const cols = line.match(/(".*?"|[^",]+)(?=,|$)/g)?.map((c) => c.replace(/^"|"$/g, "").replace(/""/g, '"')) ?? [];
    const [dateRaw, typeRaw, categoryRaw, noteRaw, amountRaw] = cols;

    const date = normalizeDate(dateRaw ?? "");
    const type = (typeRaw ?? "").trim().toLowerCase() as TransactionType;
    const category = normalizeCategory(categoryRaw ?? "");
    const amount = parseFloat((amountRaw ?? "").trim());
    const note = (noteRaw ?? "").trim();

    if (!date) return { type: "expense", amount: 0, category: "Other", note, date: "", valid: false, error: "Invalid date" };
    if (type !== "income" && type !== "expense")
      return { type: "expense", amount: 0, category: "Other", note, date, valid: false, error: "Type must be income or expense" };
    if (!category)
      return { type, amount: 0, category: "Other", note, date, valid: false, error: "Unknown category" };
    if (!amount || amount <= 0)
      return { type, amount: 0, category, note, date, valid: false, error: "Invalid amount" };

    return { type, amount, category, note, date, valid: true };
  });
}