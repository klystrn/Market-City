export interface MapFeatures {
  greenery: boolean;
  parks: boolean;
  civic: boolean;
  transit: boolean;
  context: boolean;
  labels: boolean;
  signs: boolean;
  brands: boolean;
  mountains: boolean;
  disasters: boolean;
  breadthGardens: boolean;
  connections: boolean;
  trails: boolean;
  halos: boolean;
  breadthRibbons: boolean;
  massColumns: boolean;
}
export const defaultMapFeatures: MapFeatures = {
  greenery: true,
  parks: true,
  civic: true,
  transit: true,
  context: true,
  labels: true,
  signs: true,
  brands: true,
  mountains: true,
  disasters: true,
  breadthGardens: false,
  connections: true,
  trails: false,
  halos: false,
  breadthRibbons: false,
  massColumns: false,
};
