import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  ExtrudeGeometry,
  Path,
  Shape,
  SRGBColorSpace,
} from "three";
import { Box, Cylinder } from "../Objects";
import FanRotor from "./FanRotor";
import { gpuLift, towerDimensions } from "./dimensions";

/** White ROG Strix reference: 357.6 × 149.3 × 70.1 mm at 2 scene units/m. */
export default function GraphicsCard() {
  const rear = -towerDimensions.depth / 2 + 0.009;
  const length = 0.7152;
  const centerZ = rear + length / 2;
  const fanCenters = [rear + 0.1275, rear + 0.3576, rear + 0.5877];
  const shroud = useMemo(() => {
    const frame = new Shape();
    frame.moveTo(-0.1493, -0.3576);
    frame.lineTo(0.1493, -0.3576);
    frame.lineTo(0.1493, 0.3576);
    frame.lineTo(-0.1493, 0.3576);
    frame.closePath();
    for (const z of [-0.2301, 0, 0.2301]) {
      const hole = new Path();
      hole.absarc(0, z, 0.108, 0, Math.PI * 2, true);
      frame.holes.push(hole);
    }
    return new ExtrudeGeometry(frame, {
      depth: 0.018,
      bevelEnabled: false,
      curveSegments: 28,
    });
  }, []);
  const label = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = 96;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "#d8d9d2";
    context.fillRect(0, 0, 1536, 96);
    context.fillStyle = "#747a79";
    context.font = '600 47px "DM Sans",sans-serif';
    context.fillText("GEFORCE RTX", 28, 65);
    const gradient = context.createLinearGradient(780, 0, 1470, 0);
    gradient.addColorStop(0, "#38c2d0");
    gradient.addColorStop(0.5, "#b090c9");
    gradient.addColorStop(1, "#d97f9f");
    context.fillStyle = gradient;
    context.font = '600 37px "DM Sans",sans-serif';
    context.fillText("REPUBLIC OF GAMERS", 800, 62);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, []);
  useEffect(
    () => () => {
      label.dispose();
      shroud.dispose();
    },
    [label, shroud],
  );
  return (
    <group position={[0, gpuLift, 0]}>
      <Box
        position={[0.152, -0.063, -0.21]}
        size={[0.022, 0.018, 0.28]}
        color="#292d2c"
        radius={0.002}
      />
      <Box
        position={[0.139, -0.063, centerZ]}
        size={[0.018, 0.008, 0.64]}
        color="#46564a"
        radius={0.002}
      />
      {/* Silver fin stack between the white backplate and open three-fan shroud. */}
      <Box
        position={[0.0007, -0.13, centerZ]}
        size={[0.27, 0.112, 0.684]}
        color="#565d5e"
        radius={0.004}
      />
      {Array.from({ length: 38 }, (_, index) => (
        <Box
          key={index}
          position={[0.0007, -0.13, rear + 0.022 + index * 0.0181]}
          size={[0.281, 0.11, 0.004]}
          color="#a0a5a1"
          radius={0}
          castShadow={false}
        />
      ))}
      <Box
        position={[0.0007, -0.064, centerZ]}
        size={[0.2986, 0.012, 0.7152]}
        color="#d8dad3"
        radius={0.006}
      />
      {/* Cut-out shroud surrounds all three fans instead of covering their faces. */}
      <mesh
        geometry={shroud}
        position={[0.0007, -0.19, centerZ]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#dfe1da"
          roughness={0.48}
          metalness={0.15}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <Box
            position={[side * 0.144 + 0.0007, -0.081, centerZ]}
            size={[0.012, 0.028, 0.705]}
            color="#e1e2db"
            radius={0.003}
          />
          <Box
            position={[side * 0.144 + 0.0007, -0.18, centerZ]}
            size={[0.012, 0.028, 0.705]}
            color="#dadcd5"
            radius={0.003}
          />
          <Box
            position={[0.0007, -0.13, centerZ + side * 0.351]}
            size={[0.2986, 0.138, 0.014]}
            color="#d5d7d1"
            radius={0.004}
          />
        </group>
      ))}
      {fanCenters.map((z, index) => (
        <group key={z} position={[0.0007, -0.204, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.104, 0.006, 6, 28]} />
            <meshStandardMaterial
              color="#c5c9c4"
              roughness={0.5}
              metalness={0.15}
            />
          </mesh>
          <FanRotor axis="y" radius={0.099} color="#c5ccc8">
            {Array.from({ length: 9 }, (_, blade) => (
              <Box
                key={blade}
                position={[
                  Math.cos((blade * 2 * Math.PI) / 9) * 0.051,
                  0,
                  Math.sin((blade * 2 * Math.PI) / 9) * 0.051,
                ]}
                rotation={[0, (-blade * 2 * Math.PI) / 9 + 0.3, 0]}
                size={[0.084, 0.007, 0.029]}
                color="#d8dcd5"
                radius={0.003}
                castShadow={false}
              />
            ))}
          </FanRotor>
          <Cylinder
            position={[0, 0, 0]}
            args={[0.024, 0.024, 0.012]}
            color={index === 1 ? "#d5d9d3" : "#bfc6c0"}
          />
        </group>
      ))}
      <mesh
        position={[-0.151, -0.178, centerZ]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <planeGeometry args={[0.685, 0.032]} />
        <meshStandardMaterial map={label} roughness={0.7} />
      </mesh>
      {/* Fine diagonal backplate vents and the reference card's restrained RGB end. */}
      {Array.from({ length: 9 }, (_, i) => (
        <Box
          key={i}
          position={[0.01, -0.056, rear + 0.46 + i * 0.023]}
          rotation={[0, -0.5, 0]}
          size={[0.21, 0.002, 0.006]}
          color="#626b6c"
          radius={0.001}
          castShadow={false}
        />
      ))}
      {["#45bec8", "#6faed4", "#a398cf", "#c58fbe", "#db88a6", "#db9b7a"].map(
        (color, i) => (
          <mesh
            key={color}
            position={[-0.155, -0.187 + i * 0.021, rear + 0.697]}
          >
            <boxGeometry args={[0.005, 0.019, 0.01]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              roughness={0.6}
            />
          </mesh>
        ),
      )}
      {/* Three-slot I/O bracket touches both the cooler and the case's rear plane. */}
      <Box
        position={[0.0007, -0.13, rear - 0.012]}
        size={[0.2986, 0.1402, 0.024]}
        color="#8d918d"
        radius={0.002}
      />
      {[-0.082, -0.015, 0.052, 0.115].map((x, index) => (
        <group key={x}>
          <Box
            position={[x, -0.104, rear - 0.026]}
            size={[0.049, 0.021, 0.004]}
            color="#424747"
            radius={0.002}
            castShadow={false}
          />
          <Box
            position={[x, -0.104, rear - 0.029]}
            size={[index === 3 ? 0.033 : 0.038, 0.012, 0.003]}
            color="#111516"
            radius={0.001}
            castShadow={false}
          />
        </group>
      ))}
      {[0, 1].map((row) =>
        Array.from({ length: 9 }, (_, index) => (
          <Box
            key={`${row}-${index}`}
            position={[
              -0.103 + index * 0.027,
              -0.143 - row * 0.03,
              rear - 0.026,
            ]}
            size={[0.017, 0.013, 0.004]}
            color="#242a2a"
            radius={0.003}
            castShadow={false}
          />
        )),
      )}
      <Box
        position={[-0.135, -0.072, rear - 0.012]}
        size={[0.04, 0.012, 0.045]}
        color="#989c98"
        radius={0.002}
      />
      {/* An anti-sag support rests on the PSU shroud below the far end. */}
      <Cylinder
        position={[-0.13, -0.238, rear + 0.68]}
        args={[0.009, 0.012, 0.064]}
        color="#686e69"
      />
    </group>
  );
}
