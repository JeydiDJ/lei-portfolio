import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, Object3D, PointLight, SpotLight } from "three";
import { Box } from "../Objects";
import { roomLightPower } from "../lightingLevels";
import { useEnvironmentTransition } from "../EnvironmentTransition";
import { useSeasonalFeatures } from "../../seasonal/SeasonalFeatures";

/** A ceiling wash and concealed shelf light keep the console visible in the media corner. */
export default function MediaLighting() {
  const environment = useEnvironmentTransition(),
    seasonal = useSeasonalFeatures();
  const wash = useRef<SpotLight>(null),
    shelf = useRef<PointLight>(null),
    diffuser = useRef<MeshStandardMaterial>(null),
    ceilingDiffuser = useRef<MeshStandardMaterial>(null);
  const target = useMemo(() => {
    const object = new Object3D();
    object.position.set(0, 1.0, 0.05);
    return object;
  }, []);
  useFrame(() => {
    const power =
      roomLightPower(environment.roomLight) * seasonal.lightMultiplier;
    if (wash.current) wash.current.intensity = 26 * power;
    if (shelf.current) shelf.current.intensity = 0.2 * power;
    if (diffuser.current) diffuser.current.emissiveIntensity = 0.7 * power;
    if (ceilingDiffuser.current)
      ceilingDiffuser.current.emissiveIntensity = 2 * power;
  });
  return (
    <group userData={{ dynamic: true }}>
      <primitive object={target} />
      <Box
        position={[0, 5.07, 1.0]}
        size={[0.38, 0.07, 0.24]}
        color="#b7ad9d"
        radius={0.015}
        castShadow={false}
      />
      <spotLight
        ref={wash}
        position={[0, 4.99, 1.0]}
        target={target}
        color="#ffecd9"
        angle={0.64}
        penumbra={0.9}
        decay={2}
        distance={7}
      />
      <mesh position={[0, 5.03, 1.0]} name="TV light luminous diffuser">
        <boxGeometry args={[0.326, 0.008, 0.186]} />
        <meshStandardMaterial
          ref={ceilingDiffuser}
          color="#eee6d8"
          emissive="#fff1dc"
          emissiveIntensity={0}
          roughness={0.7}
        />
      </mesh>
      <mesh position={[0, 0.852, 0.24]}>
        <boxGeometry args={[0.8, 0.008, 0.018]} />
        <meshStandardMaterial
          ref={diffuser}
          color="#e5dfd4"
          emissive="#fff1dc"
          roughness={0.8}
        />
      </mesh>
      <pointLight
        ref={shelf}
        position={[0, 0.76, 0.28]}
        color="#fff1dc"
        distance={1.25}
        decay={2}
      />
    </group>
  );
}
