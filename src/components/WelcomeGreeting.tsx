"use client";

import { useAppData } from "@/lib/AppDataContext";
import { useLanguage } from "@/lib/LanguageContext";

interface WelcomeGreetingProps {
  showName?: boolean;
}

export function WelcomeGreeting({ showName = true }: WelcomeGreetingProps) {
  const { profile } = useAppData();
  const { t } = useLanguage();

  const displayName = profile.fullName || profile.email?.split("@")[0] || null;

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";

  return (
    <p className="text-xs text-ledger-muted mt-0.5">
      {t(greetingKey)}
      {showName && displayName ? `, ${displayName}` : ""}!
    </p>
  );
}