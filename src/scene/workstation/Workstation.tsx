import Monitor from "./Monitor";
import Keyboard from "./Keyboard";
import Mouse from "./Mouse";
import ComputerTower from "./ComputerTower";
import DigitalClock from "./DigitalClock";
import { Box } from "../Objects";
import type { Section } from "../../data/portfolio";

export default function Workstation({
  onOpen,
  onClose,
  active,
  onNavigate,
}: {
  onOpen: () => void;
  onClose: () => void;
  active: boolean;
  onNavigate: (section: Section) => void;
}) {
  return (
    <group>
      <Monitor
        onOpen={onOpen}
        onClose={onClose}
        active={active}
        onNavigate={onNavigate}
      />
      <DigitalClock />
      <ComputerTower />
      <Box
        position={[-0.15, 1.454, -0.28]}
        size={[1.85, 0.006, 0.72]}
        color="#ecc0ce"
        radius={0.025}
        castShadow={false}
      />
      <Keyboard />
      <Mouse />
    </group>
  );
}
