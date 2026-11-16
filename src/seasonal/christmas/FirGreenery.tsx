import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  InstancedMesh,
  Object3D,
  Vector3,
} from "three";

type V3 = [number, number, number];
export type FirSpray = {
  position: V3;
  direction: V3;
  length: number;
  width?: number;
  roll?: number;
};

/** A real branching structure with small, curved, rounded needles, rather than solid cones. */
function buildFir() {
  const positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const stems: number[] = [],
    stemIndices: number[] = [];
  const dark = new Color("#284a31"),
    light = new Color("#638454");
  const needle = (
    base: Vector3,
    direction: Vector3,
    length: number,
    shade: number,
  ) => {
    const axis = direction.clone().normalize();
    const cross = new Vector3(-axis.y, axis.x, 0.18).normalize();
    const start = positions.length / 3;
    const color = dark.clone().lerp(light, shade);
    // A gently cupped blade: narrow heel, rounded shoulder and a soft fine tip.
    for (let row = 0; row < 3; row++) {
      const t = row / 2,
        w = [0.002, 0.009, 0.001][row];
      for (let side = -1; side <= 1; side++) {
        const point = base
          .clone()
          .addScaledVector(axis, t * length)
          .addScaledVector(cross, side * w);
        point.z += Math.sin(t * Math.PI) * 0.006 - Math.abs(side) * 0.0017;
        positions.push(point.x, point.y, point.z);
        const c = color.clone().multiplyScalar(side === 0 ? 1.08 : 0.95);
        colors.push(c.r, c.g, c.b);
      }
    }
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 2; col++) {
        const i = start + row * 3 + col;
        indices.push(i, i + 1, i + 3, i + 1, i + 4, i + 3);
      }
  };
  const stem = (a: Vector3, b: Vector3, radius: number) => {
    const axis = b.clone().sub(a).normalize();
    const cross = new Vector3(-axis.y, axis.x, 0).normalize();
    const start = stems.length / 3;
    for (let end = 0; end < 2; end++)
      for (let side = 0; side < 5; side++) {
        const angle = (side / 5) * Math.PI * 2,
          p = (end ? b : a).clone();
        p.addScaledVector(cross, Math.cos(angle) * radius * (end ? 0.5 : 1));
        p.z += Math.sin(angle) * radius;
        stems.push(p.x, p.y, p.z);
      }
    for (let i = 0; i < 5; i++) {
      const j = (i + 1) % 5;
      stemIndices.push(
        start + i,
        start + j,
        start + i + 5,
        start + j,
        start + j + 5,
        start + i + 5,
      );
    }
  };
  stem(new Vector3(), new Vector3(0, 1, 0), 0.006);
  for (let row = 0; row < 6; row++)
    for (const side of [-1, 1]) {
      const t = 0.1 + row * 0.14,
        reach = 0.26 * (1 - t * 0.65);
      const base = new Vector3(0, t, 0);
      const end = new Vector3(
        side * reach,
        t + 0.13,
        0.016 * Math.sin(row * 1.7),
      );
      stem(base, end, 0.0028);
      const axis = end.clone().sub(base);
      for (let n = 0; n < 6; n++)
        for (const spread of [-1, 1]) {
          const f = (n + 0.5) / 6,
            p = base.clone().addScaledVector(axis, f);
          const dir = axis
            .clone()
            .normalize()
            .multiplyScalar(0.65)
            .add(new Vector3(spread * 0.6, 0.35, 0.25 * Math.sin(n * 2 + row)));
          needle(p, dir, 0.045 + 0.025 * (1 - f), 0.2 + ((n + row) % 5) * 0.12);
        }
    }
  for (let n = 0; n < 16; n++)
    for (const side of [-1, 1])
      needle(
        new Vector3(0, 0.12 + n * 0.055, 0),
        new Vector3(side * 0.5, 0.8, 0.12 * Math.sin(n)),
        0.065,
        0.25 + (n % 4) * 0.13,
      );
  const foliage = new BufferGeometry();
  foliage.setAttribute("position", new Float32BufferAttribute(positions, 3));
  foliage.setAttribute("color", new Float32BufferAttribute(colors, 3));
  foliage.setIndex(indices);
  foliage.computeVertexNormals();
  const wood = new BufferGeometry();
  wood.setAttribute("position", new Float32BufferAttribute(stems, 3));
  wood.setIndex(stemIndices);
  wood.computeVertexNormals();
  return { foliage, wood };
}

const FirContext = createContext<ReturnType<typeof buildFir> | null>(null);
export function FirAssets({ children }: { children: ReactNode }) {
  const assets = useMemo(buildFir, []);
  useEffect(
    () => () => {
      assets.foliage.dispose();
      assets.wood.dispose();
    },
    [assets],
  );
  return <FirContext.Provider value={assets}>{children}</FirContext.Provider>;
}

export function FirFoliage({ sprays }: { sprays: FirSpray[] }) {
  const assets = useContext(FirContext)!;
  const leaves = useRef<InstancedMesh>(null),
    stems = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const object = new Object3D(),
      up = new Vector3(0, 1, 0);
    sprays.forEach((spray, i) => {
      object.position.set(...spray.position);
      object.quaternion.setFromUnitVectors(
        up,
        new Vector3(...spray.direction).normalize(),
      );
      object.rotateY(spray.roll ?? 0);
      object.scale.set(
        spray.length * (spray.width ?? 1),
        spray.length,
        spray.length,
      );
      object.updateMatrix();
      leaves.current!.setMatrixAt(i, object.matrix);
      stems.current!.setMatrixAt(i, object.matrix);
    });
    for (const mesh of [leaves.current!, stems.current!]) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    }
  }, [sprays]);
  return (
    <group name="Needled fir branches">
      <instancedMesh
        ref={leaves}
        args={[assets.foliage, undefined, sprays.length]}
        castShadow
        receiveShadow
      >
        <meshLambertMaterial color="#9ebc86" vertexColors side={DoubleSide} />
      </instancedMesh>
      <instancedMesh
        ref={stems}
        args={[assets.wood, undefined, sprays.length]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#665238" roughness={0.95} />
      </instancedMesh>
    </group>
  );
}
