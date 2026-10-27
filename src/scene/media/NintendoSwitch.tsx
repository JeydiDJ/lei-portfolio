import { useEffect, useMemo, useState } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Box, Cylinder } from "../Objects";
import StaticBatch from "../StaticBatch";
import SelectionOutline from "../SelectionOutline";
import Cable from "../workstation/Cable";

/** Docked Switch with neon blue/red Joy-Cons, asymmetric controls, rails and ports. */
export default function NintendoSwitch({ onOpen }: { onOpen: () => void }) {
  const [hovered, setHovered] = useState(false);
  const mark = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 320;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#b8bbbd";
    c.strokeStyle = "#b8bbbd";
    c.lineWidth = 12;
    c.beginPath();
    c.roundRect(172, 34, 74, 144, 28);
    c.stroke();
    c.beginPath();
    c.roundRect(266, 34, 74, 144, 28);
    c.fill();
    c.beginPath();
    c.arc(209, 80, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#292b2e";
    c.beginPath();
    c.arc(303, 134, 12, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = "#b8bbbd";
    c.textAlign = "center";
    c.font = "500 32px sans-serif";
    c.fillText("NINTENDO", 256, 237);
    c.font = "600 48px sans-serif";
    c.fillText("SWITCH", 256, 291);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => mark.dispose(), [mark]);
  return (
    <group
      position={[0, 0.312, 0.18]}
      name="Nintendo Switch console"
      userData={{ dynamic: true }}
      onClick={(e) => {
        e.stopPropagation();
        onOpen();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <SelectionOutline
        size={[0.49, 0.31, 0.13]}
        position={[0, 0.15, 0]}
        visible={hovered}
      />
      <StaticBatch>
        {/* Main handheld: screen is mostly hidden behind the dock's front cover. */}
        <Box
          position={[0, 0.19, -0.025]}
          size={[0.355, 0.203, 0.028]}
          color="#282a2e"
          radius={0.012}
        />
        <Box
          position={[0, 0.193, -0.009]}
          size={[0.312, 0.174, 0.0015]}
          color="#101316"
          radius={0.004}
          castShadow={false}
        />
        {[-1, 1].map((side) => (
          <group key={side} position={[side * 0.207, 0.19, -0.025]}>
            <Box
              size={[0.065, 0.203, 0.031]}
              color={side < 0 ? "#00bde4" : "#ff4554"}
              radius={0.012}
            />
            <Box
              position={[-side * 0.033, 0, -0.002]}
              size={[0.003, 0.185, 0.018]}
              color="#777b7e"
              radius={0.001}
            />
            <Cylinder
              position={[0, side < 0 ? 0.037 : -0.039, 0.018]}
              rotation={[Math.PI / 2, 0, 0]}
              args={[0.019, 0.019, 0.006]}
              color="#5d6064"
            />
            <Cylinder
              position={[0, side < 0 ? 0.037 : -0.039, 0.023]}
              rotation={[Math.PI / 2, 0, 0]}
              args={[0.0135, 0.0135, 0.008]}
              color="#25272b"
            />
            {[0, 1, 2, 3].map((i) => {
              const a = (i * Math.PI) / 2;
              return (
                <Cylinder
                  key={i}
                  position={[
                    Math.cos(a) * 0.018,
                    (side < 0 ? -0.035 : 0.04) + Math.sin(a) * 0.018,
                    0.019,
                  ]}
                  rotation={[Math.PI / 2, 0, 0]}
                  args={[0.0055, 0.0055, 0.003]}
                  color="#303238"
                />
              );
            })}
            <Box
              position={[0, 0.082, 0.017]}
              size={[0.014, 0.003, 0.002]}
              color="#34363b"
              radius={0.0006}
            />
            {side > 0 && (
              <Box
                position={[0, 0.082, 0.017]}
                size={[0.003, 0.014, 0.002]}
                color="#34363b"
                radius={0.0006}
              />
            )}
            <Cylinder
              position={[0, -0.08, 0.018]}
              rotation={[Math.PI / 2, 0, 0]}
              args={[0.005, 0.005, 0.002]}
              color="#777b80"
            />
            <Box
              position={[0, 0.103, -0.004]}
              size={[0.045, 0.005, 0.018]}
              color="#65696d"
              radius={0.002}
            />
          </group>
        ))}
        <Box
          position={[0, 0.103, 0.018]}
          size={[0.348, 0.206, 0.1]}
          color="#292b2e"
          radius={0.017}
        />
        <Box
          position={[0, 0.199, 0.014]}
          size={[0.313, 0.009, 0.075]}
          color="#373a3d"
          radius={0.002}
        />
        <Box
          position={[0, 0.011, 0.023]}
          size={[0.307, 0.022, 0.087]}
          color="#202225"
          radius={0.004}
        />
        <Box
          position={[0.176, 0.08, 0.017]}
          size={[0.002, 0.035, 0.018]}
          color="#35383b"
          radius={0.001}
        />
        {[-0.14, 0.14].map((x) => (
          <Box
            key={x}
            position={[x, 0.002, 0.014]}
            size={[0.025, 0.006, 0.065]}
            color="#36383a"
            radius={0.001}
          />
        ))}
        <Cable
          points={[
            [0.11, 0.06, -0.04],
            [0.14, 0.04, -0.12],
            [0.26, 0.02, -0.19],
            [0.41, 0.02, -0.22],
          ]}
          radius={0.003}
        />
      </StaticBatch>
      <mesh position={[0, 0.115, 0.069]}>
        <planeGeometry args={[0.175, 0.11]} />
        <meshStandardMaterial
          map={mark}
          transparent
          roughness={0.85}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[-0.147, 0.167, 0.07]}>
        <circleGeometry args={[0.002, 8]} />
        <meshBasicMaterial color="#8dba7d" />
      </mesh>
    </group>
  );
}
