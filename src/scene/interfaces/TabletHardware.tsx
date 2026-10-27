import { useLayoutEffect, useRef, type ReactNode } from "react";
import { InstancedMesh, Matrix4 } from "three";
import { Box, Cylinder } from "../Objects";
import SelectionOutline from "../SelectionOutline";
import { tabletLayout as device } from "../layout";

/** Galaxy Tab-inspired aluminum slate with landscape camera, quad grilles and S Pen. */
export default function TabletHardware({
  children,
  hovered,
  active,
}: {
  children: ReactNode;
  hovered: boolean;
  active: boolean;
}) {
  const grilles = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    let i = 0;
    for (const side of [-1, 1])
      for (const bank of [-1, 1])
        for (let slot = 0; slot < 6; slot++) {
          grilles.current?.setMatrixAt(
            i++,
            new Matrix4().makeTranslation(
              side * 0.3105,
              0,
              bank * 0.123 + (slot - 2.5) * 0.009,
            ),
          );
        }
    if (grilles.current) {
      grilles.current.instanceMatrix.needsUpdate = true;
      grilles.current.computeBoundingSphere();
    }
  }, []);
  return (
    <group name="Samsung-inspired tablet and S Pen">
      <Box
        size={[device.width, device.thickness, device.depth]}
        color="#b8b9bb"
        radius={0.005}
      />
      <SelectionOutline
        size={[device.width, device.thickness, device.depth]}
        visible={hovered && !active}
      />
      <Box
        position={[0, 0.009, 0]}
        size={[0.612, 0.002, 0.394]}
        color="#202124"
        radius={0.004}
      />
      {children}
      {/* Landscape camera stays centered in the long upper bezel. */}
      <Cylinder
        position={[0, 0.0108, -0.19]}
        args={[0.0038, 0.0038, 0.001]}
        color="#101114"
      />
      <Cylinder
        position={[0, 0.0114, -0.19]}
        args={[0.002, 0.002, 0.0005]}
        color="#334049"
      />
      <Cylinder
        position={[-0.025, 0.0107, -0.19]}
        args={[0.0012, 0.0012, 0.0006]}
        color="#333334"
      />
      <instancedMesh ref={grilles} args={[undefined, undefined, 24]}>
        <boxGeometry args={[0.0015, 0.003, 0.005]} />
        <meshStandardMaterial color="#45464a" roughness={0.9} />
      </instancedMesh>
      <Box
        position={[0.311, -0.001, 0]}
        size={[0.002, 0.005, 0.027]}
        color="#353639"
        radius={0.0006}
        castShadow={false}
      />
      <Box
        position={[0.22, 0.001, -0.202]}
        size={[0.037, 0.004, 0.004]}
        color="#7b7e82"
        radius={0.001}
        castShadow={false}
      />
      <Box
        position={[0.14, 0.001, -0.202]}
        size={[0.068, 0.004, 0.004]}
        color="#7b7e82"
        radius={0.001}
        castShadow={false}
      />
      {[-0.25, 0.25].map((x) => (
        <Box
          key={x}
          position={[x, 0, -0.2011]}
          size={[0.002, 0.015, 0.001]}
          color="#d8d8d6"
          radius={0.0003}
          castShadow={false}
        />
      ))}
      {/* Rear lenses and magnetic pen strip are part of the thin back shell. */}
      {[-0.14, -0.095].map((z) => (
        <group key={z} position={[-0.257, -0.01, z]}>
          <Cylinder
            position={[0, 0, 0]}
            args={[0.014, 0.014, 0.004]}
            color="#56585c"
          />
          <Cylinder
            position={[0, -0.0022, 0]}
            args={[0.0105, 0.0105, 0.001]}
            color="#161c22"
          />
        </group>
      ))}
      <Box
        position={[-0.07, -0.0095, -0.14]}
        size={[0.31, 0.002, 0.023]}
        color="#73777d"
        radius={0.001}
        castShadow={false}
      />
      {/* Pen rests on the desktop, with a tapered nib and an inset side button. */}
      <group position={[0.365, -0.005, 0]} name="S Pen">
        <Cylinder
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.0065, 0.0065, 0.33]}
          color="#45474c"
        />
        <Cylinder
          position={[0, 0, 0.174]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.0007, 0.0058, 0.018]}
          color="#414348"
        />
        <Cylinder
          position={[0, 0, 0.187]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.0007, 0.0007, 0.008]}
          color="#27282c"
        />
        <Box
          position={[-0.0058, 0.002, -0.035]}
          size={[0.002, 0.003, 0.036]}
          color="#74767a"
          radius={0.0006}
          castShadow={false}
        />
      </group>
    </group>
  );
}
