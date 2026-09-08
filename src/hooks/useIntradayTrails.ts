"use client";
import { useEffect, useRef, useState } from "react";
import {
  computeAllIntradayTrails,
  type IntradayCompanyInput,
  type IntradayPoint,
} from "@/domain/intraday";
import {
  createIntradayWorker,
  type IntradayWorkerResponse,
} from "@/workers/intraday.worker";
// Runs the synthetic intraday-trail computation off the main thread via a
// Web Worker (falling back to a synchronous compute if Workers are
// unavailable), so dragging the God panel's session-minute slider or
// switching companies never blocks rendering or input.
export function useIntradayTrails(
  companies: IntradayCompanyInput[],
  minute: number,
) {
  const [trails, setTrails] = useState<Record<string, IntradayPoint[]>>({});
  const worker = useRef<Worker | null>(null);
  const requestId = useRef(0);
  useEffect(() => {
    if (typeof Worker === "undefined") return;
    try {
      const instance = createIntradayWorker();
      instance.onmessage = (event: MessageEvent<IntradayWorkerResponse>) => {
        if (event.data.requestId !== requestId.current) return;
        setTrails(event.data.trails);
      };
      worker.current = instance;
    } catch {
      worker.current = null;
    }
    return () => {
      worker.current?.terminate();
      worker.current = null;
    };
  }, []);
  const key =
    companies.map((c) => `${c.ticker}:${c.price}:${c.previousClose}`).join("|") +
    `@${minute}`;
  useEffect(() => {
    requestId.current += 1;
    const id = requestId.current;
    if (worker.current) {
      worker.current.postMessage({ requestId: id, companies, minute });
      return;
    }
    const timer = setTimeout(
      () => setTrails(computeAllIntradayTrails(companies, minute)),
      0,
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` already encodes every input.
  }, [key, minute]);
  return trails;
}
