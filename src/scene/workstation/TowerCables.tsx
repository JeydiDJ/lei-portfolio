import { Box } from "../Objects";
import Cable from "./Cable";

/** Visible sleeved leads end at sockets or disappear through tray/shroud grommets. */
export default function TowerCables() {
  return (
    <group>
      {/* 24-pin motherboard power, routed around the board's front edge. */}
      <Box
        position={[0.122, 0.045, 0.205]}
        size={[0.045, 0.032, 0.078]}
        color="#555b5d"
        radius={0.003}
      />
      {Array.from({ length: 6 }, (_, i) => (
        <Cable
          key={`atx-${i}`}
          radius={0.0032}
          color={i % 2 ? "#aaa9a3" : "#c4c3bb"}
          points={[
            [0.108, 0.045, 0.176 + i * 0.011],
            [0.073, 0.035, 0.196 + i * 0.011],
            [0.086, -0.015, 0.29 + i * 0.007],
            [0.184, -0.08, 0.3 + i * 0.005],
            [0.185, -0.18, 0.25 + i * 0.005],
            [0.14, -0.22, 0.19 + i * 0.005],
          ]}
        />
      ))}
      {/* GPU auxiliary power loops down into the PSU shroud. */}
      <Box
        position={[-0.163, -0.104, 0.13]}
        size={[0.03, 0.034, 0.068]}
        color="#555b5d"
        radius={0.003}
      />
      {Array.from({ length: 5 }, (_, i) => (
        <Cable
          key={`gpu-${i}`}
          radius={0.0035}
          color={i % 2 ? "#c4c3bb" : "#9a9d98"}
          points={[
            [-0.177, -0.103, 0.108 + i * 0.01],
            [-0.192, -0.146, 0.14 + i * 0.01],
            [-0.15, -0.202, 0.23 + i * 0.008],
            [-0.06, -0.218, 0.26 + i * 0.008],
            [0.025, -0.227, 0.22 + i * 0.008],
          ]}
        />
      ))}
      {/* CPU EPS power at the upper rear socket, tucked behind the motherboard tray. */}
      <Box
        position={[0.142, 0.287, -0.275]}
        size={[0.036, 0.026, 0.052]}
        color="#555b5d"
        radius={0.003}
      />
      {[0, 1, 2, 3].map((i) => (
        <Cable
          key={`eps-${i}`}
          radius={0.003}
          color="#aaa9a3"
          points={[
            [0.123, 0.287, -0.29 + i * 0.01],
            [0.11, 0.31, -0.31 + i * 0.01],
            [0.187, 0.31, -0.32 + i * 0.01],
            [0.191, 0.19, -0.31 + i * 0.01],
          ]}
        />
      ))}
      {/* AIO pump control, radiator fan lead, and front-panel header wires. */}
      <Cable
        radius={0.0025}
        color="#50585b"
        points={[
          [0.143, 0.275, -0.39],
          [0.18, 0.265, -0.35],
          [0.18, 0.22, -0.24],
          [0.145, 0.21, -0.24],
        ]}
      />
      <Cable
        radius={0.0025}
        color="#40474c"
        points={[
          [0.11, 0.12, -0.13],
          [0.13, 0.21, -0.1],
          [0.146, 0.252, -0.035],
        ]}
      />
      <Cable
        radius={0.0025}
        color="#40474c"
        points={[
          [0.145, 0.35, 0.13],
          [0.181, 0.31, 0.12],
          [0.18, 0.255, -0.03],
          [0.146, 0.252, -0.035],
        ]}
      />
      <Cable
        radius={0.0025}
        color="#50585b"
        points={[
          [0.15, -0.205, 0.17],
          [0.18, -0.19, 0.25],
          [0.19, 0.1, 0.32],
          [0.12, 0.407, 0.38],
        ]}
      />
      <Box
        position={[0.025, -0.219, 0.24]}
        size={[0.075, 0.006, 0.078]}
        color="#5b6263"
        radius={0.008}
      />
    </group>
  );
}
