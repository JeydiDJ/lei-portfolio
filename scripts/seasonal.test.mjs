import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(new URL("../src/seasonal/calendar.ts", import.meta.url), "utf8"),
  {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
    },
  },
);
const { seasonalWindow, eventEffects, halloweenEvents, eventDuration } =
  await import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );

test("Halloween events start exactly at 6 PM Philippine time", () => {
  assert.equal(
    seasonalWindow(new Date("2026-10-27T17:59:59+08:00")).events,
    false,
  );
  assert.equal(
    seasonalWindow(new Date("2026-10-27T18:00:00+08:00")).events,
    true,
  );
});
test("overnight effects end at 5 AM, with decorations retained", () => {
  assert.deepEqual(seasonalWindow(new Date("2026-10-28T04:59:59+08:00")), {
    halloween: true,
    events: true,
  });
  assert.deepEqual(seasonalWindow(new Date("2026-10-28T05:00:00+08:00")), {
    halloween: true,
    events: false,
  });
  assert.equal(
    seasonalWindow(new Date("2026-10-28T00:00:00+08:00")).events,
    true,
  );
});
test("season closes after Halloween's overnight window", () => {
  assert.equal(
    seasonalWindow(new Date("2026-09-30T20:00:00+08:00")).events,
    false,
  );
  assert.equal(
    seasonalWindow(new Date("2026-11-01T04:59:59+08:00")).events,
    true,
  );
  assert.deepEqual(seasonalWindow(new Date("2026-11-01T05:00:00+08:00")), {
    halloween: false,
    events: false,
  });
  assert.equal(
    seasonalWindow(new Date("2026-11-01T20:00:00+08:00")).events,
    false,
  );
});
test("the visitor's timezone does not change the gate", () => {
  assert.deepEqual(
    seasonalWindow(new Date("2026-10-27T10:00:00Z")),
    seasonalWindow(new Date("2026-10-27T03:00:00-07:00")),
  );
  assert.equal(seasonalWindow(new Date("2026-10-27T10:00:00Z")).events, true);
});
test("ghost immediately cuts the light and leaving restores the user's lighting multiplier", () => {
  assert.equal(eventEffects("ghost").lightMultiplier, 0);
  assert.deepEqual(eventEffects(null), {
    lightMultiplier: 1,
    duckIntensity: 0,
  });
  for (const pose of ["ceiling", "chair"])
    assert.deepEqual(eventEffects(pose), {
      lightMultiplier: 0,
      duckIntensity: 0,
    });
  assert.deepEqual(eventEffects("duck"), {
    lightMultiplier: 1,
    duckIntensity: 1,
  });
});
test("only the corner, ceiling, chair and duck events can be scheduled", () => {
  assert.deepEqual(halloweenEvents, ["ghost", "ceiling", "chair", "duck"]);
  assert.equal("window" in eventDuration, false);
  for (const event of halloweenEvents)
    assert.ok(eventDuration[event] > 0 && eventDuration[event] <= 5);
});
