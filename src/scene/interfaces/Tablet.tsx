import { useCallback, useState } from "react";
import {
  profile,
  skills,
  tools,
  education,
  learning,
  type Section,
} from "../../data/portfolio";
import { Box } from "../Objects";
import SelectionOutline from "../SelectionOutline";
import ScreenGlow from "../ScreenGlow";
import GlassPane from "../GlassPane";
import { containedImage, rect, text, wrap } from "./drawing";
import { control, icon, os, status } from "./osDrawing";
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
  onNavigate,
}: {
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
  onContact: () => void;
  onNavigate: (section: Section) => void;
}) {
  const portrait = useSurfaceImage(profile.tabletPortrait);
  const logo = useSurfaceImage("/images/leila-logo.png");
  const [hovered, setHovered] = useState(false);
  const [page, setPage] = useState<
    "about" | "skills" | "education" | "learning"
  >("about");
  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
      rect(c, 0, 0, 720, 500, "#3d272f");
      status(c, 720, true);
      rect(c, 14, 36, 692, 411, os.paper, 12);
      rect(c, 14, 36, 150, 411, "#e9e2de", 12);
      rect(c, 148, 36, 16, 411, "#e9e2de");
      if (logo) containedImage(c, logo, 27, 55, 31, 34);
      text(c, "Leila", 69, 77, 23, os.ink, 600);
      text(c, "Personal profile", 28, 111, 15, os.muted);
      (
        [
          ["about", "About me", "person"],
          ["skills", "Skills & tools", "spark"],
          ["education", "Education", "school"],
          ["learning", "Learning", "folder"],
        ] as const
      ).forEach(([key, label, glyph], i) => {
        control(
          c,
          actions,
          ui,
          label,
          [23, 133 + i * 46, 132, 39],
          () => setPage(key),
          { icon: glyph, text: label, selected: page === key, font: 15 },
        );
      });
      control(
        c,
        actions,
        ui,
        "Open contact phone",
        [25, 397, 128, 33],
        onContact,
        { icon: "mail", text: "Contact", fill: os.burgundy, font: 17 },
      );
      const titles = {
        about: "About me",
        skills: "Skills & tools",
        education: "Education",
        learning: "Learning",
      };
      text(c, titles[page], 185, 73, 24, os.ink, 600);
      if (active)
        control(c, actions, ui, "Close profile", [659, 47, 32, 31], onClose, {
          icon: "close",
        });
      rect(c, 180, 91, 510, 1, os.line);
      if (page === "about") {
        rect(c, 184, 111, 178, 274, "#ded6d1", 7);
        if (portrait) {
          c.save();
          c.beginPath();
          c.roundRect(184, 111, 178, 274, 7);
          c.clip();
          containedImage(c, portrait, 184, 111, 178, 274);
          c.restore();
        }
        text(c, "Leila Rose", 383, 144, 32, os.ink, 600);
        text(c, "Parungo", 383, 181, 32, os.ink, 600);
        text(c, "Design, sound & interactive.", 384, 211, 17, os.muted);
        wrap(c, profile.bio, 383, 245, 305, 17, 23, os.ink);
        text(c, profile.location, 184, 418, 18, os.muted);
      } else if (page === "skills") {
        text(c, "Creative skills", 185, 125, 17, os.muted, 600);
        text(c, "Toolkit", 464, 125, 17, os.muted, 600);
        skills.forEach((skill, i) => {
          const y = 143 + i * 43;
          rect(c, 182, y, 257, 40, "#eee9e5", 5);
          text(c, skill, 194, y + 26, 18, os.ink, 500);
        });
        tools.forEach((tool, i) => {
          const y = 143 + i * 43;
          rect(c, 460, y, 230, 40, "#eee9e5", 5);
          text(c, tool, 472, y + 26, 18, os.ink, 500);
        });
      } else if (page === "education") {
        icon(c, "school", 190, 117, 36, os.burgundy);
        text(c, education.period, 243, 143, 19, os.burgundy, 600);
        wrap(c, education.degree, 186, 202, 488, 31, 39, os.ink);
        rect(c, 184, 291, 506, 1, os.line);
        text(c, "University", 187, 324, 16, os.muted);
        text(c, education.school, 187, 356, 23, os.ink, 500);
        text(c, "Degree program", 187, 405, 17, os.muted);
      } else {
        learning.forEach((entry, i) => {
          const y = 119 + i * 103;
          text(c, entry.type, 186, y, 15, os.burgundy, 600);
          text(c, entry.period, 648, y, 15, os.muted);
          wrap(c, entry.title, 186, y + 30, 490, 20, 26, os.ink);
          if (i < learning.length - 1) rect(c, 184, y + 82, 506, 1, os.line);
        });
      }
      // The tablet's application dock mirrors the desktop's real destinations.
      rect(c, 231, 456, 258, 32, "#251b20", 8);
      (
        [
          ["Work", "folder", "work"],
          ["Profile", "person", "about"],
          ["Music", "music", "music"],
          ["Contact", "mail", "contact"],
        ] as const
      ).forEach(([label, glyph, section], i) => {
        control(
          c,
          actions,
          ui,
          `Open ${label}`,
          [236 + i * 63, 457, 57, 30],
          () => (section === "about" ? setPage("about") : onNavigate(section)),
          { icon: glyph, dark: true, selected: section === "about" },
        );
      });
      rect(c, 310, 494, 100, 3, "#e6dadd", 2);
    },
    [portrait, logo, page, active, onClose, onContact, onNavigate],
  );
  const surface = useObjectSurface(720, 500, active, draw, page, {
    enabled: true,
    fps: 1,
  });
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
