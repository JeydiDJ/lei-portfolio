import { containedImage, rect, text } from "./drawing";
import type { SurfaceAction } from "./useObjectSurface";

export const brand = {
  paper: "#eee9e4",
  ink: "#2b2425",
  muted: "#756c6c",
  line: "#d0c5c1",
  burgundy: "#781b20",
  dark: "#211c1e",
  light: "#f3eeea",
};

export function rule(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  color = brand.line,
) {
  rect(c, x, y, width, 1, color);
}

export function brandMark(
  c: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
  dark = false,
) {
  if (dark) rect(c, x, y, size, size, brand.paper, 2);
  if (logo) containedImage(c, logo, x + 7, y + 5, size - 14, size - 10);
}

export function brandButton(
  c: CanvasRenderingContext2D,
  actions: SurfaceAction[],
  label: string,
  box: [number, number, number, number],
  run: () => void,
  {
    filled = false,
    dark = false,
    font = 22,
  }: { filled?: boolean; dark?: boolean; font?: number } = {},
) {
  const [x, y, w, h] = box;
  if (filled) rect(c, x, y, w, h, brand.burgundy, 3);
  else {
    c.strokeStyle = dark ? "#655559" : brand.line;
    c.lineWidth = 1;
    c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }
  c.font = `500 ${font}px "DM Sans",sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = filled || dark ? brand.light : brand.ink;
  c.fillText(label, x + w / 2, y + h / 2);
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
  actions.push({ label, rect: box, run });
}

export function emptyPreview(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  rect(c, x, y, w, h, "#e1d9d4");
  text(c, "Loading artwork…", x + 24, y + h / 2, 22, brand.muted);
}
