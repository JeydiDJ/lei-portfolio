import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  InstancedMesh,
  Matrix4,
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
      accent: label === "Esc" || label === "Enter",
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
  const geometry = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 2, 0.12), []);
  const legends = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 786;
    const c = canvas.getContext("2d")!;
    c.textAlign = "center";
    c.textBaseline = "middle";
    keys.forEach((key) => {
      c.fillStyle = key.accent ? "#fff4e8" : "#484e48";
      c.font = `${key.label.length > 2 ? 28 : 38}px sans-serif`;
      c.fillText(
        key.label,
        ((key.x + dimensions.width / 2) / dimensions.width) * canvas.width,
        ((key.z + dimensions.depth / 2) / dimensions.depth) * canvas.height,
      );
    });
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }, [keys]);
  useLayoutEffect(() => {
    if (!instances.current) return;
    keys.forEach((key, i) => {
      const matrix = new Matrix4().makeScale(
        key.units * dimensions.pitch - 0.004,
        0.018,
        dimensions.pitch - 0.004,
      );
      matrix.setPosition(key.x, 0.033, key.z);
      instances.current!.setMatrixAt(i, matrix);
      instances.current!.setColorAt(
        i,
        new Color(
          key.accent ? "#b57e72" : key.label.length > 1 ? "#adb7a6" : "#ede8dd",
        ),
      );
    });
    instances.current.instanceMatrix.needsUpdate = true;
    if (instances.current.instanceColor)
      instances.current.instanceColor.needsUpdate = true;
    instances.current.computeBoundingSphere();
  }, [keys]);
  useEffect(
    () => () => {
      geometry.dispose();
      legends.dispose();
    },
    [geometry, legends],
  );
  return (
    <group
      position={[-0.48, 1.486, -0.32]}
      rotation={[-0.035, 0, 0]}
      scale={workstationScale.keyboard}
    >
      <Box
        size={[dimensions.width, 0.04, dimensions.depth]}
        color="#bab7ac"
        radius={0.012}
      />
      <Box
        position={[0, 0.021, 0]}
        size={[dimensions.width - 0.018, 0.008, dimensions.depth - 0.018]}
        color="#787b71"
        radius={0.008}
        castShadow={false}
      />
      <instancedMesh
        ref={instances}
        args={[geometry, undefined, keys.length]}
        receiveShadow
      >
        <meshStandardMaterial roughness={0.78} />
      </instancedMesh>
      <mesh position={[0, 0.043, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
        position={[0, 0.002, -dimensions.depth / 2 - 0.002]}
        size={[0.022, 0.012, 0.008]}
        color="#30342f"
        radius={0.002}
      />
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
