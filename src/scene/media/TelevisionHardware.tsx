import type { ReactNode } from "react";
import { Box } from "../Objects";
import StaticBatch from "../StaticBatch";
import SelectionOutline from "../SelectionOutline";
import Cable from "../workstation/Cable";
import { televisionLayout as tv } from "../layout";

export default function TelevisionHardware({
  children,
  hovered,
  active,
}: {
  children: ReactNode;
  hovered: boolean;
  active: boolean;
}) {
  return (
    <group position={[0, tv.screenY, 0]} name="Slim 4K television">
      <StaticBatch>
        <Box size={[2.895, 1.674, 0.07]} color="#2c292b" radius={0.014} />
        <Box
          position={[0, 0, 0.035]}
          size={[2.858, 1.635, 0.012]}
          color="#111113"
          radius={0.006}
        />
        <Box
          position={[0, -0.819, 0.047]}
          size={[2.86, 0.023, 0.012]}
          color="#3c373a"
          radius={0.003}
        />
        {/* Rear electronics enclosure, VESA bosses and a real cable run. */}
        <Box
          position={[0, -0.2, -0.065]}
          size={[1.85, 0.96, 0.075]}
          color="#242225"
          radius={0.02}
        />
        {[-0.3, 0.3].flatMap((x) =>
          [-0.12, 0.3].map((y) => (
            <Box
              key={`${x}:${y}`}
              position={[x, y, -0.11]}
              size={[0.018, 0.018, 0.008]}
              color="#777273"
              radius={0.003}
            />
          )),
        )}
        {[-0.95, 0.95].map((x) => (
          <group key={x}>
            <Box
              position={[x, -0.93, -0.005]}
              rotation={[-0.22, 0, x < 0 ? -0.18 : 0.18]}
              size={[0.045, 0.28, 0.07]}
              color="#423c3f"
              radius={0.009}
            />
            <Box
              position={[x, -1.002, 0.11]}
              size={[0.32, 0.025, 0.4]}
              color="#3f393c"
              radius={0.007}
            />
          </group>
        ))}
        <Cable
          points={[
            [0.62, -0.52, -0.11],
            [0.57, -0.83, -0.13],
            [0.4, -1.08, -0.21],
            [0.22, -1.35, -0.24],
            [0.11, -1.55, -0.23],
          ]}
          radius={0.005}
        />
      </StaticBatch>
      <SelectionOutline
        size={[2.895, 1.674, 0.07]}
        visible={hovered && !active}
      />
      {children}
      <mesh position={[0.1, -0.82, 0.054]}>
        <circleGeometry args={[0.004, 10]} />
        <meshBasicMaterial color="#b7b0a3" />
      </mesh>
    </group>
  );
}
