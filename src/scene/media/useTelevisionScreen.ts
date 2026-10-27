import { useCallback, useState } from "react";
import { videoWorks, type VideoWork } from "../../data/videos";
import { containedImage, rect, text, wrap } from "../interfaces/drawing";
import { control, icon } from "../interfaces/osDrawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "../interfaces/useObjectSurface";
import useTelevisionVideo from "./useTelevisionVideo";

export type TVMode = "videos" | "games";
const stamp = (value: number) =>
  `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
const categories = [
  "All films",
  "Commercials",
  "Video edits",
  "Motion",
] as const;

export default function useTelevisionScreen(
  active: boolean,
  mode: TVMode,
  onMode: (mode: TVMode) => void,
  onClose: () => void,
) {
  const [category, setCategory] =
    useState<(typeof categories)[number]>("All films");
  const [selected, setSelected] = useState<VideoWork | null>(null);
  const [page, setPage] = useState(0);
  const logo = useSurfaceImage("/images/leila-logo.png");
  const poster = useSurfaceImage("/images/quick-quack-poster.png");
  const cover = useSurfaceImage(selected?.poster ?? "");
  const video = useTelevisionVideo(
    selected?.src ?? null,
    active && mode === "videos",
  );
  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
      const white = "#f3eeeb",
        muted = "#b5a7ad",
        burgundy = "#781b20";
      const playback = video.getPlayback();
      if (selected && mode === "videos") {
        c.clearRect(0, 0, 1280, 720);
        if (!video.playing && playback.position === 0 && cover)
          containedImage(c, cover, 0, 0, 1280, 720);
        rect(c, 0, 0, 1280, 92, "#181116eb");
        rect(c, 0, 604, 1280, 116, "#181116eb");
        control(
          c,
          actions,
          ui,
          "Back to video library",
          [25, 20, 52, 52],
          () => setSelected(null),
          { icon: "back", dark: true, iconSize: 28 },
        );
        text(c, selected.title, 95, 56, 30, white, 600);
        control(
          c,
          actions,
          ui,
          video.playing ? "Pause video" : "Play video",
          [35, 624, 62, 62],
          () => void video.toggle(),
          {
            icon: video.playing ? "pause" : "play",
            fill: burgundy,
            radius: 31,
            iconSize: 28,
          },
        );
        const fraction = playback.duration
          ? playback.position / playback.duration
          : 0;
        rect(c, 130, 648, 820, 5, "#66555e", 2);
        rect(c, 130, 648, 820 * fraction, 5, "#e0c4ca", 2);
        actions.push({
          label: "Seek video",
          rect: [125, 628, 830, 48],
          run: (point) =>
            video.seek(
              point && playback.duration
                ? ((point.x - 130) / 820) * playback.duration
                : playback.position + 10,
            ),
        });
        text(
          c,
          `${stamp(playback.position)} / ${stamp(playback.duration)}`,
          974,
          661,
          22,
          muted,
        );
        control(
          c,
          actions,
          ui,
          video.muted ? "Unmute video" : "Mute video",
          [1170, 628, 58, 48],
          video.toggleMuted,
          { icon: "volume", dark: true, selected: video.muted, iconSize: 28 },
        );
        if (video.error) text(c, video.error, 131, 699, 23, "#e3b4be");
        else if (!video.playing)
          text(c, "Press play to watch", 131, 699, 20, muted);
        return;
      }
      rect(c, 0, 0, 1280, 720, "#151116");
      if (logo) containedImage(c, logo, 43, 30, 43, 48);
      text(c, "Leila", 104, 66, 31, white, 600);
      control(
        c,
        actions,
        ui,
        "Video library",
        [303, 24, 160, 62],
        () => {
          onMode("videos");
          setSelected(null);
        },
        { text: "Films", selected: mode === "videos", dark: true, font: 27 },
      );
      control(
        c,
        actions,
        ui,
        "Game project",
        [481, 24, 176, 62],
        () => onMode("games"),
        { text: "Games", selected: mode === "games", dark: true, font: 27 },
      );
      if (active)
        control(c, actions, ui, "Back to room", [1172, 28, 58, 52], onClose, {
          icon: "close",
          dark: true,
          iconSize: 28,
        });
      rect(c, 42, 101, 1196, 1, "#3a2a32");
      if (mode === "games") {
        if (poster) containedImage(c, poster, 55, 135, 350, 525);
        text(c, "Quick, Quack", 458, 232, 62, white, 600);
        text(c, "Indie game collaboration", 461, 282, 28, "#d0b8c0");
        wrap(
          c,
          "Help a mother duck find her ducklings in a colorful low-poly world.",
          460,
          347,
          720,
          31,
          43,
          white,
        );
        text(c, "Leila's contributions", 462, 489, 26, muted, 600);
        text(c, "Sound design · 3D assets & texturing", 462, 536, 27, white);
        text(c, "Social media marketing", 462, 580, 27, white);
        text(c, "Nintendo Switch project", 462, 644, 23, muted);
        return;
      }
      categories.forEach((label, i) =>
        control(
          c,
          actions,
          ui,
          `Show ${label}`,
          [43 + i * 247, 124, 229, 56],
          () => {
            setCategory(label);
            setPage(0);
          },
          {
            text: label,
            selected: category === label,
            dark: true,
            font: 25,
            radius: 8,
          },
        ),
      );
      const entries = videoWorks.filter(
        (item) => category === "All films" || item.category === category,
      );
      if (entries.length === 0) {
        rect(c, 44, 212, 1192, 420, "#261a22", 10);
        icon(c, "play", 97, 275, 56, "#ba8795");
        text(c, "Videos & commercials", 96, 402, 61, white, 600);
        text(c, "Her films will appear here.", 99, 454, 29, muted);
        control(
          c,
          actions,
          ui,
          "Explore game project",
          [95, 510, 313, 61],
          () => onMode("games"),
          { text: "Explore Quick, Quack", fill: burgundy, font: 25 },
        );
        if (logo) {
          c.save();
          c.globalAlpha = 0.24;
          containedImage(c, logo, 865, 264, 260, 289);
          c.restore();
        }
      } else {
        entries.slice(page * 4, page * 4 + 4).forEach((entry, i) => {
          const x = 44 + i * 301;
          rect(
            c,
            x,
            228,
            276,
            250,
            ui.hover(`Watch ${entry.title}`) > 0.1 ? "#49303c" : "#30222b",
            8,
          );
          icon(c, "play", x + 107, 311, 52, "#d2b6c0");
          wrap(c, entry.title, x + 3, 523, 268, 29, 38, white);
          text(c, entry.category, x + 3, 619, 22, muted);
          actions.push({
            label: `Watch ${entry.title}`,
            rect: [x, 228, 276, 420],
            run: () => setSelected(entry),
          });
        });
        if (entries.length > 4) {
          if (page > 0)
            control(
              c,
              actions,
              ui,
              "Previous films",
              [860, 659, 168, 45],
              () => setPage((value) => value - 1),
              { text: "Previous", dark: true, font: 23 },
            );
          if ((page + 1) * 4 < entries.length)
            control(
              c,
              actions,
              ui,
              "More films",
              [1044, 659, 168, 45],
              () => setPage((value) => value + 1),
              { text: "More films", dark: true, font: 23 },
            );
        }
      }
      text(c, "Leila Rose Parungo", 44, 686, 21, muted);
    },
    [
      active,
      mode,
      onMode,
      onClose,
      category,
      selected,
      page,
      logo,
      poster,
      cover,
      video,
    ],
  );
  const surface = useObjectSurface(
    1280,
    720,
    active,
    draw,
    `${mode}:${category}:${page}:${selected?.id ?? "library"}`,
  );
  return {
    ...surface,
    video,
    showVideo: mode === "videos" && selected !== null,
  };
}
