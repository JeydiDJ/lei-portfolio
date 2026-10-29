import { useEffect, useState } from "react";
import { philippineDaylight } from "./daylight";
import { lunarSky } from "./lunarSky";

// Local visual QA can compare solar shadows without changing the computer clock.
// Production always uses the real instant, shared with the Philippine clock.
function sampleDaylight() {
  if ((import.meta as ImportMeta & { env: { DEV: boolean } }).env.DEV) {
    const preview = new URLSearchParams(window.location.search).get(
      "sunPreview",
    );
    if (preview && Number.isFinite(Date.parse(preview))) {
      const now = new Date(preview);
      return { ...philippineDaylight(now), moon: lunarSky(now) };
    }
  }
  const now = new Date();
  return { ...philippineDaylight(now), moon: lunarSky(now) };
}

export default function usePhilippineDaylight() {
  const [cycle, setCycle] = useState(sampleDaylight);
  useEffect(() => {
    const refresh = () => setCycle(sampleDaylight());
    const onVisibility = () => {
      if (!document.hidden) refresh();
    };
    const timer = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return cycle;
}
