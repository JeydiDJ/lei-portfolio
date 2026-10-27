import { Box, Cylinder } from "./Objects";
import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Path, Shape } from "three";
import { chairLayout } from "./layout";

const upholstery = "#6e2634";
const inset = "#e6e1d7";
const frame = "#30292b";

export default function DeskChair() {
  const back = useMemo(() => {
    // Tapered racing shell with real shoulder-harness openings.
    const outline = new Shape();
    outline.moveTo(-0.37, 0);
    outline.lineTo(-0.46, 0.22);
    outline.lineTo(-0.42, 0.71);
    outline.lineTo(-0.53, 1.02);
    outline.quadraticCurveTo(-0.55, 1.1, -0.47, 1.16);
    outline.lineTo(-0.31, 1.3);
    outline.lineTo(-0.29, 1.46);
    outline.quadraticCurveTo(0, 1.57, 0.29, 1.46);
    outline.lineTo(0.31, 1.3);
    outline.lineTo(0.47, 1.16);
    outline.quadraticCurveTo(0.55, 1.1, 0.53, 1.02);
    outline.lineTo(0.42, 0.71);
    outline.lineTo(0.46, 0.22);
    outline.lineTo(0.37, 0);
    outline.closePath();
    for (const x of [-0.19, 0.19]) {
      const opening = new Path();
      opening.absellipse(x, 1.13, 0.082, 0.042, 0, Math.PI * 2, false, 0);
      outline.holes.push(opening);
    }
    return new ExtrudeGeometry(outline, {
      depth: 0.075,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
      steps: 1,
      curveSegments: 12,
    });
  }, []);
  useEffect(() => () => back.dispose(), [back]);
  return (
    <group position={chairLayout.position} rotation={[0, chairLayout.yaw, 0]}>
      <Cylinder
        position={[0, 0.52, 0]}
        args={[0.045, 0.06, 0.65]}
        color="#929096"
      />
      <Cylinder
        position={[0, 0.23, 0]}
        args={[0.105, 0.105, 0.16]}
        color={frame}
      />
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          <Box
            position={[0, 0.19, 0.27]}
            rotation={[-0.08, 0, 0]}
            size={[0.085, 0.075, 0.61]}
            color={frame}
            radius={0.02}
          />
          <Box
            position={[0, 0.125, 0.55]}
            size={[0.06, 0.1, 0.06]}
            color="#77747d"
            radius={0.012}
          />
          {[-0.045, 0.045].map((x) => (
            <Cylinder
              key={x}
              position={[x, 0.078, 0.55]}
              rotation={[0, 0, Math.PI / 2]}
              args={[0.075, 0.075, 0.045]}
              color="#343a35"
            />
          ))}
        </group>
      ))}
      <Box
        position={[0, 0.87, 0]}
        size={[0.86, 0.09, 0.76]}
        color={frame}
        radius={0.025}
      />
      <Box
        position={[0, 0.98, -0.015]}
        size={[1.03, 0.18, 0.91]}
        color={upholstery}
        radius={0.06}
      />
      <Box
        position={[0, 1.073, -0.07]}
        size={[0.72, 0.055, 0.77]}
        color={inset}
        radius={0.025}
      />
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[side * 0.46, 1.1, 0]}
          rotation={[0, 0, side * 0.18]}
          size={[0.15, 0.19, 0.85]}
          color={upholstery}
          radius={0.055}
        />
      ))}
      <group position={[0, 1.02, 0.33]} rotation={[0.08, 0, 0]}>
        <mesh geometry={back} castShadow receiveShadow>
          <meshStandardMaterial color={upholstery} roughness={0.86} />
        </mesh>
        {/* Rear spine and stitched inserts are visible from the room entrance. */}
        <Box
          position={[0, 0.55, 0.105]}
          size={[0.54, 0.92, 0.045]}
          color={frame}
          radius={0.025}
        />
        <Box
          position={[0, 0.56, 0.134]}
          size={[0.39, 0.76, 0.018]}
          color={inset}
          radius={0.02}
        />
        <Box
          position={[0, 1.38, 0.095]}
          size={[0.39, 0.12, 0.025]}
          color={inset}
          radius={0.025}
        />
        {/* Front cushions follow the reclined shell, leaving both harness slots open. */}
        <Box
          position={[0, 0.59, -0.06]}
          size={[0.58, 0.88, 0.13]}
          color={inset}
          radius={0.04}
        />
        <Box
          position={[0, 0.26, -0.16]}
          size={[0.61, 0.25, 0.19]}
          color={upholstery}
          radius={0.06}
        />
        <Box
          position={[0, 1.36, -0.09]}
          size={[0.53, 0.24, 0.18]}
          color={inset}
          radius={0.06}
        />
        {[-1, 1].map((side) => (
          <group key={side}>
            <Box
              position={[side * 0.36, 0.54, -0.09]}
              rotation={[0, side * 0.35, side * -0.06]}
              size={[0.18, 0.82, 0.23]}
              color={upholstery}
              radius={0.06}
            />
            <Box
              position={[side * 0.4, 0.99, -0.07]}
              rotation={[0, side * 0.3, side * 0.45]}
              size={[0.18, 0.33, 0.2]}
              color={upholstery}
              radius={0.05}
            />
            <Box
              position={[side * 0.29, 0.55, 0.115]}
              size={[0.012, 0.84, 0.012]}
              color={inset}
              radius={0.003}
              castShadow={false}
            />
          </group>
        ))}
      </group>
      {[-0.53, 0.53].map((x) => (
        <group key={x}>
          <Box
            position={[x, 1.07, 0.18]}
            size={[0.055, 0.38, 0.055]}
            color={frame}
            radius={0.012}
          />
          <Box
            position={[x, 1.27, 0.025]}
            size={[0.12, 0.085, 0.62]}
            color={frame}
            radius={0.025}
          />
          <Box
            position={[x, 1.225, 0.11]}
            size={[0.15, 0.075, 0.08]}
            color={upholstery}
            radius={0.015}
          />
          <Box
            position={[x, 1.08, 0.147]}
            size={[0.065, 0.055, 0.02]}
            color="#929096"
            radius={0.008}
          />
        </group>
      ))}
      {/* Upholstery seam lines and adjustment controls. */}
      {[-0.36, 0.36].map((x) => (
        <Box
          key={x}
          position={[x, 0.985, -0.47]}
          size={[0.012, 0.07, 0.006]}
          color={inset}
          radius={0.003}
          castShadow={false}
        />
      ))}
      <Box
        position={[0.43, 0.8, 0.12]}
        rotation={[0, 0, -0.2]}
        size={[0.28, 0.025, 0.025]}
        color={frame}
        radius={0.008}
      />
      <Box
        position={[0.55, 0.77, 0.12]}
        size={[0.1, 0.045, 0.07]}
        color={frame}
        radius={0.012}
      />
      <Cylinder
        position={[0.47, 0.87, 0.32]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.085, 0.085, 0.045]}
        color={frame}
      />
    </group>
  );
}
