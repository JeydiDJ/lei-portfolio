import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  CatmullRomCurve3,
  MeshStandardMaterial,
  PointLight,
  Quaternion,
  Vector2,
  Vector3,
} from "three";
import { Box, Cylinder } from "./Objects";
import Cable from "./workstation/Cable";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { useSeasonalFeatures } from "../seasonal/SeasonalFeatures";
import { roomLightPower } from "./lightingLevels";

type V3 = [number, number, number];
const enamel = "#b887a0";
const metal = "#706370";
const brass = "#b7a08a";

function Link({
  from,
  to,
  spring = false,
}: {
  from: V3;
  to: V3;
  spring?: boolean;
}) {
  const { position, rotation, length, coil } = useMemo(() => {
    const start = new Vector3(...from),
      end = new Vector3(...to);
    const direction = end.clone().sub(start);
    const length = direction.length();
    return {
      position: start.clone().add(end).multiplyScalar(0.5),
      rotation: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction.normalize(),
      ),
      length,
      coil: new CatmullRomCurve3(
        Array.from({ length: 145 }, (_, i) => {
          const t = i / 144,
            angle = t * Math.PI * 24;
          return new Vector3(
            Math.cos(angle) * 0.012,
            (t - 0.5) * length,
            Math.sin(angle) * 0.012,
          );
        }),
      ),
    };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={rotation} castShadow receiveShadow>
      {spring ? (
        <tubeGeometry args={[coil, 144, 0.003, 5, false]} />
      ) : (
        <cylinderGeometry args={[0.012, 0.012, length, 12]} />
      )}
      <meshStandardMaterial
        color={spring ? brass : metal}
        metalness={0.55}
        roughness={0.42}
      />
    </mesh>
  );
}

function Hinge({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Cylinder
        position={[0, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.046, 0.046, 0.105]}
        color={enamel}
      />
      {[-1, 1].map((side) => (
        <group key={side}>
          <Cylinder
            position={[side * 0.057, 0, 0]}
            rotation={[0, 0, Math.PI / 2]}
            args={[0.026, 0.026, 0.012]}
            color={brass}
          />
          <Box
            position={[side * 0.064, 0, 0]}
            size={[0.002, 0.005, 0.024]}
            color="#4e4850"
            radius={0.001}
            castShadow={false}
          />
        </group>
      ))}
    </group>
  );
}

export default function DeskLamp() {
  const light = useRef<PointLight>(null);
  const bulb = useRef<MeshStandardMaterial>(null);
  const blend = useEnvironmentTransition();
  const seasonal = useSeasonalFeatures();
  const shade = useMemo(
    () => [
      new Vector2(0.22, -0.13),
      new Vector2(0.218, -0.11),
      new Vector2(0.2, -0.07),
      new Vector2(0.17, 0.02),
      new Vector2(0.11, 0.12),
      new Vector2(0.075, 0.14),
      new Vector2(0.063, 0.145),
    ],
    [],
  );
  const reflector = useMemo(
    () => shade.map((p) => new Vector2(p.x - 0.009, p.y)),
    [shade],
  );
  useFrame(() => {
    const power = roomLightPower(blend.roomLight) * seasonal.lightMultiplier;
    if (light.current) light.current.intensity = 2.8 * power;
    if (bulb.current) bulb.current.emissiveIntensity = 2 * power;
  });
  return (
    <group position={[-1.86, 1.45, -1.28]}>
      {/* Rubber footing, weighted enamel base, and inset rocker switch. */}
      <Cylinder
        position={[0, 0.01, 0]}
        args={[0.163, 0.163, 0.02]}
        color="#39333d"
      />
      <Cylinder
        position={[0, 0.034, 0]}
        args={[0.158, 0.17, 0.03]}
        color={enamel}
      />
      <Cylinder
        position={[0, 0.053, 0]}
        args={[0.14, 0.157, 0.012]}
        color={enamel}
      />
      <Cylinder
        position={[0, 0.085, -0.045]}
        args={[0.036, 0.048, 0.06]}
        color={brass}
      />
      <Box
        position={[0.065, 0.062, 0.055]}
        size={[0.055, 0.012, 0.08]}
        color="#4b404c"
        radius={0.009}
      />
      <Box
        position={[0.065, 0.069, 0.055]}
        rotation={[-0.12, 0, 0]}
        size={[0.038, 0.012, 0.055]}
        color="#e0cad1"
        radius={0.005}
      />
      <Box
        position={[0.065, 0.076, 0.044]}
        size={[0.003, 0.002, 0.014]}
        color="#71616d"
        radius={0.0005}
        castShadow={false}
      />
      {/* Paired rails, exposed tension springs, and bolted pivot joints. */}
      {[-0.034, 0.034].map((x) => (
        <group key={x}>
          <Link from={[x, 0.12, -0.045]} to={[x, 0.59, -0.17]} />
          <Link from={[x, 0.59, -0.17]} to={[x, 1.01, 0.045]} />
          <Link
            from={[x * 1.65, 0.19, -0.06]}
            to={[x * 1.65, 0.47, -0.135]}
            spring
          />
        </group>
      ))}
      <Hinge position={[0, 0.12, -0.045]} />
      <Hinge position={[0, 0.59, -0.17]} />
      <Hinge position={[0, 1.01, 0.045]} />
      <Link from={[0, 1.01, 0.045]} to={[0, 1.09, 0.14]} />
      <group position={[0, 1.045, 0.17]} rotation={[-0.22, 0, 0]}>
        <mesh castShadow receiveShadow>
          <latheGeometry args={[shade, 48]} />
          <meshStandardMaterial
            color={enamel}
            metalness={0.22}
            roughness={0.48}
          />
        </mesh>
        <mesh receiveShadow>
          <latheGeometry args={[reflector, 48]} />
          <meshStandardMaterial
            color="#f4e9da"
            side={BackSide}
            roughness={0.65}
          />
        </mesh>
        <mesh
          position={[0, -0.13, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <torusGeometry args={[0.215, 0.006, 8, 48]} />
          <meshStandardMaterial color={brass} metalness={0.5} roughness={0.4} />
        </mesh>
        <Cylinder
          position={[0, 0.152, 0]}
          args={[0.064, 0.064, 0.025]}
          color={metal}
        />
        <Cylinder
          position={[0, 0.18, 0]}
          args={[0.025, 0.04, 0.03]}
          color={brass}
        />
        <Cylinder
          position={[0, 0.077, 0]}
          args={[0.026, 0.026, 0.075]}
          color="#4b404c"
        />
        {[0.042, 0.05, 0.058].map((y) => (
          <Cylinder
            key={y}
            position={[0, y, 0]}
            args={[0.023, 0.023, 0.004]}
            color={brass}
          />
        ))}
        <mesh position={[0, -0.014, 0]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[0.044, 20, 16]} />
          <meshStandardMaterial
            ref={bulb}
            color="#fff2d7"
            emissive="#ffd29a"
            emissiveIntensity={0}
          />
        </mesh>
        <pointLight
          ref={light}
          position={[0, -0.14, 0]}
          color="#ffd7ae"
          intensity={0}
          distance={4}
        />
      </group>
      {/* A slack cord follows the arm and exits over the rear desk edge. */}
      <Cable
        points={[
          [0.035, 1.205, 0.17],
          [0.077, 1.08, 0.06],
          [0.08, 0.7, -0.14],
          [0.08, 0.36, -0.13],
          [0.055, 0.08, -0.14],
          [0.06, 0.015, -0.27],
          [0.12, -0.12, -0.36],
          [0.18, -0.65, -0.38],
        ]}
      />
    </group>
  );
}
