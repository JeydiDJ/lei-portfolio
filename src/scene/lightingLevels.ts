/** Blinds attenuate daylight; the indoor fixtures and their bounce remain independent at night. */
export function roomLightPower(brightness: number) {
  // Preserve fine control over cozy low light, with a brighter upper range and true off.
  return 2.4 * Math.min(1, Math.max(0, brightness)) ** 2;
}

export function lightingLevels(night: number, blinds: number, brightness = 1) {
  const daylight = 1 - night;
  const transmission = 1 - 0.75 * blinds;
  const dimmer = roomLightPower(brightness);
  const indoor = (night + daylight * (0.28 + blinds * 0.32)) * dimmer;
  return {
    indoor,
    ambient:
      0.12 * (daylight + night * dimmer) +
      0.2 * indoor +
      0.52 * daylight * transmission,
    hemisphere:
      0.08 * (daylight + night * dimmer) +
      0.1 * indoor +
      0.5 * daylight * transmission,
    ceiling: 80 * indoor,
    secondary: 45 * indoor,
    sun: 3.2 * daylight * transmission,
    window: 8 * daylight * transmission,
  };
}
