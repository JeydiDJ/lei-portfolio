import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import {
  CanvasTexture,
  ExtrudeGeometry,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
} from "three";

/** Grey cloth desk mat with a printed signature and stitched perimeter. */
export default function Mousepad() {
  const gl = useThree((state) => state.gl);
  const { edge, face } = useMemo(() => {
    const w = 1.85,
      h = 0.72,
      r = 0.025;
    const shape = new Shape();
    shape.moveTo(-w / 2 + r, -h / 2);
    shape.lineTo(w / 2 - r, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    shape.lineTo(w / 2, h / 2 - r);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    shape.lineTo(-w / 2 + r, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    shape.lineTo(-w / 2, -h / 2 + r);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    const edge = new ExtrudeGeometry(shape, {
      depth: 0.006,
      bevelEnabled: false,
      curveSegments: 8,
    });
    const face = new ShapeGeometry(shape, 8);
    const positions = face.getAttribute("position"),
      uv = face.getAttribute("uv");
    for (let i = 0; i < positions.count; i++)
      uv.setXY(
        i,
        (positions.getX(i) + w / 2) / w,
        (positions.getY(i) + h / 2) / h,
      );
    return { edge, face };
  }, []);
  const print = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = 600;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#a5a3a2";
    c.fillRect(0, 0, 1536, 600);
    // Fine cloth grain is part of the print texture, with no animated noise.
    c.fillStyle = "#7e7c7b";
    c.globalAlpha = 0.16;
    for (let y = 1; y < 600; y += 4) c.fillRect(0, y, 1536, 0.5);
    c.globalAlpha = 1;
    c.strokeStyle = "#d3ceca";
    c.lineWidth = 1.5;
    c.setLineDash([4, 6]);
    c.beginPath();
    c.roundRect(11, 11, 1514, 578, 16);
    c.stroke();
    c.setLineDash([]);
    c.strokeStyle = "#781b20";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(54, 564);
    c.lineTo(1120, 564);
    c.stroke();
    c.fillStyle = "#514449";
    c.font = '500 32px "DM Sans",sans-serif';
    c.fillText("Leila Rose Parungo", 54, 536);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return texture;
  }, [gl]);
  useEffect(
    () => () => {
      edge.dispose();
      face.dispose();
    },
    [edge, face],
  );
  useEffect(() => () => print.dispose(), [print]);
  return (
    <group
      name="Grey signature mousepad"
      position={[-0.15, 1.451, -0.28]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <mesh geometry={edge} receiveShadow>
        <meshStandardMaterial color="#777374" roughness={1} />
      </mesh>
      <mesh geometry={face} position={[0, 0, 0.0063]} receiveShadow>
        <meshStandardMaterial map={print} roughness={0.98} metalness={0} />
      </mesh>
    </group>
  );
}
