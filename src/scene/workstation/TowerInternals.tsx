import { Box, Cylinder } from "../Objects";
import AioCooler from "./AioCooler";
import TowerCables from "./TowerCables";
import { towerPalette } from "./towerPalette";

/** Front is +Z. The motherboard tray is on +X; components face the -X glass side. */
export default function TowerInternals() {
  return (
    <group>
      <Box
        position={[0.165, 0.015, -0.055]}
        size={[0.012, 0.59, 0.53]}
        color="#35453f"
        radius={0.004}
      />
      <AioCooler />
      <TowerCables />
      {/* Four upright DIMM slots sit toward the intake/front of the motherboard. */}
      {[0.04, 0.078, 0.116, 0.154].map((z, i) => (
        <group key={z}>
          <Box
            position={[0.137, 0.13, z]}
            size={[0.035, 0.255, 0.016]}
            color="#24282c"
            radius={0.003}
          />
          {(i === 1 || i === 3) && (
            <>
              <Box
                position={[0.116, 0.13, z]}
                size={[0.025, 0.23, 0.012]}
                color="#79877d"
                radius={0.003}
              />
              <Box
                position={[0.1, 0.248, z]}
                size={[0.025, 0.008, 0.016]}
                color="#b3bba8"
                radius={0.002}
              />
            </>
          )}
        </group>
      ))}
      {/* GPU plugs into the board and rear slots; cooler fans face downward. */}
      <Box
        position={[0.151, -0.08, -0.055]}
        size={[0.025, 0.024, 0.5]}
        color="#252a2d"
        radius={0.002}
      />
      <Box
        position={[-0.015, -0.08, -0.055]}
        size={[0.3, 0.012, 0.55]}
        color="#6f7974"
        radius={0.002}
      />
      <Box
        position={[-0.015, -0.12, -0.055]}
        size={[0.31, 0.065, 0.55]}
        color={towerPalette.panel}
        radius={0.008}
      />
      <Box
        position={[-0.177, -0.12, -0.055]}
        size={[0.008, 0.053, 0.51]}
        color={towerPalette.trim}
        radius={0.002}
      />
      {[-0.19, 0.055].map((z) => (
        <group
          key={z}
          position={[-0.015, -0.158, z]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <mesh>
            <torusGeometry args={[0.083, 0.008, 8, 24]} />
            <meshStandardMaterial color="#676f71" />
          </mesh>
          <Cylinder
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[0.022, 0.022, 0.009]}
            color="#40464c"
          />
        </group>
      ))}
      {/* PSU remains below the shroud, with the cable bundle routed along the tray. */}
      <Box
        position={[0, -0.33, -0.04]}
        size={[0.41, 0.22, 0.77]}
        color={towerPalette.panel}
        radius={0.009}
      />
      <Box
        position={[0.14, -0.2, 0.18]}
        size={[0.035, 0.15, 0.045]}
        color="#252a30"
        radius={0.005}
      />
      <Box
        position={[0.14, 0.045, 0.205]}
        size={[0.035, 0.035, 0.07]}
        color="#252a30"
        radius={0.005}
      />
    </group>
  );
}
