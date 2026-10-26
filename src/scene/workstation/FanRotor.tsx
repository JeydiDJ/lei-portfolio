import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { CanvasTexture, DoubleSide, type Group } from "three";

const turn = Math.PI * 2;
// A typical 120 mm case/radiator fan running at a steady cooling speed.
const radiansPerSecond = (1300 / 60) * turn;

export default function FanRotor({
  axis,
  children,
  color = "#4d4c58",
  radius = 0.105,
}: {
  axis: "y" | "z";
  children: ReactNode;
  color?: string;
  radius?: number;
}) {
  const rotor = useRef<Group>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const blur = useMemo(() => {
    // Time-averaged blade coverage: no sharp blade edges to alias at 60/120 Hz.
    // This is a single lit surface, not additional scene renders or postprocessing.
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const context = canvas.getContext("2d")!;
    const image = context.createImageData(128, 128);
    for (let y = 0; y < 128; y++) {
      for (let x = 0; x < 128; x++) {
        const r = Math.hypot((x - 63.5) / 63.5, (y - 63.5) / 63.5);
        const edge = Math.max(0, Math.min(1, (1 - r) / 0.12));
        const hub = Math.max(0, Math.min(1, (r - 0.18) / 0.12));
        const coverage = edge * hub * (0.65 + 0.25 * (1 - r));
        const i = (y * 128 + x) * 4;
        image.data[i] =
          image.data[i + 1] =
          image.data[i + 2] =
            Math.round(255 * coverage);
        image.data[i + 3] = 255;
      }
    }
    context.putImageData(image, 0, 0);
    return new CanvasTexture(canvas);
  }, []);
  useEffect(() => () => blur.dispose(), [blur]);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(media.matches);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useFrame((_, delta) => {
    if (!rotor.current || reducedMotion || document.hidden) return;
    // Integrate elapsed seconds, not frame count; keep the angle bounded.
    rotor.current.rotation[axis] =
      (rotor.current.rotation[axis] + radiansPerSecond * delta) % turn;
  });
  return (
    <group ref={rotor} userData={{ dynamic: true }}>
      <group visible={reducedMotion}>{children}</group>
      <mesh
        visible={!reducedMotion}
        rotation={axis === "y" ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}
        raycast={() => {}}
      >
        <planeGeometry args={[radius * 2, radius * 2]} />
        <meshStandardMaterial
          color={color}
          alphaMap={blur}
          transparent
          depthWrite={false}
          side={DoubleSide}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}
