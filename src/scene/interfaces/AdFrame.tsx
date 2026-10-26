import { useCallback, useState } from "react";
import type { Section } from "../../data/portfolio";
import {
  adClients,
  adGalleries,
  type AdClient,
  type AdFormat,
} from "../../data/ads";
import { adFrameLayouts } from "../layout";
import { Box } from "../Objects";
import SelectionOutline from "../SelectionOutline";
import GlassPane from "../GlassPane";
import { button, colors, containedImage, rect, text, wrap } from "./drawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";

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
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [client, setClient] = useState<AdClient>(
    format === "portrait" ? "dax" : "nathaniels",
  );
  const gallery = adGalleries[format].filter(
    (entry) => entry.client === client,
  );
  const clientLabel = adClients.find((entry) => entry.id === client)!.label;
  const ad = gallery[index];
  const image = useSurfaceImage(ad?.image ?? "");
  const portrait = format === "portrait";
  const canvasHeight = portrait ? 1697 : 1200;
  const layout = adFrameLayouts[format];
  const draw = useCallback<SurfaceDraw>(
    (c, actions) => {
      rect(c, 0, 0, 1200, canvasHeight, colors.paper);
      if (active) {
        text(c, clientLabel.toUpperCase(), 32, 47, 34, colors.ink, 600);
        text(
          c,
          portrait
            ? "Client advertising · Portrait"
            : "Client advertising · Square / landscape",
          32,
          85,
          25,
          colors.muted,
        );
        button(
          c,
          actions,
          portrait ? "Square gallery" : "Portrait gallery",
          [640, 20, 300, 68],
          () => onSelect(portrait ? "ads-square" : "ads-portrait"),
          false,
          29,
        );
        button(c, actions, "← Room", [956, 20, 212, 68], onClose, false, 31);
        const clientWidth =
          (1136 - (adClients.length - 1) * 20) / adClients.length;
        adClients.forEach((entry, i) =>
          button(
            c,
            actions,
            entry.label,
            [32 + i * (clientWidth + 20), 105, clientWidth, 66],
            () => {
              setClient(entry.id);
              setIndex(0);
            },
            client === entry.id,
            30,
          ),
        );
      }
      if (ad) {
        if (!active) {
          if (image) containedImage(c, image, 0, 0, 1200, canvasHeight);
          else text(c, "Loading client artwork…", 180, canvasHeight / 2, 38);
          return;
        }
        const imageHeight = canvasHeight - 355;
        if (image) containedImage(c, image, 30, 190, 1140, imageHeight);
        else text(c, "Loading artwork…", 400, canvasHeight / 2, 36);
        text(c, ad.title, 32, canvasHeight - 139, 25, colors.muted);
        button(
          c,
          actions,
          "‹ Previous ad",
          [30, canvasHeight - 110, 400, 78],
          () =>
            setIndex((value) => (value + gallery.length - 1) % gallery.length),
          false,
          34,
        );
        text(
          c,
          `${index + 1} / ${gallery.length}`,
          551,
          canvasHeight - 59,
          34,
          colors.ink,
          500,
        );
        button(
          c,
          actions,
          "Next ad ›",
          [770, canvasHeight - 110, 400, 78],
          () => setIndex((value) => (value + 1) % gallery.length),
          true,
          34,
        );
      } else {
        if (!active) text(c, "Square-format ads", 80, 150, 64, colors.ink, 600);
        rect(c, 80, 220, 1040, 650, "#e4e6da", 4);
        wrap(
          c,
          `No ${clientLabel} artwork in this format yet.`,
          155,
          490,
          880,
          53,
          74,
          colors.green,
        );
        wrap(
          c,
          "Choose another client above, or browse the portrait gallery.",
          155,
          620,
          880,
          36,
          52,
        );
        if (active) {
          button(
            c,
            actions,
            "View portrait ads →",
            [80, 930, 1040, 86],
            () => onSelect("ads-portrait"),
            true,
            42,
          );
          button(
            c,
            actions,
            "← Back to room",
            [80, 1040, 1040, 80],
            onClose,
            false,
            36,
          );
        } else text(c, "Click to explore", 80, 1010, 40, colors.green);
      }
    },
    [
      active,
      ad,
      image,
      canvasHeight,
      index,
      gallery.length,
      onClose,
      onSelect,
      client,
      clientLabel,
      portrait,
    ],
  );
  const surface = useObjectSurface(
    1200,
    canvasHeight,
    active,
    draw,
    `${client}:${index}`,
  );
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
      <mesh position={[0, 0, 0.052]} {...surface.events}>
        <planeGeometry args={[layout.width, layout.height]} />
        <meshBasicMaterial map={surface.texture} toneMapped={false} />
      </mesh>
      <group position={[0, 0, 0.055]}>
        <GlassPane
          width={layout.width}
          height={layout.height}
          strength={active ? 0.18 : 0.45}
        />
      </group>
    </group>
  );
}
