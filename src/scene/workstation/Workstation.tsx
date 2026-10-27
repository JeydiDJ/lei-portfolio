import Monitor from "./Monitor";
import Keyboard from "./Keyboard";
import Mouse from "./Mouse";
import ComputerTower from "./ComputerTower";
import DigitalClock from "./DigitalClock";
import Mousepad from "./Mousepad";
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
      <Mousepad />
      <Keyboard />
      <Mouse />
    </group>
  );
}
