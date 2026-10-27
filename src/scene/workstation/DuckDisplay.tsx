import { memo, useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector3,
  MathUtils,
  type Group,
} from "three";
import StaticBatch from "../StaticBatch";
import CursedDuckFace, {
  useCursedDuck,
} from "../../seasonal/halloween/CursedDuck";

type Vec3 = [number, number, number];

/** Authored flat faces preserve the broad, folded-paper shapes in the reference. */
function PolygonPart({
  vertices,
  faces,
  color,
}: {
  vertices: Vec3[];
  faces: number[][];
  color: string;
}) {
  const geometry = useMemo(() => {
    const center = vertices
      .reduce((sum, point) => sum.add(new Vector3(...point)), new Vector3())
      .divideScalar(vertices.length);
    const triangles = faces.flatMap((indices) => {
      const a = new Vector3(...vertices[indices[0]]);
      const normal = new Vector3(...vertices[indices[1]])
        .sub(a)
        .cross(new Vector3(...vertices[indices[2]]).sub(a));
      // Keep all convex solid faces outward, including mirrored wings and feet.
      const face =
        normal.dot(a.clone().sub(center)) < -0.000001
          ? [...indices].reverse()
          : indices;
      return Array.from({ length: face.length - 2 }, (_, i) =>
        [face[0], face[i + 1], face[i + 2]].flatMap((index) => vertices[index]),
      ).flat();
    });
    const result = new BufferGeometry();
    result.setAttribute("position", new Float32BufferAttribute(triangles, 3));
    result.computeVertexNormals();
    return result;
  }, [vertices, faces]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  );
}

// Six-sided body sections: no subdivision or rounded sphere primitives.
const bodyVertices: Vec3[] = [
  ...[0.11, 0.34, 0.6, 0.7].flatMap((y, level) =>
    Array.from({ length: 6 }, (_, i): Vec3 => {
      const angle = (i * Math.PI) / 3 + Math.PI / 6;
      const radius = [0.17, 0.32, 0.23, 0.13][level];
      return [
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius * 1.1 - 0.045,
      ];
    }),
  ),
];
const bodyFaces = [
  [5, 4, 3, 2, 1, 0],
  ...Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 6 }, (_, i) => [
      row * 6 + i,
      row * 6 + ((i + 1) % 6),
      (row + 1) * 6 + ((i + 1) % 6),
      (row + 1) * 6 + i,
    ]),
  ).flat(),
  [18, 19, 20, 21, 22, 23],
];

// Beveled polygonal face, with the kerchief following its outline rather than a second round head.
const faceOutline: [number, number][] = [
  [-0.23, 0.78],
  [-0.26, 0.96],
  [-0.18, 1.105],
  [0.08, 1.13],
  [0.235, 1.04],
  [0.265, 0.88],
  [0.19, 0.735],
  [-0.08, 0.72],
];
const hoodOutline: [number, number][] = [
  [-0.26, 0.735],
  [-0.305, 0.96],
  [-0.215, 1.145],
  [0.08, 1.22],
  [0.275, 1.075],
  [0.31, 0.875],
  [0.23, 0.69],
  [-0.09, 0.665],
];
const headVertices: Vec3[] = [
  ...faceOutline.map(([x, y]): Vec3 => [x, y, 0.19]),
  [0.015, 0.94, 0.25],
];
const headFaces = Array.from({ length: 8 }, (_, i) => [8, (i + 1) % 8, i]);
const hoodVertices: Vec3[] = [
  ...faceOutline.map(([x, y]): Vec3 => [x, y, 0.19]),
  ...hoodOutline.map(([x, y]): Vec3 => [x, y, 0.14]),
  ...hoodOutline.map(([x, y]): Vec3 => [x * 0.9, y, -0.18]),
];
const hoodFaces = [
  ...Array.from({ length: 8 }, (_, i) => [
    i,
    (i + 1) % 8,
    8 + ((i + 1) % 8),
    8 + i,
  ]),
  ...Array.from({ length: 8 }, (_, i) => [
    8 + i,
    8 + ((i + 1) % 8),
    16 + ((i + 1) % 8),
    16 + i,
  ]),
  [16, 17, 18, 19, 20, 21, 22, 23],
];
const tetraFaces = [
  [0, 2, 1],
  [0, 1, 3],
  [1, 2, 3],
  [2, 0, 3],
];

/** Occasional idle gestures; geometry stays batched within the moving body/head pivots. */
export default memo(function DuckDisplay({
  staticPose = false,
}: {
  staticPose?: boolean;
}) {
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const applyCurse = useCursedDuck(body, head);
  const reducedMotion = useRef(false);
  const motion = useRef({
    mode: -1,
    previous: -1,
    startedAt: 0,
    waitUntil: performance.now() + 5000,
    direction: 1,
  });
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotion.current = preference.matches;
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useFrame(() => {
    if (staticPose) return;
    if (!body.current || !head.current) return;
    const state = motion.current;
    const now = performance.now();
    const reset = () => {
      body.current!.rotation.set(0, -0.28, 0);
      body.current!.position.y = 0.028;
      head.current!.rotation.set(0, 0, 0);
    };
    if (applyCurse(now)) {
      state.mode = -1;
      state.waitUntil = now + 8000;
      return;
    }
    if (reducedMotion.current || document.hidden) {
      if (state.mode !== -1) {
        reset();
        state.mode = -1;
        state.waitUntil = now + 8000;
      }
      return;
    }
    if (state.mode === -1) {
      if (now < state.waitUntil) return;
      // Choose another gesture, with a quiet pause between each one.
      state.mode =
        state.previous < 0
          ? 0
          : (state.previous + 1 + Math.floor(Math.random() * 2)) % 3;
      state.previous = state.mode;
      state.direction = Math.random() > 0.5 ? 1 : -1;
      state.startedAt = now;
    }
    const duration = [3.8, 1.5, 2.4][state.mode];
    const t = Math.min(1, (now - state.startedAt) / (duration * 1000));
    const envelope = Math.sin(Math.PI * t) ** 2;
    reset();
    if (state.mode === 0) {
      // Turn, hold briefly, glance the other way, then settle back to the original pose.
      const first =
        MathUtils.smoothstep(t, 0, 0.2) - MathUtils.smoothstep(t, 0.44, 0.65);
      const second =
        MathUtils.smoothstep(t, 0.56, 0.74) - MathUtils.smoothstep(t, 0.84, 1);
      head.current.rotation.y = state.direction * (first * 0.6 - second * 0.38);
      head.current.rotation.x = Math.sin(t * Math.PI * 2) * 0.07 * envelope;
      head.current.rotation.z = state.direction * 0.045 * envelope;
    } else if (state.mode === 1) {
      body.current.rotation.y += Math.sin(t * Math.PI * 10) * 0.085 * envelope;
      body.current.rotation.z = Math.sin(t * Math.PI * 12) * 0.06 * envelope;
      head.current.rotation.y =
        Math.sin(t * Math.PI * 12 + 0.4) * 0.16 * envelope;
      head.current.rotation.z = -body.current.rotation.z * 0.5;
    } else {
      body.current.rotation.z = Math.sin(t * Math.PI * 6) * 0.105 * envelope;
      body.current.rotation.y += Math.sin(t * Math.PI * 3) * 0.06 * envelope;
      head.current.rotation.x = Math.sin(t * Math.PI * 6) * 0.09 * envelope;
    }
    // Lift the low foot just enough to keep the duck on top of its stationary plinth.
    body.current.position.y +=
      0.47 * 0.28 * Math.abs(Math.sin(body.current.rotation.z));
    if (t === 1) {
      reset();
      state.mode = -1;
      state.waitUntil = now + (7 + Math.random() * 10) * 1000;
    }
  });
  return (
    <group name="Quick Quack duck display" scale={0.624}>
      <mesh position={[0, 0.014, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.185, 0.19, 0.028, 8]} />
        <meshStandardMaterial color="#d6b4a6" roughness={0.85} />
      </mesh>
      <group
        ref={body}
        position={[0, 0.028, 0]}
        scale={0.47}
        rotation={[0, -0.28, 0]}
        userData={{ dynamic: true }}
      >
        <StaticBatch>
          <PolygonPart
            vertices={bodyVertices}
            faces={bodyFaces}
            color="#f2f4df"
          />
          <PolygonPart
            vertices={[
              [-0.12, 0.57, 0.15],
              [0.12, 0.57, 0.15],
              [0.12, 0.57, -0.09],
              [-0.12, 0.57, -0.09],
              [-0.15, 0.77, 0.17],
              [0.15, 0.77, 0.17],
              [0.15, 0.77, -0.08],
              [-0.15, 0.77, -0.08],
            ]}
            faces={[
              [0, 1, 5, 4],
              [1, 2, 6, 5],
              [2, 3, 7, 6],
              [3, 0, 4, 7],
              [4, 5, 6, 7],
              [3, 2, 1, 0],
            ]}
            color="#f2f4df"
          />
          {[-1, 1].map((side) => (
            <group key={side}>
              <PolygonPart
                vertices={[
                  [side * 0.05, 0.02, 0.01],
                  [side * 0.28, 0.02, 0.29],
                  [side * 0.04, 0.02, 0.32],
                  [side * 0.14, 0.095, 0.11],
                ]}
                faces={
                  side > 0
                    ? tetraFaces
                    : tetraFaces.map((face) => [...face].reverse())
                }
                color="#f6a51a"
              />
              <PolygonPart
                vertices={[
                  [side * 0.22, 0.61, 0.015],
                  [side * 0.31, 0.34, 0.18],
                  [side * 0.17, 0.15, 0.12],
                  [side * 0.34, 0.4, -0.07],
                ]}
                faces={
                  side > 0
                    ? tetraFaces
                    : tetraFaces.map((face) => [...face].reverse())
                }
                color="#e5edd7"
              />
            </group>
          ))}
          <PolygonPart
            vertices={[
              [-0.15, 0.3, -0.22],
              [0.15, 0.3, -0.22],
              [0, 0.69, -0.38],
              [0, 0.43, -0.13],
            ]}
            faces={tetraFaces}
            color="#e5edd7"
          />
          <group
            ref={head}
            position={[0, 0.7, 0.02]}
            userData={{ dynamic: true }}
          >
            <group position={[0, -0.7, -0.02]}>
              <CursedDuckFace />
              <StaticBatch>
                <PolygonPart
                  vertices={hoodVertices}
                  faces={hoodFaces}
                  color="#e52d25"
                />
                <PolygonPart
                  vertices={headVertices}
                  faces={headFaces}
                  color="#fff8e3"
                />
                {/* Broad orange bill, open mouth, and angular lower jaw from the artwork. */}
                <PolygonPart
                  vertices={[
                    [-0.23, 0.865, 0.2],
                    [0.23, 0.865, 0.2],
                    [-0.2, 0.79, 0.5],
                    [0.2, 0.79, 0.5],
                    [0, 0.955, 0.29],
                    [0, 0.815, 0.565],
                  ]}
                  faces={[
                    [0, 4, 2],
                    [4, 5, 2],
                    [4, 1, 5],
                    [1, 3, 5],
                    [2, 5, 3],
                    [0, 2, 3, 1],
                    [0, 1, 4],
                  ]}
                  color="#ffb519"
                />
                <PolygonPart
                  vertices={[
                    [-0.19, 0.79, 0.25],
                    [0.19, 0.79, 0.25],
                    [0.17, 0.72, 0.44],
                    [-0.17, 0.72, 0.44],
                  ]}
                  faces={[[0, 3, 2, 1]]}
                  color="#ae5a1d"
                />
                <PolygonPart
                  vertices={[
                    [-0.18, 0.72, 0.23],
                    [0.18, 0.72, 0.23],
                    [-0.16, 0.705, 0.45],
                    [0.16, 0.705, 0.45],
                    [0, 0.675, 0.34],
                  ]}
                  faces={[
                    [0, 2, 3, 1],
                    [0, 4, 2],
                    [2, 4, 3],
                    [3, 4, 1],
                    [1, 4, 0],
                  ]}
                  color="#f39a15"
                />
                {/* Small navy eye blocks, with no tessellated round eyeballs. */}
                {[-1, 1].map((side) => (
                  <mesh
                    key={side}
                    position={[side * 0.205, 0.975, 0.205]}
                    rotation={[0, side * 0.18, side * -0.1]}
                    castShadow
                  >
                    <boxGeometry args={[0.044, 0.082, 0.025]} />
                    <meshStandardMaterial color="#172b42" roughness={0.9} />
                  </mesh>
                ))}
              </StaticBatch>
            </group>
          </group>
          <PolygonPart
            vertices={[
              [-0.2, 0.71, 0.09],
              [0.22, 0.7, 0.09],
              [0.14, 0.63, 0.21],
              [-0.12, 0.65, 0.22],
            ]}
            faces={[[0, 3, 2, 1]]}
            color="#dd3026"
          />
          <PolygonPart
            vertices={[
              [0.015, 0.65, 0.2],
              [0.105, 0.62, 0.2],
              [0.08, 0.43, 0.22],
              [-0.015, 0.5, 0.23],
            ]}
            faces={[[0, 3, 2, 1]]}
            color="#e33529"
          />
          <PolygonPart
            vertices={[
              [-0.12, 0.67, -0.02],
              [-0.35, 0.6, -0.12],
              [-0.25, 0.73, -0.15],
              [-0.12, 0.69, -0.13],
            ]}
            faces={tetraFaces}
            color="#d72d25"
          />
        </StaticBatch>
      </group>
    </group>
  );
});
