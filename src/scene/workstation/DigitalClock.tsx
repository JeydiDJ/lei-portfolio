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
    c.strokeStyle = masks[value] & (1 << index) ? "#f4e5cc" : "#35272c";
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
    canvas.width = 1280;
    canvas.height = 280;
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
      c.fillStyle = "#1e1519";
      c.fillRect(0, 0, 1280, 280);
      const positions = [98, 240, 444, 586];
      (clock.hour + clock.minute)
        .split("")
        .forEach((value, index) =>
          digit(c, Number(value), positions[index], 80, 96, 140),
        );
      clock.second
        .split("")
        .forEach((value, index) =>
          digit(c, Number(value), 954 + index * 74, 145, 46, 66),
        );
      c.fillStyle = "#f4e5cc";
      for (const x of [400])
        for (const y of [123, 177]) {
          c.beginPath();
          c.arc(x, y, 6, 0, Math.PI * 2);
          c.fill();
        }
      c.fillStyle = "#65404a";
      c.fillRect(823, 72, 2, 151);
      c.font = '500 23px "DM Sans", sans-serif';
      c.fillStyle = "#b9aa98";
      c.textAlign = "left";
      c.fillText("PHILIPPINES", 48, 36);
      c.fillText(clock.date, 48, 263);
      c.font = '500 34px "DM Sans", sans-serif';
      c.fillStyle = "#f4e5cc";
      c.fillText(clock.dayPeriod, 954, 104);
      c.font = '500 23px "DM Sans", sans-serif';
      c.textAlign = "right";
      c.fillStyle = "#b9aa98";
      c.fillText("PHT · UTC+8", 1232, 36);
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
    <group
      position={[-0.35, 1.45, -0.83]}
      userData={{ dynamic: true }}
      name="Tilted Philippine desk clock"
    >
      {/* Stable plinth and front supports; the enclosure leans back by 12 degrees. */}
      <Box
        position={[0, 0.013, 0]}
        size={[0.84, 0.026, 0.23]}
        color="#4b3036"
        radius={0.009}
      />
      {[-0.28, 0.28].map((x) => (
        <Box
          key={x}
          position={[x, 0.044, 0.05]}
          size={[0.06, 0.044, 0.07]}
          color="#4b3036"
          radius={0.006}
        />
      ))}
      <group position={[0, 0.15, 0]} rotation={[-Math.PI / 15, 0, 0]}>
        <Box size={[0.9, 0.215, 0.18]} color="#ded9cf" radius={0.021} />
        <Box
          position={[0, 0, 0.09]}
          size={[0.864, 0.194, 0.009]}
          color="#781b20"
          radius={0.009}
        />
        <Box
          position={[0, 0, 0.096]}
          size={[0.842, 0.184, 0.006]}
          color="#30242a"
          radius={0.006}
        />
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[0.816, 0.1785]} />
          <meshBasicMaterial map={display.texture} toneMapped={false} />
        </mesh>
        <group position={[0, 0, 0.101]}>
          <GlassPane width={0.816} height={0.1785} strength={0.13} />
        </group>
        {/* Discreet tactile buttons on the top edge rather than pastel protrusions. */}
        {[-0.27, -0.2].map((x) => (
          <Box
            key={x}
            position={[x, 0.11, -0.025]}
            size={[0.045, 0.008, 0.035]}
            color="#9d8b76"
            radius={0.004}
          />
        ))}
      </group>
    </group>
  );
}
