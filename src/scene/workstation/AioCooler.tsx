import { Box, Cylinder } from "../Objects";
import Cable from "./Cable";
import { towerPalette } from "./towerPalette";
import FanRotor from "./FanRotor";

/** Top-mounted 240 mm AIO; pump face points toward the left glass panel (-X). */
export default function AioCooler() {
  return (
    <group>
      <Box
        position={[0.145, 0.14, -0.155]}
        size={[0.022, 0.16, 0.16]}
        color="#42474a"
        radius={0.006}
      />
      <Cylinder
        position={[0.105, 0.14, -0.155]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.075, 0.075, 0.062]}
        color={towerPalette.shell}
      />
      <Cylinder
        position={[0.071, 0.14, -0.155]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.062, 0.062, 0.008]}
        color="#353b40"
      />
      <mesh position={[0.065, 0.14, -0.155]} rotation={[0, -Math.PI / 2, 0]}>
        <torusGeometry args={[0.051, 0.0035, 6, 24]} />
        <meshStandardMaterial
          color="#dfb2c6"
          emissive="#b7839a"
          emissiveIntensity={0.25}
          roughness={0.65}
        />
      </mesh>
      <Box
        position={[0.06, 0.14, -0.155]}
        size={[0.004, 0.024, 0.024]}
        color={towerPalette.trim}
        radius={0.004}
      />

      {/* Radiator bolts to the roof, with two fans beneath it blowing upward. */}
      <Box
        position={[0, 0.412, -0.025]}
        size={[0.33, 0.055, 0.63]}
        color={towerPalette.panel}
        radius={0.006}
      />
      {Array.from({ length: 18 }, (_, i) => (
        <Box
          key={i}
          position={[0, 0.383, -0.302 + i * 0.032]}
          size={[0.274, 0.004, 0.012]}
          color="#686d6c"
          radius={0.001}
          castShadow={false}
        />
      ))}
      {[-0.18, 0.13].map((z) => (
        <group key={z} position={[0, 0.36, z]}>
          {[-1, 1].map((side) => (
            <group key={side}>
              <Box
                position={[side * 0.145, 0, 0]}
                size={[0.018, 0.05, 0.3]}
                color={towerPalette.shell}
                radius={0.003}
              />
              <Box
                position={[0, 0, side * 0.145]}
                size={[0.28, 0.05, 0.018]}
                color={towerPalette.shell}
                radius={0.003}
              />
            </group>
          ))}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.008, 6, 28]} />
            <meshStandardMaterial color={towerPalette.fan} roughness={0.75} />
          </mesh>
          <FanRotor axis="y" color="#858d8c" radius={0.114}>
            {Array.from({ length: 7 }, (_, i) => {
              const angle = (i * Math.PI * 2) / 7;
              return (
                <Box
                  key={i}
                  position={[
                    Math.cos(angle) * 0.061,
                    0,
                    Math.sin(angle) * 0.061,
                  ]}
                  rotation={[0, -angle + 0.3, 0]}
                  size={[0.105, 0.008, 0.037]}
                  color="#858d8c"
                  radius={0.004}
                  castShadow={false}
                />
              );
            })}
          </FanRotor>
          <Cylinder
            position={[0, -0.004, 0]}
            args={[0.027, 0.027, 0.02]}
            color={towerPalette.hardware}
          />
        </group>
      ))}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Both hoses clear the DIMMs and GPU, then join the radiator's front end tank. */}
          <Cable
            radius={0.012}
            color="#686d70"
            points={[
              [0.082, 0.177, -0.155 + side * 0.047],
              [-0.02, 0.205, -0.155 + side * 0.055],
              [-0.115, 0.257, -0.08 + side * 0.045],
              [-0.11, 0.277, 0.13 + side * 0.025],
              [side * 0.073, 0.315, 0.305],
              [side * 0.073, 0.412, 0.292],
            ]}
          />
          <Cylinder
            position={[side * 0.073, 0.412, 0.292]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[0.018, 0.018, 0.025]}
            color={towerPalette.hardware}
          />
        </group>
      ))}
    </group>
  );
}
