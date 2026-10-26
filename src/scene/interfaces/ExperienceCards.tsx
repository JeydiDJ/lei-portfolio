import { useCallback, useState } from "react";
import SelectionOutline from "../SelectionOutline";
import { experiences, experienceGroups, profile } from "../../data/portfolio";
import { Box, Cylinder } from "../Objects";
import { containedImage, rect, text, wrap } from "./drawing";
import { brand, brandButton, rule } from "./brandDrawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";
import BoardDecorations from "./BoardDecorations";
import BoardSpotlight from "./BoardSpotlight";

const badgeAccents = ["#781b20", "#253b3a", "#363239"];

export const experienceCardX = (index: number) => 3.25 - 0.55 + index * 0.55;
function ExperienceCard({
  index,
  active,
  onSelect,
  onClose,
}: {
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const category = experienceGroups[index];
  const [roleIndex, setRoleIndex] = useState(0);
  const entry = experiences[category.entries[roleIndex]];
  const portrait = useSurfaceImage(profile.idPortrait);
  const [hovered, setHovered] = useState(false);
  const draw = useCallback<SurfaceDraw>(
    (c, actions) => {
      const accent = badgeAccents[index];
      rect(c, 0, 0, 512, 720, "#f2f0eb");
      rect(c, 0, 0, 512, 88, accent);
      // Industry-specific insignia, without inventing an employer logo.
      c.strokeStyle = "#f2f0eb";
      c.lineWidth = 3;
      c.strokeRect(28, 26, 35, 35);
      if (index === 0) {
        c.beginPath();
        c.moveTo(33, 54);
        c.lineTo(57, 33);
        c.stroke();
      } else if (index === 1) {
        c.beginPath();
        c.moveTo(34, 44);
        c.lineTo(43, 44);
        c.moveTo(38, 39);
        c.lineTo(38, 49);
        c.moveTo(52, 42);
        c.lineTo(53, 43);
        c.stroke();
      } else {
        c.beginPath();
        c.moveTo(35, 54);
        c.lineTo(35, 45);
        c.moveTo(45, 54);
        c.lineTo(45, 38);
        c.moveTo(55, 54);
        c.lineTo(55, 32);
        c.stroke();
      }
      text(c, category.title, 82, 53, 28, "#f2f0eb", 600);
      rect(c, 28, 112, 104, 139, "#d9d5ce", 2);
      if (portrait) containedImage(c, portrait, 28, 112, 104, 139);
      wrap(c, profile.fullName, 154, 140, 330, 27, 32, brand.ink);
      text(c, entry.role, 154, 207, 23, accent, 500);
      text(c, entry.period, 154, 240, 20, brand.muted);
      rule(c, 28, 270, 456);
      const titleBottom = wrap(c, entry.title, 28, 310, 456, 29, 36, brand.ink);
      const organizationBottom = wrap(
        c,
        entry.organization,
        28,
        titleBottom + 5,
        456,
        21,
        28,
        brand.muted,
      );
      wrap(
        c,
        entry.description,
        28,
        organizationBottom + 18,
        456,
        23,
        31,
        brand.ink,
      );
      if (active) {
        brandButton(
          c,
          actions,
          `Next: ${experienceGroups[(index + 1) % experienceGroups.length].title} →`,
          [24, 542, 464, 40],
          () => onSelect((index + 1) % experienceGroups.length),
          { font: 20 },
        );
        brandButton(
          c,
          actions,
          "‹ Previous role",
          [24, 598, 224, 46],
          () =>
            setRoleIndex(
              (value) =>
                (value + category.entries.length - 1) % category.entries.length,
            ),
          { font: 21 },
        );
        brandButton(
          c,
          actions,
          "Next role ›",
          [264, 598, 224, 46],
          () => setRoleIndex((value) => (value + 1) % category.entries.length),
          { font: 21 },
        );
        brandButton(c, actions, "← Back to room", [24, 660, 464, 43], onClose, {
          filled: true,
          font: 23,
        });
      } else {
        rule(c, 28, 566, 456);
        text(
          c,
          `PORTFOLIO / ${index + 1}.${roleIndex + 1}`,
          28,
          599,
          19,
          brand.muted,
        );
        // Decorative barcode identifies the portfolio entry, not an employer credential.
        let x = 28;
        for (let bar = 0; bar < 46; bar++) {
          const width = 2 + ((bar * 7 + index) % 4);
          rect(c, x, 619, width, 40, brand.ink);
          x += width + 2;
        }
        text(c, "View experience →", 28, 695, 23, accent, 500);
      }
      rect(c, 0, 711, 512, 9, accent);
    },
    [entry, portrait, category, roleIndex, index, active, onClose, onSelect],
  );
  const surface = useObjectSurface(512, 720, active, draw, roleIndex);
  return (
    <group
      position={[-0.55 + index * 0.55, -0.12, 0.08]}
      onClick={(e) => {
        e.stopPropagation();
        if (!active) onSelect(index);
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
      {/* Clip and short lanyard meet the pegboard above the badge. */}
      <Box
        position={[0, 0.42, -0.025]}
        size={[0.022, 0.27, 0.012]}
        color={badgeAccents[index]}
        radius={0.004}
      />
      <Box
        position={[0, 0.3, 0.012]}
        size={[0.08, 0.035, 0.025]}
        color="#858784"
        radius={0.006}
      />
      <Box size={[0.43, 0.59, 0.024]} color="#a7a9a6" radius={0.012} />
      <SelectionOutline
        size={[0.43, 0.59, 0.024]}
        visible={hovered && !active}
      />
      <mesh position={[0, 0, 0.014]} receiveShadow {...surface.events}>
        <planeGeometry args={[0.41, 0.576]} />
        <meshStandardMaterial
          map={surface.texture}
          roughness={0.82}
          metalness={0}
        />
      </mesh>
    </group>
  );
}
export default function ExperienceCards({
  activeIndex,
  onSelect,
  onClose,
}: {
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <group position={[3.25, 2.95, -3.27]} userData={{ dynamic: true }}>
      <Box size={[1.9, 1.32, 0.09]} color="#332925" />
      <BoardDecorations />
      <BoardSpotlight />
      {Array.from({ length: 9 }, (_, i) => (
        <Cylinder
          key={i}
          position={[
            -0.7 + (i % 5) * 0.35,
            0.45 - Math.floor(i / 5) * 0.31,
            0.07,
          ]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.009, 0.009, 0.012]}
          color="#7c7382"
        />
      ))}
      {experienceGroups.map((entry, index) => (
        <ExperienceCard
          key={entry.title}
          index={index}
          active={activeIndex === index}
          onSelect={onSelect}
          onClose={onClose}
        />
      ))}
    </group>
  );
}
