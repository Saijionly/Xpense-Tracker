import { CATEGORIES, Category, TransactionType } from "@/lib/types";

export interface QuickAddResult {
  amount: number;
  category: Category;
  note: string;
  type: TransactionType;
}

const INCOME_HINTS = ["salary", "income", "received", "bonus", "refund"];

// Parses simple inputs like "300 grocery" or "1500 salary bonus" into form fields.
export function parseQuickAdd(input: string): QuickAddResult | null {
  const text = input.trim();
  if (!text) return null;

  const amountMatch = text.match(/(\d+(\.\d+)?)/);
  if (!amountMatch) return null;
  const amount = parseFloat(amountMatch[1]);
  if (!amount || amount <= 0) return null;

  const rest = text.replace(amountMatch[1], "").trim();
  const words = rest.split(/\s+/).filter(Boolean);

  const type: TransactionType = words.some((w) => INCOME_HINTS.includes(w.toLowerCase()))
    ? "income"
    : "expense";

  let category = CATEGORIES.find(
    (c) =>
      words.some((w) => w.toLowerCase() === c.toLowerCase()) ||
      words.some((w) => c.toLowerCase().includes(w.toLowerCase()) && w.length > 2),
  );

  if (!category) category = type === "income" ? "Income" : "Other";

  const note = words.join(" ");

  return { amount, category, note, type };
}