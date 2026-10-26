import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { Box, Cylinder } from "../Objects";

/** Small pinned keepsakes leave the badge faces and their click targets clear. */
export default function BoardDecorations() {
  const textures = useMemo(() => {
    const make = (paint: (context: CanvasRenderingContext2D) => void) => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 256;
      paint(canvas.getContext("2d")!);
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 8;
      return texture;
    };
    const cork = make((c) => {
      c.fillStyle = "#6b4a33";
      c.fillRect(0, 0, 512, 256);
      let seed = 317;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (let i = 0; i < 17000; i++) {
        c.fillStyle = ["#805c40", "#573c2b", "#92704d", "#745139"][i % 4];
        c.fillRect(
          random() * 512,
          random() * 256,
          1 + random() * 3,
          1 + random() * 3,
        );
      }
    });
    const note = make((c) => {
      c.fillStyle = "#e2d7bc";
      c.fillRect(0, 0, 512, 256);
      c.fillStyle = "#493d33";
      c.font = 'italic 48px "DM Sans",sans-serif';
      c.fillText("make things", 30, 102);
      c.fillText("that matter.", 30, 174);
      c.strokeStyle = "#781b20";
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(35, 192);
      c.lineTo(370, 188);
      c.stroke();
    });
    const ticket = make((c) => {
      c.fillStyle = "#e7e1d5";
      c.fillRect(0, 0, 512, 256);
      c.strokeStyle = "#37302e";
      c.lineWidth = 4;
      c.strokeRect(15, 15, 482, 226);
      c.fillStyle = "#781b20";
      c.font = '600 44px "DM Sans",sans-serif';
      c.fillText("CREATE / PLAY", 32, 98);
      c.fillStyle = "#37302e";
      c.font = '27px "DM Sans",sans-serif';
      c.fillText("DESIGN • SOUND • GAMES", 32, 148);
      for (let i = 0; i < 52; i++) c.fillRect(34 + i * 8, 176, (i % 3) + 2, 39);
    });
    const swatches = make((c) => {
      c.fillStyle = "#e8e0d7";
      c.fillRect(0, 0, 512, 256);
      ["#781b20", "#253b3a", "#211c1e", "#b5a58a"].forEach((color, i) => {
        c.fillStyle = color;
        c.fillRect(20 + i * 120, 24, 110, 164);
      });
      c.fillStyle = "#453d39";
      c.font = '24px "DM Sans",sans-serif';
      c.fillText("STUDIO PALETTE", 20, 232);
    });
    const sketch = make((c) => {
      c.fillStyle = "#e7dfd0";
      c.fillRect(0, 0, 512, 256);
      c.strokeStyle = "#51463b";
      c.lineWidth = 4;
      c.beginPath();
      c.moveTo(150, 180);
      c.lineTo(112, 123);
      c.lineTo(177, 99);
      c.lineTo(200, 45);
      c.lineTo(266, 32);
      c.lineTo(310, 63);
      c.lineTo(366, 91);
      c.lineTo(315, 113);
      c.lineTo(302, 181);
      c.closePath();
      c.stroke();
      c.beginPath();
      c.arc(276, 66, 5, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#781b20";
      c.font = 'italic 24px "DM Sans",sans-serif';
      c.fillText("a little character study", 96, 231);
    });
    return [cork, note, ticket, swatches, sketch];
  }, []);
  useEffect(
    () => () => textures.forEach((texture) => texture.dispose()),
    [textures],
  );
  const keepsakes = [
    { x: -0.62, y: 0.43, w: 0.32, h: 0.16, angle: -0.09, texture: 1 },
    { x: 0.02, y: 0.48, w: 0.32, h: 0.14, angle: 0.04, texture: 2 },
    { x: 0.64, y: 0.43, w: 0.29, h: 0.15, angle: 0.1, texture: 3 },
    { x: -0.65, y: -0.53, w: 0.28, h: 0.14, angle: 0.05, texture: 4 },
    { x: 0.04, y: -0.53, w: 0.33, h: 0.13, angle: -0.04, texture: 3 },
    { x: 0.67, y: -0.53, w: 0.27, h: 0.13, angle: -0.08, texture: 2 },
  ];
  return (
    <group>
      <mesh position={[0, 0, 0.061]} receiveShadow>
        <planeGeometry args={[1.8, 1.22]} />
        <meshStandardMaterial map={textures[0]} roughness={1} />
      </mesh>
      {keepsakes.map((item, index) => (
        <group
          key={index}
          position={[item.x, item.y, 0.074]}
          rotation={[0, 0, item.angle]}
        >
          <Box
            size={[item.w + 0.008, item.h + 0.008, 0.004]}
            color="#c6bda9"
            radius={0.001}
            castShadow={false}
          />
          <mesh position={[0, 0, 0.003]}>
            <planeGeometry args={[item.w, item.h]} />
            <meshStandardMaterial
              map={textures[item.texture]}
              roughness={0.95}
            />
          </mesh>
          <Cylinder
            position={[0, item.h / 2 - 0.012, 0.012]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[0.008, 0.008, 0.014]}
            color={index % 2 ? "#8c7760" : "#672328"}
          />
        </group>
      ))}
    </group>
  );
}
