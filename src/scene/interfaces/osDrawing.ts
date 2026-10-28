import { rect, text } from "./drawing";
import type { SurfaceAction, SurfaceUI } from "./useObjectSurface";

export type IconName =
  | "play"
  | "pause"
  | "back"
  | "close"
  | "folder"
  | "grid"
  | "list"
  | "person"
  | "music"
  | "mail"
  | "restart"
  | "repeat"
  | "volume"
  | "heart"
  | "school"
  | "spark"
  | "chevron"
  | "phone"
  | "message"
  | "more"
  | "home"
  | "star"
  | "recent"
  | "expand";
export const os = {
  ink: "#272326",
  muted: "#80777b",
  paper: "#f6f3f0",
  line: "#ded8d5",
  burgundy: "#781b20",
};
export function icon(
  c: CanvasRenderingContext2D,
  name: IconName,
  x: number,
  y: number,
  size = 20,
  color = os.ink,
) {
  c.save();
  c.translate(x, y);
  c.scale(size / 24, size / 24);
  c.strokeStyle = color;
  c.fillStyle = color;
  c.lineWidth = 1.7;
  c.lineCap = "round";
  c.lineJoin = "round";
  const path = (points: number[][], close = false, fill = false) => {
    c.beginPath();
    points.forEach(([a, b], i) => (i ? c.lineTo(a, b) : c.moveTo(a, b)));
    if (close) c.closePath();
    fill ? c.fill() : c.stroke();
  };
  if (name === "expand") {
    path([
      [9, 3],
      [3, 3],
      [3, 9],
    ]);
    path([
      [15, 3],
      [21, 3],
      [21, 9],
    ]);
    path([
      [3, 15],
      [3, 21],
      [9, 21],
    ]);
    path([
      [15, 21],
      [21, 21],
      [21, 15],
    ]);
  } else if (name === "star") {
    path(
      Array.from({ length: 10 }, (_, i) => {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const radius = i % 2 ? 4.5 : 10;
        return [12 + Math.cos(angle) * radius, 12 + Math.sin(angle) * radius];
      }),
      true,
    );
  } else if (name === "phone") {
    c.beginPath();
    c.moveTo(5, 3);
    c.lineTo(9, 3);
    c.lineTo(11, 8);
    c.lineTo(8, 10);
    c.bezierCurveTo(9, 13, 11, 15, 14, 16);
    c.lineTo(16, 13);
    c.lineTo(21, 15);
    c.lineTo(21, 19);
    c.bezierCurveTo(16, 25, 0, 10, 5, 3);
    c.closePath();
    c.stroke();
  } else if (name === "message")
    path(
      [
        [3, 4],
        [21, 4],
        [21, 17],
        [9, 17],
        [4, 21],
        [4, 17],
        [3, 17],
      ],
      true,
    );
  else if (name === "more") {
    for (const y of [5, 12, 19]) {
      c.beginPath();
      c.arc(12, y, 1.5, 0, Math.PI * 2);
      c.fill();
    }
  } else if (name === "home") {
    c.beginPath();
    c.roundRect(5, 5, 14, 14, 4);
    c.stroke();
  } else if (name === "recent") {
    for (const x of [6, 12, 18])
      path([
        [x, 5],
        [x, 19],
      ]);
  } else if (name === "play")
    path(
      [
        [7, 4],
        [20, 12],
        [7, 20],
      ],
      true,
      true,
    );
  else if (name === "pause") {
    c.fillRect(6, 5, 4, 14);
    c.fillRect(14, 5, 4, 14);
  } else if (name === "back") {
    path([
      [15, 5],
      [8, 12],
      [15, 19],
    ]);
  } else if (name === "chevron")
    path([
      [9, 5],
      [16, 12],
      [9, 19],
    ]);
  else if (name === "close") {
    path([
      [6, 6],
      [18, 18],
    ]);
    path([
      [18, 6],
      [6, 18],
    ]);
  } else if (name === "folder")
    path([
      [3, 7],
      [10, 7],
      [12, 10],
      [21, 10],
      [21, 20],
      [3, 20],
      [3, 7],
      [3, 5],
      [9, 5],
      [11, 7],
      [20, 7],
      [20, 10],
    ]);
  else if (name === "grid") {
    for (const a of [4, 14]) for (const b of [4, 14]) c.strokeRect(a, b, 6, 6);
  } else if (name === "list") {
    for (const b of [6, 12, 18]) {
      c.fillRect(3, b - 1, 2, 2);
      path([
        [9, b],
        [21, b],
      ]);
    }
  } else if (name === "person") {
    c.beginPath();
    c.arc(12, 7, 4, 0, Math.PI * 2);
    c.stroke();
    c.beginPath();
    c.arc(12, 21, 7, Math.PI, 0);
    c.stroke();
  } else if (name === "music") {
    path([
      [9, 17],
      [9, 5],
      [20, 3],
      [20, 15],
    ]);
    c.beginPath();
    c.ellipse(6, 18, 3, 2.5, -0.3, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(17, 16, 3, 2.5, -0.3, 0, Math.PI * 2);
    c.fill();
  } else if (name === "mail") {
    c.strokeRect(3, 5, 18, 14);
    path([
      [3, 6],
      [12, 13],
      [21, 6],
    ]);
  } else if (name === "restart") {
    c.beginPath();
    c.arc(12, 12, 8, -Math.PI / 2, Math.PI * 1.15);
    c.stroke();
    path([
      [5, 4],
      [5, 9],
      [10, 9],
    ]);
  } else if (name === "repeat") {
    path([
      [4, 9],
      [4, 6],
      [20, 6],
      [17, 3],
    ]);
    path([
      [20, 15],
      [20, 18],
      [4, 18],
      [7, 21],
    ]);
  } else if (name === "volume") {
    path(
      [
        [3, 9],
        [7, 9],
        [12, 5],
        [12, 19],
        [7, 15],
        [3, 15],
      ],
      true,
    );
    c.beginPath();
    c.arc(12, 12, 7, -0.7, 0.7);
    c.stroke();
    c.beginPath();
    c.arc(12, 12, 10, -0.7, 0.7);
    c.stroke();
  } else if (name === "heart") {
    c.beginPath();
    c.moveTo(12, 20);
    c.bezierCurveTo(1, 13, 0, 6, 6, 4);
    c.bezierCurveTo(9, 3, 12, 6, 12, 7);
    c.bezierCurveTo(14, 2, 21, 3, 22, 8);
    c.bezierCurveTo(23, 13, 16, 18, 12, 20);
    c.stroke();
  } else if (name === "school") {
    path(
      [
        [2, 9],
        [12, 3],
        [22, 9],
        [12, 15],
      ],
      true,
    );
    path([
      [6, 12],
      [6, 18],
      [12, 21],
      [18, 18],
      [18, 12],
    ]);
  } else if (name === "spark") {
    path(
      [
        [12, 2],
        [15, 9],
        [22, 12],
        [15, 15],
        [12, 22],
        [9, 15],
        [2, 12],
        [9, 9],
      ],
      true,
    );
  }
  c.restore();
}
export function control(
  c: CanvasRenderingContext2D,
  actions: SurfaceAction[],
  ui: SurfaceUI,
  label: string,
  box: [number, number, number, number],
  run: SurfaceAction["run"],
  options: {
    icon?: IconName;
    text?: string;
    selected?: boolean;
    dark?: boolean;
    fill?: string;
    font?: number;
    radius?: number;
    iconSize?: number;
  } = {},
) {
  const [x, y, w, h] = box,
    hot = ui.hover(label),
    dark = options.dark;
  if (options.fill) rect(c, x, y, w, h, options.fill, options.radius ?? 6);
  else if (options.selected)
    rect(c, x, y, w, h, dark ? "#333035" : "#e4d5d4", 6);
  if (hot > 0.01) {
    c.save();
    c.globalAlpha = hot * (ui.pressed === label ? 0.22 : 0.1);
    rect(c, x, y, w, h, dark ? "#ffffff" : "#781b20", options.radius ?? 6);
    c.restore();
  }
  const color = options.fill
    ? "#ffffff"
    : options.selected
      ? dark
        ? "#ffffff"
        : os.burgundy
      : dark
        ? "#e9e5e7"
        : os.ink;
  if (options.icon)
    icon(
      c,
      options.icon,
      x + (options.text ? 10 : (w - (options.iconSize ?? 20)) / 2),
      y + (h - (options.iconSize ?? 20)) / 2,
      options.iconSize ?? 20,
      color,
    );
  if (options.text) {
    c.font = `500 ${options.font ?? 18}px "DM Sans",sans-serif`;
    c.fillStyle = color;
    c.textAlign = options.icon ? "left" : "center";
    c.textBaseline = "middle";
    c.fillText(
      options.text,
      options.icon ? x + (options.iconSize ?? 20) + 18 : x + w / 2,
      y + h / 2,
    );
    c.textAlign = "left";
    c.textBaseline = "alphabetic";
  }
  if (ui.focused === label) {
    c.strokeStyle = dark ? "#d1abb2" : os.burgundy;
    c.lineWidth = 2;
    c.strokeRect(x + 2, y + 2, w - 4, h - 4);
  }
  actions.push({ label, rect: box, run, selected: options.selected });
}
const clock = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});
export const osTime = () => clock.format(new Date());
export function status(
  c: CanvasRenderingContext2D,
  width: number,
  dark = false,
) {
  const color = dark ? "#ece7e8" : os.ink;
  text(c, osTime(), 20, 19, 14, color, 600);
  c.strokeStyle = color;
  c.lineWidth = 1.5;
  c.strokeRect(width - 44, 8, 22, 10);
  rect(c, width - 41, 11, 16, 4, color, 1);
  rect(c, width - 20, 11, 2, 4, color);
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    c.arc(width - 65, 18, 4 + i * 3, -Math.PI * 0.8, -Math.PI * 0.2);
    c.stroke();
  }
}
