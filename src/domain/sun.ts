// Where the sun sits over the city at a given simulated time.
//
// This is a stylised arc, not an ephemeris: none of the three cities is
// georeferenced, so there is no true north to measure a real azimuth against.
// What it keeps from the real thing is what a reader notices — the sun is low
// and casts long shadows near the open and the close, stands highest around
// the middle of the session, and comes up on one side of the city and goes
// down on the other.
//
// It reads the clock, never the market. Shadows lengthen because the session
// is ending, not because the index is falling; tying light to performance
// would make a bad day look like evening (the same rule as §75.13's lights).

/** First and last minute (ET) the sun is drawn above the horizon. */
export const SUNRISE = 6 * 60 + 30;
export const SUNSET = 19 * 60 + 30;
/** The lowest elevation drawn while the sun is up, in radians. Lower than this
 *  and shadows run off the map rather than across the street. */
const MIN_ELEVATION = (16 * Math.PI) / 180;
// Kept below the real summer noon: a higher sun tucks a low city's shadows
// under its own neighbours, and Tokyo's dense blocks then read as unlit.
const MAX_ELEVATION = (48 * Math.PI) / 180;
// Where the sun stands relative to the opening camera. A sun behind the
// viewer — where the city's original fixed light sat for New York — throws
// every shadow behind its own building, out of sight. So at midday the sun is
// off to the side and a little behind the city, and the arc swings from
// nearly front-lit in the morning to back-lit near the close, when the long
// shadows reach toward the viewer across the streets.
const NOON_OFFSET = (110 * Math.PI) / 180;
const SWING = (55 * Math.PI) / 180;

export interface Sun {
  /** Whether the sun is drawn at all. */
  up: boolean;
  /** 0 at sunrise, 1 at sunset. */
  progress: number;
  /** Radians above the horizon. */
  elevation: number;
  /** Unit vector from the ground toward the sun, in world X, Y (up), Z. */
  direction: [number, number, number];
}

/** Compass angle, in the ground plane, of a camera offset from its target. */
export function viewAzimuth(offset: [number, number, number]): number {
  return Math.atan2(offset[2], offset[0]);
}

export function sunAt(etMinute: number, cameraAzimuth = 0): Sun {
  const minute = ((etMinute % 1440) + 1440) % 1440;
  const progress = (minute - SUNRISE) / (SUNSET - SUNRISE);
  const up = progress >= 0 && progress <= 1;
  const t = Math.min(1, Math.max(0, progress));
  const elevation =
    MIN_ELEVATION + (MAX_ELEVATION - MIN_ELEVATION) * Math.sin(t * Math.PI);
  const azimuth = cameraAzimuth + NOON_OFFSET + (t - 0.5) * 2 * SWING;
  const flat = Math.cos(elevation);
  return {
    up,
    progress: t,
    elevation,
    direction: [
      Math.cos(azimuth) * flat,
      Math.sin(elevation),
      Math.sin(azimuth) * flat,
    ],
  };
}

/** How far a shadow reaches per unit of height. Infinite for a set sun. */
export function shadowLength(sun: Sun): number {
  return sun.up ? 1 / Math.tan(sun.elevation) : Infinity;
}
