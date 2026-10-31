import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Color,
  InstancedMesh,
  Matrix4,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";

function Panel({
  position,
  width,
  yaw = 0,
}: {
  position: [number, number, number];
  width: number;
  yaw?: number;
}) {
  const slats = useRef<InstancedMesh>(null);
  const height = 4.92;
  const count = Math.floor(width / 0.105);
  const grain = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 512;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#a38a70";
    c.fillRect(0, 0, 128, 512);
    for (let i = 0; i < 70; i++) {
      const x = (i * 47.31) % 128;
      c.strokeStyle = i % 3 ? "#58402a14" : "#ecdbc61c";
      c.lineWidth = i % 4 ? 0.5 : 1;
      c.beginPath();
      c.moveTo(x, 0);
      c.bezierCurveTo(x + 2, 170, x - 3, 350, x + 1, 512);
      c.stroke();
    }
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 2);
    texture.anisotropy = 4;
    return texture;
  }, []);
  useEffect(() => () => grain.dispose(), [grain]);
  useLayoutEffect(() => {
    if (!slats.current) return;
    const matrix = new Matrix4(),
      color = new Color();
    for (let i = 0; i < count; i++) {
      matrix.makeScale(1, 1, 0.72);
      matrix.setPosition(-width / 2 + ((i + 0.5) * width) / count, 0, 0.009);
      slats.current.setMatrixAt(i, matrix);
      slats.current.setColorAt(i, color.setScalar(0.94 + (i % 5) * 0.018));
    }
    slats.current.instanceMatrix.needsUpdate = true;
    slats.current.instanceColor!.needsUpdate = true;
    slats.current.computeBoundingSphere();
  }, [count, width]);
  return (
    <group
      position={position}
      rotation={[0, yaw, 0]}
      name="Rounded oak fluted wall panel"
    >
      <mesh receiveShadow>
        <boxGeometry args={[width, height, 0.012]} />
        <meshStandardMaterial color="#514332" roughness={0.95} />
      </mesh>
      <instancedMesh
        ref={slats}
        args={[undefined, undefined, count]}
        castShadow
        receiveShadow
      >
        {/* Half-round profiles have real depth and rounded highlights, not printed stripes. */}
        <cylinderGeometry
          args={[0.046, 0.046, height, 12, 1, false, -Math.PI / 2, Math.PI]}
        />
        <meshStandardMaterial map={grain} roughness={0.84} />
      </instancedMesh>
    </group>
  );
}

export default function FlutedPanels() {
  return (
    <group>
      <Panel position={[5.664, 2.7, 0.4]} width={4.0} yaw={-Math.PI / 2} />
    </group>
  );
}
