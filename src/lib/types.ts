export type TransactionType = "income" | "expense";
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Electronics",
  "Emergency",
  "Other",
] as const;
export const INCOME_CATEGORIES = [
  "Salary",
  "Savings",
  "Income",
] as const;
export const CATEGORIES = [
  ...EXPENSE_CATEGORIES,
  ...INCOME_CATEGORIES,
] as const;
export type Category = (typeof CATEGORIES)[number];
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // always stored in PHP (base currency)
  category: Category;
  note: string;
  date: string; // ISO date string (yyyy-mm-dd)
  createdAt: number;
  currency: string; // original currency, e.g. "USD"
  originalAmount: number | null; // original amount before conversion (null if PHP)
  exchangeRate: number | null; // rate used at time of entry (null if PHP)
  receiptUrl: string | null; // public URL of uploaded receipt photo
  tags: string[]; // free-form labels, e.g. ["work", "urgent"]
}
export interface Budget {
  id: string;
  category: Category;
  monthlyLimit: number;
}
export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  note: string;
  nextDueDate: string; // ISO date string (yyyy-mm-dd)
}
export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // ISO date string, e.g. "2026-12-31"
}
export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: string | null; // ISO date string (yyyy-mm-dd)
}