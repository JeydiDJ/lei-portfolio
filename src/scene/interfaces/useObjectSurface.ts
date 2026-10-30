import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  CanvasTexture,
  DefaultLoadingManager,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
} from "three";

export type SurfaceAction = {
  label: string;
  rect: [number, number, number, number];
  run: (point?: { x: number; y: number }) => void;
  selected?: boolean;
};
export type SurfaceUI = {
  hovered: string | null;
  focused: string | null;
  pressed: string | null;
  time: number;
  reducedMotion: boolean;
  hover: (label: string) => number;
};
export type SurfaceDraw = (
  context: CanvasRenderingContext2D,
  actions: SurfaceAction[],
  ui: SurfaceUI,
) => void;

/** The UI is rendered onto the object's actual texture and hit-tested using its UVs. */
export function useObjectSurface(
  width: number,
  height: number,
  active: boolean,
  draw: SurfaceDraw,
  transitionKey?: string | number,
  animation?: { enabled: boolean; fps?: number },
  pixelRatio = 1,
) {
  const gl = useThree((state) => state.gl);
  const actions = useRef<SurfaceAction[]>([]);
  const keyboard = useRef<HTMLDivElement | null>(null);
  const previous = useRef<{
    key: string | number | undefined;
    active: boolean;
  } | null>(null);
  const transition = useRef<number | null>(null);
  const hoverLevels = useRef(new Map<string, number>());
  const interaction = useRef<SurfaceUI>({
    hovered: null,
    focused: null,
    pressed: null,
    time: 0,
    reducedMotion: false,
    hover: (label) => hoverLevels.current.get(label) ?? 0,
  });
  const feedback = useRef(0);
  const elapsed = useRef(0);
  const paintElapsed = useRef(0);
  const drawRef = useRef(draw);
  drawRef.current = draw;
  const updateInteraction = (
    key: "hovered" | "focused" | "pressed",
    label: string | null,
  ) => {
    if (interaction.current[key] === label) return;
    interaction.current[key] = label;
    feedback.current = 0.3;
  };
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      interaction.current.reducedMotion = preference.matches;
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!active) {
      interaction.current.hovered = null;
      interaction.current.focused = null;
      interaction.current.pressed = null;
      hoverLevels.current.clear();
    }
  }, [active]);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width * pixelRatio;
    c.height = height * pixelRatio;
    return c;
  }, [width, height, pixelRatio]);
  const pages = useMemo(() => {
    const make = () => {
      const page = document.createElement("canvas");
      page.width = width * pixelRatio;
      page.height = height * pixelRatio;
      return page;
    };
    const from = make(),
      to = make();
    // Draw in logical UI coordinates; keep hit targets independent of texture density.
    to.getContext("2d")!.scale(pixelRatio, pixelRatio);
    return { from, to };
  }, [width, height, pixelRatio]);
  const texture = useMemo(() => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return t;
  }, [canvas, gl]);
  useEffect(() => {
    if (pixelRatio <= 1) return;
    // Close-up UI does not need a new mip chain on every hover/fade upload.
    // Restore mipmaps for clean minification when viewing it across the room.
    texture.generateMipmaps = !active;
    texture.minFilter = active ? LinearFilter : LinearMipmapLinearFilter;
    texture.needsUpdate = true;
  }, [texture, active, pixelRatio]);
  useEffect(() => {
    if (!active) return;
    const layer = document.createElement("div");
    layer.className = "model-keyboard-actions";
    layer.setAttribute("role", "group");
    layer.setAttribute("aria-label", "Controls on the selected object");
    gl.domElement.parentElement?.appendChild(layer);
    keyboard.current = layer;
    return () => {
      layer.remove();
      keyboard.current = null;
    };
  }, [active, gl]);
  useEffect(() => {
    const context = pages.to.getContext("2d")!;
    context.clearRect(0, 0, width, height);
    const next: SurfaceAction[] = [];
    draw(context, next, interaction.current);
    actions.current = next;
    const prior = previous.current;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const navigate =
      active &&
      prior?.active &&
      transitionKey !== undefined &&
      prior.key !== transitionKey;
    previous.current = { key: transitionKey, active };
    if (navigate && !reduced) {
      const from = pages.from.getContext("2d")!;
      from.clearRect(0, 0, canvas.width, canvas.height);
      from.drawImage(canvas, 0, 0);
      transition.current = 0;
    } else if (!active || reduced || transition.current === null) {
      transition.current = null;
      const visible = canvas.getContext("2d")!;
      visible.clearRect(0, 0, canvas.width, canvas.height);
      visible.drawImage(pages.to, 0, 0);
      texture.needsUpdate = true;
    }
    const layer = keyboard.current;
    if (layer) {
      const hadFocus = layer.contains(document.activeElement);
      const focusedLabel = hadFocus
        ? document.activeElement?.textContent
        : null;
      layer.replaceChildren();
      for (const action of next) {
        const button = document.createElement("button");
        button.textContent = action.label;
        if (action.selected !== undefined)
          button.setAttribute("aria-pressed", String(action.selected));
        button.onclick = () => action.run();
        button.onfocus = () => updateInteraction("focused", action.label);
        button.onblur = () => updateInteraction("focused", null);
        layer.appendChild(button);
      }
      if (hadFocus) {
        const previousAction = Array.from(
          layer.querySelectorAll("button"),
        ).find((button) => button.textContent === focusedLabel);
        if (previousAction) previousAction.focus();
        else {
          // A page change can remove the pressed action while Enter is still held.
          // Focus the group rather than accidentally activating the new first button.
          layer.tabIndex = -1;
          layer.focus();
        }
      }
    }
  }, [draw, canvas, pages, texture, width, height, active, transitionKey]);
  useFrame((_, delta) => {
    if (!interaction.current.reducedMotion) interaction.current.time += delta;
    elapsed.current += delta;
    paintElapsed.current += delta;
    const paintInterval = pixelRatio > 1 ? 1 / 24 : 1 / 30;
    const paintDelta = paintElapsed.current;
    const paint = paintElapsed.current >= paintInterval;
    if (paint) paintElapsed.current %= paintInterval;
    const animate =
      active &&
      animation?.enabled &&
      elapsed.current >=
        1 / (interaction.current.reducedMotion ? 1 : (animation.fps ?? 12));
    if (paint && ((active && feedback.current > 0) || animate)) {
      for (const action of actions.current) {
        const target =
          interaction.current.hovered === action.label ||
          interaction.current.focused === action.label
            ? 1
            : 0;
        const current = hoverLevels.current.get(action.label) ?? 0;
        hoverLevels.current.set(
          action.label,
          interaction.current.reducedMotion
            ? target
            : current + (target - current) * Math.min(1, paintDelta * 20),
        );
      }
      const context = pages.to.getContext("2d")!;
      context.clearRect(0, 0, width, height);
      const next: SurfaceAction[] = [];
      drawRef.current(context, next, interaction.current);
      actions.current = next;
      if (transition.current === null) {
        const visible = canvas.getContext("2d")!;
        visible.clearRect(0, 0, canvas.width, canvas.height);
        visible.drawImage(pages.to, 0, 0);
        texture.needsUpdate = true;
      }
      feedback.current = Math.max(0, feedback.current - paintDelta);
      elapsed.current = 0;
    }
    if (transition.current === null) return;
    transition.current += delta;
    const progress = Math.min(1, transition.current / 0.24);
    if (!paint && progress < 1) return;
    const eased = progress * progress * (3 - 2 * progress);
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(pages.from, 0, 0);
    context.globalAlpha = eased;
    context.drawImage(pages.to, 0, 0);
    context.globalAlpha = 1;
    texture.needsUpdate = true;
    if (progress === 1) transition.current = null;
  });
  useEffect(
    () => () => {
      texture.dispose();
      document.body.style.cursor = "";
    },
    [texture],
  );
  const hit = (event: ThreeEvent<PointerEvent | MouseEvent>) => {
    if (!event.uv) return undefined;
    const x = event.uv.x * width,
      y = (1 - event.uv.y) * height;
    return [...actions.current].reverse().find((action) => {
      const [left, top, w, h] = action.rect;
      return x >= left && x <= left + w && y >= top && y <= top + h;
    });
  };
  return {
    texture,
    events: {
      onPointerMove: (event: ThreeEvent<PointerEvent>) => {
        if (active) {
          event.stopPropagation();
          const action = hit(event);
          updateInteraction("hovered", action?.label ?? null);
          document.body.style.cursor = action ? "pointer" : "default";
        }
      },
      onPointerOut: () => {
        updateInteraction("hovered", null);
        updateInteraction("pressed", null);
        document.body.style.cursor = "";
      },
      onPointerDown: (event: ThreeEvent<PointerEvent>) => {
        if (active) updateInteraction("pressed", hit(event)?.label ?? null);
      },
      onPointerUp: () => updateInteraction("pressed", null),
      onClick: (event: ThreeEvent<MouseEvent>) => {
        if (active) {
          event.stopPropagation();
          const action = hit(event);
          updateInteraction("pressed", null);
          action?.run(
            event.uv
              ? { x: event.uv.x * width, y: (1 - event.uv.y) * height }
              : undefined,
          );
        }
      },
    },
  };
}

export function useSurfaceImage(source: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    setImage(null);
    if (!source) return;
    let live = true;
    let pending = true;
    DefaultLoadingManager.itemStart(source);
    const settle = () => {
      if (!pending) return;
      pending = false;
      DefaultLoadingManager.itemEnd(source);
    };
    const next = new Image();
    next.onload = () => {
      if (live) setImage(next);
      settle();
    };
    next.onerror = () => {
      if (pending) DefaultLoadingManager.itemError(source);
      settle();
    };
    next.src = source;
    return () => {
      live = false;
      settle();
    };
  }, [source]);
  return image;
}
