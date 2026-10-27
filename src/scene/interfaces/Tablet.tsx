import { useState } from "react";
import type { Section } from "../../data/portfolio";
import ScreenGlow from "../ScreenGlow";
import GlassPane from "../GlassPane";
import { tabletLayout as device } from "../layout";
import TabletHardware from "./TabletHardware";
import useTabletScreen from "./useTabletScreen";

export default function Tablet({
  active,
  onOpen,
  onClose,
  onContact,
  onNavigate,
}: {
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
  onContact: () => void;
  onNavigate: (section: Section) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const surface = useTabletScreen(active, onClose, onContact, onNavigate);
  return (
    <group
      position={device.position}
      rotation={[0, device.yaw, 0]}
      userData={{ dynamic: true }}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) onOpen();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        if (!active) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <TabletHardware hovered={hovered} active={active}>
        <mesh
          position={[0, device.screenY, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          {...surface.events}
        >
          <planeGeometry args={[device.screenWidth, device.screenHeight]} />
          <meshBasicMaterial map={surface.texture} toneMapped={false} />
        </mesh>
        <group
          position={[0, device.screenY - 0.0007, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ScreenGlow
            width={device.screenWidth}
            height={device.screenHeight}
            strength={0.45}
          />
        </group>
        <group
          position={[0, device.screenY + 0.0007, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <GlassPane
            width={device.screenWidth}
            height={device.screenHeight}
            strength={active ? 0.16 : 0.32}
          />
        </group>
      </TabletHardware>
    </group>
  );
}
