import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Quaternion,
  Vector3,
} from "three";

function Stem({
  from,
  to,
  radius = 0.006,
  woody = false,
}: {
  from: number[];
  to: number[];
  radius?: number;
  woody?: boolean;
}) {
  const a = new Vector3(...from),
    b = new Vector3(...to);
  const direction = b.clone().sub(a);
  return (
    <mesh
      position={a.add(b).multiplyScalar(0.5)}
      quaternion={new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction.clone().normalize(),
      )}
      castShadow
    >
      <cylinderGeometry args={[radius * 0.7, radius, direction.length(), 7]} />
      <meshStandardMaterial
        color={woody ? "#6f5136" : "#455c34"}
        roughness={0.92}
      />
    </mesh>
  );
}

export default function StudioPlant({
  position,
  kind,
}: {
  position: [number, number, number];
  kind: "fig" | "peace-lily";
}) {
  const fig = kind === "fig";
  const leaf = useMemo(() => {
    const geometry = new BufferGeometry(),
      positions: number[] = [],
      indices: number[] = [];
    for (let row = 0; row <= 14; row++) {
      const t = row / 14;
      const breadth =
        Math.pow(Math.sin(Math.PI * t), fig ? 0.6 : 0.85) *
        0.5 *
        (fig ? 1 + 0.13 * Math.sin(t * 18) : 1);
      for (let side = -1; side <= 1; side++)
        positions.push(
          side * breadth,
          t,
          Math.sin(t * Math.PI) * 0.16 -
            t * t * 0.28 -
            Math.abs(side) * breadth * 0.15,
        );
      if (row < 14)
        for (let col = 0; col < 2; col++) {
          const i = row * 3 + col;
          indices.push(i, i + 1, i + 3, i + 1, i + 4, i + 3);
        }
    }
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  }, [fig]);
  useEffect(() => () => leaf.dispose(), [leaf]);
  const potHeight = fig ? 0.48 : 0.35,
    potRadius = fig ? 0.3 : 0.24;
  return (
    <group
      position={position}
      name={
        fig
          ? "Fiddle-leaf fig in ivory ceramic planter"
          : "Peace lily in ivory ceramic planter"
      }
    >
      <mesh position={[0, potHeight / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[potRadius, potRadius * 0.78, potHeight, 32]} />
        <meshStandardMaterial color="#ddd5c6" roughness={0.92} />
      </mesh>
      <mesh
        position={[0, potHeight - 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[potRadius * 0.91, 32]} />
        <meshStandardMaterial color="#30261e" roughness={1} />
      </mesh>
      <mesh
        position={[0, potHeight, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <torusGeometry args={[potRadius * 0.96, 0.015, 8, 32]} />
        <meshStandardMaterial color="#e4ddcf" roughness={0.9} />
      </mesh>
      {fig && (
        <Stem
          from={[0, 0.44, 0]}
          to={[0.045, 1.65, -0.015]}
          radius={0.022}
          woody
        />
      )}
      {Array.from({ length: fig ? 11 : 10 }, (_, i) => {
        const yaw = i * 2.399,
          level = fig ? 0.85 + i * 0.072 : potHeight;
        const reach = fig ? 0.16 : 0.07;
        const tip = [
          Math.sin(yaw) * reach,
          level + (fig ? 0.08 : 0.12 + (i % 3) * 0.04),
          Math.cos(yaw) * reach,
        ];
        const length = fig ? 0.43 + (i % 3) * 0.06 : 0.46 + (i % 3) * 0.08;
        return (
          <group key={i}>
            <Stem
              from={[fig ? 0.02 : 0, fig ? level - 0.08 : potHeight - 0.02, 0]}
              to={tip}
              woody={fig}
            />
            <mesh
              geometry={leaf}
              position={tip as [number, number, number]}
              rotation={[
                fig ? 0.85 : 0.45 + (i % 3) * 0.24,
                yaw,
                (i % 2 ? 1 : -1) * 0.13,
              ]}
              scale={[fig ? 0.34 : 0.17, length, length]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={i % 3 ? "#3e6142" : "#56764a"}
                roughness={0.72}
                side={DoubleSide}
              />
            </mesh>
          </group>
        );
      })}
      {!fig &&
        [-1, 1].map((side) => (
          <group key={side}>
            <Stem
              from={[0, potHeight, 0]}
              to={[side * 0.1, 0.96 + side * 0.04, -0.03]}
            />
            <mesh
              geometry={leaf}
              position={[side * 0.1, 0.93 + side * 0.04, -0.03]}
              scale={[0.12, 0.23, 0.19]}
              rotation={[0.2, side * 0.7, side * 0.2]}
              castShadow
            >
              <meshStandardMaterial
                color="#eee8d8"
                roughness={0.8}
                side={DoubleSide}
              />
            </mesh>
            <mesh
              position={[side * 0.1, 1.025 + side * 0.04, 0.005]}
              rotation={[0.18, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.009, 0.011, 0.11, 8]} />
              <meshStandardMaterial color="#b9a96a" roughness={0.95} />
            </mesh>
          </group>
        ))}
    </group>
  );
}
