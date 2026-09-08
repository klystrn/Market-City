import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
export type QualityTier = 0 | 1 | 2;
// Watches rendered-frame timing (only frames that actually happen, since the
// scene uses frameloop="demand") and reports a coarser quality tier when the
// device is struggling, so the caller can trim dpr and optional layers
// instead of staying locked to a fixed effects budget.
export default function PerformanceMonitor({
  onTier,
}: {
  onTier: (tier: QualityTier) => void;
}) {
  const samples = useRef<number[]>([]);
  const tier = useRef<QualityTier>(0);
  useFrame((_, delta) => {
    if (delta <= 0) return;
    samples.current.push(delta);
    if (samples.current.length > 24) samples.current.shift();
    if (samples.current.length < 10) return;
    const avg =
      samples.current.reduce((a, b) => a + b, 0) / samples.current.length;
    const fps = 1 / avg;
    let next = tier.current;
    if (fps < 24 && tier.current < 2) next = (tier.current + 1) as QualityTier;
    else if (fps > 48 && tier.current > 0)
      next = (tier.current - 1) as QualityTier;
    if (next !== tier.current) {
      tier.current = next;
      samples.current = [];
      onTier(next);
    }
  });
  return null;
}
