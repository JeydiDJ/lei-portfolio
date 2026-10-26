import { useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, Mesh, MeshStandardMaterial, type Group } from "three";
import { useSeasonalFeatures } from "../SeasonalFeatures";

/** Used by the duck's existing idle controller so both animations never fight. */
export function useCursedDuck(
  body: RefObject<Group | null>,
  head: RefObject<Group | null>,
) {
  const seasonal = useSeasonalFeatures();
  const originals = useRef(
    new Map<
      MeshStandardMaterial,
      { color: Color; emissive: Color; intensity: number }
    >(),
  );
  const restore = () => {
    for (const [material, saved] of originals.current) {
      material.color.copy(saved.color);
      material.emissive.copy(saved.emissive);
      material.emissiveIntensity = saved.intensity;
    }
    originals.current.clear();
    if (body.current) {
      body.current.position.set(0, 0.028, 0);
      body.current.rotation.set(0, -0.28, 0);
    }
    head.current?.rotation.set(0, 0, 0);
  };
  useEffect(() => () => restore(), []);
  return (now: number) => {
    const strength = seasonal.duckIntensity;
    if (!body.current || !head.current) return false;
    if (strength <= 0) {
      if (originals.current.size) restore();
      return false;
    }
    if (!originals.current.size) {
      body.current.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        for (const material of materials) {
          if (
            !(material instanceof MeshStandardMaterial) ||
            originals.current.has(material)
          )
            continue;
          originals.current.set(material, {
            color: material.color.clone(),
            emissive: material.emissive.clone(),
            intensity: material.emissiveIntensity,
          });
          material.color.multiplyScalar(0.26);
          material.emissive.set("#650c16");
          material.emissiveIntensity = 0.2;
        }
      });
    }
    const t = now / 1000;
    // Small stepped displacements read as a broken figurine, without screen flashes.
    const offset = Math.sin(Math.floor(t * 7) * 2.4) * 0.018 * strength;
    body.current.position.set(offset, 0.028 + Math.abs(offset) * 0.35, 0);
    body.current.rotation.set(0, -0.28 + offset * 3, offset * 0.9);
    head.current.rotation.set(
      -0.16 * strength,
      Math.sin(t * 2.4) * 0.25 * strength,
      0.46 * strength,
    );
    return true;
  };
}

/** Sits on the existing duck face, following its head pivot. */
export default function CursedDuckFace() {
  const state = useSeasonalFeatures();
  const root = useRef<Group>(null);
  useFrame(() => {
    if (root.current) root.current.visible = state.duckIntensity > 0.12;
  });
  return (
    <group ref={root} visible={false} userData={{ dynamic: true }}>
      {[-1, 1].map((side) => (
        <group
          key={side}
          position={[side * 0.205, 0.975, 0.226]}
          rotation={[0, side * 0.18, side * -0.1]}
        >
          <mesh>
            <boxGeometry args={[0.066, 0.115, 0.012]} />
            <meshBasicMaterial color="#100b13" />
          </mesh>
          <mesh position={[0, 0, 0.009]}>
            <boxGeometry args={[0.022, 0.068, 0.01]} />
            <meshBasicMaterial color="#ed3941" toneMapped={false} />
          </mesh>
          <mesh position={[0, -0.085, 0]} rotation={[0, 0, side * 0.2]}>
            <boxGeometry args={[0.015, 0.085, 0.009]} />
            <meshBasicMaterial color="#5b1120" />
          </mesh>
        </group>
      ))}
      {[-0.12, -0.06, 0, 0.06, 0.12].map((x) => (
        <mesh key={x} position={[x, 0.755, 0.455]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.019, 0.055, 3]} />
          <meshBasicMaterial color="#d6d1bd" />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[side * 0.31, 0.91, 0.07]}
          rotation={[0, 0, side * 0.18]}
        >
          <boxGeometry args={[0.12, 0.018, 0.06]} />
          <meshBasicMaterial color={side > 0 ? "#82303f" : "#353341"} />
        </mesh>
      ))}
    </group>
  );
}
