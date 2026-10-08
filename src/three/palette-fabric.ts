// The ordinary city's colours, kept in a plain module so they can be checked
// without loading the renderer. tests/palette.test.ts asserts every one of
// these stays clear of the green/red that encodes a company's daily move —
// a rule an earlier comment claimed but nothing enforced, while five of these
// colours in fact sat inside the encoding.
export const FABRIC_COLORS = {
  walls: [
    "#f0d9a8",
    "#e9bb8c",
    "#9fc6d8",
    "#d9a6b8",
    "#c3b6dd",
    "#f2cf7c",
    "#8fc2bd",
    "#e5b67e",
    "#aebfe0",
  ],
  roofs: ["#b78a46", "#8c6f9e", "#4f7f96", "#9c6478", "#5d7f8c", "#a8713f"],
  cars: ["#edeef0", "#7f93a8", "#d9b04a", "#4f6f8f", "#8e6fb0", "#55707a"],
  awnings: ["#dfa23f", "#4f9aa8", "#4f85b5", "#d9a441", "#a46fae"],
  // Pedestrians: muted everyday clothing, never the encoding's green or red.
  clothes: ["#3f5368", "#7a6a8f", "#c9a25a", "#5e7d8c", "#efd9a8", "#4a4a55", "#a7825e"],
  // Hulls: the ferry first (a harbour-ferry white), then working boats.
  hulls: ["#f2f0ea", "#35506b", "#c99a3f", "#5c6b78"],
  // Buses and lorries get livery colours a car would not, so a bus reads as
  // a bus from overview distance.
  buses: ["#e2b23d", "#3f6fa8"],
  trucks: ["#f1e6c6", "#6d7f8f", "#b88a4a"],
} as const;
