import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace } from "three";

export type SurfaceAction = {
  label: string;
  rect: [number, number, number, number];
  run: () => void;
};
export type SurfaceDraw = (
  context: CanvasRenderingContext2D,
  actions: SurfaceAction[],
) => void;

/** The UI is rendered onto the object's actual texture and hit-tested using its UVs. */
export function useObjectSurface(
  width: number,
  height: number,
  active: boolean,
  draw: SurfaceDraw,
  transitionKey?: string | number,
) {
  const gl = useThree((state) => state.gl);
  const actions = useRef<SurfaceAction[]>([]);
  const keyboard = useRef<HTMLDivElement | null>(null);
  const previous = useRef<{
    key: string | number | undefined;
    active: boolean;
  } | null>(null);
  const transition = useRef<number | null>(null);
  const canvas = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    return c;
  }, [width, height]);
  const pages = useMemo(() => {
    const make = () => {
      const page = document.createElement("canvas");
      page.width = width;
      page.height = height;
      return page;
    };
    return { from: make(), to: make() };
  }, [width, height]);
  const texture = useMemo(() => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = Math.min(8, gl.capabilities.getMaxAnisotropy());
    return t;
  }, [canvas, gl]);
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
    draw(context, next);
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
      from.clearRect(0, 0, width, height);
      from.drawImage(canvas, 0, 0);
      transition.current = 0;
    } else if (!active || reduced || transition.current === null) {
      transition.current = null;
      const visible = canvas.getContext("2d")!;
      visible.clearRect(0, 0, width, height);
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
        button.onclick = action.run;
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
    if (transition.current === null) return;
    transition.current += delta;
    const progress = Math.min(1, transition.current / 0.24);
    const eased = progress * progress * (3 - 2 * progress);
    const context = canvas.getContext("2d")!;
    context.clearRect(0, 0, width, height);
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
          document.body.style.cursor = hit(event) ? "pointer" : "default";
        }
      },
      onPointerOut: () => {
        document.body.style.cursor = "";
      },
      onClick: (event: ThreeEvent<MouseEvent>) => {
        if (active) {
          event.stopPropagation();
          hit(event)?.run();
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
    const next = new Image();
    next.onload = () => {
      if (live) setImage(next);
    };
    next.src = source;
    return () => {
      live = false;
    };
  }, [source]);
  return image;
}
