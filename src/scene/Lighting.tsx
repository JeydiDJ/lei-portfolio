import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  Fog,
  HemisphereLight,
  Object3D,
  PointLight,
  SpotLight,
  Vector3,
} from "three";
import { roomLayout } from "./layout";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { lightingLevels } from "./lightingLevels";
import { useSeasonalFeatures } from "../seasonal/SeasonalFeatures";

const dayAmbient = new Color("#eef5ff"),
  nightAmbient = new Color("#ffe5c7");
const daySky = new Color("#dcecff"),
  nightSky = new Color("#f4dfc6");
const dayWindow = new Color("#d6eaff"),
  nightWindow = new Color("#8da5de");
const dayFog = new Color("#b7cadc"),
  nightFog = new Color("#080e1b");
const dayBackground = new Color("#68606a"),
  nightBackground = new Color("#25232e");
const warmSun = new Color("#f2b280"),
  noonSun = new Color("#fff1d6");
const twilightFog = new Color("#bb9094");

export default function Lighting() {
  const { gl, size, scene } = useThree();
  const blend = useEnvironmentTransition();
  const seasonal = useSeasonalFeatures();
  const sunPosition = useMemo(() => new Vector3(), []);
  const ambient = useRef<AmbientLight>(null),
    hemisphere = useRef<HemisphereLight>(null);
  const ceiling = useRef<SpotLight>(null),
    secondary = useRef<SpotLight>(null),
    sun = useRef<DirectionalLight>(null),
    moonlight = useRef<DirectionalLight>(null),
    windowFill = useRef<PointLight>(null);
  const ceilingTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(0, 0, -1.3);
    return target;
  }, []);
  const sunTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(0, 0.5, -4);
    return target;
  }, []);
  const secondaryTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(0.4, 0, 4.4);
    return target;
  }, []);
  const shadowSize = size.width < 760 ? 1024 : 2048;
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    return () => {
      gl.shadowMap.autoUpdate = true;
    };
  }, [gl, shadowSize]);
  useFrame(() => {
    const n = blend.night,
      b = blend.blinds,
      levels = lightingLevels(n, b, blend.roomLight);
    for (const key of [
      "ambient",
      "hemisphere",
      "ceiling",
      "secondary",
      "sun",
      "window",
    ] as const)
      levels[key] *= seasonal.lightMultiplier;
    gl.toneMappingExposure = 1 - 0.1 * n;
    if (ambient.current) {
      // Approximate warm light bouncing off the white room, not outdoor sky fill.
      ambient.current.intensity = levels.ambient;
      ambient.current.color.lerpColors(dayAmbient, nightAmbient, n);
    }
    if (hemisphere.current) {
      hemisphere.current.intensity = levels.hemisphere;
      hemisphere.current.color.lerpColors(daySky, nightSky, n);
    }
    if (ceiling.current) ceiling.current.intensity = levels.ceiling;
    if (secondary.current) secondary.current.intensity = levels.secondary;
    if (sun.current) {
      const aboveHorizon = Math.max(
        0,
        Math.min(1, blend.sunDirection.y / 0.14),
      );
      sun.current.intensity = levels.sun * aboveHorizon;
      sun.current.color.lerpColors(noonSun, warmSun, blend.twilight);
      sunPosition
        .copy(blend.sunDirection)
        .multiplyScalar(55)
        .add(sunTarget.position);
      // Keep the visible sun and actual shadow direction in agreement. Update
      // the cached shadow only when the slow dusk/dawn movement requires it.
      sun.current.position.copy(sunPosition);
      if (
        aboveHorizon > 0 &&
        sun.current.shadow.camera.position.distanceToSquared(sunPosition) >
          0.0004
      ) {
        gl.shadowMap.needsUpdate = true;
      }
    }
    if (windowFill.current) {
      windowFill.current.intensity =
        levels.window * (0.3 + 0.7 * Math.max(0, -blend.sunDirection.z));
      windowFill.current.color.lerpColors(dayWindow, nightWindow, n);
    }
    if (moonlight.current) {
      moonlight.current.position
        .copy(blend.moonDirection)
        .multiplyScalar(55)
        .add(sunTarget.position);
      moonlight.current.intensity =
        0.07 *
        n *
        blend.moonIllumination *
        Math.max(0, Math.min(1, blend.moonDirection.y / 0.12)) *
        (1 - 0.75 * b) *
        seasonal.lightMultiplier;
    }
    if (scene.fog)
      scene.fog.color
        .lerpColors(dayFog, nightFog, n)
        .lerp(twilightFog, blend.twilight * 0.4);
    if (scene.fog instanceof Fog) {
      scene.fog.near = 18 + n * 10;
      scene.fog.far = 75 + n * 20;
    }
    if (scene.background instanceof Color)
      scene.background.lerpColors(dayBackground, nightBackground, n);
    // Fixed shadow-caster counts avoid shader recompilation during the crossfade.
  });
  return (
    <group>
      <primitive object={ceilingTarget} />
      <primitive object={sunTarget} />
      <primitive object={secondaryTarget} />
      <spotLight
        ref={secondary}
        position={roomLayout.secondaryCeilingLight}
        target={secondaryTarget}
        color="#ffe5bf"
        intensity={0}
        angle={1.15}
        penumbra={0.75}
        distance={10}
        decay={2}
      />
      <ambientLight ref={ambient} intensity={0} />
      <hemisphereLight ref={hemisphere} args={["#dcecff", "#8a735b", 0]} />
      <spotLight
        castShadow
        ref={ceiling}
        position={roomLayout.ceilingLight}
        target={ceilingTarget}
        color="#ffe5bf"
        intensity={0}
        angle={1.15}
        penumbra={0.65}
        decay={2}
        distance={13}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-near={0.2}
        shadow-camera-far={15}
        shadow-normalBias={0.025}
        shadow-bias={-0.0001}
      />
      <directionalLight
        castShadow
        ref={sun}
        position={[-6, 10, -14]}
        target={sunTarget}
        color="#fff1d6"
        intensity={0}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-camera-left={-13}
        shadow-camera-right={13}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={0.5}
        shadow-camera-far={100}
        shadow-normalBias={0.025}
        shadow-bias={-0.0001}
      />
      <pointLight
        ref={windowFill}
        position={[0, 3.05, -3.12]}
        intensity={0}
        distance={7}
        decay={2}
      />
      <directionalLight
        ref={moonlight}
        target={sunTarget}
        color="#a6bce4"
        intensity={0}
      />
    </group>
  );
}
