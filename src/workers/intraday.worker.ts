import type { IntradayCompanyInput, IntradayPoint } from "@/domain/intraday";
export interface IntradayWorkerRequest {
  requestId: number;
  companies: IntradayCompanyInput[];
  minute: number;
}
export interface IntradayWorkerResponse {
  requestId: number;
  trails: Record<string, IntradayPoint[]>;
}
type WorkerScope = {
  onmessage: ((event: { data: IntradayWorkerRequest }) => void) | null;
  postMessage: (message: IntradayWorkerResponse) => void;
};
// Self-contained worker body, duplicating the pure math from
// domain/computeIntradayTrail rather than importing it: this project's
// static export build (Turbopack) does not compile a file referenced via
// `new Worker(new URL("./x.ts", import.meta.url))` — it copies the raw .ts
// source as a static asset, which the browser cannot execute. Stringifying
// this single, fully self-contained function into a Blob worker sidesteps
// that bundler pipeline entirely. Kept in sync with domain/intraday.ts by
// the shared-output test in tests/new-features.test.ts.
export function runIntradayWorker(scope: WorkerScope) {
  const OPEN_MINUTE = 570;
  const CLOSE_MINUTE = 960;
  function hashSeed(s: string): number {
    let h = 17;
    for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return h;
  }
  function mulberry32(seed: number) {
    let a = seed;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function computeIntradayTrail(
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
  scope.onmessage = (event) => {
    const { requestId, companies, minute } = event.data;
    const trails: Record<string, IntradayPoint[]> = {};
    for (const c of companies) trails[c.ticker] = computeIntradayTrail(c, minute);
    scope.postMessage({ requestId, trails });
  };
}
export function createIntradayWorker(): Worker {
  const source = `(${runIntradayWorker.toString()})(self);`;
  const blob = new Blob([source], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url);
  URL.revokeObjectURL(url);
  return worker;
}
