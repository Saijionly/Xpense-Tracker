"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/LanguageContext";

interface WelcomeGreetingProps {
  showName?: boolean;
}

export function WelcomeGreeting({ showName = true }: WelcomeGreetingProps) {
  const supabase = createClient();
  const { t } = useLanguage();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!showName) return;
    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? null;
      setName(email ? email.split("@")[0] : null);
    });
  }, [supabase, showName]);

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "greetingMorning" : hour < 18 ? "greetingAfternoon" : "greetingEvening";

  return (
    <p className="text-xs text-ledger-muted mt-0.5">
      {t(greetingKey)}
      {showName && name ? `, ${name}` : ""}!
    </p>
  );
}