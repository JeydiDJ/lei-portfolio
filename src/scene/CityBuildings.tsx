import { useLayoutEffect, useMemo, useRef } from "react";
import {
  Color,
  Euler,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from "three";
import { useFrame } from "@react-three/fiber";
import { useEnvironmentTransition } from "./EnvironmentTransition";
const dayWindowColor = new Color("#657d94"),
  nightWindowColor = new Color("#e7bc89");

type Building = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  roof: boolean;
};
function makeCity() {
  let seed = 239;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const buildings: Building[] = [];
  const lit: Matrix4[] = [],
    dark: Matrix4[] = [];
  const quaternion = new Quaternion(),
    position = new Vector3(),
    scale = new Vector3();
  const addWindow = (
    x: number,
    y: number,
    z: number,
    angle: number,
    width: number,
  ) => {
    const matrix = new Matrix4();
    position.set(x, y, z);
    scale.set(width, 0.47, 1);
    quaternion.setFromEuler(new Euler(0, angle, 0));
    matrix.compose(position, quaternion, scale);
    (random() > 0.62 ? lit : dark).push(matrix);
  };
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      const x = -39 + col * 8.5 + (row % 2) * 3;
      const z = -11 - row * 12 - random() * 2;
      const width = 4 + random() * 2.5,
        depth = 4 + random() * 2;
      // The studio is elevated: nearby rooftops sit below the distant towers.
      const height =
        row === 0 ? 11 + random() * 4 : 10 + row * 2 + random() * (4 + row * 2);
      buildings.push({
        x,
        z,
        width,
        depth,
        height,
        color: ["#6b6176", "#786b7e", "#655e73", "#8b7581"][
          Math.floor(random() * 4)
        ],
        roof: random() > 0.4,
      });
      const columns = Math.floor(width / 0.75),
        sideColumns = Math.floor(depth / 0.75);
      for (let y = -10.9; y < height - 12 - 0.7; y += 0.95) {
        for (let c = 0; c < columns; c++) {
          const wx = x - width / 2 + ((c + 0.5) * width) / columns;
          addWindow(wx, y, z + depth / 2 + 0.012, 0, 0.32);
          addWindow(wx, y, z - depth / 2 - 0.012, Math.PI, 0.32);
        }
        for (let c = 0; c < sideColumns; c++) {
          const wz = z - depth / 2 + ((c + 0.5) * depth) / sideColumns;
          addWindow(x + width / 2 + 0.012, y, wz, Math.PI / 2, 0.32);
          addWindow(x - width / 2 - 0.012, y, wz, -Math.PI / 2, 0.32);
        }
      }
    }
  }
  return { buildings, lit, dark };
}
function WindowInstances({
  matrices,
  lit,
  night,
}: {
  matrices: Matrix4[];
  lit: boolean;
  night: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const blend = useEnvironmentTransition();
  useFrame(() => {
    if (!material.current) return;
    material.current.color.lerpColors(
      dayWindowColor,
      nightWindowColor,
      lit ? blend.night : 0,
    );
    material.current.emissiveIntensity = lit ? 1.5 * blend.night : 0;
  });
  useLayoutEffect(() => {
    if (!ref.current) return;
    matrices.forEach((matrix, i) => ref.current!.setMatrixAt(i, matrix));
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [matrices]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, matrices.length]}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial
        ref={material}
        emissive={lit ? "#efbd86" : "#000000"}
        emissiveIntensity={0}
        roughness={0.6}
      />
    </instancedMesh>
  );
}
type CityPart = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
};
function CityParts({
  parts,
  antenna = false,
  facade = false,
}: {
  parts: CityPart[];
  antenna?: boolean;
  facade?: boolean;
}) {
  const mesh = useRef<InstancedMesh>(null);
  const material = useRef<MeshStandardMaterial>(null);
  const blend = useEnvironmentTransition();
  useFrame(() => {
    if (facade && material.current)
      material.current.emissiveIntensity = 0.045 * blend.night;
  });
  useLayoutEffect(() => {
    if (!mesh.current) return;
    const matrix = new Matrix4(),
      color = new Color();
    for (let i = 0; i < parts.length; i++) {
      matrix.makeScale(...parts[i].scale);
      matrix.setPosition(...parts[i].position);
      mesh.current.setMatrixAt(i, matrix);
      mesh.current.setColorAt(i, color.set(parts[i].color));
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor)
      mesh.current.instanceColor.needsUpdate = true;
    mesh.current.computeBoundingSphere();
  }, [parts]);
  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, parts.length]}
      castShadow
      receiveShadow
    >
      {antenna ? (
        <cylinderGeometry args={[0.025, 0.035, 1.9, 6]} />
      ) : (
        <boxGeometry args={[1, 1, 1]} />
      )}
      <meshStandardMaterial
        ref={material}
        roughness={0.9}
        emissive={facade ? "#64556c" : "#000000"}
        emissiveIntensity={0}
      />
    </instancedMesh>
  );
}
export default function CityBuildings({ night }: { night: number }) {
  const city = useMemo(makeCity, []);
  const parts = useMemo(() => {
    const facades: CityPart[] = [],
      roofs: CityPart[] = [],
      equipment: CityPart[] = [],
      antennas: CityPart[] = [];
    for (const b of city.buildings) {
      facades.push({
        position: [b.x, b.height / 2 - 12, b.z],
        scale: [b.width, b.height, b.depth],
        color: b.color,
      });
      roofs.push({
        position: [b.x, b.height - 11.96, b.z],
        scale: [b.width + 0.16, 0.12, b.depth + 0.16],
        color: "#aa929a",
      });
      if (b.roof) {
        equipment.push({
          position: [b.x + 0.5, b.height - 11.65, b.z],
          scale: [1.2, 0.6, 1.1],
          color: "#89828b",
        });
        antennas.push({
          position: [b.x - 0.6, b.height - 11.05, b.z - 0.3],
          scale: [1, 1, 1],
          color: "#aaa1ad",
        });
      }
    }
    return { facades, roofs, equipment, antennas };
  }, [city]);
  return (
    <group>
      <mesh position={[0, -12.12, -31]} receiveShadow>
        <boxGeometry args={[150, 0.2, 110]} />
        <meshStandardMaterial color="#383641" roughness={1} />
      </mesh>
      <CityParts parts={parts.facades} facade />
      <CityParts parts={parts.roofs} />
      <CityParts parts={parts.equipment} />
      <CityParts parts={parts.antennas} antenna />
      <WindowInstances matrices={city.lit} lit night={night} />
      <WindowInstances matrices={city.dark} lit={false} night={night} />
    </group>
  );
}
