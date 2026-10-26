/** Blinds attenuate daylight; the indoor fixtures and their bounce remain independent at night. */
export function lightingLevels(night: number, blinds: number, brightness = 1) {
  const daylight = 1 - night;
  const transmission = 1 - 0.75 * blinds;
  // A small minimum keeps room objects readable at the dim end of the control.
  const dimmer = 0.12 + 0.88 * brightness;
  const indoor = (night + daylight * blinds * 0.43) * dimmer;
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
