import { Transaction } from "./types";

export interface ForecastResult {
  currentMonthSpent: number;
  projectedMonthTotal: number;
  dailyAverage: number;
  daysElapsed: number;
  daysRemaining: number;
  daysInMonth: number;
  previousMonthAverage: number;
  trend: "up" | "down" | "flat";
}

export function calculateSpendingForecast(transactions: Transaction[]): ForecastResult | null {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysElapsed = now.getDate();
  const daysRemaining = daysInMonth - daysElapsed;

  const expenses = transactions.filter((t) => t.type === "expense");

  const currentMonthSpent = expenses
    .filter((t) => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Look at the past 3 full months (excluding current) to get a stable daily average
  const pastMonthsData: { total: number; days: number }[] = [];
  for (let i = 1; i <= 3; i++) {
    const refDate = new Date(currentYear, currentMonth - i, 1);
    const refMonth = refDate.getMonth();
    const refYear = refDate.getFullYear();
    const refDaysInMonth = new Date(refYear, refMonth + 1, 0).getDate();

    const total = expenses
      .filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === refMonth && d.getFullYear() === refYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (total > 0) {
      pastMonthsData.push({ total, days: refDaysInMonth });
    }
  }

  if (pastMonthsData.length === 0 && currentMonthSpent === 0) {
    return null;
  }

  const previousMonthAverage =
    pastMonthsData.length > 0
      ? pastMonthsData.reduce((sum, m) => sum + m.total / m.days, 0) / pastMonthsData.length
      : currentMonthSpent / Math.max(daysElapsed, 1);

  const dailyAverage =
    daysElapsed > 0 ? currentMonthSpent / daysElapsed : previousMonthAverage;

  // Blend current month's pace with historical average for a more stable projection
  const blendedDailyRate =
    pastMonthsData.length > 0 ? dailyAverage * 0.6 + previousMonthAverage * 0.4 : dailyAverage;

  const projectedMonthTotal = currentMonthSpent + blendedDailyRate * daysRemaining;

  let trend: "up" | "down" | "flat" = "flat";
  if (pastMonthsData.length > 0) {
    if (dailyAverage > previousMonthAverage * 1.1) trend = "up";
    else if (dailyAverage < previousMonthAverage * 0.9) trend = "down";
  }

  return {
    currentMonthSpent,
    projectedMonthTotal,
    dailyAverage,
    daysElapsed,
    daysRemaining,
    daysInMonth,
    previousMonthAverage,
    trend,
  };
}