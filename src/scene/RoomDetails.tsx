import { useEffect, useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { Box } from "./Objects";

export function Book({
  position,
  color = "#8b9b83",
  height = 0.5,
  rotation = 0,
}: {
  position: [number, number, number];
  color?: string;
  height?: number;
  rotation?: number;
}) {
  return (
    <group position={position} rotation={[0, 0, rotation]}>
      <Box size={[0.13, height, 0.3]} color={color} radius={0.006} />
      <Box
        position={[0.013, 0, -0.012]}
        size={[0.096, height - 0.04, 0.265]}
        color="#ded5bd"
        radius={0.002}
      />
      <Box
        position={[0, 0, 0.145]}
        size={[0.13, height, 0.025]}
        color={color}
        radius={0.005}
      />
      {[-height * 0.32, height * 0.32].map((y) => (
        <Box
          key={y}
          position={[0, y, 0.16]}
          size={[0.105, 0.012, 0.006]}
          color="#d9ceb9"
          radius={0.002}
          castShadow={false}
        />
      ))}
      <Box
        position={[0, 0.02, 0.161]}
        size={[0.06, 0.1, 0.005]}
        color="#d8cfba"
        radius={0.002}
        castShadow={false}
      />
    </group>
  );
}
export function Rug() {
  const weave = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#c2b6a2";
    c.fillRect(0, 0, 128, 128);
    for (let i = 0; i < 128; i += 4) {
      c.fillStyle = i % 8 ? "#b9ad99" : "#cabfab";
      c.fillRect(i, 0, 1, 128);
      c.fillStyle = "#d3c7b333";
      c.fillRect(0, i, 128, 1);
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(12, 10);
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => weave.dispose(), [weave]);
  return (
    <group position={[0, 0, -0.75]}>
      <mesh position={[0, 0.025, 0]} receiveShadow>
        <boxGeometry args={[5.5, 0.025, 4.4]} />
        <meshStandardMaterial map={weave} roughness={1} />
      </mesh>
      {[-2.6, 2.6].map((x) => (
        <Box
          key={x}
          position={[x, 0.04, 0]}
          size={[0.025, 0.004, 4.15]}
          color="#82786b"
          radius={0}
          castShadow={false}
        />
      ))}
      {[-2.07, 2.07].map((z) => (
        <Box
          key={z}
          position={[0, 0.04, z]}
          size={[5.22, 0.004, 0.025]}
          color="#82786b"
          radius={0}
          castShadow={false}
        />
      ))}
      {Array.from({ length: 32 }, (_, i) => (
        <Box
          key={i}
          position={[-2.55 + i * 0.165, 0.018, 2.25]}
          size={[0.012, 0.008, 0.14]}
          color="#bfb49f"
          radius={0.002}
          castShadow={false}
        />
      ))}
    </group>
  );
}

export default function RoomDetails() {
  return (
    <group>
      {/* Cabinet door fronts and a small stack of sketchbooks. */}
      {[-0.34, 0.34].map((x) => (
        <Box
          key={x}
          position={[3.1 + x, 0.6, -2.32]}
          size={[0.63, 0.91, 0.025]}
          color="#393943"
          radius={0.006}
        />
      ))}
      {["#a9b69b", "#d1bd9c", "#b49dab"].map((color, i) => (
        <Box
          key={color}
          position={[2.66, 1.145 + i * 0.042, -2.68]}
          rotation={[0, (i - 1) * 0.06, 0]}
          size={[0.48, 0.035, 0.4]}
          color={color}
          radius={0.005}
        />
      ))}
    </group>
  );
}
