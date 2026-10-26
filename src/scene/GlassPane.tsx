import { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { DoubleSide, type BufferGeometry } from "three";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { lightingLevels } from "./lightingLevels";

/** Lightweight, view-dependent glazing; no extra scene renders or refraction buffers. */
export default function GlassPane({
  width,
  height,
  geometry,
  strength = 1,
}: {
  width: number;
  height: number;
  geometry?: BufferGeometry;
  strength?: number;
}) {
  const environment = useEnvironmentTransition();
  const uniforms = useMemo(
    () => ({
      strength: { value: strength },
      daylight: { value: 1 },
      ceilingLight: { value: 0.5 },
    }),
    [],
  );
  useFrame(() => {
    uniforms.strength.value = strength;
    uniforms.daylight.value =
      (1 - environment.night) * (1 - environment.blinds * 0.72);
    uniforms.ceilingLight.value = lightingLevels(
      environment.night,
      environment.blinds,
      environment.roomLight,
    ).indoor;
  });
  return (
    <mesh geometry={geometry} raycast={() => {}}>
      {!geometry && <planeGeometry args={[width, height]} />}
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
        vertexShader={`
          varying vec3 worldPoint;
          varying vec3 worldNormal;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            worldPoint = world.xyz;
            worldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * viewMatrix * world;
          }
        `}
        fragmentShader={`
          varying vec3 worldPoint;
          varying vec3 worldNormal;
          uniform float strength;
          uniform float daylight;
          uniform float ceilingLight;
          float softBox(vec2 p, vec2 size, float feather) {
            vec2 edge = abs(p) - size;
            return 1.0 - smoothstep(-feather, feather, max(edge.x, edge.y));
          }
          void main() {
            vec3 viewDirection = normalize(cameraPosition - worldPoint);
            vec3 normal = normalize(worldNormal) * (gl_FrontFacing ? 1.0 : -1.0);
            vec3 reflected = reflect(-viewDirection, normal);
            float fresnel = pow(1.0 - max(dot(normal, viewDirection), 0.0), 3.0);
            // Reflections of the actual ceiling fixture and studio window footprints.
            float ceiling = 0.0;
            if (reflected.y > 0.001) {
              float distanceToCeiling = (5.0 - worldPoint.y) / reflected.y;
              vec3 hit = worldPoint + reflected * distanceToCeiling;
              if (distanceToCeiling > 0.0)
                ceiling = softBox(hit.xz - vec2(-0.1, -2.2), vec2(0.58, 0.18), 0.065);
            }
            float windowReflection = 0.0;
            if (reflected.z < -0.001) {
              float distanceToWindow = (-3.34 - worldPoint.z) / reflected.z;
              vec3 hit = worldPoint + reflected * distanceToWindow;
              if (distanceToWindow > 0.0)
                windowReflection = softBox(hit.xy - vec2(0.0, 3.05), vec2(1.94, 1.20), 0.12);
            }
            // Broad soft highlights shift with the reflected view, rather than painted-on stripes.
            float sweep = dot(reflected, normalize(vec3(0.65, 0.9, 0.25)));
            float streak = exp(-pow((sweep + 0.18) / 0.045, 2.0)) * 0.16;
            streak += exp(-pow((sweep + 0.065) / 0.020, 2.0)) * 0.075;
            float fixture = ceiling * ceilingLight;
            float alpha = strength * (0.025 + fresnel * 0.25 + streak + fixture * 0.43 + windowReflection * daylight * 0.065);
            vec3 tint = mix(vec3(0.79, 0.87, 0.93), vec3(1.0, 0.91, 0.79), fixture * 0.75);
            gl_FragColor = vec4(tint, min(alpha, 0.48));
          }
        `}
      />
    </mesh>
  );
}
