import { Html, QuadraticBezierLine } from "@react-three/drei";
import type { Plot } from "@/domain/types";
import { linksFor, partnerOf } from "@/domain/supply-chain";
export default function SupplyChainLines({
  plots,
  selected,
  dark,
  onSelect,
}: {
  plots: Plot[];
  selected: string | null;
  dark: boolean;
  onSelect: (ticker: string) => void;
}) {
  if (!selected) return null;
  const origin = plots.find((p) => p.ticker === selected);
  if (!origin) return null;
  const links = linksFor(selected);
  return (
    <>
      {links.map((link) => {
        const partner = partnerOf(link, selected);
        const target = plots.find((p) => p.ticker === partner);
        if (!target) return null;
        const mid: [number, number, number] = [
          (origin.x + target.x) / 2,
          Math.max(origin.height, target.height) * 0.55 + 16,
          (origin.z + target.z) / 2,
        ];
        return (
          <group key={`${link.a}-${link.b}`}>
            <QuadraticBezierLine
              start={[origin.x, origin.height * 0.55 + 2, origin.z]}
              end={[target.x, target.height * 0.55 + 2, target.z]}
              mid={mid}
              color={dark ? "#e7d8a6" : "#3b6b52"}
              lineWidth={1.6}
              dashed
              dashScale={2.4}
              transparent
              opacity={0.8}
            />
            <Html position={mid} center zIndexRange={[3, 0]}>
              <button
                className="supply-chain-chip"
                onClick={() => onSelect(partner)}
                title={link.label}
              >
                {partner}
                <small>{link.label}</small>
              </button>
            </Html>
          </group>
        );
      })}
    </>
  );
}
