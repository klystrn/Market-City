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
};
