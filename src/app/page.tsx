"use client";

import { useMemo } from "react";
import { useAppData } from "@/lib/AppDataContext";
import { useLanguage } from "@/lib/LanguageContext";
import { SummaryCard } from "@/components/SummaryCard";
import { BudgetAlerts } from "@/components/BudgetAlerts";
import { RecurringReminders } from "@/components/RecurringReminders";
import { BarChart } from "@/components/BarChart";
import { CategoryChart } from "@/components/CategoryChart";
import { TrendsChart } from "@/components/TrendsChart";
import { InsightsPanel } from "@/components/InsightsPanel";
import { ForecastPanel } from "@/components/ForecastPanel";
import { RecapPanel } from "@/components/RecapPanel";
import { WelcomeGreeting } from "@/components/WelcomeGreeting";
import { RevealOnScroll } from "@/components/RevealOnScroll";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

export default function DashboardPage() {
  const { transactions, budgets, recurring, loaded } = useAppData();
  const { t } = useLanguage();

  const { income, expenses, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  if (!loaded) return null;

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ledger-text">
          Dashboard
        </h1>
        <WelcomeGreeting />
      </div>

      <BudgetAlerts budgets={budgets} transactions={transactions} />
      <RecurringReminders recurring={recurring} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <RevealOnScroll direction="up" delay={0}>
          <SummaryCard label={t("balance")} amount={balance} icon={Wallet} accent="text" />
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={80}>
          <SummaryCard label={t("incomeLabel")} amount={income} icon={TrendingUp} accent="gold" />
        </RevealOnScroll>
        <RevealOnScroll direction="up" delay={160}>
          <SummaryCard label={t("expensesLabel")} amount={expenses} icon={TrendingDown} accent="slate" />
        </RevealOnScroll>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <RevealOnScroll direction="up">
            <BarChart transactions={transactions} />
          </RevealOnScroll>
        </div>
        <RevealOnScroll direction="right">
          <CategoryChart transactions={transactions} />
        </RevealOnScroll>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevealOnScroll direction="left">
          <RecapPanel transactions={transactions} />
        </RevealOnScroll>
        <RevealOnScroll direction="right">
          <InsightsPanel transactions={transactions} />
        </RevealOnScroll>
        <RevealOnScroll direction="left">
          <ForecastPanel transactions={transactions} />
        </RevealOnScroll>
        <RevealOnScroll direction="right">
          <TrendsChart transactions={transactions} />
        </RevealOnScroll>
      </div>
    </div>
  );
}