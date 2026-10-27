import { useCallback, useState } from "react";
import {
  profile,
  skills,
  tools,
  education,
  learning,
  type Section,
} from "../../data/portfolio";
import { containedImage, rect, text, wrap } from "./drawing";
import { control, icon, os, osTime, status } from "./osDrawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";

type Page = "about" | "skills" | "education" | "learning";
type App = "profile" | "home" | "recent";
const titles = {
  about: "About me",
  skills: "Skills & tools",
  education: "Education",
  learning: "Learning",
};
const destinations = [
  ["Work", "folder", "work"],
  ["Profile", "person", "about"],
  ["Music", "music", "music"],
  ["Contact", "phone", "contact"],
] as const;

/** Landscape One UI-inspired profile app, home screen and Android tablet taskbar. */
export default function useTabletScreen(
  active: boolean,
  onClose: () => void,
  onContact: () => void,
  onNavigate: (section: Section) => void,
) {
  const portrait = useSurfaceImage(profile.tabletPortrait);
  const logo = useSurfaceImage("/images/leila-logo.png");
  const [page, setPage] = useState<Page>("about");
  const [app, setApp] = useState<App>("profile");
  const openProfile = () => {
    setApp("profile");
    setPage("about");
  };
  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
      const home = app === "home";
      rect(c, 0, 0, 960, 600, home ? "#39232c" : "#f4f2ef");
      status(c, 960, home);
      if (home) {
        text(c, osTime(), 58, 135, 62, "#f2e9e2", 500);
        text(c, "Philippine time", 62, 171, 20, "#cdbbc1");
        if (logo) containedImage(c, logo, 645, 105, 215, 245);
        text(c, "Leila Rose Parungo", 60, 233, 29, "#f2e9e2", 500);
        text(c, "Design, sound & interactive.", 61, 269, 21, "#cdbbc1");
        destinations.forEach(([label, glyph, section], i) => {
          const x = 279 + i * 108;
          if (section !== "about") rect(c, x, 398, 68, 68, "#ddd6cf", 17);
          control(
            c,
            actions,
            ui,
            `Launch ${label}`,
            [x, 398, 68, 68],
            () => (section === "about" ? openProfile() : onNavigate(section)),
            {
              icon: glyph,
              iconSize: 29,
              fill: section === "about" ? "#781b20" : undefined,
              radius: 17,
            },
          );
          text(c, label, x + 6, 493, 19, "#eee3df");
        });
      } else if (app === "recent") {
        text(c, "Recent apps", 36, 72, 28, os.ink, 600);
        rect(c, 269, 99, 422, 369, "#ffffff", 18);
        rect(c, 269, 99, 422, 57, "#e8e1dc", 18);
        text(c, "Profile", 297, 136, 24, os.ink, 600);
        if (portrait) containedImage(c, portrait, 294, 180, 152, 202);
        text(c, "Leila Rose", 466, 218, 26, os.ink, 600);
        text(c, "Parungo", 466, 251, 26, os.ink, 600);
        text(c, titles[page], 467, 299, 20, os.muted);
        actions.push({
          label: "Resume profile",
          rect: [269, 99, 422, 369],
          run: () => setApp("profile"),
        });
        control(
          c,
          actions,
          ui,
          "Close all apps",
          [396, 483, 168, 42],
          () => setApp("home"),
          { text: "Close all", fill: "#58454b", font: 20, radius: 21 },
        );
      } else {
        text(c, "Profile", 34, 72, 30, os.ink, 600);
        if (active)
          control(c, actions, ui, "Back to room", [901, 41, 36, 36], onClose, {
            icon: "close",
          });
        rect(c, 20, 96, 224, 443, "#e9e5e0", 14);
        if (logo) containedImage(c, logo, 39, 117, 30, 34);
        text(c, "Leila", 83, 142, 24, os.ink, 600);
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
            [33, 178 + i * 61, 198, 48],
            () => setPage(key),
            {
              icon: glyph,
              text: label,
              selected: page === key,
              font: 19,
              radius: 24,
            },
          );
        });
        control(
          c,
          actions,
          ui,
          "Open contact phone",
          [34, 477, 196, 45],
          onContact,
          {
            icon: "phone",
            text: "Contact",
            fill: os.burgundy,
            font: 20,
            radius: 22,
          },
        );
        rect(c, 260, 96, 680, 443, "#fffdfb", 14);
        text(c, titles[page], 285, 141, 30, os.ink, 600);
        rect(c, 282, 160, 635, 1, "#e9e2dd");
        if (page === "about") {
          if (portrait) {
            c.save();
            c.beginPath();
            c.roundRect(285, 182, 213, 284, 10);
            c.clip();
            containedImage(c, portrait, 285, 182, 213, 284);
            c.restore();
          }
          text(c, "Leila Rose", 522, 219, 36, os.ink, 600);
          text(c, "Parungo", 522, 262, 36, os.ink, 600);
          text(c, "Design, sound & interactive.", 524, 298, 20, os.muted);
          wrap(c, profile.bio, 523, 335, 389, 20, 27, os.ink);
          text(c, profile.location, 286, 506, 19, os.muted);
        } else if (page === "skills") {
          text(c, "Creative skills", 286, 195, 20, os.muted, 600);
          text(c, "Toolkit", 625, 195, 20, os.muted, 600);
          skills.forEach((skill, i) => {
            const y = 213 + i * 51;
            rect(c, 282, y, 315, 43, "#f1ede8", 8);
            text(c, skill, 295, y + 28, 21, os.ink, 500);
          });
          tools.forEach((tool, i) => {
            const y = 213 + i * 51;
            rect(c, 620, y, 298, 43, "#f1ede8", 8);
            text(c, tool, 633, y + 28, 21, os.ink, 500);
          });
        } else if (page === "education") {
          icon(c, "school", 290, 191, 42, os.burgundy);
          text(c, education.period, 352, 222, 24, os.burgundy, 600);
          wrap(c, education.degree, 285, 286, 618, 35, 45, os.ink);
          rect(c, 285, 391, 631, 1, os.line);
          text(c, "University", 287, 426, 19, os.muted);
          text(c, education.school, 287, 465, 29, os.ink, 500);
          text(c, "Degree program", 287, 510, 19, os.muted);
        } else {
          learning.forEach((entry, i) => {
            const y = 195 + i * 112;
            text(c, entry.type, 286, y, 18, os.burgundy, 600);
            text(c, entry.period, 854, y, 18, os.muted);
            wrap(c, entry.title, 286, y + 31, 618, 23, 29, os.ink);
            if (i < learning.length - 1) rect(c, 285, y + 91, 631, 1, os.line);
          });
        }
      }
      // Samsung-style tablet taskbar and the three Android navigation controls.
      rect(c, 0, 550, 960, 50, home ? "#2c1c24" : "#ded9d3");
      destinations.forEach(([label, glyph, section], i) => {
        control(
          c,
          actions,
          ui,
          `Open ${label}`,
          [328 + i * 58, 556, 39, 36],
          () => (section === "about" ? openProfile() : onNavigate(section)),
          {
            icon: glyph,
            selected: app === "profile" && section === "about",
            dark: home,
            radius: 10,
          },
        );
      });
      control(
        c,
        actions,
        ui,
        "Recent apps",
        [806, 555, 39, 37],
        () => setApp("recent"),
        { icon: "recent", dark: home },
      );
      control(
        c,
        actions,
        ui,
        "Home",
        [854, 555, 39, 37],
        () => setApp("home"),
        { icon: "home", dark: home },
      );
      control(
        c,
        actions,
        ui,
        "Back",
        [902, 555, 39, 37],
        () => {
          if (app === "recent") setApp("profile");
          else if (app === "home") onClose();
          else if (page !== "about") setPage("about");
          else setApp("home");
        },
        { icon: "back", dark: home },
      );
    },
    [portrait, logo, page, app, active, onClose, onContact, onNavigate],
  );
  return useObjectSurface(960, 600, active, draw, `${app}:${page}`, {
    enabled: true,
    fps: 1 / 60,
  });
}
