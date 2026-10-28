import { useState } from "react";
import type { Section } from "../../data/portfolio";
import type { AdFormat } from "../../data/ads";
import { adFrameLayouts } from "../layout";
import { Box } from "../Objects";
import SelectionOutline from "../SelectionOutline";
import WallArtSpotlight from "../WallArtSpotlight";
import useAdFrameSurface from "./useAdFrameSurface";

export default function AdFrame({
  format,
  active,
  onSelect,
  onClose,
}: {
  format: AdFormat;
  active: boolean;
  onSelect: (section: Section) => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const portrait = format === "portrait";
  const layout = adFrameLayouts[format];
  const surface = useAdFrameSurface(format, active, onSelect, onClose);
  return (
    <group
      position={layout.position}
      rotation={[0, Math.PI / 2, 0]}
      userData={{ dynamic: true }}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) onSelect(portrait ? "ads-portrait" : "ads-square");
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
      <Box
        size={[layout.width + 0.16, layout.height + 0.16, 0.075]}
        color="#42383f"
        radius={0.012}
      />
      <SelectionOutline
        size={[layout.width + 0.16, layout.height + 0.16, 0.075]}
        visible={hovered && !active}
      />
      <Box
        position={[0, 0, 0.042]}
        size={[layout.width + 0.06, layout.height + 0.06, 0.015]}
        color="#eee8dc"
        radius={0.002}
      />
      <mesh position={[0, 0, 0.052]} receiveShadow {...surface.events}>
        <planeGeometry args={[layout.width, layout.height]} />
        <meshStandardMaterial
          map={surface.texture}
          roughness={0.95}
          metalness={0}
        />
      </mesh>
      <WallArtSpotlight height={layout.height} />
    </group>
  );
}
