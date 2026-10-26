import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  Color,
  type BufferGeometry,
  type PointLight,
  type ShaderMaterial,
} from "three";
import { useEnvironmentTransition } from "./EnvironmentTransition";

/** A soft local halo and shadow-free light spill, without a full-screen bloom pass. */
export default function ScreenGlow({
  width,
  height,
  geometry,
  strength = 1,
  spill = true,
}: {
  width: number;
  height: number;
  geometry?: BufferGeometry;
  strength?: number;
  spill?: boolean;
}) {
  const material = useRef<ShaderMaterial>(null);
  const light = useRef<PointLight>(null);
  const environment = useEnvironmentTransition();
  const uniforms = useMemo(
    () => ({
      tint: { value: new Color("#d4dfff") },
      brightness: { value: 0.3 },
    }),
    [],
  );
  useFrame(() => {
    const darkness = Math.max(environment.night, environment.blinds * 0.65);
    if (material.current)
      material.current.uniforms.brightness.value =
        (0.16 + darkness * 0.34) * strength;
    if (light.current)
      light.current.intensity = (0.035 + darkness * 0.2) * strength;
  });
  return (
    <group>
      <mesh
        geometry={geometry}
        scale={geometry ? [1.15, 1.24, 1] : [1, 1, 1]}
        raycast={() => {}}
      >
        {!geometry && <planeGeometry args={[width * 1.3, height * 1.4]} />}
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
          toneMapped={false}
          vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={`varying vec2 vUv; uniform vec3 tint; uniform float brightness; void main() { vec2 edge = abs(vUv - 0.5) * 2.0; float halo = (1.0 - smoothstep(0.68, 1.0, edge.x)) * (1.0 - smoothstep(0.62, 1.0, edge.y)); gl_FragColor = vec4(tint, halo * brightness); }`}
        />
      </mesh>
      {spill && (
        <pointLight
          ref={light}
          position={[0, 0, width * 0.2]}
          color="#d4dfff"
          distance={width * 2.5}
          decay={2}
          intensity={0.1}
        />
      )}
    </group>
  );
}
