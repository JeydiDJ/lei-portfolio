import { useFrame, useThree } from "@react-three/fiber";
import { Outlines } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CanvasTexture,
  Curve,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  RepeatWrapping,
  RGBADepthPacking,
  SRGBColorSpace,
  Vector3,
} from "three";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { Box, Cylinder } from "./Objects";
import SelectionOutline from "./SelectionOutline";
import { windowLayout } from "./layout";

const chainRadius = 0.052;
const chainDrop = 1.44;
const chainLength = 2 * chainDrop + 2 * Math.PI * chainRadius;
const beadCount = Math.ceil(chainLength / 0.022);
const bandPitch = 0.36;

/** Closed bead-chain loop in the clutch wheel's Y/Z plane. */
class ChainPath extends Curve<Vector3> {
  constructor() {
    super();
  }
  override getPoint(t: number, target = new Vector3()) {
    let distance = t * chainLength;
    const arc = Math.PI * chainRadius;
    if (distance < arc) {
      const a = distance / chainRadius;
      return target.set(
        0,
        Math.sin(a) * chainRadius,
        -Math.cos(a) * chainRadius,
      );
    }
    distance -= arc;
    if (distance < chainDrop) return target.set(0, -distance, chainRadius);
    distance -= chainDrop;
    if (distance < arc) {
      const a = distance / chainRadius;
      return target.set(
        0,
        -chainDrop - Math.sin(a) * chainRadius,
        Math.cos(a) * chainRadius,
      );
    }
    return target.set(0, -chainDrop + distance - arc, -chainRadius);
  }
}

export default function RollerBlind({
  onToggle,
}: {
  down: boolean;
  onToggle: () => void;
}) {
  const front = useRef<Mesh>(null),
    rear = useRef<Mesh>(null);
  const fabricOutline = useRef<Group>(null);
  const bottomRail = useRef<Mesh>(null),
    roller = useRef<Mesh>(null);
  const beads = useRef<InstancedMesh>(null);
  const [hovered, setHovered] = useState(false);
  const progress = useRef(-1);
  const blend = useEnvironmentTransition();
  const gl = useThree((state) => state.gl);
  const top = windowLayout.centerY + windowLayout.height / 2 + 0.015;
  const fabricWidth = windowLayout.width - 0.08;
  const fullDrop = windowLayout.height + 0.02;
  const chainPath = useMemo(() => new ChainPath(), []);
  const beadMatrix = useMemo(() => new Matrix4(), []);
  const beadPoint = useMemo(() => new Vector3(), []);
  const fabrics = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "rgba(234,225,209,0.96)";
    c.fillRect(0, 0, 256, 76);
    c.fillStyle = "rgba(245,240,229,0.17)";
    c.fillRect(0, 76, 256, 52);
    for (let x = 0; x < 256; x += 4) {
      c.fillStyle = "rgba(207,196,178,0.12)";
      c.fillRect(x, 0, 1, 128);
    }
    for (let y = 0; y < 128; y += 4) {
      c.fillStyle = "rgba(255,250,240,0.08)";
      c.fillRect(0, y, 256, 1);
    }
    return [0, 1].map(() => {
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.wrapS = texture.wrapT = RepeatWrapping;
      texture.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
      return texture;
    });
  }, [gl]);
  useEffect(
    () => () => {
      fabrics.forEach((texture) => texture.dispose());
      document.body.style.cursor = "";
    },
    [fabrics],
  );

  useFrame(() => {
    if (Math.abs(progress.current - blend.blinds) < 0.00001) return;
    progress.current = blend.blinds;
    gl.shadowMap.needsUpdate = true;
    const drop = 0.055 + blend.blinds * (fullDrop - 0.055);
    for (const sheet of [front.current, rear.current])
      if (sheet) {
        sheet.scale.y = drop;
        sheet.position.y = top - drop / 2;
      }
    fabrics.forEach((texture, i) => {
      texture.repeat.y = drop / bandPitch;
      texture.offset.y = -(drop / bandPitch) + i * 0.025;
    });
    if (fabricOutline.current) {
      fabricOutline.current.scale.y = drop;
      fabricOutline.current.position.y = top - drop / 2;
    }
    if (bottomRail.current) bottomRail.current.position.y = top - drop;
    if (roller.current) {
      const radius = Math.sqrt(
        0.075 ** 2 + ((fullDrop - drop) * 0.0025) / Math.PI,
      );
      roller.current.scale.set(radius / 0.075, 1, radius / 0.075);
      roller.current.rotation.y = -blend.blinds * 15;
    }
    if (beads.current) {
      for (let i = 0; i < beadCount; i++) {
        chainPath.getPoint((i / beadCount + blend.blinds * 0.4) % 1, beadPoint);
        beadMatrix.makeTranslation(beadPoint.x, beadPoint.y, beadPoint.z);
        beads.current.setMatrixAt(i, beadMatrix);
      }
      beads.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group
      userData={{ dynamic: true }}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      {[rear, front].map((ref, i) => (
        <mesh
          key={i}
          ref={ref}
          position={[0, top - 0.0275, i === 0 ? -3.13 : -3.09]}
          scale={[1, 0.055, 1]}
          castShadow
          renderOrder={i === 0 ? 1 : 2}
        >
          <planeGeometry args={[fabricWidth, 1]} />
          <meshStandardMaterial
            map={fabrics[i]}
            transparent
            alphaTest={0.02}
            depthWrite={false}
            side={2}
            roughness={1}
          />
          <meshDepthMaterial
            attach="customDepthMaterial"
            depthPacking={RGBADepthPacking}
            map={fabrics[i]}
            alphaTest={0.65}
            side={2}
          />
        </mesh>
      ))}
      <group
        ref={fabricOutline}
        position={[0, top - 0.0275, -3.11]}
        scale={[1, 0.055, 1]}
      >
        {hovered && (
          <lineLoop raycast={() => {}} renderOrder={3}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    -fabricWidth / 2,
                    -0.5,
                    0.026,
                    fabricWidth / 2,
                    -0.5,
                    0.026,
                    fabricWidth / 2,
                    0.5,
                    0.026,
                    -fabricWidth / 2,
                    0.5,
                    0.026,
                  ]),
                  3,
                ]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ffd6e7" toneMapped={false} />
          </lineLoop>
        )}
      </group>
      <mesh ref={bottomRail} position={[0, top - 0.055, -3.11]} castShadow>
        <boxGeometry args={[fabricWidth + 0.025, 0.045, 0.07]} />
        <meshStandardMaterial color="#c5bcae" roughness={0.8} />
        {hovered && (
          <Outlines
            color="#ffd6e7"
            thickness={2}
            screenspace={false}
            toneMapped={false}
          />
        )}
      </mesh>
      <group position={[0, top + 0.06, -3.12]} rotation={[0, 0, Math.PI / 2]}>
        <mesh ref={roller} castShadow>
          <cylinderGeometry args={[0.075, 0.075, fabricWidth, 32]} />
          <meshStandardMaterial color="#e8dfce" roughness={0.95} />
          {hovered && (
            <Outlines
              color="#ffd6e7"
              thickness={2}
              screenspace={false}
              toneMapped={false}
            />
          )}
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <Box
          key={side}
          position={[
            side * (windowLayout.width / 2 + 0.015),
            top + 0.06,
            -3.17,
          ]}
          size={[0.08, 0.2, 0.22]}
          color="#d5d0c5"
          radius={0.012}
        />
      ))}
      <Cylinder
        position={[windowLayout.width / 2 + 0.015, top + 0.06, -3.12]}
        rotation={[0, 0, Math.PI / 2]}
        args={[0.065, 0.065, 0.11]}
        color="#c2b8a8"
      />
      <group position={[windowLayout.width / 2 + 0.07, top + 0.06, -3.12]}>
        <mesh>
          <tubeGeometry args={[chainPath, 112, 0.0028, 5, true]} />
          <meshStandardMaterial color="#a99d8c" roughness={0.8} />
        </mesh>
        <instancedMesh
          ref={beads}
          args={[undefined, undefined, beadCount]}
          frustumCulled={false}
        >
          <sphereGeometry args={[0.0065, 8, 6]} />
          <meshStandardMaterial color="#e2d8c7" roughness={0.7} />
        </instancedMesh>
        <group position={[0, -chainDrop, 0]}>
          <Box
            position={[0, 0, -0.15]}
            size={[0.045, 0.12, 0.18]}
            color="#c9c1b4"
            radius={0.008}
          />
          <Box size={[0.035, 0.135, 0.14]} color="#d8cebd" radius={0.012} />
          <SelectionOutline size={[0.035, 0.135, 0.14]} visible={hovered} />
        </group>
      </group>
    </group>
  );
}
