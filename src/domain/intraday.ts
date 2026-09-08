import type { Company } from "./types";
export interface IntradayPoint {
  minute: number;
  price: number;
}
export type IntradayCompanyInput = Pick<
  Company,
  "ticker" | "previousClose" | "price" | "updatedAt"
>;
const OPEN_MINUTE = 570; // 09:30 ET
const CLOSE_MINUTE = 960; // 16:00 ET
export function hashSeed(s: string): number {
  return [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 17);
}
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// A deterministic, seeded random-bridge path from the previous close (at the
// 09:30 ET open) to the current price at `minute`. This is an illustrative
// synthetic intraday shape for the "performance trail" visual layer, not
// real tick data — this offline demo has no access to intraday quotes.
export function computeIntradayTrail(
  company: IntradayCompanyInput,
  minute: number,
): IntradayPoint[] {
  const rand = mulberry32(
    hashSeed(company.ticker + company.updatedAt.slice(0, 10)),
  );
  const end = Math.min(CLOSE_MINUTE, Math.max(OPEN_MINUTE + 10, minute));
  const steps = Math.max(4, Math.min(48, Math.round((end - OPEN_MINUTE) / 10)));
  const start = company.previousClose || company.price || 1;
  const finish = company.price;
  const vol =
    Math.max(0.002, Math.abs(finish - start) / Math.max(1, start)) *
    start *
    0.4;
  const points: IntradayPoint[] = [];
  let noise = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    noise = (noise + (rand() - 0.5) * vol) * (1 - t * 0.12);
    const drift = start + (finish - start) * t;
    const price =
      i === 0 ? start : i === steps ? finish : drift + noise * t * (1 - t) * 4;
    points.push({
      minute: Math.round(OPEN_MINUTE + (end - OPEN_MINUTE) * t),
      price: Number(price.toFixed(2)),
    });
  }
  return points;
}
// Minutes since midnight ET, using the same fixed UTC−4 convention as the
// God simulation clock (applyGod in simulation.ts).
export function etMinuteOfIso(iso: string): number {
  const d = new Date(iso);
  return (
    (((d.getUTCHours() * 60 + d.getUTCMinutes() - 240) % 1440) + 1440) % 1440
  );
}
export function computeAllIntradayTrails(
  companies: IntradayCompanyInput[],
  minute: number,
): Record<string, IntradayPoint[]> {
  const out: Record<string, IntradayPoint[]> = {};
  for (const c of companies) out[c.ticker] = computeIntradayTrail(c, minute);
  return out;
}
