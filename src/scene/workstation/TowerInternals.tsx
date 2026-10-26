import GraphicsCard from "./GraphicsCard";
import { Box } from "../Objects";
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
                color="#d4d8d1"
                radius={0.003}
              />
              {/* Full-length diffused RGB bar on the outer spine of each DIMM. */}
              <mesh position={[0.099, 0.13, z]}>
                <boxGeometry args={[0.01, 0.232, 0.015]} />
                <meshStandardMaterial
                  color="#f3f4ef"
                  emissive="#ffffff"
                  emissiveIntensity={1.3}
                  roughness={0.45}
                  toneMapped={false}
                />
              </mesh>
            </>
          )}
        </group>
      ))}
      <GraphicsCard />
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
