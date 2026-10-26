import { roomLayout } from "./layout";
import { Box } from "./Objects";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, MeshStandardMaterial } from "three";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { lightingLevels } from "./lightingLevels";
import { useSeasonalFeatures } from "../seasonal/SeasonalFeatures";
const offColor = new Color("#e2e0d9"),
  onColor = new Color("#fff0d6");

export default function Ceiling() {
  const blend = useEnvironmentTransition();
  const seasonal = useSeasonalFeatures();
  const diffusers = useRef<(MeshStandardMaterial | null)[]>([]);
  useFrame(() => {
    const { indoor } = lightingLevels(
      blend.night,
      blend.blinds,
      blend.roomLight,
    );
    for (const material of diffusers.current) {
      if (!material) continue;
      material.color.lerpColors(
        offColor,
        onColor,
        indoor * seasonal.lightMultiplier,
      );
      material.emissiveIntensity = 2 * indoor * seasonal.lightMultiplier;
    }
  });
  return (
    <group>
      <Box
        position={[
          (roomLayout.left + roomLayout.right) / 2,
          roomLayout.ceilingHeight + 0.1,
          (roomLayout.back + roomLayout.front) / 2,
        ]}
        size={[
          roomLayout.right - roomLayout.left + 0.25,
          0.2,
          roomLayout.front - roomLayout.back + 0.25,
        ]}
        color="#f4f1eb"
        radius={0}
      />
      {[roomLayout.ceilingLight, roomLayout.secondaryCeilingLight].map(
        ([x, , z], i) => (
          <group key={i}>
            <Box
              position={[x, roomLayout.ceilingHeight - 0.055, z]}
              size={[2.05, 0.11, 0.64]}
              color="#b9ad97"
              radius={0.025}
            />
            <mesh position={[x, roomLayout.ceilingHeight - 0.117, z]}>
              <boxGeometry args={[1.92, 0.018, 0.52]} />
              <meshStandardMaterial
                ref={(material) => {
                  diffusers.current[i] = material;
                }}
                emissive="#ffe0ad"
                emissiveIntensity={0}
                roughness={0.7}
              />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
}
