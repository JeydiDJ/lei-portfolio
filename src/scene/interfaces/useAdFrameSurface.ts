import { useCallback, useState } from "react";
import {
  adClients,
  adGalleries,
  type AdClient,
  type AdFormat,
} from "../../data/ads";
import type { Section } from "../../data/portfolio";
import { containedImage, rect, text, wrap } from "./drawing";
import { control, icon, os } from "./osDrawing";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";

export default function useAdFrameSurface(
  format: AdFormat,
  active: boolean,
  onSelect: (section: Section) => void,
  onClose: () => void,
) {
  const [client, setClient] = useState<AdClient>(
    format === "portrait" ? "dax" : "nathaniels",
  );
  const [index, setIndex] = useState(0);
  const [browsing, setBrowsing] = useState(true);
  const gallery = adGalleries[format].filter(
    (entry) => entry.client === client,
  );
  const available = adClients.filter((entry) =>
    adGalleries[format].some((ad) => ad.client === entry.id),
  );
  const clientLabel = adClients.find((entry) => entry.id === client)!.label;
  const ad = gallery[index];
  const image = useSurfaceImage(ad?.image ?? "");
  const height = format === "portrait" ? 1697 : 1200;
  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
      rect(c, 0, 0, 1200, height, os.paper);
      if (!active) {
        if (image) containedImage(c, image, 0, 0, 1200, height);
        return;
      }
      const formatLabel =
        format === "portrait" ? "Portrait" : "Square / landscape";
      text(c, browsing ? "Advertising" : clientLabel, 40, 69, 40, os.ink, 500);
      text(
        c,
        browsing
          ? `${formatLabel} · ${available.length} campaigns`
          : `${formatLabel} · ${gallery.length} designs`,
        40,
        111,
        25,
        os.muted,
      );
      control(c, actions, ui, "Back to room", [1008, 28, 152, 62], onClose, {
        icon: "close",
        text: "Room",
        font: 28,
        iconSize: 28,
      });
      control(
        c,
        actions,
        ui,
        browsing ? "Back to artwork" : "Browse campaigns",
        [720, 28, 260, 62],
        () => setBrowsing(!browsing),
        {
          icon: browsing ? "back" : "list",
          text: browsing ? "Artwork" : "Campaigns",
          font: 28,
          iconSize: 28,
        },
      );
      rect(c, 40, 137, 1120, 1, os.line);
      if (browsing) {
        control(
          c,
          actions,
          ui,
          "Portrait gallery",
          [40, 162, 550, 64],
          () => onSelect("ads-portrait"),
          { text: "Portrait", selected: format === "portrait", font: 30 },
        );
        control(
          c,
          actions,
          ui,
          "Square gallery",
          [610, 162, 550, 64],
          () => onSelect("ads-square"),
          {
            text: "Square / landscape",
            selected: format === "square",
            font: 30,
          },
        );
        available.forEach((entry, i) => {
          const y = 264 + i * 122;
          const count = adGalleries[format].filter(
            (ad) => ad.client === entry.id,
          ).length;
          const label = `View ${entry.label} ads`;
          if (entry.id === client) {
            rect(c, 40, y, 1120, 108, "#eee5e3", 4);
            rect(c, 40, y + 20, 4, 68, os.burgundy);
          }
          c.save();
          c.globalAlpha = ui.hover(label) * 0.08;
          rect(c, 40, y, 1120, 108, os.burgundy, 4);
          c.restore();
          text(c, entry.label, 70, y + 48, 35, os.ink, 500);
          text(
            c,
            `${count} design${count === 1 ? "" : "s"}`,
            70,
            y + 84,
            25,
            os.muted,
          );
          icon(c, "chevron", 1098, y + 38, 30, os.burgundy);
          rect(c, 70, y + 116, 1060, 1, os.line);
          actions.push({
            label,
            rect: [40, y, 1120, 108],
            run: () => {
              setClient(entry.id);
              setIndex(0);
              setBrowsing(false);
            },
          });
        });
        text(
          c,
          "Select a campaign to view its artwork.",
          40,
          height - 47,
          25,
          os.muted,
        );
        return;
      }
      if (image) containedImage(c, image, 32, 158, 1136, height - 300);
      else if (ad) text(c, "Loading artwork…", 436, height / 2, 30, os.muted);
      else {
        wrap(
          c,
          "No artwork in this format yet.",
          100,
          height / 2,
          1000,
          38,
          50,
          os.muted,
        );
        control(
          c,
          actions,
          ui,
          "Choose a campaign",
          [340, height / 2 + 70, 520, 68],
          () => setBrowsing(true),
          { text: "Choose a campaign", fill: os.burgundy, font: 30 },
        );
      }
      if (ad) {
        text(c, ad.title, 40, height - 112, 25, os.muted);
        rect(c, 40, height - 92, 1120, 1, os.line);
        if (gallery.length > 1) {
          control(
            c,
            actions,
            ui,
            "Previous ad",
            [40, height - 77, 210, 58],
            () => setIndex((index - 1 + gallery.length) % gallery.length),
            { icon: "back", text: "Previous", font: 28, iconSize: 26 },
          );
          control(
            c,
            actions,
            ui,
            "Next ad",
            [956, height - 77, 204, 58],
            () => setIndex((index + 1) % gallery.length),
            { text: "Next →", font: 28 },
          );
        }
        text(
          c,
          `${String(index + 1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}`,
          548,
          height - 39,
          28,
          os.ink,
        );
      }
    },
    [
      active,
      image,
      height,
      format,
      browsing,
      client,
      clientLabel,
      index,
      gallery.length,
      ad,
      onClose,
      onSelect,
    ],
  );
  return useObjectSurface(
    1200,
    height,
    active,
    draw,
    `${client}:${index}:${browsing}`,
  );
}
