import { Box } from "../Objects";
import Cable from "./Cable";
import { gpuLift } from "./dimensions";

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
      {/* Socket sits at the PCB's glass-facing edge, above the cooler fins. */}
      <Box
        position={[-0.146, -0.066 + gpuLift, 0.035]}
        size={[0.016, 0.026, 0.049]}
        color="#343a3a"
        radius={0.003}
      />
      <Box
        position={[-0.165, -0.066 + gpuLift, 0.035]}
        size={[0.03, 0.024, 0.043]}
        color="#c7cbc4"
        radius={0.003}
      />
      <Box
        position={[-0.159, -0.05 + gpuLift, 0.035]}
        size={[0.018, 0.006, 0.016]}
        color="#7b827d"
        radius={0.001}
      />
      {/* Sleeves leave the seated plug straight before a gentle bend to the shroud. */}
      {Array.from({ length: 6 }, (_, i) => (
        <Cable
          key={`gpu-${i}`}
          radius={0.0027}
          color={i % 2 ? "#d7d9d1" : "#c1c7bf"}
          points={[
            [-0.178, -0.066 + gpuLift, 0.018 + i * 0.0068],
            [-0.197, -0.066 + gpuLift, 0.018 + i * 0.0068],
            [-0.208, -0.075, 0.032 + i * 0.0068],
            [-0.198, -0.165, 0.1 + i * 0.0068],
            [-0.12, -0.207, 0.2 + i * 0.0068],
            [0.025, -0.227, 0.22 + i * 0.0068],
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
