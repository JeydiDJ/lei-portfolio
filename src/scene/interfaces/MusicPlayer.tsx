import { useCallback, useState } from "react";
import SpeakerCabinet from "./SpeakerCabinet";
import GlassPane from "../GlassPane";
import { containedImage, rect, text } from "./drawing";
import { control, icon } from "./osDrawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";
import useRoomMusic, { roomTracks } from "./useRoomMusic";
import { musicPlayerLayout } from "../layout";
import SpeakerEffects from "./SpeakerEffects";

const stamp = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
export default function MusicPlayer({
  active,
  onOpen,
  onClose,
}: {
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [view, setView] = useState<"playing" | "library">("playing");
  const [saved, setSaved] = useState(false);
  const music = useRoomMusic();
  const logo = useSurfaceImage("/images/leila-logo.png");
  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
      const white = "#f5f5f5",
        muted = "#a7a7a7",
        green = "#1ed760";
      const playback = music.getPlayback();
      rect(c, 0, 0, 720, 440, "#121212");
      control(
        c,
        actions,
        ui,
        "Your library",
        [18, 14, 146, 36],
        () => setView("library"),
        {
          icon: "list",
          text: "Your library",
          selected: view === "library",
          dark: true,
          font: 17,
        },
      );
      control(
        c,
        actions,
        ui,
        "Now playing",
        [176, 14, 151, 36],
        () => setView("playing"),
        {
          icon: "music",
          text: "Now playing",
          selected: view === "playing",
          dark: true,
          font: 17,
        },
      );
      if (active)
        control(c, actions, ui, "Back to room", [661, 14, 40, 36], onClose, {
          icon: "close",
          dark: true,
        });
      const artwork = (x: number, y: number, size: number) => {
        rect(c, x, y, size, size, "#1d1116", 4);
        if (logo)
          containedImage(
            c,
            logo,
            x + size * 0.15,
            y + size * 0.14,
            size * 0.7,
            size * 0.7,
          );
      };
      if (view === "playing") {
        artwork(28, 76, 210);
        text(c, "Original recording", 270, 98, 17, muted);
        text(c, roomTracks[music.track], 268, 151, 49, white, 700);
        text(c, "Leila Rose Parungo", 270, 186, 24, "#d5d5d5", 500);
        text(c, "An original beat from her studio.", 270, 221, 18, muted);
        control(
          c,
          actions,
          ui,
          saved ? "Remove saved track" : "Save track",
          [265, 242, 42, 36],
          () => setSaved((value) => !value),
          { icon: "heart", selected: saved, dark: true },
        );
        text(
          c,
          saved ? "Saved for this visit" : "Add to your favorites",
          319,
          266,
          16,
          muted,
        );
        if (music.playing) {
          const energy = music.getEnergy();
          for (let i = 0; i < 5; i++) {
            const h = 5 + (10 + Math.sin(ui.time * 5 + i) * 8) * energy;
            rect(c, 647 + i * 7, 282 - h, 3, h, green, 1);
          }
        }
      } else {
        text(c, "Your library", 28, 94, 34, white, 700);
        text(c, "1 track · Leila's original audio", 28, 124, 18, muted);
        const rowLabel = "Play Midterms";
        rect(
          c,
          20,
          149,
          680,
          116,
          ui.hover(rowLabel) > 0.1 ? "#282828" : "#1b1b1b",
          6,
        );
        artwork(34, 167, 78);
        text(
          c,
          roomTracks[music.track],
          132,
          194,
          29,
          music.playing ? green : white,
          600,
        );
        text(c, "Leila Rose Parungo", 132, 225, 19, muted);
        text(
          c,
          playback.duration ? stamp(playback.duration) : "Original beat",
          516,
          209,
          18,
          muted,
        );
        actions.push({
          label: rowLabel,
          rect: [20, 149, 680, 116],
          run: music.toggle,
        });
        control(
          c,
          actions,
          ui,
          music.playing ? "Pause track" : "Play track",
          [636, 181, 42, 42],
          music.toggle,
          { icon: music.playing ? "pause" : "play", fill: green, radius: 21 },
        );
      }
      rect(c, 0, 302, 720, 138, "#0b0b0b");
      control(
        c,
        actions,
        ui,
        "Restart recording",
        [282, 309, 40, 40],
        music.next,
        { icon: "restart", dark: true },
      );
      control(
        c,
        actions,
        ui,
        music.loading ? "Cancel loading" : music.playing ? "Pause" : "Play",
        [334, 303, 52, 52],
        music.toggle,
        {
          icon: music.loading ? "close" : music.playing ? "pause" : "play",
          fill: green,
          radius: 26,
        },
      );
      control(
        c,
        actions,
        ui,
        music.repeat ? "Turn repeat off" : "Turn repeat on",
        [398, 309, 40, 40],
        music.toggleRepeat,
        { icon: "repeat", selected: music.repeat, dark: true },
      );
      if (music.repeat) rect(c, 416, 350, 4, 4, green, 2);
      const progress = playback.duration
        ? playback.position / playback.duration
        : 0;
      const hot = ui.hover("Seek forward 10 seconds");
      rect(c, 82, 374, 556, 4, "#4c4c4c", 2);
      rect(c, 82, 374, 556 * progress, 4, hot > 0.1 ? green : "#eeeeee", 2);
      if (hot > 0.05) {
        c.fillStyle = white;
        c.beginPath();
        c.arc(82 + 556 * progress, 376, 6, 0, Math.PI * 2);
        c.fill();
      }
      text(c, stamp(playback.position), 25, 383, 16, muted);
      text(
        c,
        playback.duration ? stamp(playback.duration) : "--:--",
        652,
        383,
        16,
        muted,
      );
      actions.push({
        label: "Seek forward 10 seconds",
        rect: [76, 363, 568, 25],
        run: (point) =>
          music.seek(
            point && playback.duration
              ? ((point.x - 82) / 556) * playback.duration
              : playback.position + 10,
          ),
      });
      icon(c, "music", 27, 410, 17, music.playing ? green : muted);
      text(
        c,
        music.error ||
          (music.loading
            ? "Loading recording…"
            : music.playing
              ? "Playing on this speaker"
              : "This speaker"),
        54,
        425,
        16,
        music.error ? "#e296a4" : muted,
      );
      control(c, actions, ui, "Volume −", [467, 403, 32, 30], music.quieter, {
        text: "−",
        font: 22,
        dark: true,
      });
      icon(c, "volume", 505, 411, 18, muted);
      rect(c, 539, 419, 109, 3, "#494949", 2);
      rect(
        c,
        539,
        419,
        109 * music.volume,
        3,
        ui.hover("Set volume") > 0.1 ? green : white,
        2,
      );
      if (ui.hover("Set volume") > 0.05) {
        c.beginPath();
        c.arc(539 + 109 * music.volume, 420.5, 5, 0, Math.PI * 2);
        c.fillStyle = white;
        c.fill();
      }
      actions.push({
        label: "Set volume",
        rect: [534, 405, 119, 28],
        run: (point) =>
          music.setVolume(
            point ? (point.x - 539) / 109 : Math.min(1, music.volume + 0.1),
          ),
      });
      control(c, actions, ui, "Volume +", [660, 403, 32, 30], music.louder, {
        text: "+",
        font: 22,
        dark: true,
      });
    },
    [active, onClose, view, saved, music, logo],
  );
  const surface = useObjectSurface(720, 440, active, draw, view, {
    enabled: music.playing || music.loading,
    fps: 12,
  });
  return (
    <group
      position={musicPlayerLayout.position}
      userData={{ dynamic: true }}
      rotation={[0, musicPlayerLayout.yaw, 0]}
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
      <SpeakerEffects
        playing={music.playing}
        volume={music.volume}
        getEnergy={music.getEnergy}
      />
      <SpeakerCabinet
        hovered={hovered}
        active={active}
        playing={music.playing}
        volume={music.volume}
        onToggle={music.toggle}
        onVolume={music.setVolume}
      >
        <mesh position={musicPlayerLayout.screen} {...surface.events}>
          <planeGeometry args={[0.388, 0.237]} />
          <meshBasicMaterial map={surface.texture} toneMapped={false} />
        </mesh>
        <group position={[-0.035, 0.105, 0.1805]}>
          <GlassPane
            width={0.388}
            height={0.237}
            strength={active ? 0.16 : 0.3}
          />
        </group>
      </SpeakerCabinet>
    </group>
  );
}
