import { Box, Cylinder } from "../Objects";
import StaticBatch from "../StaticBatch";

/** Low oak-and-burgundy cabinet, open dock shelf, concealed wiring and a TV remote. */
export default function MediaCabinet() {
  return (
    <StaticBatch>
      <group name="Media cabinet">
        <Box
          position={[0, 0.9, 0]}
          size={[3.2, 0.07, 0.82]}
          color="#c4a17e"
          radius={0.016}
        />
        <Box
          position={[0, 0.265, 0]}
          size={[3.15, 0.07, 0.78]}
          color="#ba9775"
          radius={0.012}
        />
        <Box
          position={[0, 0.58, -0.365]}
          size={[3.08, 0.58, 0.035]}
          color="#584437"
          radius={0.003}
        />
        {[-1.54, -0.58, 0.58, 1.54].map((x) => (
          <Box
            key={x}
            position={[x, 0.58, 0]}
            size={[0.055, 0.58, 0.76]}
            color="#bc9976"
            radius={0.004}
          />
        ))}
        {[-1.065, 1.065].map((x) => (
          <group key={x}>
            <Box
              position={[x, 0.58, 0.395]}
              size={[0.89, 0.565, 0.035]}
              color="#692630"
              radius={0.008}
            />
            <Box
              position={[x, 0.75, 0.418]}
              size={[0.19, 0.012, 0.018]}
              color="#b9a58a"
              radius={0.003}
            />
          </group>
        ))}
        {[-1.3, 1.3].flatMap((x) =>
          [-0.27, 0.27].map((z) => (
            <Cylinder
              key={`${x}:${z}`}
              position={[x, 0.125, z]}
              args={[0.026, 0.019, 0.25]}
              color="#514540"
            />
          )),
        )}
        <Box
          position={[0, 0.3, -0.1]}
          size={[1.1, 0.022, 0.54]}
          color="#d4b28e"
          radius={0.003}
        />
        {/* Cable chute routes power/HDMI from the TV to the open console bay. */}
        <Box
          position={[0, 0.78, -0.36]}
          size={[0.16, 0.075, 0.005]}
          color="#302c2a"
          radius={0.005}
        />
        <group
          position={[-1.24, 0.96, 0.19]}
          rotation={[0, -0.2, 0]}
          name="TV remote"
        >
          <Box size={[0.09, 0.026, 0.29]} color="#29272a" radius={0.009} />
          <Cylinder
            position={[0, 0.016, -0.1]}
            args={[0.009, 0.009, 0.004]}
            color="#781b20"
          />
          <Cylinder
            position={[0, 0.016, -0.025]}
            args={[0.028, 0.028, 0.003]}
            color="#595459"
          />
          <Cylinder
            position={[0, 0.018, -0.025]}
            args={[0.014, 0.014, 0.003]}
            color="#29272a"
          />
          {[-0.022, 0.022].flatMap((x) =>
            [0.035, 0.065, 0.095].map((z) => (
              <Box
                key={`${x}:${z}`}
                position={[x, 0.015, z]}
                size={[0.021, 0.004, 0.014]}
                color="#a19a94"
                radius={0.003}
                castShadow={false}
              />
            )),
          )}
        </group>
      </group>
    </StaticBatch>
  );
}
