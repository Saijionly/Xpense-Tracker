import { LucideIcon } from "lucide-react";

interface SummaryCardProps {
  label: string;
  amount: number;
  icon: LucideIcon;
  accent: "gold" | "slate" | "text";
}

const accentClasses: Record<SummaryCardProps["accent"], string> = {
  gold: "text-ledger-gold-soft",
  slate: "text-ledger-slate-soft",
  text: "text-ledger-text",
};

export function SummaryCard({ label, amount, icon: Icon, accent }: SummaryCardProps) {
  const formatted = amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  });

  return (
    <div className="rounded-lg border border-ledger-line bg-ledger-surface p-5 flex items-start justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-ledger-muted mb-2">{label}</p>
        <p className={`tabular font-mono text-2xl font-medium ${accentClasses[accent]}`}>
          {formatted}
        </p>
      </div>
      <div className="rounded-md bg-ledger-surface-2 p-2">
        <Icon size={18} className="text-ledger-muted" />
      </div>
    </div>
  );
}
