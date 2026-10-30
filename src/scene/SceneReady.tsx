import { useEffect } from "react";

/** Commit only after the room's suspended assets resolve, then allow a painted frame. */
export default function SceneReady({ onReady }: { onReady: () => void }) {
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(onReady);
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [onReady]);
  return null;
}
