import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  SpotLight,
  Vector3,
} from "three";
import { Box } from "./Objects";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { useSeasonalFeatures } from "../seasonal/SeasonalFeatures";
import { roomLightPower } from "./lightingLevels";

/** A hooded picture light in the frame's local coordinates (+Z faces the room). */
export default function WallArtSpotlight({ height }: { height: number }) {
  const environment = useEnvironmentTransition();
  const seasonal = useSeasonalFeatures();
  const light = useRef<SpotLight>(null);
  const lens = useRef<MeshStandardMaterial>(null);
  const y = height / 2 + 0.24;
  const { target, orientation } = useMemo(() => {
    const target = new Object3D();
    target.position.set(0, -0.05, 0.055);
    const direction = target.position
      .clone()
      .sub(new Vector3(0, y, 0.52))
      .normalize();
    return {
      target,
      orientation: new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        direction,
      ),
    };
  }, [y]);
  useFrame(() => {
    const brightness =
      roomLightPower(environment.roomLight) * seasonal.lightMultiplier;
    if (light.current)
      light.current.intensity = (3.5 + height * 2) * brightness;
    if (lens.current) lens.current.emissiveIntensity = 0.6 * brightness;
  });
  return (
    <group name="Dedicated picture spotlight" userData={{ dynamic: true }}>
      <primitive object={target} />
      <Box
        position={[0, y, 0]}
        size={[0.14, 0.12, 0.045]}
        color="#403937"
        radius={0.012}
        castShadow={false}
      />
      <Box
        position={[0, y, 0.24]}
        size={[0.026, 0.026, 0.48]}
        color="#93816a"
        radius={0.006}
        castShadow={false}
      />
      <group position={[0, y, 0.52]} quaternion={orientation}>
        <mesh>
          <cylinderGeometry args={[0.085, 0.07, 0.16, 16]} />
          <meshStandardMaterial
            color="#403937"
            roughness={0.6}
            metalness={0.35}
          />
        </mesh>
        <mesh position={[0, 0.083, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.067, 16]} />
          <meshStandardMaterial
            ref={lens}
            color="#fff4e4"
            emissive="#fff0dc"
            roughness={0.85}
          />
        </mesh>
      </group>
      {/* Fixed, shadow-free lights add no shadow-map renders while orbiting. */}
      <spotLight
        ref={light}
        position={[0, y, 0.52]}
        target={target}
        color="#fff3e3"
        intensity={5}
        angle={0.76}
        penumbra={0.85}
        decay={2}
        distance={3.2}
      />
    </group>
  );
}
