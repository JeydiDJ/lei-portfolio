import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  eventDuration,
  eventEffects,
  halloweenEvents,
  seasonalWindow,
  type HalloweenEvent,
} from "./calendar";

type SeasonalState = {
  halloween: boolean;
  event: HalloweenEvent | null;
  progress: number;
  lightMultiplier: number;
  duckIntensity: number;
};
const SeasonalContext = createContext<SeasonalState | null>(null);
export function useSeasonalFeatures() {
  const value = useContext(SeasonalContext);
  if (!value) throw new Error("SeasonalFeatures provider is missing");
  return value;
}

/** A single scheduler prevents overlapping scares and never changes the user's light slider. */
export default function SeasonalFeatures({
  children,
  paused,
}: {
  children: ReactNode;
  paused: boolean;
}) {
  const canvas = useThree((state) => state.gl.domElement);
  const values = useRef<SeasonalState>({
    halloween: seasonalWindow().halloween,
    event: null,
    progress: 0,
    lightMultiplier: 1,
    duckIntensity: 0,
  });
  const timing = useRef({
    checked: -Infinity,
    eligible: false,
    next: 18 + Math.random() * 17,
    elapsed: 0,
    previous: "",
  });
  const reduced = useRef(false);
  // Local development inspection only; eligibility and the night-time gate still apply.
  const preview = useRef(
    (import.meta as ImportMeta & { env?: { DEV: boolean } }).env?.DEV
      ? new URLSearchParams(window.location.search).get("seasonalPreview")
      : null,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduced.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    const hide = () => {
      if (!document.hidden) return;
      Object.assign(values.current, {
        event: null,
        progress: 0,
        lightMultiplier: 1,
        duckIntensity: 0,
      });
      timing.current.elapsed = 0;
      timing.current.next = 18 + Math.random() * 17;
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  useFrame((_, delta) => {
    const state = values.current,
      timer = timing.current;
    const now = Date.now();
    if (Math.floor(now / 1000) !== timer.checked) {
      const window = seasonalWindow(new Date(now));
      state.halloween = window.halloween;
      timer.eligible = window.events;
      timer.checked = Math.floor(now / 1000);
    }
    const status = !timer.eligible
      ? "outside-hours"
      : paused
        ? "content-open"
        : reduced.current
          ? "reduced-motion"
          : document.hidden
            ? "hidden"
            : "ready";
    if (canvas.dataset.seasonalStatus !== status)
      canvas.dataset.seasonalStatus = status;
    if (!timer.eligible || paused || reduced.current || document.hidden) {
      state.event = null;
      state.progress = 0;
      state.lightMultiplier = 1;
      state.duckIntensity = 0;
      timer.elapsed = 0;
      timer.next = 18 + Math.random() * 17;
      if (canvas.dataset.seasonalEvent !== "none")
        canvas.dataset.seasonalEvent = "none";
      return;
    }
    timer.elapsed += delta;
    const inspection = preview.current;
    if (
      inspection === "ghost" ||
      inspection === "ceiling" ||
      inspection === "chair" ||
      inspection === "duck"
    ) {
      state.event = inspection;
      state.progress = 0.45;
    } else {
      if (!state.event && timer.elapsed >= timer.next) {
        const candidates = halloweenEvents.filter(
          (kind) => kind !== timer.previous,
        );
        state.event = candidates[Math.floor(Math.random() * candidates.length)];
        timer.previous = state.event;
        timer.elapsed = 0;
      }
      if (state.event) {
        state.progress = timer.elapsed / eventDuration[state.event];
        if (state.progress >= 1) {
          state.event = null;
          state.progress = 0;
          timer.elapsed = 0;
          timer.next = 45 + Math.random() * 55;
        }
      }
    }
    const effects = eventEffects(state.event);
    state.lightMultiplier = effects.lightMultiplier;
    state.duckIntensity = effects.duckIntensity;
    const eventName = state.event ?? "none";
    if (canvas.dataset.seasonalEvent !== eventName)
      canvas.dataset.seasonalEvent = eventName;
  }, -3);
  return (
    <SeasonalContext.Provider value={values.current}>
      {children}
    </SeasonalContext.Provider>
  );
}
