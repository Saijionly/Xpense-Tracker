import { Transaction } from "@/lib/types";

export function exportTransactionsToCSV(transactions: Transaction[]) {
  if (transactions.length === 0) return;

  const headers = ["Date", "Type", "Category", "Note", "Amount"];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    t.category,
    `"${(t.note ?? "").replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
  ]);

  const csvContent = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `xpense-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTransactionsToPDF(transactions: Transaction[]) {
  if (transactions.length === 0) return;

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const rows = sorted
    .map(
      (t) => `
        <tr>
          <td>${t.date}</td>
          <td style="text-transform:capitalize">${t.type}</td>
          <td>${t.category}</td>
          <td>${(t.note ?? "").replace(/</g, "&lt;")}</td>
          <td style="text-align:right; color:${t.type === "income" ? "#1a7f37" : "#b3261e"}">
            ${t.type === "income" ? "+" : "-"}₱${t.amount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </td>
        </tr>`,
    )
    .join("");

  const totalIncome = sorted.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = sorted.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const win = window.open("", "_blank");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Xpense Transactions</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #1a212b; }
          h1 { font-size: 18px; margin-bottom: 4px; }
          p.sub { color: #6b7280; font-size: 12px; margin-top: 0; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
          th { background: #f3f4f6; text-transform: uppercase; font-size: 10px; letter-spacing: 0.05em; }
          .summary { margin-top: 20px; font-size: 13px; }
          .summary span { display: inline-block; margin-right: 24px; }
        </style>
      </head>
      <body>
        <h1>Xpense — Transaction Report</h1>
        <p class="sub">Generated on ${new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</p>
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Category</th><th>Note</th><th style="text-align:right">Amount</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="summary">
          <span><strong>Total Income:</strong> ₱${totalIncome.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
          <span><strong>Total Expenses:</strong> ₱${totalExpenses.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
          <span><strong>Net Balance:</strong> ₱${(totalIncome - totalExpenses).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</span>
        </div>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}