import { useMemo } from "react";
import { Path, Shape } from "three";
import OutdoorAtmosphere from "./OutdoorAtmosphere";
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
      <OutdoorAtmosphere />
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
