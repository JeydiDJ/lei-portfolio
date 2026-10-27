import { useEffect, useMemo } from "react";
import {
  CanvasTexture,
  CatmullRomCurve3,
  RepeatWrapping,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

/** Soft floor seat with a sculpted seat hollow, raised back and sewn fabric panels. */
function contour(x: number, y: number, z: number, lift = 0) {
  const angle = Math.atan2(z, x),
    radial = Math.hypot(x, z);
  const fold = 1 + Math.sin(angle * 9 + y * 1.5) * 0.014 * (1 - y * y);
  const hollow =
    0.36 *
    Math.exp(-((x / 0.55) ** 2 + ((z - 0.25) / 0.65) ** 2)) *
    Math.max(0, y);
  return new Vector3(
    x * 0.72 * fold + x * lift,
    Math.max(
      0,
      0.43 +
        0.43 * y +
        Math.max(0, -z) * 0.46 -
        hollow -
        0.09 +
        Math.sin(angle * 6) * 0.009 * Math.max(0, y) * radial,
    ) +
      Math.max(0, y) * lift,
    z * 0.82 * fold + z * lift,
  );
}
export default function BeanBag() {
  const { body, seams, fabric } = useMemo(() => {
    const body = new SphereGeometry(1, 48, 32);
    const vertices = body.getAttribute("position");
    for (let i = 0; i < vertices.count; i++) {
      const point = contour(
        vertices.getX(i),
        vertices.getY(i),
        vertices.getZ(i),
      );
      vertices.setXYZ(i, point.x, point.y, point.z);
    }
    body.computeVertexNormals();
    body.computeBoundingSphere();
    const panels = [
      Math.PI / 4,
      (3 * Math.PI) / 4,
      (5 * Math.PI) / 4,
      (7 * Math.PI) / 4,
    ].map((angle) => {
      const points = Array.from({ length: 41 }, (_, i) => {
        const polar = 0.06 + ((Math.PI - 0.12) * i) / 40;
        return contour(
          Math.sin(polar) * Math.cos(angle),
          Math.cos(polar),
          Math.sin(polar) * Math.sin(angle),
          0.003,
        );
      });
      return new TubeGeometry(
        new CatmullRomCurve3(points),
        48,
        0.0026,
        5,
        false,
      );
    });
    const seams = mergeGeometries(panels)!;
    panels.forEach((part) => part.dispose());
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#808080";
    c.fillRect(0, 0, 64, 64);
    for (let y = 0; y < 64; y += 4)
      for (let x = 0; x < 64; x += 4) {
        c.fillStyle = (x + y) % 8 === 0 ? "#969696" : "#6c6c6c";
        c.fillRect(x, y, 2, 1);
        c.fillRect(x + 2, y + 1, 1, 2);
      }
    const fabric = new CanvasTexture(canvas);
    fabric.wrapS = fabric.wrapT = RepeatWrapping;
    fabric.repeat.set(18, 14);
    return { body, seams, fabric };
  }, []);
  useEffect(
    () => () => {
      body.dispose();
      seams.dispose();
      fabric.dispose();
    },
    [body, seams, fabric],
  );
  return (
    <group
      position={[-0.95, 0, 2.1]}
      rotation={[0, Math.PI, 0]}
      name="Burgundy bean bag facing the TV"
    >
      <mesh geometry={body} castShadow receiveShadow>
        <meshStandardMaterial
          color="#6e2634"
          roughness={0.98}
          bumpMap={fabric}
          bumpScale={0.0015}
        />
      </mesh>
      <mesh geometry={seams} receiveShadow>
        <meshStandardMaterial color="#a16c72" roughness={1} />
      </mesh>
      <mesh position={[0, 0.89, -0.64]} rotation={[-0.12, 0, 0]} castShadow>
        <torusGeometry args={[0.052, 0.008, 6, 20, Math.PI]} />
        <meshStandardMaterial color="#57212d" roughness={1} />
      </mesh>
    </group>
  );
}
