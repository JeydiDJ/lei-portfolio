import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  CanvasTexture,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
  type Sprite,
  type SpriteMaterial,
} from "three";

/** Audio-reactive accents: three expanding wave rings and five drifting music notes. */
export default function SpeakerEffects({
  playing,
  volume,
  getEnergy,
}: {
  playing: boolean;
  volume: number;
  getEnergy: () => number;
}) {
  const root = useRef<Group>(null);
  const rings = useRef<(Mesh | null)[]>([]);
  const notes = useRef<(Sprite | null)[]>([]);
  const fade = useRef(0);
  const elapsed = useRef(0);
  const energy = useRef(0);
  const reducedMotion = useRef(false);
  const noteTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 160;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#d997b1";
    c.shadowColor = "#4c223988";
    c.shadowBlur = 3;
    c.shadowOffsetY = 1;
    for (const [x, y] of [
      [30, 124],
      [91, 105],
    ]) {
      c.beginPath();
      c.ellipse(x, y, 19, 12, -0.3, 0, Math.PI * 2);
      c.fill();
    }
    c.fillRect(42, 35, 8, 87);
    c.fillRect(103, 17, 8, 86);
    c.beginPath();
    c.moveTo(42, 35);
    c.lineTo(111, 17);
    c.lineTo(111, 39);
    c.lineTo(42, 57);
    c.closePath();
    c.fill();
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return texture;
  }, []);
  useEffect(() => () => noteTexture.dispose(), [noteTexture]);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotion.current = query.matches;
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  useFrame((_, delta) => {
    if (!root.current) return;
    const audible = playing && volume > 0;
    fade.current = MathUtils.damp(fade.current, audible ? 1 : 0, 6, delta);
    root.current.visible = fade.current > 0.002 && !document.hidden;
    if (!root.current.visible) return;
    elapsed.current += Math.min(delta, 0.1);
    energy.current = MathUtils.damp(
      energy.current,
      audible ? getEnergy() : 0,
      10,
      delta,
    );
    const intensity = fade.current * (0.65 + energy.current * 0.35);
    rings.current.forEach((ring, i) => {
      if (!ring) return;
      const phase = reducedMotion.current
        ? 0.12 + i * 0.18
        : (elapsed.current * 0.55 + i / 3) % 1;
      ring.scale.setScalar(1 + phase * 1.35 + energy.current * 0.06);
      ring.position.set(0, -0.16, 0.205 + phase * 0.16);
      (ring.material as MeshBasicMaterial).opacity =
        intensity * (1 - phase) ** 2 * 0.38;
    });
    notes.current.forEach((note, i) => {
      if (!note) return;
      const phase = reducedMotion.current
        ? 0.3
        : (elapsed.current * 0.19 + i * 0.21) % 1;
      const direction = i % 2 ? 1 : -1;
      note.position.set(
        direction * (0.25 + phase * 0.12) +
          (reducedMotion.current
            ? 0
            : Math.sin(elapsed.current * 1.1 + i) * 0.035),
        0.04 + phase * 0.9,
        0.2 + Math.sin(i * 2) * 0.05,
      );
      const size = 0.1 + Math.sin(i * 1.7) * 0.012;
      note.scale.set(size, size * 1.25, 1);
      const material = note.material as SpriteMaterial;
      material.rotation = reducedMotion.current
        ? 0
        : Math.sin(elapsed.current * 0.8 + i) * 0.16;
      material.opacity = reducedMotion.current
        ? i < 2
          ? fade.current * 0.4
          : 0
        : Math.sin(Math.PI * phase) ** 1.4 * intensity * 0.9;
    });
  });
  return (
    <group ref={root} visible={false} userData={{ dynamic: true }}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(node) => {
            rings.current[i] = node;
          }}
          raycast={() => {}}
        >
          <torusGeometry args={[0.136, 0.0028, 4, 40]} />
          <meshBasicMaterial
            color="#e2b1c5"
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <sprite
          key={i}
          ref={(node) => {
            notes.current[i] = node;
          }}
          raycast={() => {}}
        >
          <spriteMaterial
            map={noteTexture}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      ))}
    </group>
  );
}
