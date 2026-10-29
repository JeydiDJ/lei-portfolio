import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

async function loadSource(path) {
  const { outputText } = ts.transpileModule(
    readFileSync(new URL(path, import.meta.url), "utf8"),
    {
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.ESNext,
      },
    },
  );
  return import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
}
const { philippineDaylight } = await loadSource("../src/scene/daylight.ts");
const { lunarSky } = await loadSource("../src/scene/lunarSky.ts");
const { lightingLevels, roomLightPower } = await loadSource(
  "../src/scene/lightingLevels.ts",
);

test("nighttime indoor illumination is unchanged by blinds", () => {
  const open = lightingLevels(1, 0);
  for (const blinds of [0.25, 0.5, 0.75, 1]) {
    assert.deepEqual(lightingLevels(1, blinds), open);
  }
  assert.equal(open.window, 0);
  assert.equal(open.sun, 0);
  assert.ok(open.ceiling > 0 && open.secondary > 0);
});

test("daytime blinds filter exterior light while indoor fixtures compensate", () => {
  const open = lightingLevels(0, 0);
  const closed = lightingLevels(0, 1);
  assert.ok(closed.window > 0 && closed.window < open.window);
  assert.ok(closed.sun > 0 && closed.sun < open.sun);
  assert.ok(closed.ceiling > open.ceiling);
});

test("room dimmer changes indoor light without changing daylight or blinds independence", () => {
  for (const brightness of [0, 0.45, 1]) {
    assert.deepEqual(
      lightingLevels(1, 0, brightness),
      lightingLevels(1, 1, brightness),
    );
    assert.equal(
      lightingLevels(0, 0, brightness).sun,
      lightingLevels(0, 0, 1).sun,
    );
    assert.equal(
      lightingLevels(0, 0, brightness).window,
      lightingLevels(0, 0, 1).window,
    );
  }
  const dim = lightingLevels(1, 0, 0);
  const cozy = lightingLevels(1, 0, 0.45);
  const bright = lightingLevels(1, 0, 1);
  for (const source of ["ceiling", "secondary", "ambient", "hemisphere"]) {
    assert.ok(
      dim[source] === 0 &&
        dim[source] < cozy[source] &&
        cozy[source] < bright[source],
    );
  }
});
test("slider reaches true off and a brighter maximum across the day/night cycle", () => {
  assert.equal(roomLightPower(0), 0);
  assert.equal(roomLightPower(1), 2.4);
  assert.equal(roomLightPower(-1), 0);
  assert.equal(roomLightPower(2), 2.4);
  for (const night of [0, 0.5, 1]) {
    for (const blinds of [0, 0.5, 1]) {
      const off = lightingLevels(night, blinds, 0);
      assert.equal(off.indoor, 0);
      assert.equal(off.ceiling, 0);
      assert.equal(off.secondary, 0);
      assert.ok(lightingLevels(night, blinds, 1).ceiling > 0);
    }
  }
  assert.ok(lightingLevels(1, 0, 1).ceiling > 80);
});
const { philippineClockParts } = await loadSource(
  "../src/scene/workstation/clockTime.ts",
);
const at = (date, time) => new Date(`${date}T${time}:00+08:00`);

test("lunar illumination agrees with USNO's October 2026 primary phases", () => {
  // https://aa.usno.navy.mil/api/moon/phases/year?year=2026
  const fresh = lunarSky(new Date("2026-10-10T15:50:00Z"));
  const waxing = lunarSky(new Date("2026-10-18T16:12:00Z"));
  const full = lunarSky(new Date("2026-10-26T04:12:00Z"));
  const waning = lunarSky(new Date("2026-11-01T20:28:00Z"));
  assert.ok(fresh.illumination < 0.01);
  assert.ok(full.illumination > 0.99);
  assert.ok(Math.abs(waxing.illumination - 0.5) < 0.03);
  assert.ok(Math.abs(waning.illumination - 0.5) < 0.03);
  assert.ok(Math.abs(waxing.phase - 0.25) < 0.02);
  assert.ok(Math.abs(waning.phase - 0.75) < 0.02);
});

test("lunar vectors stay normalized and continuous through a full month", () => {
  const start = Date.parse("2026-10-01T00:00:00Z");
  let previous = lunarSky(new Date(start));
  for (let hour = 1; hour <= 31 * 24; hour++) {
    const current = lunarSky(new Date(start + hour * 3600000));
    assert.ok(current.phase >= 0 && current.phase < 1);
    assert.ok(current.illumination >= 0 && current.illumination <= 1);
    assert.ok(Math.abs(Math.hypot(...current.direction) - 1) < 1e-10);
    assert.ok(
      Math.hypot(
        ...current.direction.map((v, i) => v - previous.direction[i]),
      ) < 0.28,
    );
    assert.ok(Math.abs(current.illumination - previous.illumination) < 0.015);
    previous = current;
  }
});

test("moon phase and position depend on the instant, not visitor timezone", () => {
  assert.deepEqual(
    lunarSky(new Date("2026-10-29T22:00:00+08:00")),
    lunarSky(new Date("2026-10-29T14:00:00Z")),
  );
});

for (const date of ["2026-03-20", "2026-06-21", "2026-12-21", "2028-02-29"]) {
  test(`Philippine noon is daylight and midnight is night on ${date}`, () => {
    assert.equal(philippineDaylight(at(date, "12:00")).night, 0);
    assert.equal(philippineDaylight(at(date, "00:00")).night, 1);
    assert.equal(philippineClockParts(at(date, "12:00")).dayPeriod, "PM");
  });
}
test("October sunrise and sunset pass through warm twilight", () => {
  const dawn = philippineDaylight(at("2026-10-26", "06:00"));
  const dusk = philippineDaylight(at("2026-10-26", "17:30"));
  assert.equal(dawn.phase, "Sunrise");
  assert.equal(dusk.phase, "Sunset");
  assert.ok(dawn.twilight > 0.5 && dusk.twilight > 0.5);
});
test("summer and winter sunset timing differ", () => {
  assert.ok(
    philippineDaylight(at("2026-06-21", "18:00")).night <
      philippineDaylight(at("2026-12-21", "18:00")).night,
  );
});
test("the cycle stays bounded and continuous across a full Philippine day", () => {
  const start = at("2026-10-26", "00:00").getTime();
  let previous = philippineDaylight(new Date(start));
  for (let minute = 1; minute <= 1440; minute++) {
    const next = philippineDaylight(new Date(start + minute * 60_000));
    assert.ok(next.night >= 0 && next.night <= 1);
    assert.ok(next.twilight >= 0 && next.twilight <= 1);
    assert.ok(Math.abs(next.night - previous.night) < 0.04);
    previous = next;
  }
});
test("visitor timezone cannot change the clock or daylight cycle", () => {
  const instant = at("2026-10-26", "06:00");
  const expected = philippineDaylight(instant);
  const original = process.env.TZ;
  try {
    for (const zone of ["UTC", "America/New_York", "Asia/Tokyo"]) {
      process.env.TZ = zone;
      assert.deepEqual(philippineDaylight(instant), expected);
      assert.equal(philippineClockParts(instant).hour, "06");
      assert.equal(philippineClockParts(instant).dayPeriod, "AM");
    }
  } finally {
    if (original === undefined) delete process.env.TZ;
    else process.env.TZ = original;
  }
});

test("sun travels east to west while the studio orientation stays fixed", () => {
  const morning = philippineDaylight(at("2026-10-28", "08:00"));
  const noon = philippineDaylight(at("2026-10-28", "12:00"));
  const afternoon = philippineDaylight(at("2026-10-28", "16:00"));
  assert.ok(morning.azimuth > 0 && morning.azimuth < 180);
  assert.ok(afternoon.azimuth > 180 && afternoon.azimuth < 360);
  assert.ok(morning.sunDirection[0] < 0);
  assert.ok(afternoon.sunDirection[0] > 0);
  assert.ok(
    noon.elevation > morning.elevation && noon.elevation > afternoon.elevation,
  );
});

test("seasonal noon position crosses to the north in Manila's summer", () => {
  const summer = philippineDaylight(at("2026-06-21", "12:00"));
  const winter = philippineDaylight(at("2026-12-21", "12:00"));
  assert.ok(summer.sunDirection[2] > 0);
  assert.ok(winter.sunDirection[2] < 0);
  assert.ok(summer.elevation > winter.elevation);
});

test("solar vectors remain normalized, continuous and agree with elevation", () => {
  const start = at("2026-10-28", "00:00").getTime();
  let previous = philippineDaylight(new Date(start)).sunDirection;
  for (let minute = 0; minute <= 1440; minute++) {
    const cycle = philippineDaylight(new Date(start + minute * 60_000));
    const direction = cycle.sunDirection;
    assert.ok(Math.abs(Math.hypot(...direction) - 1) < 1e-10);
    assert.ok(
      Math.abs(direction[1] - Math.sin((cycle.elevation * Math.PI) / 180)) <
        1e-10,
    );
    assert.ok(Math.hypot(...direction.map((v, i) => v - previous[i])) < 0.005);
    previous = direction;
  }
  assert.ok(philippineDaylight(at("2026-10-28", "00:00")).sunDirection[1] < 0);
});
