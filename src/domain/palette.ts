// Which colours the city is allowed to paint scenery, and why.
//
// Exactly one thing in Market City encodes the daily move: a company building's
// colour, green up and red down, neutral grey when flat. Every other coloured
// surface — foliage, walls, roofs, awnings, parked cars — is decoration, and a
// decoration that lands on the signal's colour makes the signal ambiguous. An
// orange autumn tree beside a falling building is not a small aesthetic problem;
// a reader glancing at the district cannot tell which of the two is data.
//
// This module makes that a rule the code checks rather than a claim a comment
// makes. `tests/palette.test.ts` walks every scenery palette in the app and
// fails if one strays into the encoding.
/** The ends of the performance ramp, from `performanceColor`. */
const DIRECTIONAL: [number, number, number][] = [
  [104, 184, 137], // weakest advance
  [17, 143, 100], // strongest advance
  [231, 136, 118], // weakest decline
  [213, 62, 69], // strongest decline
];
/** The "no meaningful change" greys, light and dark theme. */
const NEUTRAL: [number, number, number][] = [
  [194, 199, 187],
  [147, 154, 144],
];
/**
 * Minimum perceptual distance from green or red. Scenery closer than this can
 * be mistaken for a company that is moving, which is the misreading that
 * matters.
 */
export const DIRECTIONAL_CLEARANCE = 25;
/**
 * Minimum distance from the flat grey. Deliberately lower: being mistaken for a
 * company that is *not* moving is a far milder error than being mistaken for one
 * that is, and holding scenery 25 away from grey would outlaw every pale or
 * desaturated colour — frost, stone, concrete, an overcast road.
 */
export const NEUTRAL_CLEARANCE = 12;
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
/** CIE L*a*b*, so distances approximate what the eye actually separates. */
function toLab([r, g, b]: [number, number, number]): [number, number, number] {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  const z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
/**
 * CIE76 difference. Not the most refined formula, but the question here is
 * "could these two be confused at a glance", which it answers well enough, and
 * it is simple enough to be obviously correct.
 */
export function colorDistance(a: string, b: string): number {
  const [l1, a1, b1] = toLab(hexToRgb(a));
  const [l2, a2, b2] = toLab(hexToRgb(b));
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}
const toHex = (c: [number, number, number]) =>
  "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
/** How far a scenery colour sits from the nearest green or red of the encoding. */
export function directionalClearance(hex: string): number {
  return Math.min(...DIRECTIONAL.map((c) => colorDistance(hex, toHex(c))));
}
/** How far it sits from the flat grey. */
export function neutralClearance(hex: string): number {
  return Math.min(...NEUTRAL.map((c) => colorDistance(hex, toHex(c))));
}
