export const SUPPORTED_CURRENCIES = ["PHP", "USD", "EUR", "GBP", "JPY", "AUD", "SGD", "KRW"] as const;
export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

// Fetches how much 1 unit of `from` currency is worth in PHP.
// Uses Frankfurter (free, no API key needed).
export async function getExchangeRateToPHP(from: CurrencyCode): Promise<number> {
  if (from === "PHP") return 1;

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=PHP`);
    if (!res.ok) throw new Error("Rate fetch failed");
    const data = await res.json();
    const rate = data?.rates?.PHP;
    if (!rate) throw new Error("No PHP rate in response");
    return rate;
  } catch {
    // Fallback so the form never fully breaks if the API is down.
    return 1;
  }
}