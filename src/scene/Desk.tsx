import { RoundedBox } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Box, Cylinder } from "./Objects";
import { deskLayout } from "./layout";

/** An open oak desk with a cream drawer pedestal and tapered metal legs. */
export default function Desk() {
  const oak = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#cba77f";
    context.fillRect(0, 0, 512, 256);
    let seed = 42;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let i = 0; i < 180; i++) {
      const y = random() * 256;
      context.strokeStyle = `rgba(112,76,45,${0.025 + random() * 0.07})`;
      context.lineWidth = 0.3 + random();
      context.beginPath();
      context.moveTo(0, y);
      context.bezierCurveTo(
        170,
        y + random() * 5,
        340,
        y - random() * 5,
        512,
        y,
      );
      context.stroke();
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => oak.dispose(), [oak]);

  return (
    <group>
      <RoundedBox
        position={[0, 1.38, -0.65]}
        args={[deskLayout.width, 0.14, 1.9]}
        radius={0.035}
        smoothness={3}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial map={oak} roughness={0.72} />
      </RoundedBox>
      {/* A narrow apron and two slim legs leave the knee space open. */}
      <Box
        position={[-0.35, 1.24, -1.4]}
        size={[3.12, 0.12, 0.06]}
        color="#596057"
        radius={0.012}
      />
      {[-1.36, 0.06].map((z) => (
        <Cylinder
          key={z}
          position={[-1.82, 0.69, z]}
          args={[0.065, 0.045, 1.25]}
          rotation={[0, 0, -0.055]}
          color="#596057"
        />
      ))}
      <Box
        position={[-1.84, 0.28, -0.65]}
        size={[0.055, 0.055, 1.42]}
        color="#596057"
        radius={0.012}
      />
      {/* Three inset drawer fronts and simple, dark metal pulls. */}
      <Box
        position={[1.48, 0.725, -0.65]}
        size={[0.82, 1.17, 1.5]}
        color="#e5e0d5"
        radius={0.025}
      />
      {[0.36, 0.71, 1.06].map((y) => (
        <group key={y}>
          <Box
            position={[1.48, y, 0.113]}
            size={[0.75, 0.32, 0.035]}
            color="#f4f0e7"
            radius={0.008}
          />
          <Box
            position={[1.48, y + 0.06, 0.145]}
            size={[0.22, 0.025, 0.035]}
            color="#6b6c60"
            radius={0.008}
          />
        </group>
      ))}
      {[-1.22, -0.08].map((z) => (
        <Box
          key={z}
          position={[1.48, 0.1, z]}
          size={[0.64, 0.08, 0.08]}
          color="#807260"
          radius={0.01}
        />
      ))}
    </group>
  );
}
