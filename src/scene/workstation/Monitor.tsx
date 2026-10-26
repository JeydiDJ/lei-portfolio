import { useEffect, useMemo, useState } from "react";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { Box } from "../Objects";
import Cable from "./Cable";
import { monitorDimensions as dimensions } from "./dimensions";
import { towerRearPort } from "./dimensions";
import useWorkScreen from "../interfaces/useWorkScreen";
import { Outlines } from "@react-three/drei";
import ScreenGlow from "../ScreenGlow";
import GlassPane from "../GlassPane";

function curvedPanel(width: number, height: number, depth: number) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  const segments = 64;
  // Front and back surfaces share the same 1800R centre of curvature.
  for (let side = 0; side < (depth ? 2 : 1); side++) {
    for (let i = 0; i <= segments; i++) {
      const angle = ((i / segments - 0.5) * width) / dimensions.radius;
      const x = Math.sin(angle) * dimensions.radius;
      const z =
        (1 - Math.cos(angle)) * dimensions.radius +
        (side ? -depth / 2 : depth / 2);
      positions.push(x, -height / 2, z, x, height / 2, z);
      uvs.push(i / segments, 0, i / segments, 1);
      if (i < segments) {
        const a = side * (segments + 1) * 2 + i * 2;
        indices.push(
          ...(side
            ? [a, a + 1, a + 2, a + 1, a + 3, a + 2]
            : [a, a + 2, a + 1, a + 1, a + 2, a + 3]),
        );
      }
    }
  }
  if (depth) {
    const back = (segments + 1) * 2;
    for (let i = 0; i < segments; i++) {
      const a = i * 2,
        b = a + back;
      indices.push(
        a,
        b,
        a + 2,
        a + 2,
        b,
        b + 2,
        a + 1,
        a + 3,
        b + 1,
        a + 3,
        b + 3,
        b + 1,
      );
    }
    indices.push(0, 1, back, 1, back + 1, back);
    const a = segments * 2,
      b = a + back;
    indices.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export default function Monitor({
  onOpen,
  onClose,
  active,
}: {
  onOpen: () => void;
  onClose: () => void;
  active: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const shell = useMemo(
    () =>
      curvedPanel(
        dimensions.width + 0.032,
        dimensions.height + 0.032,
        dimensions.depth,
      ),
    [],
  );
  const screen = useMemo(
    () => curvedPanel(dimensions.width, dimensions.height, 0),
    [],
  );
  const surface = useWorkScreen(active, onClose);
  const texture = surface.texture;
  useEffect(
    () => () => {
      shell.dispose();
      screen.dispose();

      document.body.style.cursor = "";
    },
    [shell, screen],
  );
  return (
    <group position={[-0.35, 0, -1.21]} userData={{ dynamic: true }}>
      <Box
        position={[0, 1.474, 0.02]}
        size={[0.56, 0.035, 0.36]}
        color="#34343b"
        radius={0.018}
      />
      <Box
        position={[0, 1.93, -0.06]}
        rotation={[-0.08, 0, 0]}
        size={[0.08, 0.9, 0.065]}
        color="#3d3d45"
        radius={0.015}
      />
      <Box
        position={[0, 2.34, -0.07]}
        size={[0.3, 0.22, 0.09]}
        color="#26272e"
        radius={0.025}
      />
      <group
        position={[0, 2.34, 0]}
        onClick={(e) => {
          e.stopPropagation();
          surface.wake();
          onOpen();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          surface.wake();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <mesh geometry={shell} castShadow receiveShadow>
          <meshStandardMaterial
            color={hovered && !active ? "#826b7c" : "#202128"}
            emissive={hovered && !active ? "#e8a9c5" : "#000000"}
            emissiveIntensity={0.35}
            roughness={0.65}
          />
          {hovered && !active && (
            <Outlines
              color="#ffd6e7"
              thickness={2}
              screenspace={false}
              toneMapped={false}
            />
          )}
        </mesh>
        <group position={[0, 0, dimensions.depth / 2 + 0.0005]}>
          <ScreenGlow
            width={dimensions.width}
            height={dimensions.height}
            geometry={screen}
            strength={surface.sleeping ? 0.15 : 1}
          />
        </group>
        <mesh
          geometry={screen}
          {...surface.events}
          position={[0, 0, dimensions.depth / 2 + 0.0015]}
        >
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        <group position={[0, 0, dimensions.depth / 2 + 0.0025]}>
          <GlassPane
            width={dimensions.width}
            height={dimensions.height}
            geometry={screen}
            strength={active ? 0.14 : 0.28}
          />
        </group>
        <mesh
          position={[
            0,
            -dimensions.height / 2 - 0.01,
            dimensions.depth / 2 + 0.002,
          ]}
        >
          <circleGeometry args={[0.0035, 10]} />
          <meshBasicMaterial color="#d7dfcf" />
        </mesh>
      </group>
      <Cable
        points={[
          [0, 2.02, -0.13],
          [0.025, 1.65, -0.17],
          [0.1, 1.46, -0.2],
          [1.3, 1.46, -0.36],
          [towerRearPort[0] + 0.35, towerRearPort[1], towerRearPort[2] + 1.21],
        ]}
      />
    </group>
  );
}
