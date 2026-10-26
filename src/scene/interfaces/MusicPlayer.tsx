import { useCallback, useState } from "react";
import { Box, Cylinder } from "../Objects";
import SelectionOutline from "../SelectionOutline";
import ScreenGlow from "../ScreenGlow";
import GlassPane from "../GlassPane";
import { rect, text } from "./drawing";
import { brand, brandButton, brandMark, rule } from "./brandDrawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";
import useRoomMusic, { roomTracks } from "./useRoomMusic";
import { musicPlayerLayout } from "../layout";
import SpeakerEffects from "./SpeakerEffects";

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
  const music = useRoomMusic();
  const logo = useSurfaceImage("/images/leila-logo.png");
  const draw = useCallback<SurfaceDraw>(
    (c, actions) => {
      rect(c, 0, 0, 720, 440, brand.dark);
      brandMark(c, logo, 28, 20, 66, true);
      text(c, "Leila Parungo", 112, 48, 26, brand.light, 500);
      text(c, "Studio audio", 112, 77, 22, "#b5a4a8");
      if (active)
        brandButton(c, actions, "← Room", [552, 28, 140, 44], onClose, {
          dark: true,
        });
      rule(c, 28, 110, 664, "#514247");
      text(c, "Original beat · Leila Rose Parungo", 28, 145, 22, "#b5a4a8");
      text(c, roomTracks[music.track], 28, 198, 46, brand.light, 500);
      text(
        c,
        `${String(music.track + 1).padStart(2, "0")} / ${String(roomTracks.length).padStart(2, "0")}`,
        583,
        192,
        24,
        "#b5a4a8",
      );
      brandButton(
        c,
        actions,
        music.loading ? "Cancel" : music.playing ? "Pause" : "Play",
        [28, 226, 215, 64],
        music.toggle,
        { filled: true, font: 30 },
      );
      brandButton(c, actions, "Restart ↺", [264, 226, 252, 64], music.next, {
        dark: true,
        font: 27,
      });
      text(
        c,
        music.loading ? "Loading…" : music.playing ? "Playing" : "Paused",
        548,
        266,
        23,
        "#d4b8c0",
      );
      rule(c, 28, 315, 664, "#514247");
      text(c, "Volume", 28, 355, 22, "#b5a4a8");
      brandButton(c, actions, "−", [148, 329, 52, 46], music.quieter, {
        dark: true,
        font: 30,
      });
      rect(c, 224, 350, 318, 3, "#655056");
      rect(c, 224, 350, 318 * music.volume, 3, "#d1a8b6");
      c.fillStyle = brand.light;
      c.beginPath();
      c.arc(224 + 318 * music.volume, 351.5, 6, 0, Math.PI * 2);
      c.fill();
      brandButton(c, actions, "+", [567, 329, 52, 46], music.louder, {
        dark: true,
        font: 30,
      });
      text(c, `${Math.round(music.volume * 100)}%`, 638, 359, 23, brand.light);
      // Preserve descriptive names for keyboard and assistive input.
      actions[actions.length - 2].label = "Volume −";
      actions[actions.length - 1].label = "Volume +";
      text(
        c,
        music.error || "Sound for the creative process.",
        28,
        414,
        21,
        "#b5a4a8",
      );
    },
    [
      active,
      logo,
      onClose,
      music.playing,
      music.loading,
      music.track,
      music.volume,
      music.error,
      music.toggle,
      music.next,
      music.quieter,
      music.louder,
    ],
  );
  const surface = useObjectSurface(
    720,
    440,
    active,
    draw,
    `${music.track}:${music.playing}`,
  );
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
      <Box
        size={[0.44, 0.66, 0.3]}
        color={hovered && !active ? "#e6b6c5" : "#d4c2ba"}
        radius={0.04}
      />
      <SelectionOutline size={[0.44, 0.66, 0.3]} visible={hovered && !active} />
      <Box
        position={[0, 0, 0.15]}
        size={[0.412, 0.625, 0.012]}
        color="#39393e"
        radius={0.03}
      />
      <mesh position={[0, 0.16, 0.158]} {...surface.events}>
        <planeGeometry args={[0.388, 0.237]} />
        <meshBasicMaterial map={surface.texture} toneMapped={false} />
      </mesh>
      <group position={[0, 0.16, 0.156]}>
        <ScreenGlow
          width={0.388}
          height={0.237}
          strength={0.25}
          spill={false}
        />
      </group>
      <group position={[0, 0.16, 0.159]}>
        <GlassPane
          width={0.388}
          height={0.237}
          strength={active ? 0.16 : 0.3}
        />
      </group>
      <group position={[0, -0.16, 0.164]}>
        <Cylinder
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.132, 0.132, 0.018]}
          color="#77727a"
        />
        <Cylinder
          position={[0, 0, 0.012]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.117, 0.117, 0.012]}
          color="#202327"
        />
        <Cylinder
          position={[0, 0, 0.02]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.068, 0.068, 0.012]}
          color="#4a454e"
        />
        <mesh position={[0, 0, 0.032]}>
          <sphereGeometry args={[0.044, 20, 12]} />
          <meshStandardMaterial color="#c697ae" roughness={0.5} />
        </mesh>
        {Array.from({ length: 28 }, (_, i) => {
          const angle = (i / 28) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.093,
                Math.sin(angle) * 0.093,
                0.022,
              ]}
            >
              <circleGeometry args={[0.004, 6]} />
              <meshBasicMaterial color="#a59aa5" />
            </mesh>
          );
        })}
      </group>
      {[-0.15, 0.15].map((x) => (
        <Box
          key={x}
          position={[x, -0.34, 0]}
          size={[0.07, 0.02, 0.21]}
          color="#39393e"
          radius={0.006}
        />
      ))}
      <mesh position={[0.165, -0.015, 0.16]}>
        <circleGeometry args={[0.007, 12]} />
        <meshBasicMaterial
          color={music.playing ? "#abd4b1" : "#b38f9e"}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
