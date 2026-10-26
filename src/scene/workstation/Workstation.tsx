import Monitor from "./Monitor";
import Keyboard from "./Keyboard";
import Mouse from "./Mouse";
import ComputerTower from "./ComputerTower";
import DigitalClock from "./DigitalClock";
import { Box } from "../Objects";

export default function Workstation({
  onOpen,
  onClose,
  active,
}: {
  onOpen: () => void;
  onClose: () => void;
  active: boolean;
}) {
  return (
    <group>
      <Monitor onOpen={onOpen} onClose={onClose} active={active} />
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
