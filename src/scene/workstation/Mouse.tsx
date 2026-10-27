import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Shape,
  ExtrudeGeometry,
  SRGBColorSpace,
} from "three";
import { mouseDimensions as dimensions, workstationScale } from "./dimensions";
import Cable from "./Cable";
import { Box } from "../Objects";

type Station = [number, number, number];
// Front to rear: narrowed nose, low clicks, and a palm hump behind the center.
const stations: Station[] = [
  [0, 0.72, 0.4],
  [0.06, 0.88, 0.46],
  [0.19, 0.98, 0.59],
  [0.36, 0.95, 0.81],
  [0.55, 1, 1],
  [0.72, 0.98, 0.94],
  [0.87, 0.83, 0.73],
  [0.96, 0.53, 0.44],
  [1, 0.04, 0.17],
];
function profile(t: number, column: 1 | 2) {
  const i = Math.min(
    stations.length - 2,
    Math.max(
      0,
      stations.findIndex(
        (point, index) =>
          index < stations.length - 1 &&
          t >= point[0] &&
          t <= stations[index + 1][0],
      ),
    ),
  );
  const a = stations[i],
    b = stations[i + 1];
  const u = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
  const before = stations[Math.max(0, i - 1)],
    after = stations[Math.min(stations.length - 1, i + 2)];
  const m0 = (b[column] - before[column]) / (b[0] - before[0]);
  const m1 = (after[column] - a[column]) / (after[0] - a[0]);
  const span = b[0] - a[0];
  return (
    (2 * u ** 3 - 3 * u ** 2 + 1) * a[column] +
    (u ** 3 - 2 * u ** 2 + u) * m0 * span +
    (-2 * u ** 3 + 3 * u ** 2) * b[column] +
    (u ** 3 - u ** 2) * m1 * span
  );
}
function shellPoint(t: number, u: number, lift = 0): [number, number, number] {
  const height = profile(t, 2) * dimensions.height;
  return [
    (u * profile(t, 1) * dimensions.width) / 2,
    0.012 + Math.pow(Math.max(0, 1 - u * u), 0.58) * (height - 0.012) + lift,
    (t - 0.5) * dimensions.length,
  ];
}
function shellPatch(
  start: number,
  end: number,
  left: number,
  right: number,
  lift: number,
  rows = 36,
  columns = 24,
  roundedEnds = false,
) {
  const positions: number[] = [],
    indices: number[] = [];
  for (let row = 0; row <= rows; row++) {
    for (let col = 0; col <= columns; col++) {
      positions.push(
        ...shellPoint(
          start + ((end - start) * row) / rows,
          (left + ((right - left) * col) / columns) *
            (roundedEnds
              ? Math.sqrt(Math.max(0, 1 - ((2 * row) / rows - 1) ** 2))
              : 1),
          lift,
        ),
      );
      if (row < rows && col < columns) {
        const a = row * (columns + 1) + col,
          b = a + columns + 1;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
function noseCap() {
  const positions: number[] = [];
  for (let i = 0; i < 24; i++) {
    positions.push(
      ...shellPoint(0, -1 + i / 12),
      ...shellPoint(0, -1 + (i + 1) / 12),
      0,
      0.012,
      -dimensions.length / 2,
    );
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}

export default function Mouse() {
  const logo = useTexture("/images/leila-logo.png");
  useEffect(() => {
    logo.colorSpace = SRGBColorSpace;
    logo.needsUpdate = true;
  }, [logo]);
  const parts = useMemo(() => {
    const outline = new Shape();
    const points = Array.from({ length: 49 }, (_, i) => shellPoint(i / 48, 1));
    outline.moveTo(points[0][0] * 0.985, -points[0][2]);
    points.slice(1).forEach(([x, , z]) => outline.lineTo(x * 0.985, -z));
    [...points].reverse().forEach(([x, , z]) => outline.lineTo(-x * 0.985, -z));
    outline.closePath();
    // A curved decal follows the palm shell rather than floating above it.
    const logo = shellPatch(0.75, 0.89, -0.25, 0.25, 0.00035, 14, 12);
    const uvs: number[] = [];
    for (let row = 0; row <= 14; row++)
      for (let col = 0; col <= 12; col++) uvs.push(col / 12, 1 - row / 14);
    logo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    return {
      logo,
      body: shellPatch(0, 1, -1, 1, 0),
      nose: noseCap(),
      left: shellPatch(0.018, 0.43, -0.94, -0.013, 0.0015, 20, 12),
      right: shellPatch(0.018, 0.43, 0.013, 0.94, 0.0015, 20, 12),
      split: shellPatch(0.012, 0.439, -0.012, 0.012, 0.0016, 20, 2),
      wheelSlot: shellPatch(0.14, 0.285, -0.15, 0.15, 0.0018, 16, 8, true),
      base: new ExtrudeGeometry(outline, {
        depth: 0.008,
        bevelEnabled: true,
        bevelSize: 0.0008,
        bevelThickness: 0.0008,
        bevelSegments: 2,
        steps: 1,
      }),
    };
  }, []);
  useEffect(
    () => () => Object.values(parts).forEach((geometry) => geometry.dispose()),
    [parts],
  );
  const wheelZ = (0.21 - 0.5) * dimensions.length;
  const wheelY = shellPoint(0.21, 0)[1] - 0.007;
  return (
    <group
      position={[0.41, 1.457, -0.28]}
      rotation={[0, -0.08, 0]}
      scale={workstationScale.mouse}
      name="Contoured wireless mouse"
    >
      {/* The flat base and skates sit on the mat instead of sinking a sphere into it. */}
      <mesh
        geometry={parts.base}
        position={[0, 0.0025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#575451" roughness={0.85} />
      </mesh>
      {[0.19, 0.81].map((t) => (
        <mesh
          key={t}
          position={[0, 0.001, (t - 0.5) * dimensions.length]}
          scale={[0.042, 0.001, 0.012]}
        >
          <sphereGeometry args={[1, 16, 8]} />
          <meshStandardMaterial color="#c9c7c0" roughness={0.85} />
        </mesh>
      ))}
      <mesh geometry={parts.body} castShadow receiveShadow>
        <meshStandardMaterial color="#d2d0c9" roughness={0.62} />
      </mesh>
      <mesh geometry={parts.logo} receiveShadow name="Printed rose logo">
        <meshStandardMaterial
          map={logo}
          color="#000000"
          transparent
          depthWrite={false}
          roughness={0.8}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>
      <mesh geometry={parts.nose} castShadow>
        <meshStandardMaterial color="#d2d0c9" roughness={0.62} />
      </mesh>
      <mesh geometry={parts.split}>
        <meshStandardMaterial color="#625b58" roughness={0.85} />
      </mesh>
      {[parts.left, parts.right].map((geometry, i) => (
        <mesh key={i} geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial color="#dfdcd5" roughness={0.62} />
        </mesh>
      ))}
      <Cable
        points={Array.from({ length: 21 }, (_, i) =>
          shellPoint(0.436, -0.94 + i * 0.094, 0.0006),
        )}
        radius={0.00065}
        color="#77706a"
      />
      <mesh geometry={parts.wheelSlot}>
        <meshStandardMaterial color="#514b48" roughness={0.9} />
      </mesh>
      {/* The wheel is seated inside its recess, with transverse rubber grip ribs. */}
      <group position={[0, wheelY, wheelZ]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.014, 24]} />
          <meshStandardMaterial color="#3b393a" roughness={0.95} />
        </mesh>
        {Array.from({ length: 20 }, (_, i) => {
          const angle = (i * Math.PI) / 10;
          return (
            <mesh
              key={i}
              position={[0, Math.cos(angle) * 0.015, Math.sin(angle) * 0.015]}
              rotation={[angle, 0, 0]}
            >
              <boxGeometry args={[0.0145, 0.0012, 0.0022]} />
              <meshStandardMaterial color="#4b4846" roughness={0.9} />
            </mesh>
          );
        })}
      </group>
      {[-0.027, 0.014].map((z) => (
        <group
          key={z}
          position={shellPoint(z / dimensions.length + 0.5, -0.89, 0.001)}
          rotation={[0, 0, -0.3]}
        >
          <Box
            size={[0.004, 0.011, 0.033]}
            color="#77716a"
            radius={0.0013}
            castShadow={false}
          />
          <Box
            position={[-0.0016, 0.0005, 0]}
            size={[0.004, 0.008, 0.029]}
            color="#c4c0b8"
            radius={0.0013}
          />
        </group>
      ))}
      {/* Recessed USB-C charging port at the front, between the click panels. */}
      <mesh position={[0, 0.017, -dimensions.length / 2 - 0.0005]}>
        <boxGeometry args={[0.024, 0.008, 0.002]} />
        <meshStandardMaterial color="#504c49" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.017, -dimensions.length / 2 - 0.0016]}>
        <boxGeometry args={[0.017, 0.003, 0.001]} />
        <meshStandardMaterial
          color="#aaa49c"
          roughness={0.6}
          metalness={0.25}
        />
      </mesh>
    </group>
  );
}
