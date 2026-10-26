import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

type V3 = [number, number, number];
export function Box({
  position = [0, 0, 0],
  size,
  color,
  radius = 0.025,
  rotation = [0, 0, 0],
  castShadow = true,
  receiveShadow = true,
}: {
  position?: V3;
  size: V3;
  color: string;
  radius?: number;
  rotation?: V3;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  if (radius === 0)
    return (
      <mesh
        position={position}
        rotation={rotation}
        castShadow={castShadow}
        receiveShadow={receiveShadow}
      >
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.78} />
      </mesh>
    );
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, ...size.map((v) => v / 3))}
      smoothness={2}
      bevelSegments={4}
      position={position}
      rotation={rotation}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <meshStandardMaterial color={color} roughness={0.78} />
    </RoundedBox>
  );
}
export function Cylinder({
  position,
  args,
  color,
  rotation = [0, 0, 0],
}: {
  position: V3;
  args: [number, number, number];
  color: string;
  rotation?: V3;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[...args, 24]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}
export function Plant({
  position,
  scale = 1,
}: {
  position: V3;
  scale?: number;
}) {
  return (
    <group position={position} scale={scale}>
      <Cylinder
        position={[0, 0.17, 0]}
        args={[0.21, 0.15, 0.34]}
        color="#c58b68"
      />
      <Cylinder
        position={[0, 0.345, 0]}
        args={[0.185, 0.185, 0.012]}
        color="#635140"
      />
      <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.014, 8, 24]} />
        <meshStandardMaterial color="#c78e6d" roughness={0.9} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => {
        const a = i * 2.4;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <Cylinder
              position={[0.055, 0.435 + (i % 3) * 0.045, 0]}
              args={[0.008, 0.01, 0.25 + (i % 3) * 0.09]}
              rotation={[0, 0, -0.28]}
              color="#60754e"
            />
            <Leaf i={i} />
          </group>
        );
      })}
    </group>
  );
}
function Leaf({ i }: { i: number }) {
  return (
    <mesh
      position={[0.14, 0.55 + (i % 3) * 0.1, 0]}
      rotation={[0, 0, -0.5]}
      scale={[0.1, 0.31, 0.075]}
      castShadow
    >
      <sphereGeometry args={[1, 12, 8]} />
      <meshStandardMaterial color={i % 2 ? "#5b7752" : "#84976a"} />
    </mesh>
  );
}

export function Artwork({
  kind = "poster",
  position,
  width = 0.8,
  height = 1,
  rotation = [0, 0, 0],
}: {
  kind?: string;
  position: V3;
  width?: number;
  height?: number;
  rotation?: V3;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = 768;
    const c = canvas.getContext("2d")!;
    c.fillStyle = kind === "screen" ? "#22202e" : "#e9d0c7";
    c.fillRect(0, 0, 768, 768);
    if (kind === "screen") {
      c.fillStyle = "#34303f";
      c.fillRect(0, 0, 768, 55);
      ["#d8a0ad", "#c9b17f", "#a1bca0"].forEach((color, i) => {
        c.fillStyle = color;
        c.beginPath();
        c.arc(29 + i * 24, 27, 6, 0, Math.PI * 2);
        c.fill();
      });
      c.fillStyle = "#e7c4d2";
      c.font = "bold 65px sans-serif";
      c.fillText("lei’s creative space", 60, 175);
      c.fillStyle = "#9e95af";
      c.font = "24px sans-serif";
      c.fillText("A little motion. A little play.", 60, 224);
      ["#a3b28e", "#b8a0c9", "#d0a085", "#91aaa5"].forEach((color, i) => {
        const x = 60 + (i % 2) * 340,
          y = 280 + Math.floor(i / 2) * 190;
        c.fillStyle = color;
        c.fillRect(x, y, 310, 145);
        c.fillStyle = "#302d3d";
        c.font = "bold 26px sans-serif";
        c.fillText(
          ["bloom.", "out of orbit", "little world", "after hours"][i],
          x + 22,
          y + 85,
        );
      });
      c.fillStyle = "#b59caf";
      c.font = "20px sans-serif";
      c.fillText("SELECTED WORK  ↗", 60, 719);
    } else if (kind === "motion") {
      c.fillStyle = "#393248";
      c.fillRect(0, 0, 768, 768);
      [230, 180, 130, 80].forEach((radius, i) => {
        c.strokeStyle = ["#d9afbc", "#b7a0c8", "#ddbd94", "#a3b2aa"][i];
        c.lineWidth = 24;
        c.beginPath();
        c.ellipse(384, 350, radius, radius * 0.65, -0.6, 0, Math.PI * 2);
        c.stroke();
      });
      c.fillStyle = "#e8d6de";
      c.font = "32px sans-serif";
      c.textAlign = "center";
      c.fillText("ALWAYS IN MOTION", 384, 680);
    } else if (kind === "play") {
      c.fillStyle = "#aab9ad";
      c.fillRect(0, 0, 768, 768);
      ["#d7a8ac", "#e4c39e", "#647c75", "#e8d7cf"].forEach((color, i) => {
        c.fillStyle = color;
        c.beginPath();
        c.arc(
          240 + (i % 2) * 280,
          225 + Math.floor(i / 2) * 260,
          130,
          0,
          Math.PI * 2,
        );
        c.fill();
      });
      c.fillStyle = "#384d46";
      c.font = "32px sans-serif";
      c.textAlign = "center";
      c.fillText("A LITTLE PLAY, EVERY DAY", 384, 680);
    } else {
      c.fillStyle = "#d57f55";
      c.beginPath();
      c.arc(384, 340, 215, Math.PI, 0);
      c.fill();
      c.fillRect(169, 340, 430, 200);
      c.fillStyle = "#809375";
      c.beginPath();
      c.arc(384, 445, 145, Math.PI, 0);
      c.fill();
      c.fillRect(239, 445, 290, 140);
      c.fillStyle = "#f5e8cd";
      c.beginPath();
      c.arc(384, 500, 75, Math.PI, 0);
      c.fill();
      c.fillRect(309, 500, 150, 100);
      c.fillStyle = "#455a43";
      c.font = "32px sans-serif";
      c.textAlign = "center";
      c.fillText("MAKE ROOM FOR PLAY", 384, 680);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [kind]);
  return (
    <group position={position} rotation={rotation}>
      <Box
        size={[width + 0.07, height + 0.07, 0.06]}
        color={kind === "screen" ? "#15151e" : "#39333f"}
      />
      <mesh position={[0, 0, 0.036]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}
