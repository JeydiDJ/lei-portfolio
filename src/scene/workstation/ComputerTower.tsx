import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Path, Shape } from "three";
import { Box, Cylinder } from "../Objects";
import { towerDimensions as dimensions } from "./dimensions";
import { workstationScale, towerYaw } from "./dimensions";
import TowerInternals from "./TowerInternals";
import FrontMesh from "./FrontMesh";
import DuckDisplay from "./DuckDisplay";
import { towerPalette } from "./towerPalette";
import RearPanel, { rearFanY } from "./RearPanel";
import GlassPane from "../GlassPane";
import FanRotor from "./FanRotor";

function Fan({ y, rear = false }: { y: number; rear?: boolean }) {
  const housing = useMemo(() => {
    const frame = new Shape();
    frame.moveTo(-0.155, -0.155);
    frame.lineTo(0.155, -0.155);
    frame.lineTo(0.155, 0.155);
    frame.lineTo(-0.155, 0.155);
    frame.closePath();
    const opening = new Path();
    opening.absarc(0, 0, 0.132, 0, Math.PI * 2, true);
    frame.holes.push(opening);
    return new ExtrudeGeometry(frame, {
      depth: 0.035,
      bevelEnabled: false,
      curveSegments: 28,
    });
  }, []);
  useEffect(() => () => housing.dispose(), [housing]);
  return (
    <group
      position={[
        0,
        y,
        rear ? -dimensions.depth / 2 + 0.025 : dimensions.depth / 2 - 0.038,
      ]}
      rotation={[0, rear ? Math.PI : 0, 0]}
    >
      <mesh
        geometry={housing}
        position={[0, 0, -0.026]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={towerPalette.fan} roughness={0.75} />
      </mesh>
      {[-1, 1].flatMap((x) =>
        [-1, 1].map((side) => (
          <Cylinder
            key={`${x}-${side}`}
            position={[x * 0.143, side * 0.143, 0.013]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[0.0065, 0.0065, 0.009]}
            color="#8a8c93"
          />
        )),
      )}
      {/* Rear motor struts connect the hub to the fixed square housing. */}
      {[0, 1, 2].map((i) => {
        const angle = (i * Math.PI * 2) / 3;
        return (
          <Box
            key={i}
            position={[
              Math.cos(angle) * 0.076,
              Math.sin(angle) * 0.076,
              -0.019,
            ]}
            rotation={[0, 0, angle]}
            size={[0.115, 0.016, 0.012]}
            color="#34363e"
            radius={0.003}
            castShadow={false}
          />
        );
      })}
      <mesh>
        <torusGeometry args={[0.125, 0.009, 8, 36]} />
        <meshStandardMaterial
          color="#b8b1c2"
          emissive="#a997bd"
          emissiveIntensity={0.65}
          roughness={0.7}
        />
      </mesh>
      <FanRotor axis="z">
        {Array.from({ length: 7 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 7;
          return (
            <Box
              key={i}
              position={[Math.cos(angle) * 0.055, Math.sin(angle) * 0.055, 0]}
              rotation={[0, 0, angle + 0.35]}
              size={[0.095, 0.038, 0.008]}
              color="#4d4c58"
              radius={0.01}
              castShadow={false}
            />
          );
        })}
      </FanRotor>
      <Cylinder
        position={[0, 0, 0.003]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[0.027, 0.027, 0.034]}
        color="#34343c"
      />
    </group>
  );
}
export default function ComputerTower() {
  const { width, height, depth } = dimensions;
  return (
    <group
      position={[1.42, 1.45, -0.96]}
      rotation={[0, towerYaw, 0]}
      scale={workstationScale.tower}
    >
      <group position={[0, 0.51, 0]}>
        <group position={[0, height / 2 + 0.005, 0.3]}>
          <DuckDisplay />
        </group>
        {/* Front is +Z: solid cable-management panel on the right, glass on the left. */}
        <Box
          position={[width / 2, 0, 0]}
          size={[0.018, height, depth]}
          color={towerPalette.shell}
          radius={0.008}
        />
        <RearPanel />
        {[-1, 1].map((side) => (
          <Box
            key={side}
            position={[0, side * (height / 2 - 0.012), 0]}
            size={[width, 0.024, depth]}
            color={towerPalette.shell}
            radius={0.008}
          />
        ))}
        <group
          position={[-width / 2 - 0.006, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
        >
          <GlassPane
            width={depth - 0.045}
            height={height - 0.055}
            strength={1.15}
          />
        </group>
        {/* Left panel perimeter and four thumbscrews; no mirrored right-side window. */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <Box
              position={[-width / 2 - 0.004, side * (height / 2 - 0.022), 0]}
              size={[0.018, 0.022, depth - 0.02]}
              color={towerPalette.trim}
              radius={0.003}
            />
            <Box
              position={[-width / 2 - 0.004, 0, side * (depth / 2 - 0.018)]}
              size={[0.018, height - 0.04, 0.018]}
              color={towerPalette.trim}
              radius={0.003}
            />
            {[-1, 1].map((z) => (
              <Cylinder
                key={z}
                position={[
                  -width / 2 - 0.014,
                  side * (height / 2 - 0.042),
                  z * (depth / 2 - 0.04),
                ]}
                rotation={[0, 0, Math.PI / 2]}
                args={[0.008, 0.008, 0.009]}
                color="#a0a4a2"
              />
            ))}
          </group>
        ))}
        {[-1, 1].map((side) => (
          <Box
            key={side}
            position={[side * (width / 2 - 0.012), 0, depth / 2]}
            size={[0.024, height, 0.02]}
            color={towerPalette.trim}
            radius={0.005}
          />
        ))}
        <Box
          position={[0, height / 2 - 0.055, depth / 2]}
          size={[width, 0.11, 0.025]}
          color={towerPalette.shell}
          radius={0.008}
        />
        <Box
          position={[0, -height / 2 + 0.04, depth / 2]}
          size={[width, 0.08, 0.025]}
          color={towerPalette.shell}
          radius={0.008}
        />
        <Fan y={-0.21} />
        <Fan y={0.18} />
        <Fan y={rearFanY} rear />
        {/* Intake rails attach both fan housings to the chassis crossmembers. */}
        {[-1, 1].map((side) => (
          <Box
            key={side}
            position={[side * 0.164, -0.015, depth / 2 - 0.051]}
            size={[0.026, 0.744, 0.026]}
            color={towerPalette.hardware}
            radius={0.003}
          />
        ))}
        {[0.346, -0.376].map((y) => (
          <Box
            key={y}
            position={[0, y, depth / 2 - 0.042]}
            size={[width - 0.016, 0.024, 0.044]}
            color={towerPalette.trim}
            radius={0.003}
          />
        ))}
        <FrontMesh />
        <TowerInternals />
        {/* Rear connectors align with the right-hand motherboard tray. */}
        <Box
          position={[0.155, -0.045, -depth / 2 - 0.012]}
          size={[0.085, 0.22, 0.008]}
          color="#777f81"
          radius={0.002}
        />
        {Array.from({ length: 6 }, (_, i) => (
          <Box
            key={i}
            position={[
              0.136 + (i % 2) * 0.035,
              0.025 - Math.floor(i / 2) * 0.04,
              -depth / 2 - 0.02,
            ]}
            size={[0.025, 0.013, 0.008]}
            color="#17212b"
            radius={0.002}
            castShadow={false}
          />
        ))}
        <Box
          position={[0.155, -0.115, -depth / 2 - 0.02]}
          size={[0.034, 0.027, 0.008]}
          color="#23312f"
          radius={0.002}
        />
        <Box
          position={[0.155, -0.085, -depth / 2 - 0.02]}
          size={[0.042, 0.014, 0.008]}
          color="#17212b"
          radius={0.002}
        />
        {[-0.09, -0.13, -0.17, -0.21].map((y) => (
          <Box
            key={y}
            position={[-0.045, y, -depth / 2 - 0.014]}
            size={[0.285, 0.012, 0.006]}
            color="#11151b"
            radius={0.002}
            castShadow={false}
          />
        ))}
        <Box
          position={[0.065, -0.33, -depth / 2 - 0.017]}
          size={[0.044, 0.027, 0.009]}
          color="#101419"
          radius={0.002}
        />
        {/* Front I/O: two USB-A ports, audio jack, power switch and status LED. */}
        {[-0.09, -0.035].map((x) => (
          <Box
            key={x}
            position={[x, 0.407, depth / 2 + 0.018]}
            size={[0.036, 0.012, 0.006]}
            color="#0e1015"
            radius={0.002}
            castShadow={false}
          />
        ))}
        <Cylinder
          position={[0.035, 0.407, depth / 2 + 0.022]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.007, 0.007, 0.006]}
          color="#11151a"
        />
        <Cylinder
          position={[0.095, 0.407, depth / 2 + 0.024]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.014, 0.014, 0.008]}
          color="#737d7a"
        />
        <mesh position={[0.14, 0.407, depth / 2 + 0.025]}>
          <circleGeometry args={[0.0035, 10]} />
          <meshBasicMaterial color="#c8ddbc" />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => (
          <Box
            key={i}
            position={[0, height / 2 + 0.002, -0.3 + i * 0.058]}
            size={[0.27, 0.003, 0.012]}
            color="#13161c"
            radius={0.003}
            castShadow={false}
          />
        ))}
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Box
              key={`${x}-${z}`}
              position={[
                x * (width / 2 - 0.06),
                -height / 2 - 0.025,
                z * (depth / 2 - 0.09),
              ]}
              size={[0.065, 0.05, 0.075]}
              color="#15171c"
              radius={0.008}
            />
          )),
        )}
      </group>
    </group>
  );
}
