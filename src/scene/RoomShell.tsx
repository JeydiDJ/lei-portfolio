import { useEffect, useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from "three";
import { Box, Cylinder } from "./Objects";
import BackWall from "./BackWall";
import Ceiling from "./Ceiling";
import FlutedPanels from "./FlutedPanels";
import { roomLayout as room } from "./layout";

function Floor() {
  const wood = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const c = canvas.getContext("2d")!;
    let seed = 67;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    for (let plank = 0; plank < 8; plank++) {
      const x = plank * 128;
      c.fillStyle = ["#80644c", "#8b6b50", "#927358", "#765d48"][plank % 4];
      c.fillRect(x, 0, 128, 1024);
      for (let i = 0; i < 90; i++) {
        c.strokeStyle = `rgba(44,29,20,${random() * 0.09})`;
        c.lineWidth = 0.4 + random();
        const gx = x + random() * 126;
        c.beginPath();
        c.moveTo(gx, 0);
        c.bezierCurveTo(
          gx + random() * 5,
          340,
          gx - random() * 5,
          680,
          gx,
          1024,
        );
        c.stroke();
      }
      c.fillStyle = "#493b32";
      c.fillRect(x, 0, 1.2, 1024);
      for (let y = (plank % 3) * 170; y < 1024; y += 510)
        c.fillRect(x, y, 128, 1.3);
    }
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(2, 2);
    t.anisotropy = 4;
    return t;
  }, []);
  useEffect(() => () => wood.dispose(), [wood]);
  return (
    <mesh
      position={[
        (room.left + room.right) / 2,
        -0.12,
        (room.back + room.front) / 2,
      ]}
      receiveShadow
    >
      <boxGeometry
        args={[
          room.right - room.left + 0.25,
          0.24,
          room.front - room.back + 0.25,
        ]}
      />
      <meshStandardMaterial map={wood} roughness={0.86} />
    </mesh>
  );
}
function Door() {
  return (
    <group
      position={[3.65, 1.94, room.front - 0.17]}
      rotation={[0, Math.PI, 0]}
    >
      <Box size={[1.65, 3.82, 0.075]} color="#b29578" radius={0.012} />
      {[-0.82, 0.82].map((y) => (
        <Box
          key={y}
          position={[0, y, 0.045]}
          size={[1.35, 1.42, 0.025]}
          color="#c3aa8c"
          radius={0.012}
        />
      ))}
      {[-0.885, 0.885].map((x) => (
        <Box
          key={x}
          position={[x, 0.015, 0.02]}
          size={[0.12, 3.94, 0.16]}
          color="#e5dfd3"
          radius={0.006}
        />
      ))}
      <Box
        position={[0, 1.99, 0.02]}
        size={[1.89, 0.12, 0.16]}
        color="#e5dfd3"
        radius={0.006}
      />
      <Cylinder
        position={[-0.61, -0.08, 0.08]}
        rotation={[Math.PI / 2, 0, 0]}
        args={[0.055, 0.055, 0.035]}
        color="#8a826c"
      />
      <Box
        position={[-0.53, -0.08, 0.12]}
        size={[0.23, 0.035, 0.04]}
        color="#aaa18b"
        radius={0.014}
      />
      {[-1.45, 0, 1.45].map((y) => (
        <Cylinder
          key={y}
          position={[0.79, y, 0.05]}
          args={[0.018, 0.018, 0.12]}
          color="#8a826c"
        />
      ))}
    </group>
  );
}
export default function RoomShell() {
  const width = room.right - room.left,
    depth = room.front - room.back,
    h = room.ceilingHeight;
  const cx = (room.left + room.right) / 2,
    cz = (room.back + room.front) / 2;
  return (
    <group>
      <Floor />
      <BackWall />
      <FlutedPanels />
      <Ceiling />
      {[room.left, room.right].map((x) => (
        <group key={x}>
          <Box
            position={[x, h / 2, cz]}
            size={[0.25, h, depth]}
            color="#f4f1eb"
            radius={0}
          />
          <Box
            position={[x + (x === room.left ? 0.17 : -0.17), 0.14, cz]}
            size={[0.08, 0.22, depth]}
            color="#e6e1d8"
            radius={0.004}
          />
        </group>
      ))}
      {/* Front wall has a framed door; every wall meets its neighbours at a real corner. */}
      <Box
        position={[(room.left + 2.765) / 2, h / 2, room.front]}
        size={[2.765 - room.left, h, 0.25]}
        color="#f4f1eb"
        radius={0}
      />
      <Box
        position={[(4.535 + room.right) / 2, h / 2, room.front]}
        size={[room.right - 4.535, h, 0.25]}
        color="#f4f1eb"
        radius={0}
      />
      <Box
        position={[3.65, (3.94 + h) / 2, room.front]}
        size={[1.77, h - 3.94, 0.25]}
        color="#f4f1eb"
        radius={0}
      />
      <Door />
      <Box
        position={[cx, 0.14, room.back + 0.17]}
        size={[width - 0.25, 0.22, 0.08]}
        color="#e6e1d8"
        radius={0.004}
      />
      {[
        [room.left + 0.125, 2.765],
        [4.535, room.right - 0.125],
      ].map(([a, b], i) => (
        <Box
          key={i}
          position={[(a + b) / 2, 0.14, room.front - 0.17]}
          size={[b - a, 0.22, 0.08]}
          color="#e6e1d8"
          radius={0.004}
        />
      ))}
      {[room.left + 0.15, room.right - 0.15].flatMap((x) =>
        [room.back + 0.15, room.front - 0.15].map((z) => (
          <Box
            key={`${x}-${z}`}
            position={[x, h / 2, z]}
            size={[0.055, h, 0.055]}
            color="#e4dfd4"
            radius={0.008}
          />
        )),
      )}
      {[room.back + 0.17, room.front - 0.17].map((z) => (
        <Box
          key={z}
          position={[cx, h - 0.055, z]}
          size={[width, 0.11, 0.1]}
          color="#e6e1d8"
          radius={0}
        />
      ))}
      {[room.left + 0.17, room.right - 0.17].map((x) => (
        <Box
          key={x}
          position={[x, h - 0.055, cz]}
          size={[0.1, 0.11, depth]}
          color="#e6e1d8"
          radius={0}
        />
      ))}
      {/* Small socket plates and a light switch make the architecture readable. */}
      {[-2.7, 3.8].map((x) => (
        <group key={x} position={[x, 0.44, room.back + 0.14]}>
          <Box size={[0.2, 0.16, 0.022]} color="#e5e0d5" radius={0.012} />
          {[-0.045, 0.045].map((s) => (
            <Box
              key={s}
              position={[s, 0, 0.014]}
              size={[0.018, 0.04, 0.006]}
              color="#77766d"
              radius={0.002}
              castShadow={false}
            />
          ))}
        </group>
      ))}
      <group
        position={[2.35, 2.12, room.front - 0.14]}
        rotation={[0, Math.PI, 0]}
      >
        <Box size={[0.19, 0.27, 0.022]} color="#e6e1d8" radius={0.012} />
        <Box
          position={[0, 0, 0.018]}
          size={[0.12, 0.18, 0.014]}
          color="#f4efe5"
          radius={0.006}
        />
      </group>
    </group>
  );
}
