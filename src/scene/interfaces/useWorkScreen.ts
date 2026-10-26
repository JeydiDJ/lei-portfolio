import { useCallback, useState } from "react";
import { useThree } from "@react-three/fiber";
import useMonitorIdle from "./useMonitorIdle";
import { categories, projects, type Category } from "../../data/portfolio";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";
import { containedImage, rect, text, wrap } from "./drawing";
import {
  brand,
  brandButton,
  brandMark,
  emptyPreview,
  rule,
} from "./brandDrawing";

export default function useWorkScreen(active: boolean, onClose: () => void) {
  const { sleeping, wake } = useMonitorIdle(active);
  const logo = useSurfaceImage("/images/leila-logo.png");
  const mobile = useThree((state) => state.size.width < 700);
  const [category, setCategory] = useState<Category>("All work");
  const [selected, setSelected] = useState<string | null>(null);
  const [media, setMedia] = useState(0);
  const project = projects.find((item) => item.id === selected);
  const image = useSurfaceImage(project?.images?.[media] ?? "");
  const daxPreview = useSurfaceImage(projects[0].images?.[0] ?? "");
  const nathanielsPreview = useSurfaceImage(projects[1].images?.[0] ?? "");
  const gamePreview = useSurfaceImage(projects[2].images?.[0] ?? "");
  const beddingPreview = useSurfaceImage(projects[3].images?.[0] ?? "");
  const draw = useCallback<SurfaceDraw>(
    (c, actions) => {
      if (sleeping) {
        rect(c, 0, 0, 1024, 576, "#000000");
        if (logo) containedImage(c, logo, 302, 118, 420, 340);
        actions.push({
          label: "Wake monitor",
          rect: [0, 0, 1024, 576],
          run: wake,
        });
        return;
      }
      rect(c, 0, 0, 1024, 576, brand.paper);
      brandMark(c, logo, 24, 17, 58);
      text(c, "Leila Parungo", 98, 44, 26, brand.ink, 600);
      text(c, "Design / Motion / Interactive", 98, 70, 18, brand.muted);
      if (active)
        brandButton(c, actions, "← Room", [850, 24, 146, 44], onClose);
      rule(c, 28, 92, 968);

      if (!project) {
        text(c, "Work", 30, 156, 40, brand.ink, 600);
        text(c, "Browse by discipline", 30, 189, 17, brand.muted);
        categories.forEach((item, i) => {
          const y = 218 + i * 51;
          if (item === category) {
            rect(c, 28, y, 196, 43, "#e1d2ce", 2);
            rect(c, 28, y, 3, 43, brand.burgundy);
          }
          text(
            c,
            item,
            42,
            y + 29,
            mobile ? 25 : 23,
            item === category ? brand.burgundy : brand.muted,
            item === category ? 600 : 400,
          );
          actions.push({
            label: `Show ${item}`,
            rect: [28, y, 196, 43],
            run: () => setCategory(item),
          });
        });
        const visible = projects.filter(
          (item) => category === "All work" || item.category === category,
        );
        text(
          c,
          category === "All work" ? "Selected work" : category,
          266,
          149,
          36,
          brand.ink,
          600,
        );
        text(
          c,
          `${String(visible.length).padStart(2, "0")} projects`,
          865,
          148,
          20,
          brand.muted,
        );
        const previews = [
          daxPreview,
          nathanielsPreview,
          gamePreview,
          beddingPreview,
        ];
        const rowHeight = Math.min(113, 352 / Math.max(1, visible.length));
        const compact = rowHeight < 100;
        visible.forEach((item, i) => {
          const y = 180 + i * rowHeight;
          rule(c, 266, y, 730);
          const preview = previews[projects.indexOf(item)];
          const previewHeight = rowHeight - 26;
          rect(c, 266, y + 13, 92, previewHeight, "#e1d9d4");
          if (preview)
            containedImage(c, preview, 266, y + 13, 92, previewHeight);
          text(
            c,
            item.title,
            382,
            y + (compact ? 34 : 43),
            compact ? 27 : 30,
            brand.ink,
            500,
          );
          text(c, item.type, 383, y + (compact ? 63 : 77), 19, brand.muted);
          text(c, "View →", 907, y + rowHeight / 2, 22, brand.burgundy, 500);
          actions.push({
            label: `Open ${item.title}`,
            rect: [266, y, 730, rowHeight],
            run: () => {
              setSelected(item.id);
              setMedia(0);
            },
          });
        });
        if (!visible.length) {
          rule(c, 266, 180, 730);
          text(c, "New work is on its way.", 266, 255, 30, brand.ink, 500);
          text(
            c,
            "Projects in this discipline will be added here.",
            266,
            295,
            23,
            brand.muted,
          );
        }
        rule(c, 28, 541, 968);
        text(
          c,
          "Advertising · Animation · Games · Overlays",
          28,
          565,
          18,
          brand.muted,
        );
      } else {
        brandButton(
          c,
          actions,
          "← All work",
          [28, 111, 166, 43],
          () => setSelected(null),
          { font: 22 },
        );
        text(c, project.title, 225, 144, 34, brand.ink, 600);
        rect(c, 28, 177, 582, 311, "#ded6d1");
        if (image) containedImage(c, image, 28, 177, 582, 311);
        else emptyPreview(c, 28, 177, 582, 311);
        text(c, project.category, 642, 202, 24, brand.burgundy, 600);
        wrap(c, project.type, 642, 241, 350, 22, 29, brand.muted);
        wrap(c, project.description, 642, 317, 350, 23, 31, brand.ink);
        const count = project.images?.length ?? 0;
        if (count > 1) {
          brandButton(c, actions, "‹ Previous", [28, 510, 168, 44], () =>
            setMedia((media - 1 + count) % count),
          );
          text(
            c,
            `${String(media + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`,
            273,
            539,
            22,
            brand.muted,
          );
          brandButton(c, actions, "Next ›", [442, 510, 168, 44], () =>
            setMedia((media + 1) % count),
          );
        } else text(c, "Game artwork", 28, 540, 20, brand.muted);
        const index = projects.indexOf(project);
        brandButton(
          c,
          actions,
          "Next project →",
          [642, 510, 354, 44],
          () => {
            setSelected(projects[(index + 1) % projects.length].id);
            setMedia(0);
          },
          { filled: true },
        );
      }
    },
    [
      active,
      onClose,
      mobile,
      category,
      project,
      image,
      media,
      sleeping,
      logo,
      wake,
      daxPreview,
      nathanielsPreview,
      gamePreview,
      beddingPreview,
    ],
  );
  const surface = useObjectSurface(
    1024,
    576,
    active,
    draw,
    `${selected ?? category}:${media}:${sleeping}`,
  );
  return {
    ...surface,
    sleeping,
    wake,
    events: {
      ...surface.events,
      onPointerMove: (
        event: Parameters<typeof surface.events.onPointerMove>[0],
      ) => {
        wake();
        surface.events.onPointerMove(event);
      },
      onClick: (event: Parameters<typeof surface.events.onClick>[0]) => {
        wake();
        if (sleeping && active) event.stopPropagation();
        else surface.events.onClick(event);
      },
    },
  };
}
