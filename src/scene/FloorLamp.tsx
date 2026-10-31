import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  CylinderGeometry,
  DoubleSide,
  MeshStandardMaterial,
  Object3D,
  SpotLight,
} from "three";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { useSeasonalFeatures } from "../seasonal/SeasonalFeatures";
import { roomLightPower } from "./lightingLevels";
import Cable from "./workstation/Cable";

// Approximate diffuse transmission through linen: brightest near the bulb,
// softer at the rims. This is a raster lighting model, not path tracing.
const linenTransmission: MeshStandardMaterial["onBeforeCompile"] = (shader) => {
  shader.vertexShader = "varying vec3 vShadePoint;\n" + shader.vertexShader;
  shader.vertexShader = shader.vertexShader.replace(
    "#include <begin_vertex>",
    "#include <begin_vertex>\nvShadePoint = position;",
  );
  shader.fragmentShader = "varying vec3 vShadePoint;\n" + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <emissivemap_fragment>",
    `
    #include <emissivemap_fragment>
    vec3 toBulb = vec3(0.0, -0.07, 0.0) - vShadePoint;
    vec3 inward = normalize(vec3(-vShadePoint.x, 0.0, -vShadePoint.z));
    float incidence = max(0.0, dot(inward, normalize(toBulb)));
    totalEmissiveRadiance *= incidence * 0.17 / max(dot(toBulb, toBulb), 0.08);
  `,
  );
};

/** A warm linen-shade floor lamp, controlled by the room's existing dimmer. */
export default function FloorLamp() {
  const environment = useEnvironmentTransition();
  const seasonal = useSeasonalFeatures();
  const gl = useThree((state) => state.gl);
  const downlight = useRef<SpotLight>(null);
  const uplight = useRef<SpotLight>(null);
  const targets = useMemo(() => {
    const down = new Object3D(),
      up = new Object3D();
    down.position.set(0, 0, 0);
    up.position.set(0, 5.2, 0);
    return { down, up };
  }, []);
  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
  }, [gl]);
  const shadeMaterial = useRef<MeshStandardMaterial>(null);
  const bulbMaterial = useRef<MeshStandardMaterial>(null);
  const shade = useMemo(() => {
    const geometry = new CylinderGeometry(0.32, 0.44, 0.68, 96, 1, true);
    const positions = geometry.getAttribute("position");
    // Shallow pleats give the fabric a tactile edge without dense geometry.
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i),
        z = positions.getZ(i);
      const factor = 1 + 0.009 * Math.cos(Math.atan2(x, z) * 48);
      positions.setX(i, x * factor);
      positions.setZ(i, z * factor);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(() => () => shade.dispose(), [shade]);
  useFrame(() => {
    const power =
      roomLightPower(environment.roomLight) * seasonal.lightMultiplier;
    if (downlight.current) downlight.current.intensity = 16 * power;
    if (uplight.current) uplight.current.intensity = 7 * power;
    if (shadeMaterial.current)
      shadeMaterial.current.emissiveIntensity = 0.38 * power;
    if (bulbMaterial.current)
      bulbMaterial.current.emissiveIntensity = 2.2 * power;
  });
  return (
    <group
      position={[5.15, 0.015, -2.9]}
      name="Tall linen floor lamp"
      userData={{ dynamic: true }}
    >
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.29, 0.32, 0.08, 40]} />
        <meshStandardMaterial
          color="#3c3030"
          metalness={0.35}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.087, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.27, 0.015, 40]} />
        <meshStandardMaterial color="#8e7860" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.38, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.022, 2.59, 16]} />
        <meshStandardMaterial
          color="#74604b"
          metalness={0.7}
          roughness={0.38}
        />
      </mesh>
      <mesh position={[0, 2.57, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.12, 16]} />
        <meshStandardMaterial color="#4a3b32" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.7, 0]} scale={[1, 1.35, 1]}>
        <sphereGeometry args={[0.065, 16, 12]} />
        <meshStandardMaterial
          ref={bulbMaterial}
          color="#eee1c6"
          emissive="#ffcf91"
          emissiveIntensity={0}
          roughness={0.65}
        />
      </mesh>
      <mesh position={[0, 2.8, 0]} geometry={shade} castShadow receiveShadow>
        <meshStandardMaterial
          ref={shadeMaterial}
          color="#e1d5c2"
          emissive="#ffc887"
          emissiveIntensity={0}
          roughness={0.98}
          side={DoubleSide}
          onBeforeCompile={linenTransmission}
        />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, 2.8 + side * 0.34, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[side === 1 ? 0.32 : 0.44, 0.009, 6, 64]} />
          <meshStandardMaterial color="#c6b69e" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 3.155, 0]}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshStandardMaterial color="#8e7860" metalness={0.6} roughness={0.4} />
      </mesh>
      <Cable
        points={[
          [0.06, 0.02, -0.15],
          [0.15, 0.014, -0.35],
          [0.1, 0.012, -0.4],
          [-0.4, 0.012, -0.42],
          [-1.1, 0.012, -0.42],
          [-1.35, 0.43, -0.44],
        ]}
        radius={0.006}
        color="#36302b"
      />
      <primitive object={targets.down} />
      <primitive object={targets.up} />
      {/* Cones originate at the bulb and match the radius/distance of each rim.
          Only the downlight needs a shadow map for furniture and the lamp base. */}
      <spotLight
        ref={downlight}
        target={targets.down}
        position={[0, 2.73, 0]}
        color="#ffd49a"
        intensity={0}
        angle={Math.atan2(0.44, 2.73 - 2.46)}
        penumbra={0.25}
        distance={6}
        decay={2}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.08}
        shadow-camera-far={6}
        shadow-bias={-0.00015}
        shadow-normalBias={0.012}
        shadow-radius={2}
      />
      <spotLight
        ref={uplight}
        target={targets.up}
        position={[0, 2.73, 0]}
        color="#ffdbac"
        intensity={0}
        angle={Math.atan2(0.32, 3.14 - 2.73)}
        penumbra={0.3}
        distance={4}
        decay={2}
      />
    </group>
  );
}
