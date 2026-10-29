import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { useFrame } from "@react-three/fiber";
import { MathUtils, Vector3 } from "three";
import { lunarSky, type LunarSky } from "./lunarSky";

type EnvironmentState = {
  night: number;
  blinds: number;
  twilight: number;
  roomLight: number;
  sunDirection: Vector3;
  moonDirection: Vector3;
  moonIllumination: number;
};
const EnvironmentContext = createContext<EnvironmentState | null>(null);

export function EnvironmentTransition({
  night,
  twilight,
  sunDirection,
  moon = lunarSky(),
  roomLight,
  blindsDown,
  children,
}: {
  night: number;
  twilight: number;
  sunDirection: [number, number, number];
  moon?: LunarSky;
  roomLight: number;
  blindsDown: boolean;
  children: ReactNode;
}) {
  const values = useRef<EnvironmentState>({
    night: Number(night),
    twilight,
    roomLight,
    blinds: Number(blindsDown),
    sunDirection: new Vector3(...sunDirection),
    moonDirection: new Vector3(...moon.direction),
    moonIllumination: moon.illumination,
  });
  const reducedMotion = useRef(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotion.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  // Update before controls and consumers; every light and material sees the same blend.
  useFrame((_, delta) => {
    const approach = (value: number, target: number, rate: number) => {
      const next = reducedMotion.current
        ? target
        : MathUtils.damp(value, target, rate, delta);
      return Math.abs(next - target) < 0.0001 ? target : next;
    };
    values.current.night = approach(values.current.night, Number(night), 2.4);
    values.current.twilight = approach(values.current.twilight, twilight, 2.4);
    values.current.roomLight = approach(values.current.roomLight, roomLight, 5);
    values.current.blinds = approach(
      values.current.blinds,
      Number(blindsDown),
      4.5,
    );
    const direction = values.current.sunDirection;
    direction
      .set(
        approach(direction.x, sunDirection[0], 2.4),
        approach(direction.y, sunDirection[1], 2.4),
        approach(direction.z, sunDirection[2], 2.4),
      )
      .normalize();
    const lunar = values.current.moonDirection;
    lunar
      .set(
        approach(lunar.x, moon.direction[0], 2.4),
        approach(lunar.y, moon.direction[1], 2.4),
        approach(lunar.z, moon.direction[2], 2.4),
      )
      .normalize();
    values.current.moonIllumination = approach(
      values.current.moonIllumination,
      moon.illumination,
      2.4,
    );
  }, -2);
  return (
    <EnvironmentContext.Provider value={values.current}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironmentTransition() {
  const value = useContext(EnvironmentContext);
  if (!value)
    throw new Error("Environment components need EnvironmentTransition.");
  return value;
}
