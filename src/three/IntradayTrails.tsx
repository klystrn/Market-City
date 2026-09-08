import { useMemo } from "react";
import { CatmullRomLine } from "@react-three/drei";
import type { Company, Plot } from "@/domain/types";
import { performanceColor } from "@/domain/city";
import { useIntradayTrails } from "@/hooks/useIntradayTrails";
// A floating price ribbon beside each highlighted building, tracing a
// deterministic synthetic intraday shape from the open to the current
// price. Illustrative session texture, not real tick data.
export default function IntradayTrails({
  plots,
  companies,
  minute,
  dark,
}: {
  plots: Plot[];
  companies: Company[];
  minute: number;
  dark: boolean;
}) {
  const tracked = useMemo(() => companies.slice(0, 5), [companies]);
  const trails = useIntradayTrails(tracked, minute);
  return (
    <>
      {tracked.map((c) => {
        const plot = plots.find((p) => p.ticker === c.ticker);
        const points = trails[c.ticker];
        if (!plot || !points || points.length < 2) return null;
        const prices = points.map((p) => p.price);
        const min = Math.min(...prices),
          max = Math.max(...prices),
          span = max - min || 1;
        const x0 = plot.x + plot.width / 2 + 1.4;
        const path = points.map((p, i): [number, number, number] => [
          x0,
          1.3 + ((p.price - min) / span) * (plot.height * 0.7 + 2),
          plot.z - plot.depth / 2 + (i / (points.length - 1)) * plot.depth,
        ]);
        return (
          <CatmullRomLine
            key={c.ticker}
            points={path}
            color={performanceColor(c.changePercent, dark)}
            lineWidth={1.8}
            transparent
            opacity={0.85}
          />
        );
      })}
    </>
  );
}
