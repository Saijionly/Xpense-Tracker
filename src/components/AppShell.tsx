"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";
import { AppDataProvider } from "@/lib/AppDataContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/auth");

  if (isAuthPage) {
    return (
      <>
        {children}
        <ThemeToggle />
        <LanguageToggle />
      </>
    );
  }

  return (
    <AppDataProvider>
      <TopNav />
      {children}
    </AppDataProvider>
  );
}