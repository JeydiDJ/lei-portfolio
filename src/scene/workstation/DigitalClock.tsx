import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Box } from "../Objects";
import { philippineClockParts } from "./clockTime";
import GlassPane from "../GlassPane";

const masks = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];
function digit(
  c: CanvasRenderingContext2D,
  value: number,
  x: number,
  y = 66,
  w = 96,
  h = 130,
) {
  const inset = w * 0.14;
  const segments = [
    [x + inset, y, x + w - inset, y],
    [x + w, y + inset, x + w, y + h / 2 - inset],
    [x + w, y + h / 2 + inset, x + w, y + h - inset],
    [x + inset, y + h, x + w - inset, y + h],
    [x, y + h / 2 + inset, x, y + h - inset],
    [x, y + inset, x, y + h / 2 - inset],
    [x + inset, y + h / 2, x + w - inset, y + h / 2],
  ];
  c.lineWidth = w * 0.1;
  c.lineCap = "round";
  segments.forEach(([x1, y1, x2, y2], index) => {
    c.strokeStyle = masks[value] & (1 << index) ? "#f6d8d2" : "#3b303b";
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
  });
}

export default function DigitalClock() {
  const gl = useThree((state) => state.gl);
  const display = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return { canvas, texture };
  }, [gl]);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const sync = () => {
      clearTimeout(timer);
      const now = new Date();
      const clock = philippineClockParts(now);
      const c = display.canvas.getContext("2d")!;
      c.fillStyle = "#29232d";
      c.fillRect(0, 0, 1024, 256);
      const positions = [82, 212, 397, 527];
      (clock.hour + clock.minute)
        .split("")
        .forEach((value, index) => digit(c, Number(value), positions[index]));
      clock.second
        .split("")
        .forEach((value, index) =>
          digit(c, Number(value), 780 + index * 72, 129, 48, 66),
        );
      c.fillStyle = "#f6d8d2";
      for (const x of [352])
        for (const y of [106, 156]) {
          c.beginPath();
          c.arc(x, y, 6, 0, Math.PI * 2);
          c.fill();
        }
      c.fillStyle = "#68515f";
      c.fillRect(714, 65, 2, 136);
      c.font = '500 23px "DM Sans", sans-serif';
      c.fillStyle = "#d2b8c2";
      c.textAlign = "left";
      c.fillText("PHILIPPINES", 48, 34);
      c.fillText(clock.date, 48, 238);
      c.font = '500 31px "DM Sans", sans-serif';
      c.fillText(clock.dayPeriod, 780, 102);
      c.font = '500 23px "DM Sans", sans-serif';
      c.textAlign = "right";
      c.fillText("PHT · UTC+8", 976, 34);
      display.texture.needsUpdate = true;
      gl.domElement.dataset.localClock = clock.time;
      gl.domElement.dataset.localClockZone = clock.timeZone;
      // Align to the next real second rather than accumulating interval drift.
      timer = setTimeout(sync, 1000 - (Date.now() % 1000) + 10);
    };
    sync();
    window.addEventListener("focus", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("focus", sync);
      document.removeEventListener("visibilitychange", sync);
      delete gl.domElement.dataset.localClock;
      delete gl.domElement.dataset.localClockZone;
    };
  }, [display, gl]);
  useEffect(() => () => display.texture.dispose(), [display]);
  return (
    <group position={[-0.35, 1.589, -0.83]} userData={{ dynamic: true }}>
      <Box size={[0.86, 0.23, 0.14]} color="#eaded0" radius={0.035} />
      <Box
        position={[0, 0, 0.07]}
        size={[0.818, 0.21, 0.009]}
        color="#c49baa"
        radius={0.01}
      />
      <mesh position={[0, 0, 0.076]}>
        <planeGeometry args={[0.768, 0.192]} />
        <meshBasicMaterial map={display.texture} toneMapped={false} />
      </mesh>
      <group position={[0, 0, 0.077]}>
        <GlassPane width={0.768} height={0.192} strength={0.22} />
      </group>
      {[-0.27, 0.27].map((x) => (
        <Box
          key={x}
          position={[x, -0.127, 0]}
          size={[0.09, 0.024, 0.09]}
          color="#75636c"
          radius={0.006}
        />
      ))}
      {[-0.26, -0.19].map((x) => (
        <Box
          key={x}
          position={[x, 0.12, -0.015]}
          size={[0.045, 0.012, 0.04]}
          color="#c49baa"
          radius={0.005}
        />
      ))}
    </group>
  );
}
