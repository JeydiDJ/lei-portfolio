import { useCallback, useEffect, useRef, useState } from "react";

export const MONITOR_IDLE_MS = 30_000;

/** Only activity at the monitor resets its screensaver timer. */
export default function useMonitorIdle(active: boolean) {
  const [sleeping, setSleeping] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wake = useCallback(() => {
    clearTimeout(timer.current);
    setSleeping(false);
    timer.current = setTimeout(() => setSleeping(true), MONITOR_IDLE_MS);
  }, []);

  useEffect(() => {
    wake();
    return () => clearTimeout(timer.current);
  }, [active, wake]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      // Redrawing replaces the focused wake button with the first portfolio action.
      // Consume activation keys so the same keystroke cannot activate that new action.
      if (sleeping && (event.key === "Enter" || event.key === " "))
        event.preventDefault();
      wake();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, sleeping, wake]);

  return { sleeping, wake };
}
