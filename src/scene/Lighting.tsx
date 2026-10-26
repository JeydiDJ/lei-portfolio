import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  AmbientLight,
  Color,
  DirectionalLight,
  HemisphereLight,
  Object3D,
  PointLight,
  SpotLight,
} from "three";
import { roomLayout } from "./layout";
import { useEnvironmentTransition } from "./EnvironmentTransition";
import { lightingLevels } from "./lightingLevels";

const dayAmbient = new Color("#eef5ff"),
  nightAmbient = new Color("#ffe5c7");
const daySky = new Color("#dcecff"),
  nightSky = new Color("#f4dfc6");
const dayWindow = new Color("#d6eaff"),
  nightWindow = new Color("#8da5de");
const dayFog = new Color("#b7cadc"),
  nightFog = new Color("#17233b");
const dayBackground = new Color("#68606a"),
  nightBackground = new Color("#25232e");
const warmSun = new Color("#f2b280"),
  noonSun = new Color("#fff1d6");
const twilightFog = new Color("#bb9094");

export default function Lighting() {
  const { gl, size, scene } = useThree();
  const blend = useEnvironmentTransition();
  const ambient = useRef<AmbientLight>(null),
    hemisphere = useRef<HemisphereLight>(null);
  const ceiling = useRef<SpotLight>(null),
    secondary = useRef<SpotLight>(null),
    sun = useRef<DirectionalLight>(null),
    windowFill = useRef<PointLight>(null);
  const ceilingTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(0, 0, -1.3);
    return target;
  }, []);
  const sunTarget = useMemo(() => {
    const target = new Object3D();
    target.position.set(1, 0.5, 0.5);
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
      sun.current.intensity = levels.sun;
      sun.current.color.lerpColors(noonSun, warmSun, blend.twilight);
    }
    if (windowFill.current) {
      windowFill.current.intensity = levels.window;
      windowFill.current.color.lerpColors(dayWindow, nightWindow, n);
    }
    if (scene.fog)
      scene.fog.color
        .lerpColors(dayFog, nightFog, n)
        .lerp(twilightFog, blend.twilight * 0.4);
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
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-camera-near={0.5}
        shadow-camera-far={45}
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
    </group>
  );
}
