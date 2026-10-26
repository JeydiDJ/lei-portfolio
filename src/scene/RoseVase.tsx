import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Vector2,
  Vector3,
} from "three";

function petal(width: number, reach: number, height: number) {
  const positions: number[] = [],
    indices: number[] = [];
  const rows = 10,
    columns = 10;
  for (let row = 0; row <= rows; row++) {
    const v = row / rows;
    for (let column = 0; column <= columns; column++) {
      const u = column / columns - 0.5;
      const angle = u * width * Math.sin(Math.PI * v * 0.72);
      const radius = 0.014 + reach * Math.sin(v * Math.PI * 0.62);
      const scallop = 1 - 0.2 * (u * 2) ** 2;
      positions.push(
        Math.sin(angle) * radius,
        height * v * scallop - 0.045 * v ** 4,
        Math.cos(angle) * radius,
      );
    }
  }
  for (let row = 0; row < rows; row++)
    for (let column = 0; column < columns; column++) {
      const a = row * (columns + 1) + column,
        b = a + columns + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Layered burgundy petals echo the rose mark, with a glazed charcoal bud vase. */
export default function RoseVase() {
  const petals = useMemo(
    () => [
      petal(2, 0.13, 0.13),
      petal(2.3, 0.085, 0.16),
      petal(2.6, 0.04, 0.175),
    ],
    [],
  );
  const vase = useMemo(
    () => [
      new Vector2(0, 0),
      new Vector2(0.068, 0),
      new Vector2(0.083, 0.018),
      new Vector2(0.098, 0.08),
      new Vector2(0.087, 0.15),
      new Vector2(0.044, 0.2),
      new Vector2(0.035, 0.25),
      new Vector2(0.03, 0.25),
      new Vector2(0.029, 0.225),
    ],
    [],
  );
  const stem = useMemo(
    () => [
      new Vector3(0, 0.17, 0),
      new Vector3(0.012, 0.34, 0),
      new Vector3(0.025, 0.46, 0.005),
      new Vector3(0.036, 0.57, 0),
    ],
    [],
  );
  useEffect(
    () => () => petals.forEach((geometry) => geometry.dispose()),
    [petals],
  );
  return (
    <group position={[-3.16, 2.46, -3.04]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[vase, 32]} />
        <meshStandardMaterial
          color="#30282a"
          roughness={0.3}
          metalness={0.08}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, 0.022, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.078, 0.003, 6, 32]} />
        <meshStandardMaterial
          color="#9b8056"
          metalness={0.55}
          roughness={0.4}
        />
      </mesh>
      {stem.slice(1).map((end, index) => {
        const start = stem[index],
          direction = end.clone().sub(start);
        return (
          <mesh
            key={index}
            position={start.clone().add(end).multiplyScalar(0.5)}
            rotation={[0, 0, -Math.atan2(direction.x, direction.y)]}
            castShadow
          >
            <cylinderGeometry args={[0.005, 0.006, direction.length(), 8]} />
            <meshStandardMaterial color="#36543b" roughness={0.85} />
          </mesh>
        );
      })}
      {[-1, 1].map((side, index) => (
        <group
          key={side}
          position={[0.018, 0.34 + index * 0.095, 0]}
          rotation={[0.2, side * 0.5, side * -0.9]}
        >
          <mesh
            position={[0, 0.065, 0]}
            scale={[0.027, 0.09, 0.007]}
            castShadow
          >
            <sphereGeometry args={[1, 12, 8]} />
            <meshStandardMaterial
              color={index ? "#324b34" : "#456442"}
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}
      <group position={[0.036, 0.55, 0]} rotation={[0.15, 0.3, -0.12]}>
        <mesh position={[0, 0.005, 0]} castShadow>
          <coneGeometry args={[0.035, 0.07, 7]} />
          <meshStandardMaterial color="#36543b" roughness={0.9} />
        </mesh>
        {[7, 5, 4].map((count, layer) =>
          Array.from({ length: count }, (_, index) => (
            <mesh
              key={`${layer}-${index}`}
              geometry={petals[layer]}
              rotation={[0, (index * Math.PI * 2) / count + layer * 0.7, 0]}
              position={[0, layer * 0.004, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={["#781b20", "#8d232c", "#61151d"][layer]}
                side={DoubleSide}
                roughness={0.72}
              />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
}
