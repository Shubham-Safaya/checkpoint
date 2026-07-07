import { DEFAULT_FX_RATE } from "../siteConfig";

const FX_KEY = "checkpoint.fx.v1";

export function getFxRate(): number {
  const v = Number(localStorage.getItem(FX_KEY));
  return v > 0 ? v : DEFAULT_FX_RATE;
}

export function setFxRate(rate: number) {
  if (rate > 0) localStorage.setItem(FX_KEY, String(rate));
}

/** Indian digit grouping: ₹1,20,00,000. Compact: ₹1.2 Cr / ₹45 L. */
export function formatINR(amount: number, compact = false): string {
  if (compact) {
    if (Math.abs(amount) >= 1e7) return `₹${trim(amount / 1e7)} Cr`;
    if (Math.abs(amount) >= 1e5) return `₹${trim(amount / 1e5)} L`;
  }
  return `₹${new Intl.NumberFormat("en-IN").format(Math.round(amount))}`;
}

function trim(n: number): string {
  return (Math.round(n * 10) / 10).toString();
}

export function usdToInr(usd: number): number {
  return usd * getFxRate();
}
