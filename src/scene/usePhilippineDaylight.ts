import { useEffect, useState } from "react";
import { philippineDaylight } from "./daylight";

export default function usePhilippineDaylight() {
  const [cycle, setCycle] = useState(() => philippineDaylight());
  useEffect(() => {
    const refresh = () => setCycle(philippineDaylight());
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
