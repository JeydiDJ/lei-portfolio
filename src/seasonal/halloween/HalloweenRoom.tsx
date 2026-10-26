import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Shape, type Group } from "three";
import { Box } from "../../scene/Objects";
import StaticBatch from "../../scene/StaticBatch";
import Cable from "../../scene/workstation/Cable";
import { useSeasonalFeatures } from "../SeasonalFeatures";
import Phantom from "./Phantom";

function Pumpkin({
  position,
  scale = 1,
}: {
  position: [number, number, number];
  scale?: number;
}) {
  const face = useMemo(() => {
    const eye = new Shape();
    eye.moveTo(-0.07, -0.04);
    eye.lineTo(0.07, -0.04);
    eye.lineTo(0, 0.065);
    eye.closePath();
    const smile = new Shape();
    smile.moveTo(-0.15, 0.01);
    smile.lineTo(-0.085, -0.065);
    smile.lineTo(0, -0.09);
    smile.lineTo(0.085, -0.065);
    smile.lineTo(0.15, 0.01);
    smile.lineTo(0.045, -0.025);
    smile.lineTo(0.025, 0.01);
    smile.lineTo(-0.025, 0.01);
    smile.lineTo(-0.045, -0.025);
    smile.closePath();
    return { eye, smile };
  }, []);
  return (
    <group position={position} scale={scale} rotation={[0, 0.25, 0]}>
      {Array.from({ length: 9 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 9;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.105, 0, Math.sin(angle) * 0.105]}
            scale={[0.23, 0.27, 0.23]}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial
              color={i % 2 ? "#b85d25" : "#ca6d2c"}
              roughness={0.87}
            />
          </mesh>
        );
      })}
      <mesh position={[0, 0.285, 0]} rotation={[0, 0, -0.22]} castShadow>
        <cylinderGeometry args={[0.035, 0.055, 0.13, 7]} />
        <meshStandardMaterial color="#5a5140" roughness={1} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.125, 0.075, 0.314]}
          rotation={[0, side * 0.22, side * -0.12]}
        >
          <shapeGeometry args={[face.eye]} />
          <meshStandardMaterial
            color="#ffb759"
            emissive="#f48b24"
            emissiveIntensity={0.65}
            roughness={0.75}
          />
        </mesh>
      ))}
      <mesh position={[0, -0.07, 0.332]}>
        <shapeGeometry args={[face.smile]} />
        <meshStandardMaterial
          color="#ffb759"
          emissive="#f48b24"
          emissiveIntensity={0.65}
        />
      </mesh>
    </group>
  );
}

export default function HalloweenRoom() {
  const state = useSeasonalFeatures();
  const gl = useThree((state) => state.gl);
  const decorations = useRef<Group>(null);
  const bat = useMemo(() => {
    const shape = new Shape();
    const points = [
      [-0.36, 0.12],
      [-0.28, -0.1],
      [-0.16, -0.025],
      [-0.08, -0.1],
      [0, -0.03],
      [0.08, -0.1],
      [0.16, -0.025],
      [0.28, -0.1],
      [0.36, 0.12],
      [0.15, 0.045],
      [0.065, 0.085],
      [0.04, 0.17],
      [0, 0.12],
      [-0.04, 0.17],
      [-0.065, 0.085],
      [-0.15, 0.045],
    ];
    shape.moveTo(...(points[0] as [number, number]));
    points.slice(1).forEach(([x, y]) => shape.lineTo(x, y));
    shape.closePath();
    return shape;
  }, []);
  useFrame(() => {
    if (
      decorations.current &&
      decorations.current.visible !== state.halloween
    ) {
      decorations.current.visible = state.halloween;
      gl.shadowMap.needsUpdate = true;
    }
  });
  return (
    <group name="Halloween seasonal features" userData={{ dynamic: true }}>
      <group ref={decorations} visible={state.halloween}>
        <StaticBatch>
          <Pumpkin position={[-2.75, 0.29, -0.35]} />
          <Pumpkin position={[2.56, 1.3, -2.58]} scale={0.55} />
          <Cable
            points={[
              [-1.95, 4.48, -3.15],
              [-1, 4.32, -3.15],
              [0, 4.26, -3.15],
              [1, 4.32, -3.15],
              [1.95, 4.48, -3.15],
            ]}
            radius={0.006}
            color="#704346"
          />
          {[-1.55, -0.75, 0, 0.75, 1.55].map((x, i) => (
            <group key={x} position={[x, 4.28 + Math.abs(x) * 0.075, -3.12]}>
              <Box
                position={[0, -0.065, 0]}
                size={[0.005, 0.14, 0.005]}
                color="#987052"
                radius={0}
                castShadow={false}
              />
              <mesh
                position={[0, -0.18, 0]}
                rotation={[0, 0, i % 2 ? -0.12 : 0.12]}
                scale={0.62}
              >
                <shapeGeometry args={[bat]} />
                <meshStandardMaterial color="#38252c" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </StaticBatch>
      </group>
      <Phantom />
    </group>
  );
}
