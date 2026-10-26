import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Path, Shape } from "three";
import { Box, Cylinder } from "../Objects";
import { towerDimensions } from "./dimensions";
import { towerPalette } from "./towerPalette";

export const rearFanY = 0.275;

/** A real ventilation opening keeps the rear exhaust from sitting behind a solid panel. */
export default function RearPanel() {
  const { width, height, depth } = towerDimensions;
  const panel = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.closePath();
    const vent = new Path();
    vent.absarc(0, rearFanY, 0.137, 0, Math.PI * 2, true);
    shape.holes.push(vent);
    return new ExtrudeGeometry(shape, {
      depth: 0.018,
      bevelEnabled: false,
      curveSegments: 28,
    });
  }, [width, height]);
  useEffect(() => () => panel.dispose(), [panel]);
  return (
    <group>
      <mesh
        geometry={panel}
        position={[0, 0, -depth / 2 - 0.009]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={towerPalette.panel} roughness={0.8} />
      </mesh>
      <mesh position={[0, rearFanY, -depth / 2 - 0.012]}>
        <torusGeometry args={[0.138, 0.004, 6, 28]} />
        <meshStandardMaterial color={towerPalette.trim} roughness={0.75} />
      </mesh>
      {[-0.09, -0.045, 0, 0.045, 0.09].map((y) => (
        <Box
          key={y}
          position={[0, rearFanY + y, -depth / 2 - 0.015]}
          size={[2 * Math.sqrt(0.13 ** 2 - y ** 2), 0.006, 0.006]}
          color={towerPalette.trim}
          radius={0.002}
          castShadow={false}
        />
      ))}
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((y) => (
          <Cylinder
            key={`${x}/${y}`}
            position={[x * 0.143, rearFanY + y * 0.143, -depth / 2 - 0.012]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[0.0065, 0.0065, 0.008]}
            color={towerPalette.hardware}
          />
        )),
      )}
    </group>
  );
}
