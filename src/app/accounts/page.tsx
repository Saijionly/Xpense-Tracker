"use client";

import { useAppData } from "@/lib/AppDataContext";
import { WalletManager } from "@/components/WalletManager";
import { BudgetPanel } from "@/components/BudgetPanel";
import { DebtTracker } from "@/components/DebtTracker";
import { LoanCalculator } from "@/components/LoanCalculator";
import { RecurringPanel } from "@/components/RecurringPanel";
import { SavingsGoals } from "@/components/SavingsGoals";
import { RevealOnScroll } from "@/components/RevealOnScroll";

export default function AccountsPage() {
  const {
    transactions,
    wallets,
    addWallet,
    deleteWallet,
    budgets,
    setBudget,
    deleteBudget,
    recurring,
    addRecurring,
    updateRecurring,
    deleteRecurring,
    markRecurringPaid,
    debts,
    addDebt,
    addPayment,
    deleteDebt,
    loaded,
  } = useAppData();

  if (!loaded) return null;

  return (
    <div className="min-h-full">
      <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="font-display text-xl font-semibold tracking-tight text-ledger-text">
            Accounts & Goals
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevealOnScroll direction="left">
            <WalletManager
              wallets={wallets}
              transactions={transactions}
              onAdd={addWallet}
              onDelete={deleteWallet}
            />
          </RevealOnScroll>
          <RevealOnScroll direction="right">
            <SavingsGoals />
          </RevealOnScroll>
          <RevealOnScroll direction="left">
            <BudgetPanel
              budgets={budgets}
              transactions={transactions}
              onSet={setBudget}
              onDelete={deleteBudget}
            />
          </RevealOnScroll>
          <RevealOnScroll direction="right">
            <LoanCalculator />
          </RevealOnScroll>
          <div className="lg:col-span-2">
            <RevealOnScroll direction="up">
              <DebtTracker debts={debts} onAdd={addDebt} onPay={addPayment} onDelete={deleteDebt} />
            </RevealOnScroll>
          </div>
          <div className="lg:col-span-2">
            <RevealOnScroll direction="up">
              <RecurringPanel
                recurring={recurring}
                onAdd={addRecurring}
                onUpdate={updateRecurring}
                onDelete={deleteRecurring}
                onMarkPaid={markRecurringPaid}
              />
            </RevealOnScroll>
          </div>
        </div>
      </main>
    </div>
  );
}