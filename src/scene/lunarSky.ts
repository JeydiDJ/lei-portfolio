export type LunarSky = {
  direction: [number, number, number];
  illumination: number;
  phase: number;
  elevation: number;
};

/** Low-order lunar ephemeris for the visual sky, not navigation.
 * Dominant lunar longitude/latitude terms and equatorial-to-horizontal rotation.
 * Phase is derived from Sun–Moon elongation, rather than a repeating animation.
 */
export function lunarSky(
  now = new Date(),
  latitude = 14.6,
  longitude = 120.98,
): LunarSky {
  const rad = Math.PI / 180;
  const days = now.getTime() / 86400000 + 2440587.5 - 2451545;
  const obliquity = (23.4393 - days * 0.00000036) * rad;
  const solarAnomaly = (357.5291 + 0.98560028 * days) * rad;
  const solarLongitude =
    solarAnomaly +
    (1.9148 * Math.sin(solarAnomaly) +
      0.02 * Math.sin(2 * solarAnomaly) +
      0.0003 * Math.sin(3 * solarAnomaly)) *
      rad +
    (102.9372 + 180) * rad;
  const lunarAnomaly = (134.963 + 13.064993 * days) * rad;
  const meanLongitude = (218.316 + 13.176396 * days) * rad;
  const argumentLatitude = (93.272 + 13.22935 * days) * rad;
  const lunarLongitude = meanLongitude + 6.289 * rad * Math.sin(lunarAnomaly);
  const lunarLatitude = 5.128 * rad * Math.sin(argumentLatitude);
  const equatorial = (lon: number, lat: number) => ({
    ra: Math.atan2(
      Math.sin(lon) * Math.cos(obliquity) - Math.tan(lat) * Math.sin(obliquity),
      Math.cos(lon),
    ),
    dec: Math.asin(
      Math.sin(lat) * Math.cos(obliquity) +
        Math.cos(lat) * Math.sin(obliquity) * Math.sin(lon),
    ),
  });
  const moon = equatorial(lunarLongitude, lunarLatitude);
  const sun = equatorial(solarLongitude, 0);
  const separation =
    Math.sin(sun.dec) * Math.sin(moon.dec) +
    Math.cos(sun.dec) * Math.cos(moon.dec) * Math.cos(sun.ra - moon.ra);
  const illumination = (1 - Math.max(-1, Math.min(1, separation))) / 2;
  const phase =
    ((((lunarLongitude - solarLongitude) / (2 * Math.PI)) % 1) + 1) % 1;
  const hourAngle = (280.16 + 360.9856235 * days + longitude) * rad - moon.ra;
  const lat = latitude * rad;
  const east = -Math.cos(moon.dec) * Math.sin(hourAngle);
  const north =
    Math.cos(lat) * Math.sin(moon.dec) -
    Math.sin(lat) * Math.cos(moon.dec) * Math.cos(hourAngle);
  const up =
    Math.sin(lat) * Math.sin(moon.dec) +
    Math.cos(lat) * Math.cos(moon.dec) * Math.cos(hourAngle);
  return {
    direction: [-east, up, north],
    illumination,
    phase,
    elevation: Math.asin(Math.max(-1, Math.min(1, up))) / rad,
  };
}
