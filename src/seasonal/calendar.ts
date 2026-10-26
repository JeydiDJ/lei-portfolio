// Keep seasonal dates on the same clock as Leila's desk, regardless of visitor timezone.
const calendar = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  hourCycle: "h23",
});

export function seasonalWindow(now = new Date()) {
  const parts = Object.fromEntries(
    calendar.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  const month = Number(parts.month),
    day = Number(parts.day),
    hour = Number(parts.hour);
  // October, plus the last overnight window after Halloween itself.
  const halloween = month === 10 || (month === 11 && day === 1 && hour < 5);
  return { halloween, events: halloween && (hour >= 18 || hour < 5) };
}

export const halloweenEvents = ["ghost", "ceiling", "chair", "duck"] as const;
export type HalloweenEvent = (typeof halloweenEvents)[number];
export const eventDuration: Record<HalloweenEvent, number> = {
  ghost: 4.5,
  ceiling: 4.5,
  chair: 4.5,
  duck: 2.8,
};

const normalEffects = { lightMultiplier: 1, duckIntensity: 0 };
const ghostEffects = { lightMultiplier: 0, duckIntensity: 0 };
const duckEffects = { lightMultiplier: 1, duckIntensity: 1 };
export function eventEffects(event: HalloweenEvent | null) {
  return event === "ghost" || event === "ceiling" || event === "chair"
    ? ghostEffects
    : event === "duck"
      ? duckEffects
      : normalEffects;
}
