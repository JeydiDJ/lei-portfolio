import { useCallback, useState } from "react";
import {
  profile,
  skills,
  tools,
  education,
  learning,
} from "../../data/portfolio";
import { Box } from "../Objects";
import SelectionOutline from "../SelectionOutline";
import ScreenGlow from "../ScreenGlow";
import GlassPane from "../GlassPane";
import { containedImage, rect, text, wrap } from "./drawing";
import { brand, brandButton, brandMark, rule } from "./brandDrawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";

export default function Tablet({
  active,
  onOpen,
  onClose,
  onContact,
}: {
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
  onContact: () => void;
}) {
  const portrait = useSurfaceImage(profile.tabletPortrait);
  const logo = useSurfaceImage("/images/leila-logo.png");
  const [hovered, setHovered] = useState(false);
  const [page, setPage] = useState<
    "about" | "skills" | "education" | "learning"
  >("about");
  const draw = useCallback<SurfaceDraw>(
    (c, actions) => {
      rect(c, 0, 0, 720, 500, brand.paper);
      brandMark(c, logo, 18, 9, 54);
      text(c, "About me", 88, 44, 29, brand.ink, 600);
      rule(c, 24, 68, 672);
      if (active)
        brandButton(c, actions, "← Room", [550, 16, 146, 40], onClose, {
          font: 22,
        });
      (
        [
          ["about", "About"],
          ["skills", "Skills"],
          ["education", "Education"],
          ["learning", "Learning"],
        ] as const
      ).forEach(([key, label], index) => {
        const x = 24 + index * 174;
        text(
          c,
          label,
          x + 12,
          105,
          23,
          page === key ? brand.burgundy : brand.muted,
          page === key ? 600 : 400,
        );
        if (page === key) rect(c, x + 12, 115, 138, 2, brand.burgundy);
        actions.push({
          label,
          rect: [x, 78, 162, 40],
          run: () => setPage(key),
        });
      });
      if (page === "about") {
        rect(c, 24, 136, 190, 280, "#e1d9d4", 2);
        if (portrait) containedImage(c, portrait, 24, 136, 190, 280);
        text(c, profile.fullName, 238, 157, 30, brand.ink, 600);
        wrap(c, profile.bio, 238, 197, 454, 23, 30, brand.ink);
        text(c, profile.location, 238, 422, 22, brand.muted);
      } else if (page === "skills") {
        text(c, "Creative skills", 28, 157, 28, brand.ink, 600);
        skills.forEach((skill, index) =>
          text(c, skill, 28, 200 + index * 38, 24, brand.ink),
        );
        text(c, "Tools", 397, 157, 28, brand.ink, 600);
        tools.forEach((tool, index) =>
          text(c, tool, 397, 200 + index * 38, 24, brand.muted),
        );
      } else if (page === "education") {
        text(c, education.period, 28, 165, 25, brand.burgundy, 500);
        wrap(c, education.degree, 28, 220, 630, 34, 45, brand.ink);
        text(c, education.school, 28, 339, 28, brand.ink, 500);
        text(c, "Education", 28, 389, 23, brand.muted);
      } else {
        learning.forEach((entry, index) => {
          const y = 147 + index * 97;
          text(
            c,
            `${entry.type} · ${entry.period}`,
            28,
            y,
            20,
            brand.burgundy,
            500,
          );
          wrap(c, entry.title, 28, y + 30, 650, 23, 28, brand.ink);
        });
      }
      rule(c, 24, 436, 672);
      brandButton(
        c,
        actions,
        "Contact on my phone →",
        [24, 448, 672, 38],
        onContact,
        { filled: true, font: 23 },
      );
    },
    [portrait, logo, page, active, onClose, onContact],
  );
  const surface = useObjectSurface(720, 500, active, draw, page);
  return (
    <group
      position={[1.23, 1.49, -0.04]}
      userData={{ dynamic: true }}
      rotation={[0, -0.17, 0]}
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
      <Box
        size={[0.58, 0.055, 0.42]}
        color={hovered && !active ? "#efbfd3" : "#bf9ca7"}
        radius={0.018}
      />
      <SelectionOutline
        size={[0.58, 0.055, 0.42]}
        visible={hovered && !active}
      />
      <Box
        position={[0, 0.03, 0]}
        size={[0.54, 0.008, 0.38]}
        color="#22262a"
        radius={0.008}
      />
      <mesh
        position={[0, 0.035, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        {...surface.events}
      >
        <planeGeometry args={[0.515, 0.358]} />
        <meshBasicMaterial map={surface.texture} toneMapped={false} />
      </mesh>
      <group position={[0, 0.0345, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ScreenGlow width={0.515} height={0.358} strength={0.45} />
      </group>
      <group position={[0, 0.036, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <GlassPane
          width={0.515}
          height={0.358}
          strength={active ? 0.16 : 0.32}
        />
      </group>
      <Box
        position={[0.34, -0.0275, 0]}
        size={[0.025, 0.025, 0.39]}
        color="#ddd2d3"
        radius={0.008}
      />
    </group>
  );
}
