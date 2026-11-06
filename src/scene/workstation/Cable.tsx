import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
export default function Cable({
  points,
  radius = 0.004,
  color = "#25262c",
  segments = 24,
}: {
  points: [number, number, number][];
  radius?: number;
  color?: string;
  segments?: number;
}) {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    [points],
  );
  return (
    <mesh>
      <tubeGeometry args={[curve, segments, radius, 6, false]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}
