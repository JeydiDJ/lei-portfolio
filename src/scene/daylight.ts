/** Manila is the daylight reference for the Philippine-time studio clock.
 * Approximate solar position: NOAA general solar position equations.
 * https://gml.noaa.gov/grad/solcalc/solareqns.PDF
 */
export const DAYLIGHT_LOCATION = { latitude: 14.6, longitude: 120.98 };
const radians = Math.PI / 180;
const smooth = (a: number, b: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function philippineDaylight(now = new Date()) {
  const year = now.getUTCFullYear();
  const yearStart = Date.UTC(year, 0, 1);
  const daysInYear = (Date.UTC(year + 1, 0, 1) - yearStart) / 86_400_000;
  const day = Math.floor((now.getTime() - yearStart) / 86_400_000) + 1;
  const utcHours =
    now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const gamma = ((2 * Math.PI) / daysInYear) * (day - 1 + (utcHours - 12) / 24);
  const equation =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma));
  const declination =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const solarMinutes =
    (((utcHours * 60 + equation + 4 * DAYLIGHT_LOCATION.longitude) % 1440) +
      1440) %
    1440;
  const hourAngle = (solarMinutes / 4 - 180) * radians;
  const latitude = DAYLIGHT_LOCATION.latitude * radians;
  // Local east / up / north components avoid an azimuth singularity at noon.
  const east = -Math.cos(declination) * Math.sin(hourAngle);
  const north =
    Math.cos(latitude) * Math.sin(declination) -
    Math.sin(latitude) * Math.cos(declination) * Math.cos(hourAngle);
  const up =
    Math.sin(latitude) * Math.sin(declination) +
    Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle);
  const elevation = Math.asin(Math.max(-1, Math.min(1, up))) / radians;
  const night = 1 - smooth(-8, 6, elevation);
  const twilight = smooth(-10, -3, elevation) * (1 - smooth(4, 16, elevation));
  const phase =
    elevation >= 6
      ? "Daylight"
      : elevation <= -8
        ? "Night"
        : solarMinutes < 720
          ? "Sunrise"
          : "Sunset";
  const azimuth = (Math.atan2(east, north) / radians + 360) % 360;
  // The studio's window faces south (-Z); north is +Z and east is -X.
  // This orientation stays fixed: the sun can move behind the room in summer.
  const sunDirection: [number, number, number] = [-east, up, north];
  return { night, twilight, elevation, azimuth, sunDirection, phase };
}
