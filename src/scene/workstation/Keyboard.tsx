import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  BufferGeometry,
  Float32BufferAttribute,
  Color,
  ExtrudeGeometry,
  InstancedMesh,
  Matrix4,
  Path,
  Shape,
  SRGBColorSpace,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Box } from "../Objects";
import { keyboardDimensions as dimensions } from "./dimensions";
import Cable from "./Cable";
import { workstationScale, towerUsbPort } from "./dimensions";

type Key = {
  label: string;
  x: number;
  z: number;
  units: number;
  accent: boolean;
};

/** Rounded shoulders taper into a shallow finger dish; one mesh shared by every key. */
function createKeycap() {
  const vertices: number[] = [];
  const triangles: number[] = [];
  const rings = [
    [-0.5, 0.9],
    [-0.34, 1],
    [0.12, 0.96],
    [0.36, 0.86],
    [0.48, 0.73],
  ];
  const segments = 24;
  for (const [y, scale] of rings) {
    for (let corner = 0; corner < 4; corner++) {
      const angle = (corner * Math.PI) / 2;
      const cx = corner === 0 || corner === 3 ? 0.29 : -0.29;
      const cz = corner < 2 ? 0.29 : -0.29;
      for (let step = 0; step < 6; step++) {
        const a = angle + ((step / 5) * Math.PI) / 2;
        vertices.push(
          (cx + Math.cos(a) * 0.21) * scale,
          y,
          (cz + Math.sin(a) * 0.21) * scale,
        );
      }
    }
  }
  for (let ring = 0; ring < rings.length - 1; ring++) {
    for (let i = 0; i < segments; i++) {
      const a = ring * segments + i;
      const b = ring * segments + ((i + 1) % segments);
      triangles.push(a, a + segments, b, b, a + segments, b + segments);
    }
  }
  const center = vertices.length / 3;
  vertices.push(0, 0.41, 0);
  const bottom = center + 1;
  vertices.push(0, -0.5, 0);
  for (let i = 0; i < segments; i++) {
    const next = (i + 1) % segments;
    triangles.push(center, 4 * segments + next, 4 * segments + i);
    triangles.push(bottom, i, next);
  }
  const mesh = new BufferGeometry();
  mesh.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  mesh.setIndex(triangles);
  mesh.computeVertexNormals();
  return mesh;
}
function layoutKeys() {
  const keys: Key[] = [];
  const pitch = dimensions.pitch,
    left = -0.347;
  const add = (label: string, x: number, row: number, units = 1) =>
    keys.push({
      label,
      x: left + (x + units / 2) * pitch,
      z: row === 0 ? -0.11 : -0.055 + (row - 1) * pitch,
      units,
      accent: ["Esc", "Enter", "", "←", "↓", "↑", "→"].includes(label),
    });
  add("Esc", 0, 0);
  for (let i = 0; i < 12; i++)
    add(`F${i + 1}`, 2 + i + Math.floor(i / 4) * 0.5, 0);
  ["Prt", "Scr", "Pause"].forEach((label, i) => add(label, 15.5 + i, 0));
  const rows: [string, number][][] = [
    [
      ...["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="].map(
        (label) => [label, 1] as [string, number],
      ),
      ["Back", 2],
    ],
    [
      ["Tab", 1.5],
      ...["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"].map(
        (label) => [label, 1] as [string, number],
      ),
      ["\\", 1.5],
    ],
    [
      ["Caps", 1.75],
      ...["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"].map(
        (label) => [label, 1] as [string, number],
      ),
      ["Enter", 2.25],
    ],
    [
      ["Shift", 2.25],
      ...["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"].map(
        (label) => [label, 1] as [string, number],
      ),
      ["Shift", 2.75],
    ],
    [
      ["Ctrl", 1.25],
      ["Win", 1.25],
      ["Alt", 1.25],
      ["", 6.25],
      ["Alt", 1.25],
      ["Fn", 1.25],
      ["Menu", 1.25],
      ["Ctrl", 1.25],
    ],
  ];
  rows.forEach((row, r) => {
    let x = 0;
    row.forEach(([label, units]) => {
      add(label, x, r + 1, units);
      x += units;
    });
  });
  ["Ins", "Home", "PgUp"].forEach((label, i) => add(label, 15.5 + i, 1));
  ["Del", "End", "PgDn"].forEach((label, i) => add(label, 15.5 + i, 2));
  add("↑", 16.5, 4);
  ["←", "↓", "→"].forEach((label, i) => add(label, 15.5 + i, 5));
  return keys;
}
export default function Keyboard() {
  const portY = (towerUsbPort[1] - 1.486) / workstationScale.keyboard;
  const portZ = (towerUsbPort[2] + 0.32) / workstationScale.keyboard;
  const usbEnd: [number, number, number] = [
    (towerUsbPort[0] + 0.48) / workstationScale.keyboard,
    portY * Math.cos(0.035) - portZ * Math.sin(0.035),
    portY * Math.sin(0.035) + portZ * Math.cos(0.035),
  ];
  const keys = useMemo(layoutKeys, []);
  const instances = useRef<InstancedMesh>(null);
  const switches = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.12), []);
  const keycapGeometry = useMemo(createKeycap, []);
  const caseRim = useMemo(() => {
    const width = dimensions.width / 2;
    const depth = dimensions.depth / 2;
    const outline = new Shape();
    outline.moveTo(-width, -depth);
    outline.lineTo(width, -depth);
    outline.lineTo(width, depth);
    outline.lineTo(-width, depth);
    outline.closePath();
    const opening = new Path();
    opening.moveTo(-width + 0.013, -depth + 0.013);
    opening.lineTo(-width + 0.013, depth - 0.013);
    opening.lineTo(width - 0.013, depth - 0.013);
    opening.lineTo(width - 0.013, -depth + 0.013);
    opening.closePath();
    outline.holes.push(opening);
    return new ExtrudeGeometry(outline, {
      depth: 0.025,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.002,
      bevelThickness: 0.002,
    });
  }, []);
  const legends = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 786;
    const c = canvas.getContext("2d")!;
    c.textAlign = "center";
    c.textBaseline = "middle";
    keys.forEach((key) => {
      c.fillStyle = key.accent ? "#f2e8dc" : "#68605d";
      c.font = `500 ${key.label.length > 2 ? 25 : 33}px "DM Sans", sans-serif`;
      c.fillText(
        key.label,
        ((key.x + dimensions.width / 2) / dimensions.width) * canvas.width,
        ((key.z + dimensions.depth / 2) / dimensions.depth) * canvas.height,
      );
    });
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, [keys]);
  useLayoutEffect(() => {
    if (!instances.current) return;
    keys.forEach((key, i) => {
      const matrix = new Matrix4().makeScale(
        key.units * dimensions.pitch - 0.005,
        0.02,
        dimensions.pitch - 0.005,
      );
      matrix.setPosition(key.x, 0.041, key.z);
      instances.current!.setMatrixAt(i, matrix);
      instances.current!.setColorAt(
        i,
        new Color(
          key.accent ? "#781b20" : key.label.length > 1 ? "#e8e3dd" : "#f2eee8",
        ),
      );
      const switchMatrix = new Matrix4().makeScale(
        key.units * dimensions.pitch - 0.009,
        0.013,
        dimensions.pitch - 0.009,
      );
      switchMatrix.setPosition(key.x, 0.027, key.z);
      switches.current?.setMatrixAt(i, switchMatrix);
    });
    instances.current.instanceMatrix.needsUpdate = true;
    if (instances.current.instanceColor)
      instances.current.instanceColor.needsUpdate = true;
    instances.current.computeBoundingSphere();
    if (switches.current) {
      switches.current.instanceMatrix.needsUpdate = true;
      switches.current.computeBoundingSphere();
    }
  }, [keys]);
  useEffect(
    () => () => {
      geometry.dispose();
      keycapGeometry.dispose();
      legends.dispose();
      caseRim.dispose();
    },
    [geometry, keycapGeometry, legends, caseRim],
  );
  return (
    <group
      position={[-0.48, 1.486, -0.32]}
      rotation={[-0.035, 0, 0]}
      scale={workstationScale.keyboard}
    >
      <Box
        position={[0, -0.005, 0]}
        size={[dimensions.width, 0.027, dimensions.depth]}
        color="#d7d9d4"
        radius={0.008}
      />
      {/* The dark joint separates the two white case halves. */}
      <Box
        position={[0, 0.01, 0]}
        size={[dimensions.width - 0.003, 0.003, dimensions.depth - 0.003]}
        color="#9b9993"
        radius={0.003}
        castShadow={false}
      />
      <mesh
        geometry={caseRim}
        position={[0, 0.038, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#e9eae5"
          roughness={0.52}
          metalness={0.12}
        />
      </mesh>
      {/* Recessed plate rests on silicone gasket tabs, below the keycap skirts. */}
      <Box
        position={[0, 0.019, 0]}
        size={[dimensions.width - 0.034, 0.004, dimensions.depth - 0.034]}
        color="#b8b6b2"
        radius={0.003}
        castShadow={false}
      />
      {[-0.27, 0, 0.27].flatMap((x) =>
        [-1, 1].map((side) => (
          <Box
            key={`${x}-${side}`}
            position={[x, 0.019, side * (dimensions.depth / 2 - 0.019)]}
            size={[0.046, 0.007, 0.012]}
            color="#c0c5bf"
            radius={0.002}
            castShadow={false}
          />
        )),
      )}
      <instancedMesh
        ref={switches}
        args={[geometry, undefined, keys.length]}
        receiveShadow
      >
        <meshStandardMaterial color="#bcc2bc" roughness={0.75} />
      </instancedMesh>
      <instancedMesh
        ref={instances}
        args={[keycapGeometry, undefined, keys.length]}
        receiveShadow
      >
        <meshStandardMaterial roughness={0.62} />
      </instancedMesh>
      <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[dimensions.width, dimensions.depth]} />
        <meshStandardMaterial
          map={legends}
          transparent
          alphaTest={0.1}
          depthWrite={false}
          roughness={0.85}
        />
      </mesh>
      <Box
        position={[0, 0, -dimensions.depth / 2 - 0.002]}
        size={[0.022, 0.012, 0.008]}
        color="#454a47"
        radius={0.002}
      />
      {[-0.29, 0.29].flatMap((x) =>
        [-0.095, 0.095].map((z) => (
          <Box
            key={`${x}-${z}`}
            position={[x, -0.02, z]}
            size={[0.042, 0.006, 0.022]}
            color="#656c67"
            radius={0.003}
            castShadow={false}
          />
        )),
      )}
      <Cable
        points={[
          [0, 0, -0.145],
          [0.02, 0.012, -0.25],
          [0.8, 0.02, -0.75],
          [1.15, 0.02, -0.8],
          usbEnd,
        ]}
      />
    </group>
  );
}
