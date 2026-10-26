import type { SurfaceAction } from "./useObjectSurface";

export const colors = {
  paper: "#f4f0e5",
  ink: "#303b32",
  muted: "#73796c",
  line: "#d5d7c8",
  green: "#536c49",
};
export function text(
  c: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size = 24,
  color = colors.ink,
  weight = 400,
) {
  c.fillStyle = color;
  c.font = `${weight} ${size}px "DM Sans",sans-serif`;
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
  c.fillText(value, x, y);
}
export function wrap(
  c: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  width: number,
  size = 24,
  line = 34,
  color = colors.muted,
) {
  c.font = `${size}px "DM Sans",sans-serif`;
  let row = "",
    baseline = y;
  for (const word of value.split(" ")) {
    const next = row ? `${row} ${word}` : word;
    if (c.measureText(next).width > width && row) {
      text(c, row, x, baseline, size, color);
      row = word;
      baseline += line;
    } else row = next;
  }
  if (row) {
    text(c, row, x, baseline, size, color);
    baseline += line;
  }
  return baseline;
}
export function rect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  radius = 0,
) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, radius);
  c.fill();
}
export function button(
  c: CanvasRenderingContext2D,
  actions: SurfaceAction[],
  label: string,
  box: [number, number, number, number],
  run: () => void,
  selected = false,
  font = 23,
) {
  const [x, y, w, h] = box;
  rect(c, x, y, w, h, selected ? colors.green : "#e6e8dc", 7);
  c.font = `500 ${font}px "DM Sans",sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = selected ? "#fffaf0" : colors.ink;
  c.fillText(label, x + w / 2, y + h / 2);
  c.textAlign = "left";
  c.textBaseline = "alphabetic";
  actions.push({ label, rect: box, run });
}
export function picture(
  c: CanvasRenderingContext2D,
  graphic: string,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  c.save();
  c.beginPath();
  c.rect(x, y, w, h);
  c.clip();
  rect(
    c,
    x,
    y,
    w,
    h,
    { bloom: "#dce2b9", orbit: "#d9c8e5", world: "#c7d9c2", stream: "#e5c8b0" }[
      graphic
    ] ?? "#dce2b9",
  );
  const cx = x + w / 2,
    cy = y + h / 2;
  if (graphic === "bloom") {
    c.fillStyle = "#d98754";
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      c.beginPath();
      c.ellipse(
        cx + Math.cos(a) * h * 0.18,
        cy + Math.sin(a) * h * 0.18,
        h * 0.16,
        h * 0.12,
        a,
        0,
        Math.PI * 2,
      );
      c.fill();
    }
    c.fillStyle = "#eee6a1";
    c.beginPath();
    c.arc(cx, cy, h * 0.12, 0, Math.PI * 2);
    c.fill();
  } else if (graphic === "orbit") {
    c.fillStyle = "#b59ac9";
    c.beginPath();
    c.arc(cx, cy, h * 0.29, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "#7f6398";
    c.lineWidth = 3;
    c.beginPath();
    c.ellipse(cx, cy, w * 0.32, h * 0.22, -0.3, 0, Math.PI * 2);
    c.stroke();
  } else if (graphic === "world") {
    rect(c, cx - h * 0.2, cy - h * 0.08, h * 0.4, h * 0.38, "#ede3c5");
    c.fillStyle = "#a47857";
    c.beginPath();
    c.moveTo(cx - h * 0.27, cy - h * 0.05);
    c.lineTo(cx, cy - h * 0.35);
    c.lineTo(cx + h * 0.27, cy - h * 0.05);
    c.fill();
    rect(c, cx - h * 0.05, cy + h * 0.1, h * 0.1, h * 0.2, "#718664", h * 0.04);
  } else {
    rect(c, x + w * 0.15, y + h * 0.12, w * 0.7, h * 0.76, "#f7ead9", 8);
    text(
      c,
      "be right back.",
      x + w * 0.24,
      y + h * 0.58,
      Math.min(w * 0.07, h * 0.16),
      "#9c735d",
      600,
    );
  }
  c.restore();
}
export function containedImage(
  c: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.min(w / image.naturalWidth, h / image.naturalHeight);
  const iw = image.naturalWidth * scale,
    ih = image.naturalHeight * scale;
  c.drawImage(image, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
}
