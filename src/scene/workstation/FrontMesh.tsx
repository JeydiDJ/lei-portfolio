import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  DoubleSide,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { Box } from "../Objects";
import { towerDimensions as dimensions } from "./dimensions";
import { towerPalette } from "./towerPalette";

export default function FrontMesh() {
  const grille = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#deddd6";
    c.fillRect(0, 0, 64, 64);
    c.globalCompositeOperation = "destination-out";
    for (const x of [16, 48])
      for (const y of [16, 48]) {
        c.beginPath();
        c.arc(x, y, 12.5, 0, Math.PI * 2);
        c.fill();
      }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(26, 50);
    texture.anisotropy = 4;
    return texture;
  }, []);
  useEffect(() => () => grille.dispose(), [grille]);
  const width = dimensions.width - 0.048;
  const height = dimensions.height - 0.19;
  return (
    <group position={[0, -0.015, dimensions.depth / 2 + 0.025]}>
      {/* Perforations are transparent, so the recessed intake fans remain visible. */}
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={grille}
          color={towerPalette.shell}
          transparent
          opacity={0.85}
          alphaTest={0.05}
          depthWrite={false}
          side={DoubleSide}
          metalness={0.15}
          roughness={0.7}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[side * (width / 2 + 0.003), 0, -0.005]}
            size={[0.012, height + 0.024, 0.014]}
            color={towerPalette.trim}
            radius={0.003}
          />
          <Box
            position={[0, side * (height / 2 + 0.006), -0.005]}
            size={[width, 0.012, 0.014]}
            color={towerPalette.trim}
            radius={0.003}
          />
          {[-1, 1].map((edge) => (
            <mesh
              key={edge}
              position={[
                side * (width / 2 - 0.01),
                edge * (height / 2 - 0.01),
                0.003,
              ]}
            >
              <circleGeometry args={[0.0045, 8]} />
              <meshStandardMaterial
                color="#8b8c94"
                metalness={0.6}
                roughness={0.4}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
