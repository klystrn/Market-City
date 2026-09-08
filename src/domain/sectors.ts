import type { Sector } from "./types";
import { sectors } from "./geography";
export type SectorIdentity = Omit<Sector, "x" | "z" | "width" | "depth">;
// Sector identity (id, name, colour) is shared by every city; only the geometry
// differs. Tokyo's list stays the single source of the eleven GICS sectors.
export const sectorIdentities: SectorIdentity[] = sectors.map(
  ({ id, name, short, color }) => ({ id, name, short, color }),
);
export const sectorName = (id: string) =>
  sectorIdentities.find((s) => s.id === id)?.short ?? id;
