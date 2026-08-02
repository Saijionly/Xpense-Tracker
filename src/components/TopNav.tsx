"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Landmark } from "lucide-react";
import { ProfileMenu } from "@/components/ProfileMenu";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggleInline } from "@/components/ThemeToggleInline";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts & Goals", icon: Landmark },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-ledger-line bg-ledger-surface/95 backdrop-blur">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16 gap-2">
        <div className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="Xpense logo" className="h-8 w-auto" />
          <span className="font-display text-lg font-semibold tracking-tight text-ledger-text hidden sm:inline">
            Xpense
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`flex items-center gap-2 rounded-md px-2.5 sm:px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? "bg-ledger-gold/15 text-ledger-gold-soft"
                    : "text-ledger-muted hover:text-ledger-text hover:bg-ledger-surface-2"
                }`}
              >
                <Icon size={20} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          <ThemeToggleInline />
          <NotificationBell />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}