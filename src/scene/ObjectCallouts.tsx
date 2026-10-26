import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Section } from "../data/portfolio";
import { deskLayout, monitorFocus, phoneLayout } from "./layout";

type Marker = {
  point: Vector3;
  anchors: Vector3[];
  offset: [number, number];
  label: string;
  run: () => void;
};
type MarkerNode = Marker & {
  group: SVGGElement;
  leaders: { point: Vector3; path: SVGPathElement; dot: SVGCircleElement }[];
  button: HTMLButtonElement;
  width: number;
};

export default function ObjectCallouts({
  activeSection,
  onSelect,
}: {
  activeSection: Section | null;
  onSelect: (section: Section) => void;
}) {
  const { gl, camera, size } = useThree();
  const layer = useRef<HTMLDivElement | null>(null);
  const nodes = useRef<MarkerNode[]>([]);
  const projected = useMemo(() => new Vector3(), []);
  const focalPoint = useMemo(() => new Vector3(...monitorFocus), []);
  const dimensions = useRef("");
  const lastPose = useRef<number[]>([]);
  const lastHidden = useRef<boolean | null>(null);
  const markers = useMemo<Marker[]>(
    () => [
      {
        label: "Work",
        point: new Vector3(0.1, 2.9, -1.16 + deskLayout.offsetZ),
        anchors: [new Vector3(0.1, 2.9, -1.16 + deskLayout.offsetZ)],
        offset: [-80, -80],
        run: () => onSelect("work"),
      },
      {
        label: "About Me",
        point: new Vector3(1.3, 1.53, -1.35),
        anchors: [new Vector3(1.3, 1.53, -1.35)],
        offset: [65, 50],
        run: () => onSelect("about"),
      },
      {
        label: "Experience",
        point: new Vector3(3.25, 3.03, -3.176),
        anchors: [new Vector3(3.25, 3.03, -3.176)],
        offset: [10, -65],
        run: () => onSelect("experience"),
      },
      {
        label: "Contact",
        point: new Vector3(
          phoneLayout.position[0],
          1.49,
          phoneLayout.position[2] + deskLayout.offsetZ,
        ),
        anchors: [
          new Vector3(
            phoneLayout.position[0],
            1.49,
            phoneLayout.position[2] + deskLayout.offsetZ,
          ),
        ],
        offset: [-95, 45],
        run: () => onSelect("contact"),
      },
    ],
    [onSelect],
  );

  useEffect(() => {
    const root = document.createElement("div");
    root.className = "blueprint-callouts";
    root.setAttribute("role", "group");
    root.setAttribute("aria-label", "Interactive room objects");
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("aria-hidden", "true");
    root.appendChild(svg);
    nodes.current = markers.map((marker) => {
      const group = document.createElementNS(ns, "g");
      const leaders = marker.anchors.map((point) => {
        const path = document.createElementNS(ns, "path");
        const dot = document.createElementNS(ns, "circle");
        dot.setAttribute("r", "2.2");
        group.append(path, dot);
        return { point, path, dot };
      });
      svg.appendChild(group);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "blueprint-label";
      button.textContent = marker.label;
      button.onpointerdown = (event) => event.stopPropagation();
      button.onclick = (event) => {
        event.stopPropagation();
        marker.run();
      };
      button.onmouseenter = () => group.classList.add("is-hovered");
      button.onmouseleave = () => group.classList.remove("is-hovered");
      button.onfocus = () => group.classList.add("is-hovered");
      button.onblur = () => group.classList.remove("is-hovered");
      root.appendChild(button);
      return { ...marker, group, leaders, button, width: 0 };
    });
    gl.domElement.parentElement?.appendChild(root);
    layer.current = root;
    dimensions.current = "";
    lastPose.current = [];
    lastHidden.current = null;
    return () => {
      root.remove();
      nodes.current = [];
      layer.current = null;
    };
  }, [gl, markers]);

  useFrame(() => {
    const root = layer.current;
    if (!root) return;
    const hidden =
      Boolean(activeSection) || camera.position.distanceTo(focalPoint) < 4.5;
    if (lastHidden.current !== hidden) {
      root.style.opacity = hidden ? "0" : "1";
      root.setAttribute("aria-hidden", String(hidden));
      if (hidden)
        for (const node of nodes.current) {
          node.button.style.visibility = "hidden";
          node.button.tabIndex = -1;
        }
      lastHidden.current = hidden;
      lastPose.current = [];
    }
    if (hidden) return;
    camera.updateMatrixWorld();
    const world = camera.matrixWorld.elements;
    const projection = camera.projectionMatrix.elements;
    const previous = lastPose.current;
    const cameraChanged =
      previous.length === 0 ||
      previous[32] !== size.width ||
      previous[33] !== size.height ||
      world.some((value, i) => Math.abs(value - previous[i]) > 0.00001) ||
      projection.some(
        (value, i) => Math.abs(value - previous[i + 16]) > 0.00001,
      );
    // Leave the DOM untouched while the camera is still; moving fans/clock need no label work.
    if (!cameraChanged) return;
    lastPose.current = [...world, ...projection, size.width, size.height];
    const key = `${size.width}/${size.height}`;
    if (key !== dimensions.current) {
      for (const node of nodes.current) node.width = node.button.offsetWidth;
      dimensions.current = key;
    }
    const placed: { x: number; y: number; width: number }[] = [];
    const mobile = size.width < 700;
    const maxY = Math.max(28, size.height - (mobile ? 130 : 90));
    for (const node of nodes.current) {
      projected.copy(node.point).project(camera);
      const visible =
        Math.abs(projected.x) < 0.99 &&
        Math.abs(projected.y) < 0.98 &&
        projected.z > -1 &&
        projected.z < 1;
      node.group.style.display = visible ? "" : "none";
      node.button.style.visibility = visible ? "visible" : "hidden";
      node.button.tabIndex = visible ? 0 : -1;
      if (!visible) continue;
      const ax = (projected.x * 0.5 + 0.5) * size.width;
      const ay = (-projected.y * 0.5 + 0.5) * size.height;
      const factor = mobile ? 0.75 : 1;
      const width = node.width || 95;
      const x = Math.max(
        12,
        Math.min(size.width - width - 12, ax + node.offset[0] * factor),
      );
      const preferredY = Math.max(
        20,
        Math.min(maxY, ay + node.offset[1] * factor),
      );
      let y = preferredY;
      for (let attempt = 0; attempt < 25; attempt++) {
        const shift =
          attempt === 0
            ? 0
            : Math.ceil(attempt / 2) * 24 * (attempt % 2 ? 1 : -1);
        const candidate = Math.max(20, Math.min(maxY, preferredY + shift));
        const collides = placed.some(
          (other) =>
            x < other.x + other.width + 8 &&
            x + width + 8 > other.x &&
            candidate < other.y + 23 &&
            candidate + 23 > other.y,
        );
        if (!collides) {
          y = candidate;
          break;
        }
      }
      placed.push({ x, y, width });
      node.button.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      const baseline = y + 20;
      const labelOnRight = x + width / 2 > ax;
      const elbow = labelOnRight ? x : x + width;
      const end = labelOnRight ? x + width : x;
      for (const leader of node.leaders) {
        projected.copy(leader.point).project(camera);
        const inView =
          Math.abs(projected.x) < 0.99 &&
          Math.abs(projected.y) < 0.98 &&
          projected.z > -1 &&
          projected.z < 1;
        leader.path.style.display = inView ? "" : "none";
        leader.dot.style.display = inView ? "" : "none";
        if (!inView) continue;
        const px = (projected.x * 0.5 + 0.5) * size.width;
        const py = (-projected.y * 0.5 + 0.5) * size.height;
        leader.path.setAttribute(
          "d",
          `M ${px.toFixed(1)} ${py.toFixed(1)} L ${elbow.toFixed(1)} ${baseline.toFixed(1)} H ${end.toFixed(1)}`,
        );
        leader.dot.setAttribute("cx", px.toFixed(1));
        leader.dot.setAttribute("cy", py.toFixed(1));
      }
    }
  });
  return null;
}
