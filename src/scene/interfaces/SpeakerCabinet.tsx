import { useEffect, useMemo, type ReactNode } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import {
  BoxGeometry,
  CanvasTexture,
  Matrix4,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { Box, Cylinder } from "../Objects";
import Cable from "../workstation/Cable";
import SelectionOutline from "../SelectionOutline";

/** Compact audio cabinet: enamel shell, woven grille, recessed display and knurled dial. */
export default function SpeakerCabinet({
  children,
  hovered,
  active,
  playing,
  volume,
  onToggle,
  onVolume,
}: {
  children: ReactNode;
  hovered: boolean;
  active: boolean;
  playing: boolean;
  volume: number;
  onToggle: () => void;
  onVolume: (value: number) => void;
}) {
  const gl = useThree((state) => state.gl);
  const rose = useTexture("/images/leila-logo.png");
  const cloth = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#9b9284";
    c.fillRect(0, 0, 128, 128);
    // Alternating warp and weft; fixed pattern avoids noise that shimmers while orbiting.
    for (let y = 0; y < 128; y += 8)
      for (let x = 0; x < 128; x += 8) {
        const alternate = (x / 8 + y / 8) % 2 === 0;
        c.fillStyle = alternate ? "#c7bdab" : "#b2a793";
        c.fillRect(x + 1, y + 1, alternate ? 6 : 3, alternate ? 3 : 6);
        c.fillStyle = "#766e62";
        c.fillRect(x + 6, y + 5, 1, 2);
      }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(20, 7);
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return texture;
  }, [gl]);
  const knurl = useMemo(() => {
    const parts = Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * Math.PI * 2;
      const geometry = new BoxGeometry(0.002, 0.006, 0.013);
      const matrix = new Matrix4().makeRotationZ(angle);
      matrix.setPosition(Math.cos(angle) * 0.04, Math.sin(angle) * 0.04, 0);
      return geometry.applyMatrix4(matrix);
    });
    const merged = mergeGeometries(parts)!;
    parts.forEach((part) => part.dispose());
    return merged;
  }, []);
  useEffect(
    () => () => {
      cloth.dispose();
      knurl.dispose();
    },
    [cloth, knurl],
  );
  return (
    <group name="Ivory studio speaker">
      <Box size={[0.56, 0.54, 0.3]} color="#ded9cf" radius={0.032} />
      <SelectionOutline size={[0.56, 0.54, 0.3]} visible={hovered && !active} />
      {/* Fine burgundy seam around the inset front fascia. */}
      <Box
        position={[0, 0, 0.15]}
        size={[0.526, 0.506, 0.012]}
        color="#641e28"
        radius={0.023}
      />
      <Box
        position={[0, 0.001, 0.158]}
        size={[0.512, 0.492, 0.014]}
        color="#d4cec1"
        radius={0.021}
      />
      <Box
        position={[-0.035, 0.105, 0.169]}
        size={[0.418, 0.263, 0.014]}
        color="#242023"
        radius={0.009}
      />
      {children}
      {/* Woven lower baffle replaces the exposed rings and decorative driver dots. */}
      <mesh position={[0, -0.146, 0.174]}>
        <boxGeometry args={[0.482, 0.168, 0.012]} />
        <meshStandardMaterial map={cloth} roughness={0.98} metalness={0} />
      </mesh>
      <Box
        position={[0, -0.051, 0.175]}
        size={[0.484, 0.006, 0.012]}
        color="#9e917d"
        radius={0.001}
        castShadow={false}
      />
      <Box
        position={[0, -0.157, 0.183]}
        size={[0.048, 0.047, 0.005]}
        color="#d9ceba"
        radius={0.005}
        castShadow={false}
      />
      <mesh position={[0, -0.157, 0.186]}>
        <planeGeometry args={[0.034, 0.036]} />
        <meshStandardMaterial
          map={rose}
          transparent
          roughness={0.9}
          depthWrite={false}
        />
      </mesh>
      {/* Knurled volume encoder with a fine index mark. */}
      <group
        position={[0.213, 0.113, 0.181]}
        onWheel={(e) => {
          if (active) {
            e.stopPropagation();
            onVolume(volume - e.deltaY * 0.001);
          }
        }}
      >
        <mesh>
          <torusGeometry args={[0.046, 0.0025, 6, 40]} />
          <meshStandardMaterial color="#781b20" roughness={0.7} />
        </mesh>
        <Cylinder
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.04, 0.04, 0.022]}
          color="#ad9d86"
        />
        <mesh geometry={knurl}>
          <meshStandardMaterial
            color="#c3b49c"
            metalness={0.65}
            roughness={0.4}
          />
        </mesh>
        <Cylinder
          position={[0, 0, 0.014]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.035, 0.035, 0.008]}
          color="#d3c5ae"
        />
        <group rotation={[0, 0, 0.75 - volume * 1.5]}>
          <Box
            position={[0, 0.023, 0.02]}
            size={[0.0025, 0.009, 0.0015]}
            color="#4e3934"
            radius={0.0004}
            castShadow={false}
          />
        </group>
      </group>
      <group
        position={[0.213, 0.007, 0.181]}
        onClick={(e) => {
          if (active) {
            e.stopPropagation();
            onToggle();
          }
        }}
      >
        <Cylinder
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.018, 0.018, 0.012]}
          color="#4a3439"
        />
        <Box
          position={[0, 0.002, 0.008]}
          size={[0.002, 0.01, 0.001]}
          color="#e0d5c1"
          radius={0.0004}
          castShadow={false}
        />
      </group>
      <mesh position={[0.213, -0.032, 0.183]}>
        <circleGeometry args={[0.0028, 10]} />
        <meshBasicMaterial
          color={playing ? "#d0b98d" : "#6f6056"}
          toneMapped={false}
        />
      </mesh>
      {/* Small rubber feet keep the body and the power lead above the desktop. */}
      {[-0.2, 0.2].map((x) => (
        <Box
          key={x}
          position={[x, -0.277, 0]}
          size={[0.07, 0.016, 0.21]}
          color="#302a2b"
          radius={0.006}
        />
      ))}
      <Box
        position={[0, -0.03, -0.153]}
        size={[0.46, 0.39, 0.008]}
        color="#b4ac9e"
        radius={0.015}
      />
      {[-0.18, 0.18].flatMap((x) =>
        [-0.18, 0.12].map((y) => (
          <Cylinder
            key={`${x}:${y}`}
            position={[x, y, -0.16]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[0.004, 0.004, 0.004]}
            color="#635d54"
          />
        )),
      )}
      <Cylinder
        position={[-0.12, -0.17, -0.16]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[0.01, 0.01, 0.02]}
        color="#342d2c"
      />
      <Cable
        radius={0.0026}
        points={[
          [-0.12, -0.17, -0.17],
          [-0.12, -0.2, -0.22],
          [-0.1, -0.274, -0.28],
          [0.08, -0.279, -0.37],
          [0.25, -0.279, -0.54],
        ]}
      />
    </group>
  );
}
