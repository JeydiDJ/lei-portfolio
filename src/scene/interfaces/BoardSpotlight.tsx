import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SpotLight,
  Vector3,
} from "three";
import { Box, Cylinder } from "../Objects";
import { useEnvironmentTransition } from "../EnvironmentTransition";
import { useSeasonalFeatures } from "../../seasonal/SeasonalFeatures";

/** A warm, hooded gallery light aimed at the printed IDs and cork backing. */
export default function BoardSpotlight() {
  const environment = useEnvironmentTransition();
  const seasonal = useSeasonalFeatures();
  const light = useRef<SpotLight>(null);
  const lens = useRef<MeshStandardMaterial>(null);
  const { target, orientation } = useMemo(() => {
    const target = new Object3D();
    target.position.set(0, -0.12, 0.09);
    const direction = new Vector3(0, -1.06, -0.71).normalize();
    return {
      target,
      orientation: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction,
      ),
    };
  }, []);
  useFrame(() => {
    // Remains a reading light at the dim end; independent of the window blinds.
    if (light.current)
      light.current.intensity =
        (3 + 3 * environment.roomLight) * seasonal.lightMultiplier;
    if (lens.current)
      lens.current.emissiveIntensity =
        (0.35 + 0.55 * environment.roomLight) * seasonal.lightMultiplier;
  });
  return (
    <group>
      <primitive object={target} />
      <Box
        position={[0, 0.84, -0.025]}
        size={[0.16, 0.22, 0.06]}
        color="#39352f"
        radius={0.014}
      />
      <Cylinder
        position={[0, 0.96, 0]}
        args={[0.018, 0.018, 0.16]}
        color="#817057"
      />
      <Cylinder
        position={[0, 1.02, 0.42]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[0.018, 0.018, 0.84]}
        color="#817057"
      />
      <group position={[0, 0.94, 0.8]} quaternion={orientation}>
        <mesh castShadow={false}>
          <cylinderGeometry args={[0.105, 0.08, 0.16, 24]} />
          <meshStandardMaterial
            color="#302b27"
            metalness={0.45}
            roughness={0.46}
          />
        </mesh>
        <mesh position={[0, 0.083, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.008, 24]} />
          <meshStandardMaterial
            ref={lens}
            color="#f1e6d2"
            emissive="#ffe2ba"
            roughness={0.7}
          />
        </mesh>
      </group>
      <spotLight
        ref={light}
        position={[0, 0.94, 0.8]}
        target={target}
        color="#fff0dc"
        intensity={4.35}
        angle={0.9}
        penumbra={0.85}
        decay={2}
        distance={3.4}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-camera-near={0.12}
        shadow-camera-far={3.4}
        shadow-normalBias={0.006}
        shadow-bias={-0.0001}
      />
    </group>
  );
}
