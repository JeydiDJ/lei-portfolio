import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { SRGBColorSpace } from "three";
import { Box } from "./Objects";
import GlassPane from "./GlassPane";

/** Preserve the original portrait ratio inside a narrow, matted wall frame. */
export default function FramedPhoto() {
  const texture = useTexture("/images/leila-parungo.png");
  const gl = useThree((state) => state.gl);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
  const width = 1.04;
  const height = width * (texture.image.height / texture.image.width);

  return (
    <group position={[-3.65, 3.6, -3.26]}>
      <Box
        size={[width + 0.19, height + 0.19, 0.075]}
        color="#79636c"
        radius={0.012}
      />
      <Box
        position={[0, 0, 0.041]}
        size={[width + 0.12, height + 0.12, 0.015]}
        color="#e9e2dc"
        radius={0.002}
      />
      <mesh position={[0, 0, 0.052]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <group position={[0, 0, 0.055]}>
        <GlassPane width={width} height={height} strength={0.45} />
      </group>
    </group>
  );
}
