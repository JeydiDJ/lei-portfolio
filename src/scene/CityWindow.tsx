import { useMemo } from "react";
import { BackSide, Color, Path, Shape } from "three";
import { useFrame } from "@react-three/fiber";
import { useEnvironmentTransition } from "./EnvironmentTransition";
const dayTop = new Color().setRGB(0.3, 0.55, 0.8),
  nightTop = new Color().setRGB(0.015, 0.025, 0.065);
const dayBottom = new Color().setRGB(0.72, 0.83, 0.91),
  nightBottom = new Color().setRGB(0.1, 0.12, 0.22);
const twilightTop = new Color("#9b83ab"),
  twilightBottom = new Color("#edab83");
import { Box } from "./Objects";
import CityBuildings from "./CityBuildings";
import { windowLayout } from "./layout";
import RollerBlind from "./RollerBlind";
import GlassPane from "./GlassPane";

export default function CityWindow({
  night,
  blindsDown,
  onToggleBlinds,
}: {
  night: number;
  blindsDown: boolean;
  onToggleBlinds: () => void;
}) {
  const { width, height, frame, centerY } = windowLayout;
  const blend = useEnvironmentTransition();
  const skyUniforms = useMemo(
    () => ({ top: { value: new Color() }, bottom: { value: new Color() } }),
    [],
  );
  useFrame(() => {
    skyUniforms.top.value.lerpColors(dayTop, nightTop, blend.night);
    skyUniforms.bottom.value.lerpColors(dayBottom, nightBottom, blend.night);
    skyUniforms.top.value.lerp(twilightTop, blend.twilight * 0.55);
    skyUniforms.bottom.value.lerp(twilightBottom, blend.twilight * 0.85);
  });
  const trim = useMemo(() => {
    // Offset the reveal from the wall opening so their side faces cannot z-fight.
    const reveal = frame + 0.025;
    const shape = new Shape();
    shape.moveTo(-width / 2, -height / 2);
    shape.lineTo(width / 2, -height / 2);
    shape.lineTo(width / 2, height / 2);
    shape.lineTo(-width / 2, height / 2);
    shape.closePath();
    const hole = new Path();
    hole.moveTo(-width / 2 + reveal, -height / 2 + reveal);
    hole.lineTo(-width / 2 + reveal, height / 2 - reveal);
    hole.lineTo(width / 2 - reveal, height / 2 - reveal);
    hole.lineTo(width / 2 - reveal, -height / 2 + reveal);
    hole.closePath();
    shape.holes.push(hole);
    return shape;
  }, [width, height, frame]);
  return (
    <group>
      {/* A world-space sky encloses real buildings; only the sky has no parallax. */}
      <mesh renderOrder={-10}>
        <sphereGeometry args={[74, 32, 16]} />
        <shaderMaterial
          side={BackSide}
          depthWrite={false}
          uniforms={skyUniforms}
          vertexShader={`varying vec3 vDirection; void main(){vec4 world = modelMatrix * vec4(position,1.0); vDirection = world.xyz-cameraPosition; gl_Position = projectionMatrix * viewMatrix * world;}`}
          fragmentShader={`uniform vec3 top; uniform vec3 bottom; varying vec3 vDirection; void main(){float h = smoothstep(-.12,.6,normalize(vDirection).y); gl_FragColor = vec4(mix(bottom,top,h),1.0);\n #include <tonemapping_fragment>\n #include <colorspace_fragment>\n }`}
        />
      </mesh>
      <CityBuildings night={night} />
      {/* A single ring eliminates coplanar overlaps at the frame corners. */}
      <group position={[0, centerY, -3.6]}>
        {[-1, 1].map((side) => {
          const paneWidth = (width - 2 * (frame + 0.025) - 0.045) / 2;
          return (
            <group
              key={side}
              position={[side * (paneWidth / 2 + 0.0225), 0, 0.2]}
            >
              <GlassPane
                width={paneWidth}
                height={height - 2 * (frame + 0.025)}
                strength={0.95}
              />
            </group>
          );
        })}
        <mesh castShadow>
          <extrudeGeometry
            args={[trim, { depth: 0.28, bevelEnabled: false }]}
          />
          <meshStandardMaterial color="#25252b" roughness={0.9} />
        </mesh>
        <Box
          position={[0, 0, 0.18]}
          size={[0.045, height - frame * 2, 0.14]}
          color="#181820"
          radius={0.008}
        />
        <mesh position={[0, -height / 2 - 0.055, 0.4]} castShadow>
          <boxGeometry args={[width, 0.1, 0.5]} />
          <meshStandardMaterial color="#55515a" roughness={0.85} />
        </mesh>
      </group>
      <RollerBlind down={blindsDown} onToggle={onToggleBlinds} />
    </group>
  );
}
