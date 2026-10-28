import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useMonitorIdle from "./useMonitorIdle";
import {
  categories,
  projects,
  type Category,
  type Section,
} from "../../data/portfolio";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";
import { containedImage, rect, text, wrap } from "./drawing";
import { control, icon, os, osTime } from "./osDrawing";

export default function useWorkScreen(
  active: boolean,
  onClose: () => void,
  onNavigate: (section: Section) => void,
) {
  const { sleeping, wake } = useMonitorIdle(active);
  const wokeAt = useRef(-Infinity);
  const logo = useSurfaceImage("/images/leila-logo.png");
  const [category, setCategory] = useState<Category>("All work");
  const [selected, setSelected] = useState<string | null>(null);
  const [media, setMedia] = useState(0);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const visibleProjects = useMemo(
    () =>
      projects.filter(
        (item) => category === "All work" || item.category === category,
      ),
    [category],
  );
  const previewOffset =
    Math.min(page, Math.max(0, Math.ceil(visibleProjects.length / 4) - 1)) * 4;
  const project = projects.find((item) => item.id === selected);
  const image = useSurfaceImage(project?.images?.[media] ?? "");
  useEffect(() => {
    if (!active) setFullscreen(false);
    if (!active || !fullscreen || !project) return;
    const handle = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopImmediatePropagation();
        event.preventDefault();
        setFullscreen(false);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const count = project.images?.length ?? 0;
        if (count > 1)
          setMedia(
            (value) =>
              (value + (event.key === "ArrowRight" ? 1 : -1) + count) % count,
          );
      }
    };
    window.addEventListener("keydown", handle, true);
    return () => window.removeEventListener("keydown", handle, true);
  }, [active, fullscreen, project]);
  const first = useSurfaceImage(
      visibleProjects[previewOffset]?.images?.[0] ?? "",
    ),
    second = useSurfaceImage(
      visibleProjects[previewOffset + 1]?.images?.[0] ?? "",
    );
  const third = useSurfaceImage(
      visibleProjects[previewOffset + 2]?.images?.[0] ?? "",
    ),
    fourth = useSurfaceImage(
      visibleProjects[previewOffset + 3]?.images?.[0] ?? "",
    );
  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
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
      if (fullscreen && project) {
        rect(c, 0, 0, 1024, 576, "#151216");
        rect(c, 0, 0, 1024, 48, "#211a20");
        text(c, project.title, 20, 31, 21, "#f6f0f1", 500);
        control(
          c,
          actions,
          ui,
          "Exit full screen",
          [838, 6, 174, 36],
          () => setFullscreen(false),
          { text: "Exit full screen", icon: "close", dark: true, font: 17 },
        );
        if (image) containedImage(c, image, 48, 56, 928, 464);
        else text(c, "Loading artwork…", 421, 291, 20, "#e9e1e5");
        const count = project.images?.length ?? 0;
        if (count > 1) {
          control(
            c,
            actions,
            ui,
            "Previous image",
            [4, 247, 40, 70],
            () => setMedia((media - 1 + count) % count),
            { icon: "back", dark: true, iconSize: 25 },
          );
          control(
            c,
            actions,
            ui,
            "Next image",
            [980, 247, 40, 70],
            () => setMedia((media + 1) % count),
            { icon: "chevron", dark: true, iconSize: 25 },
          );
        }
        text(c, `${media + 1} / ${count}`, 487, 554, 18, "#e9e1e5");
        text(
          c,
          "← → Browse images · Esc to exit full screen",
          20,
          554,
          15,
          "#b6a8af",
        );
        return;
      }
      rect(c, 0, 0, 1024, 576, "#302026");
      rect(c, 0, 0, 1024, 28, "#1b1519");
      if (logo) containedImage(c, logo, 15, 5, 18, 18);
      text(c, "Lei OS", 44, 20, 16, "#f2ecee", 600);
      text(c, "Files", 119, 20, 16, "#f2ecee", 600);
      text(c, osTime(), 875, 20, 15, "#d0c3c8");
      // One native-style file window, framed by the desktop and its application dock.
      rect(c, 22, 43, 980, 474, os.paper, 9);
      rect(c, 22, 43, 980, 38, "#e8e2df", 9);
      rect(c, 22, 70, 980, 11, "#e8e2df");
      if (active)
        control(
          c,
          actions,
          ui,
          "Close work window",
          [32, 48, 28, 27],
          onClose,
          { icon: "close" },
        );
      text(
        c,
        project ? "Portfolio — Preview" : "Portfolio — Files",
        402,
        68,
        19,
        os.ink,
        600,
      );
      rect(c, 22, 81, 980, 36, "#f0ece8");
      if (project)
        control(
          c,
          actions,
          ui,
          "Back to all work",
          [203, 84, 32, 30],
          () => setSelected(null),
          { icon: "back" },
        );
      else icon(c, "folder", 208, 89, 21, os.muted);
      text(
        c,
        project ? `Work / ${project.category}` : "Work / Selected projects",
        243,
        106,
        17,
        os.muted,
      );
      if (!project) {
        control(
          c,
          actions,
          ui,
          "Grid view",
          [902, 84, 36, 30],
          () => setView("grid"),
          { icon: "grid", selected: view === "grid" },
        );
        control(
          c,
          actions,
          ui,
          "List view",
          [945, 84, 36, 30],
          () => setView("list"),
          { icon: "list", selected: view === "list" },
        );
      }
      rect(c, 22, 117, 174, 377, "#eae4e1");
      text(c, "Library", 39, 147, 16, os.muted, 600);
      categories.forEach((item, i) =>
        control(
          c,
          actions,
          ui,
          `Show ${item}`,
          [31, 160 + i * 43, 155, 37],
          () => {
            setCategory(item);
            setSelected(null);
            setPage(0);
          },
          {
            icon:
              item === "All work"
                ? "grid"
                : item === "Games"
                  ? "spark"
                  : "folder",
            text: item,
            selected: item === category,
            font: 18,
          },
        ),
      );
      control(
        c,
        actions,
        ui,
        "Open videos and commercials on TV",
        [31, 385, 155, 42],
        () => onNavigate("tv"),
        { icon: "play", text: "Videos & film", font: 16 },
      );
      text(c, "Leila's portfolio", 39, 470, 15, os.muted);
      const previews = [first, second, third, fourth];
      if (!project) {
        const visible = visibleProjects;
        text(
          c,
          category === "All work" ? "Selected work" : category,
          218,
          151,
          27,
          os.ink,
          600,
        );
        text(c, `${visible.length} projects`, 881, 149, 16, os.muted);
        const pages = Math.max(1, Math.ceil(visible.length / 4));
        const currentPage = Math.min(page, pages - 1);
        visible
          .slice(currentPage * 4, currentPage * 4 + 4)
          .forEach((item, i) => {
            const label = `Open ${item.title}`,
              preview = previews[i];
            const open = () => {
              setSelected(item.id);
              setMedia(0);
            };
            if (view === "grid") {
              const x = 210 + i * 194,
                y = 168;
              rect(c, x, y, 184, 313, "#f6f3f0", 6);
              c.save();
              c.globalAlpha = ui.hover(label) * 0.75;
              rect(c, x, y, 184, 313, "#e7dcd9", 6);
              c.restore();
              rect(c, x + 8, y + 7, 168, 205, "#e4ddda", 4);
              if (preview) containedImage(c, preview, x + 8, y + 7, 168, 205);
              wrap(c, item.title, x + 11, y + 237, 162, 19, 24, os.ink);
              text(
                c,
                `${item.images?.length ?? 0} image${item.images?.length === 1 ? "" : "s"}`,
                x + 11,
                y + 306,
                14,
                os.muted,
              );
              actions.push({ label, rect: [x, y, 184, 313], run: open });
            } else {
              const y = 171 + i * 76;
              c.save();
              c.globalAlpha = ui.hover(label);
              rect(c, 210, y, 776, 72, "#eae0dc", 4);
              c.restore();
              if (preview) containedImage(c, preview, 219, y + 8, 65, 54);
              text(c, item.title, 302, y + 29, 23, os.ink, 500);
              text(c, item.type, 302, y + 54, 16, os.muted);
              text(
                c,
                `${item.images?.length ?? 0} image${item.images?.length === 1 ? "" : "s"}`,
                873,
                y + 40,
                16,
                os.muted,
              );
              rect(c, 217, y + 73, 763, 1, os.line);
              actions.push({ label, rect: [210, y, 776, 73], run: open });
            }
          });
        if (!visible.length) {
          icon(c, "folder", 547, 241, 53, os.muted);
          text(c, "No projects here yet", 457, 329, 25, os.ink, 500);
          text(
            c,
            "New work will appear in this folder.",
            420,
            363,
            19,
            os.muted,
          );
        }
        rect(c, 196, 494, 806, 23, "#e9e4e0");
        text(c, `${visible.length} items`, 216, 510, 14, os.muted);
        if (pages > 1) {
          if (currentPage > 0)
            control(
              c,
              actions,
              ui,
              "Previous projects page",
              [748, 495, 32, 21],
              () => setPage(currentPage - 1),
              { icon: "back" },
            );
          text(c, `${currentPage + 1} / ${pages}`, 821, 510, 14, os.muted);
          if (currentPage < pages - 1)
            control(
              c,
              actions,
              ui,
              "Next projects page",
              [945, 495, 32, 21],
              () => setPage(currentPage + 1),
              { icon: "chevron" },
            );
        }
      } else {
        text(c, project.title, 218, 151, 27, os.ink, 600);
        control(
          c,
          actions,
          ui,
          "Enter full screen",
          [840, 123, 143, 34],
          () => setFullscreen(true),
          { text: "Full screen", icon: "expand", font: 16 },
        );
        rect(c, 216, 169, 478, 291, "#e4ddda", 4);
        if (image) containedImage(c, image, 216, 169, 478, 291);
        else text(c, "Loading artwork…", 363, 321, 20, os.muted);
        actions.push({
          label: "View artwork full screen",
          rect: [216, 169, 478, 291],
          run: () => setFullscreen(true),
        });
        text(c, "Project details", 721, 192, 20, os.ink, 600);
        text(c, project.category, 721, 225, 18, os.burgundy, 600);
        wrap(c, project.type, 721, 257, 259, 17, 23, os.muted);
        wrap(c, project.description, 721, 321, 259, 18, 25, os.ink);
        const count = project.images?.length ?? 0;
        if (count > 1) {
          control(
            c,
            actions,
            ui,
            "Previous image",
            [216, 467, 101, 29],
            () => setMedia((media - 1 + count) % count),
            { icon: "back", text: "Prev", font: 16 },
          );
          text(c, `${media + 1} of ${count}`, 416, 488, 17, os.muted);
          control(
            c,
            actions,
            ui,
            "Next image",
            [593, 467, 101, 29],
            () => setMedia((media + 1) % count),
            { icon: "chevron", text: "Next", font: 16 },
          );
        }
        control(
          c,
          actions,
          ui,
          "Next project",
          [719, 458, 264, 33],
          () => {
            setSelected(
              projects[(projects.indexOf(project) + 1) % projects.length].id,
            );
            setMedia(0);
          },
          { text: "Next project →", fill: os.burgundy, font: 17 },
        );
        rect(c, 196, 499, 806, 18, "#e9e4e0");
        text(
          c,
          `Preview · Image ${media + 1} of ${count}`,
          216,
          513,
          13,
          os.muted,
        );
      }
      rect(c, 387, 528, 250, 40, "#1b1519", 8);
      (
        [
          ["Work", "folder", "work"],
          ["About me", "person", "about"],
          ["Music", "music", "music"],
          ["Contact", "mail", "contact"],
        ] as const
      ).forEach(([label, glyph, section], i) => {
        control(
          c,
          actions,
          ui,
          `Open ${label}`,
          [396 + i * 59, 532, 52, 32],
          () => (section === "work" ? setSelected(null) : onNavigate(section)),
          { icon: glyph, dark: true, selected: section === "work" },
        );
      });
    },
    [
      active,
      onClose,
      onNavigate,
      category,
      project,
      selected,
      media,
      view,
      sleeping,
      logo,
      wake,
      image,
      first,
      second,
      third,
      fourth,
      visibleProjects,
      page,
      fullscreen,
    ],
  );
  const surface = useObjectSurface(
    1024,
    576,
    active,
    draw,
    `${selected ?? category}:${media}:${sleeping}:${view}:${page}:${fullscreen}`,
    // The desktop clock displays minutes, so it needs only a minute-level refresh.
    { enabled: !sleeping, fps: 1 / 60 },
    2,
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
        if (sleeping) wokeAt.current = performance.now();
        wake();
        surface.events.onPointerMove(event);
      },
      onClick: (event: Parameters<typeof surface.events.onClick>[0]) => {
        wake();
        if (active && (sleeping || performance.now() - wokeAt.current < 200))
          event.stopPropagation();
        else surface.events.onClick(event);
      },
    },
  };
}
