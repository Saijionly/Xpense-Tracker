export type TransactionType = "income" | "expense";
export const CATEGORIES = [
  "Food",
  "Transport",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Savings",
  "Salary",
  "Freelance",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];
export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  note: string;
  date: string; // ISO date string (yyyy-mm-dd)
  createdAt: number;
}
export interface Budget {
  id: string;
  category: Category;
  monthlyLimit: number;
}