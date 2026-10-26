export const PHILIPPINE_TIME_ZONE = "Asia/Manila";

const timeFormat = new Intl.DateTimeFormat("en-PH", {
  timeZone: PHILIPPINE_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  numberingSystem: "latn",
});
const dateFormat = new Intl.DateTimeFormat("en-PH", {
  timeZone: PHILIPPINE_TIME_ZONE,
  weekday: "short",
  month: "short",
  day: "2-digit",
});

export function philippineClockParts(now = new Date()) {
  const fields = Object.fromEntries(
    timeFormat.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  const hour = fields.hour.padStart(2, "0");
  const minute = fields.minute.padStart(2, "0");
  const second = fields.second.padStart(2, "0");
  const dayPeriod = fields.dayPeriod.toUpperCase();
  return {
    hour,
    minute,
    second,
    dayPeriod,
    time: `${hour}:${minute}:${second} ${dayPeriod}`,
    date: dateFormat.format(now),
    timeZone: PHILIPPINE_TIME_ZONE,
  };
}
