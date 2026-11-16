import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  MeshStandardMaterial,
  PointLight,
  Shape,
} from "three";
import { FirAssets, FirFoliage, type FirSpray } from "./FirGreenery";
import StaticBatch from "../../scene/StaticBatch";
import Cable from "../../scene/workstation/Cable";
import { useEnvironmentTransition } from "../../scene/EnvironmentTransition";
import { roomLightPower } from "../../scene/lightingLevels";

type V3 = [number, number, number];
const burgundy = "#721b2a",
  gold = "#c5a06a",
  ivory = "#e8ddc9";

function Bow({ position, scale = 1 }: { position: V3; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh
            position={[s * 0.13, 0.015, 0]}
            rotation={[0, 0, s * -0.32]}
            scale={[1, 0.6, 0.32]}
            castShadow
          >
            <torusGeometry args={[0.105, 0.045, 6, 16]} />
            <meshStandardMaterial color={burgundy} roughness={0.8} />
          </mesh>
          <mesh
            position={[s * 0.085, -0.17, 0.012]}
            rotation={[0, 0, s * 0.2]}
            castShadow
          >
            <boxGeometry args={[0.095, 0.3, 0.022]} />
            <meshStandardMaterial color={burgundy} roughness={0.85} />
          </mesh>
        </group>
      ))}
      <mesh scale={[1, 0.8, 0.65]}>
        <sphereGeometry args={[0.065, 12, 8]} />
        <meshStandardMaterial color={burgundy} roughness={0.8} />
      </mesh>
    </group>
  );
}

function Gift({
  position,
  size,
  color,
  rotation = 0,
}: {
  position: V3;
  size: V3;
  color: string;
  rotation?: number;
}) {
  const [w, h, d] = size;
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, h / 2, 0]}>
        <boxGeometry args={[w * 0.14, h + 0.007, d + 0.01]} />
        <meshStandardMaterial color={gold} roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, h + 0.006, 0]}>
        <boxGeometry args={[w + 0.01, 0.009, d * 0.14]} />
        <meshStandardMaterial color={gold} roughness={0.5} metalness={0.35} />
      </mesh>
      <Bow position={[0, h + 0.035, 0]} scale={0.55} />
      <mesh
        position={[w * 0.26, h * 0.77, d / 2 + 0.006]}
        rotation={[0, 0, -0.18]}
      >
        <boxGeometry args={[0.09, 0.12, 0.004]} />
        <meshStandardMaterial color={ivory} roughness={1} />
      </mesh>
    </group>
  );
}

function Garland({
  width,
  position,
  yaw = 0,
  drop = 0.18,
}: {
  width: number;
  position: V3;
  yaw?: number;
  drop?: number;
}) {
  const count = Math.ceil(width / 0.075);
  const sprays = useMemo<FirSpray[]>(
    () =>
      Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1);
        return {
          position: [
            (t - 0.5) * (width - 0.2),
            -(Math.sin(t * Math.PI * 2) ** 2) * drop,
            0,
          ],
          direction: [i % 2 ? -0.75 : 0.75, i % 3 === 0 ? -0.45 : 0.4, 0.16],
          length: 0.32,
          width: 1.1,
          roll: ((i % 3) - 1) * 0.25,
        };
      }),
    [count, width, drop],
  );
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <FirFoliage sprays={sprays} />
      {Array.from({ length: count }, (_, i) => {
        const t = i / (count - 1),
          x = (t - 0.5) * width,
          y = -(Math.sin(t * Math.PI * 2) ** 2) * drop;
        return (
          <group key={i} position={[x, y, 0]}>
            {i % 7 === 0 && (
              <mesh position={[0, -0.065, 0.05]} castShadow>
                <sphereGeometry args={[0.035, 10, 8]} />
                <meshStandardMaterial color={burgundy} roughness={0.35} />
              </mesh>
            )}
          </group>
        );
      })}
      <TreeBulbs
        positions={Array.from({ length: Math.ceil(width / 0.17) }, (_, i) => {
          const count = Math.ceil(width / 0.17),
            t = i / (count - 1);
          return [
            (t - 0.5) * width,
            -(Math.sin(t * Math.PI * 2) ** 2) * drop,
            0.085,
          ] as V3;
        })}
      />
      <Bow position={[-width / 2, -0.04, 0.08]} scale={0.65} />
      <Bow position={[width / 2, -0.04, 0.08]} scale={0.65} />
    </group>
  );
}

function Wreath({ position, yaw = 0 }: { position: V3; yaw?: number }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <FirFoliage
        sprays={Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return {
            position: [Math.cos(a) * 0.31, Math.sin(a) * 0.31, 0],
            direction: [-Math.sin(a), Math.cos(a), 0.15],
            length: 0.26,
            width: 1.2,
            roll: ((i % 3) - 1) * 0.3,
          };
        })}
      />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.32, Math.sin(a) * 0.32, 0.07]}
          >
            <sphereGeometry args={[0.038, 12, 8]} />
            <meshStandardMaterial
              color={i % 2 ? gold : burgundy}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        );
      })}
      <Bow position={[0, -0.29, 0.12]} scale={1.1} />
    </group>
  );
}

function Stocking({ position, yaw = 0 }: { position: V3; yaw?: number }) {
  return (
    <group position={position} rotation={[0, yaw, -0.12]}>
      <mesh position={[0, -0.16, 0]} scale={[0.095, 0.22, 0.055]} castShadow>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={burgundy} roughness={1} />
      </mesh>
      <mesh
        position={[0.07, -0.32, 0]}
        rotation={[0, 0, 0.3]}
        scale={[0.16, 0.085, 0.06]}
        castShadow
      >
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color={burgundy} roughness={1} />
      </mesh>
      <mesh>
        <boxGeometry args={[0.225, 0.11, 0.13]} />
        <meshStandardMaterial color={ivory} roughness={1} />
      </mesh>
      <Cable
        points={[
          [0, 0.04, 0],
          [0, 0.12, 0],
          [0.035, 0.13, 0],
          [0.045, 0.05, 0],
        ]}
        radius={0.008}
        color={gold}
      />
    </group>
  );
}

function ChristmasTree() {
  const bounce = useRef<PointLight>(null);
  const env = useEnvironmentTransition();
  const star = useMemo(() => {
    const shape = new Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5,
        r = i % 2 ? 0.095 : 0.205;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    shape.closePath();
    return shape;
  }, []);
  const treeSprays = useMemo<FirSpray[]>(() => {
    const sprays: FirSpray[] = [];
    for (let tier = 0; tier < 17; tier++) {
      const y = 0.65 + tier * 0.155,
        radius = 0.69 * (1 - tier / 18),
        count = 11;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + tier * 2.399;
        sprays.push({
          position: [Math.cos(a) * 0.03, y, Math.sin(a) * 0.03],
          direction: [
            Math.cos(a),
            -0.15 + Math.sin(i * 2.7) * 0.09,
            Math.sin(a),
          ],
          length: radius * (1 + 0.07 * Math.sin(i * 3 + tier)),
          width: 1.3,
          roll: i * 0.75 + tier * 0.3,
        });
      }
    }
    // An upright, needled leader meets the star without a solid conical cap.
    sprays.push({
      position: [0, 2.9, 0],
      direction: [0, 1, 0],
      length: 0.4,
      width: 0.6,
    });
    return sprays;
  }, []);
  const bulbs = useMemo(
    () =>
      Array.from({ length: 128 }, (_, i) => {
        const t = i / 127,
          a = t * Math.PI * 2 * 7,
          r = 0.68 * (1 - t) + 0.04;
        return [Math.cos(a) * r, 0.58 + t * 2.62, Math.sin(a) * r] as V3;
      }),
    [],
  );
  useFrame(() => {
    if (bounce.current)
      bounce.current.intensity =
        0.6 * Math.min(1, roomLightPower(env.roomLight) * 3);
  });
  return (
    <group position={[4.88, 0.015, -2.48]} name="Christmas fir tree">
      <mesh
        position={[0, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <circleGeometry args={[0.85, 48]} />
        <meshStandardMaterial color={ivory} roughness={1} />
      </mesh>
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.08, 0.8, 12]} />
        <meshStandardMaterial color="#5a4030" roughness={1} />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.19, 0.32, 24]} />
        <meshStandardMaterial color={burgundy} roughness={0.9} />
      </mesh>
      <FirFoliage sprays={treeSprays} />
      {Array.from({ length: 42 }, (_, i) => {
        const t = (i + 0.5) / 43,
          a = i * 2.4,
          r = 0.69 * (1 - t) + 0.045,
          s = i % 3 === 0 ? 0.075 : 0.055;
        return (
          <group
            key={i}
            position={[Math.cos(a) * r, 0.67 + t * 2.4, Math.sin(a) * r]}
          >
            <mesh castShadow>
              <sphereGeometry args={[s, 16, 12]} />
              <meshStandardMaterial
                color={[burgundy, gold, ivory][i % 3]}
                metalness={i % 3 === 1 ? 0.65 : 0.12}
                roughness={i % 3 === 1 ? 0.28 : 0.5}
              />
            </mesh>
            <mesh position={[0, s + 0.008, 0]}>
              <cylinderGeometry args={[0.016, 0.018, 0.022, 8]} />
              <meshStandardMaterial
                color={gold}
                metalness={0.65}
                roughness={0.35}
              />
            </mesh>
          </group>
        );
      })}
      <Cable
        points={bulbs.filter((_, i) => i % 2 === 0)}
        segments={192}
        color="#625337"
        radius={0.007}
      />
      <mesh position={[0, 3.42, 0]} castShadow>
        <extrudeGeometry
          args={[
            star,
            {
              depth: 0.045,
              bevelEnabled: true,
              bevelSize: 0.015,
              bevelThickness: 0.012,
              bevelSegments: 1,
              steps: 1,
            },
          ]}
        />
        <meshStandardMaterial color={gold} metalness={0.65} roughness={0.3} />
      </mesh>
      <Bow position={[0, 2.62, 0.23]} scale={0.8} />
      <TreeBulbs positions={bulbs} />
      <pointLight
        ref={bounce}
        position={[0, 1.6, 0.95]}
        color="#ffd094"
        intensity={0}
        distance={3.5}
        decay={2}
      />
      <Gift
        position={[-0.55, 0.09, 0.4]}
        size={[0.48, 0.32, 0.4]}
        color={burgundy}
        rotation={0.2}
      />
      <Gift
        position={[0.28, 0.09, 0.64]}
        size={[0.4, 0.48, 0.32]}
        color={ivory}
        rotation={-0.2}
      />
      <Gift
        position={[-0.15, 0.09, 0.83]}
        size={[0.32, 0.18, 0.28]}
        color="#887254"
        rotation={0.1}
      />
    </group>
  );
}

// Instanced beads add one draw call, with no per-bulb lights or shadow maps.
function TreeBulbs({ positions }: { positions: V3[] }) {
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const env = useEnvironmentTransition();
  useLayoutEffect(() => {
    const object = new Object3D();
    positions.forEach((p, i) => {
      object.position.set(...p);
      object.updateMatrix();
      mesh.current!.setMatrixAt(i, object.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
    mesh.current!.computeBoundingSphere();
  }, [positions]);
  useFrame(() => {
    if (material.current)
      material.current.emissiveIntensity =
        2.5 * Math.min(1, roomLightPower(env.roomLight) * 3);
  });
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, positions.length]}>
      <sphereGeometry args={[0.019, 6, 4]} />
      <meshStandardMaterial
        ref={material}
        color="#ffe4ad"
        emissive="#ffc477"
        emissiveIntensity={0}
        roughness={0.35}
      />
    </instancedMesh>
  );
}

export default function ChristmasRoom() {
  return (
    <FirAssets>
      <StaticBatch>
        <group name="Christmas decorations — burgundy, fir and champagne">
          <ChristmasTree />
          <Garland width={4.35} position={[0, 4.76, -3.1]} />
          <Garland
            width={2.95}
            position={[5.48, 3.04, 0.4]}
            yaw={-Math.PI / 2}
            drop={0.12}
          />
          <Garland width={1.5} position={[-3.65, 2.43, -2.73]} drop={0.09} />
          <Garland width={1.95} position={[3.25, 3.69, -3.12]} drop={0.07} />
          <group position={[-3.65, 4.77, -3.12]} scale={0.65}>
            <Wreath position={[0, 0, 0]} />
          </group>
          <Stocking position={[5.02, 1.02, -0.48]} yaw={-Math.PI / 2} />
          <Stocking position={[5.02, 1.02, 0.13]} yaw={-Math.PI / 2} />
          <Gift
            position={[-3.95, 0.025, -2.52]}
            size={[0.48, 0.35, 0.4]}
            color={ivory}
            rotation={0.16}
          />
          <Gift
            position={[-3.62, 0.025, -2.35]}
            size={[0.3, 0.23, 0.28]}
            color={burgundy}
            rotation={-0.18}
          />
          <Bow position={[3.25, 3.69, -2.99]} scale={0.75} />
        </group>
      </StaticBatch>
    </FirAssets>
  );
}
