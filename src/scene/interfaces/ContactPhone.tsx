import { useCallback, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, type Group } from "three";
import { Box, Cylinder } from "../Objects";
import { profile } from "../../data/portfolio";
import { phoneLayout } from "../layout";
import GlassPane from "../GlassPane";
import ScreenGlow from "../ScreenGlow";
import SelectionOutline from "../SelectionOutline";
import {
  useObjectSurface,
  useSurfaceImage,
  type SurfaceDraw,
} from "./useObjectSurface";
import { containedImage, rect, text } from "./drawing";
import { control, icon, status, os, osTime } from "./osDrawing";

/** Flat display, squared titanium frame, punch-hole camera, separate rear lenses and S Pen silo. */
export default function ContactPhone({
  active,
  onOpen,
  onClose,
}: {
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState("");
  const body = useRef<Group>(null);
  const flip = useRef<Group>(null);
  const progress = useRef(0);
  const gl = useThree((state) => state.gl);
  const shadowDelay = useRef(0);
  const reducedMotion = useRef(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotion.current = preference.matches;
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useFrame((_, delta) => {
    if (!body.current || !flip.current) return;
    const target = active ? 1 : 0;
    const remaining = target - progress.current;
    const wasMoving = Math.abs(remaining) > 0;
    progress.current = reducedMotion.current
      ? target
      : progress.current +
        Math.sign(remaining) * Math.min(Math.abs(remaining), delta / 1.1);
    const p = progress.current;
    const turn = MathUtils.smoothstep(p, 0.18, 0.82);
    const lift =
      MathUtils.smoothstep(p, 0, 0.18) * (1 - MathUtils.smoothstep(p, 0.82, 1));
    flip.current.rotation.y = Math.PI * (1 - turn);
    // Lift first, rotate the entire phone above the desk, then lower it onto its resting face.
    body.current.position.y =
      phoneLayout.position[1] +
      phoneLayout.openLift * MathUtils.smoothstep(p, 0.82, 1) +
      0.115 * lift;
    if (wasMoving) {
      shadowDelay.current -= delta;
      if (shadowDelay.current <= 0 || p === target) {
        gl.shadowMap.needsUpdate = true;
        shadowDelay.current = 0.12;
      }
    }
  });
  const logo = useSurfaceImage("/images/leila-logo.png");
  const portrait = useSurfaceImage(profile.idPortrait);
  const [page, setPage] = useState<"contact" | "list" | "home" | "recent">(
    "contact",
  );
  const [menu, setMenu] = useState(false);
  const [favorite, setFavorite] = useState(false);
  const { width, height, depth } = phoneLayout;
  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(""), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);
  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(`${label} copied`);
    } catch {
      setCopied("Copy unavailable");
    }
    setMenu(false);
  };
  const draw = useCallback<SurfaceDraw>(
    (c, actions, ui) => {
      const dark = page === "home" || page === "recent",
        ink = "#202124",
        muted = "#757575";
      rect(c, 0, 0, 720, 1480, dark ? "#38232d" : "#f2f2f2");
      c.save();
      c.scale(2, 2);
      status(c, 360, dark);
      c.restore();
      const center = (
        value: string,
        y: number,
        size: number,
        color = ink,
        weight = 500,
      ) => {
        c.font = `${weight} ${size}px "DM Sans",sans-serif`;
        c.textAlign = "center";
        c.textBaseline = "alphabetic";
        c.fillStyle = color;
        c.fillText(value, 360, y);
        c.textAlign = "left";
      };
      const avatar = (x: number, y: number, r: number) => {
        c.save();
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.clip();
        rect(c, x - r, y - r, r * 2, r * 2, "#ddd7d4");
        if (portrait) containedImage(c, portrait, x - r, y - r, r * 2, r * 2);
        c.restore();
      };
      const call = () => {
        window.location.href = `tel:+63${profile.phone.slice(1)}`;
      };
      const email = () => {
        window.location.href = `mailto:${profile.email}`;
      };
      if (page === "home") {
        text(
          c,
          osTime().replace(/\s*[AP]M$/i, ""),
          48,
          270,
          108,
          "#f4eff1",
          500,
        );
        text(c, "Leila's creative space", 55, 322, 30, "#cfbac4");
        if (logo) {
          c.save();
          c.globalAlpha = 0.35;
          containedImage(c, logo, 213, 485, 294, 330);
          c.restore();
        }
        control(
          c,
          actions,
          ui,
          "Open Contacts app",
          [64, 1100, 112, 112],
          () => setPage("list"),
          { icon: "person", iconSize: 56, fill: "#dc784e", radius: 27 },
        );
        control(c, actions, ui, "Email Leila", [304, 1100, 112, 112], email, {
          icon: "mail",
          iconSize: 56,
          fill: os.burgundy,
          radius: 27,
        });
        control(c, actions, ui, "Call Leila", [544, 1100, 112, 112], call, {
          icon: "phone",
          iconSize: 56,
          fill: "#328859",
          radius: 27,
        });
        for (const [label, x] of [
          ["Contacts", 74],
          ["Email", 325],
          ["Phone", 564],
        ] as const)
          text(c, label, x, 1260, 29, "#eee7ea");
      } else if (page === "recent") {
        center("Recent apps", 156, 40, "#f2e9ee");
        rect(c, 94, 238, 532, 917, "#f1ecea", 34);
        avatar(360, 420, 91);
        center(profile.fullName, 590, 40);
        center("Contacts", 675, 32, muted);
        actions.push({
          label: "Return to contact",
          rect: [94, 238, 532, 917],
          run: () => setPage("contact"),
        });
        control(
          c,
          actions,
          ui,
          "Close recent apps",
          [202, 1231, 316, 75],
          () => setPage("home"),
          { text: "Close all", dark: true, font: 34, radius: 36 },
        );
      } else if (page === "list") {
        control(
          c,
          actions,
          ui,
          "Back to home",
          [30, 86, 72, 72],
          () => setPage("home"),
          { icon: "back", iconSize: 40 },
        );
        text(c, "Contacts", 48, 304, 84, ink, 600);
        text(c, "1 contact", 53, 361, 30, muted);
        text(c, "My profile", 49, 483, 31, muted);
        rect(c, 28, 514, 664, 166, "#ffffff", 30);
        avatar(107, 597, 49);
        text(c, profile.fullName, 186, 582, 38, ink, 500);
        text(c, "Creative designer", 186, 627, 29, muted);
        actions.push({
          label: "View Leila's contact",
          rect: [28, 514, 664, 166],
          run: () => setPage("contact"),
        });
        center("Keep in touch", 900, 38, ink);
        center("Design, sound and ideas worth sharing.", 956, 28, muted);
      } else {
        control(
          c,
          actions,
          ui,
          "Back to contacts",
          [30, 86, 72, 72],
          () => setPage("list"),
          { icon: "back", iconSize: 40 },
        );
        control(
          c,
          actions,
          ui,
          favorite ? "Remove favorite" : "Add favorite",
          [540, 86, 72, 72],
          () => setFavorite((value) => !value),
          { icon: "star", iconSize: 38, selected: favorite },
        );
        control(
          c,
          actions,
          ui,
          "Contact options",
          [624, 86, 66, 72],
          () => setMenu(true),
          { icon: "more", iconSize: 38 },
        );
        rect(c, 28, 178, 664, 438, "#e7dfe1", 32);
        avatar(360, 296, 87);
        center(profile.fullName, 451, 47, ink, 600);
        center("Creative designer", 502, 30, muted);
        center(profile.location, 548, 28, muted);
        const quick = [
          ["Call", "phone", call, "#328859"],
          [
            "Message",
            "message",
            () => {
              window.location.href = `sms:+63${profile.phone.slice(1)}`;
            },
            "#3b76bd",
          ],
          ["Email", "mail", email, os.burgundy],
        ] as const;
        quick.forEach(([label, glyph, run, color], i) => {
          const x = 114 + i * 202;
          control(c, actions, ui, label, [x, 647, 88, 88], run, {
            icon: glyph,
            iconSize: 43,
            fill: color,
            radius: 44,
          });
          text(c, label, x + (label === "Message" ? -12 : 9), 779, 28, muted);
        });
        rect(c, 28, 815, 664, 382, "#ffffff", 30);
        const field = (
          label: string,
          value: string,
          y: number,
          action: string,
          run: () => void,
          size = 37,
        ) => {
          const hot = ui.hover(action);
          if (hot > 0) {
            c.save();
            c.globalAlpha = hot * 0.07;
            rect(c, 34, y - 52, 652, 118, ink, 20);
            c.restore();
          }
          text(c, label, 55, y - 14, 26, muted);
          text(c, value, 55, y + 37, size, ink, 500);
          icon(c, "chevron", 618, y + 3, 31, muted);
          actions.push({ label: action, rect: [34, y - 52, 652, 118], run });
        };
        field("Mobile", profile.phone, 875, `Call ${profile.phone}`, call);
        rect(c, 53, 938, 614, 1, "#ededed");
        field(
          "Email",
          profile.email,
          1000,
          `Email ${profile.email}`,
          email,
          32,
        );
        rect(c, 53, 1063, 614, 1, "#ededed");
        field(
          "LinkedIn",
          "Leila Parungo",
          1125,
          "Open Leila's LinkedIn",
          () => {
            window.open(profile.linkedIn, "_blank", "noopener,noreferrer");
          },
        );
        rect(c, 28, 1217, 664, 111, "#ffffff", 30);
        text(c, "Portfolio", 55, 1257, 25, muted);
        text(c, "leilaparungo.my.canva.site", 55, 1300, 31, ink, 500);
        actions.push({
          label: "Open Canva portfolio",
          rect: [28, 1217, 664, 111],
          run: () => {
            window.open(profile.website, "_blank", "noopener,noreferrer");
          },
        });
        control(
          c,
          actions,
          ui,
          copied || "Copy email",
          [180, 1341, 360, 59],
          () => {
            void copy(profile.email, "Email");
          },
          {
            text: copied || "Copy email",
            font: 30,
            fill: os.burgundy,
            radius: 29,
          },
        );
      }
      rect(c, 0, 1416, 720, 64, dark ? "#2b1c24" : "#f2f2f2");
      control(
        c,
        actions,
        ui,
        "Recent apps",
        [83, 1418, 88, 57],
        () => {
          setMenu(false);
          setPage("recent");
        },
        { icon: "recent", iconSize: 34, dark },
      );
      control(
        c,
        actions,
        ui,
        "Home",
        [316, 1418, 88, 57],
        () => {
          setMenu(false);
          setPage("home");
        },
        { icon: "home", iconSize: 34, dark },
      );
      control(
        c,
        actions,
        ui,
        "Back",
        [549, 1418, 88, 57],
        () => {
          if (menu) setMenu(false);
          else if (page === "contact") setPage("list");
          else if (page === "home") onClose();
          else setPage("home");
        },
        { icon: "back", iconSize: 35, dark },
      );
      if (menu) {
        c.save();
        c.globalAlpha = 0.38;
        rect(c, 0, 0, 720, 1480, "#000000");
        c.restore();
        actions.push({
          label: "Dismiss contact options",
          rect: [0, 0, 720, 1480],
          run: () => setMenu(false),
        });
        rect(c, 22, 1050, 676, 354, "#ffffff", 34);
        control(
          c,
          actions,
          ui,
          "Copy email address",
          [46, 1080, 628, 73],
          () => {
            void copy(profile.email, "Email");
          },
          { text: "Copy email address", font: 33, radius: 20 },
        );
        control(
          c,
          actions,
          ui,
          "Copy phone number",
          [46, 1162, 628, 73],
          () => {
            void copy(profile.phone, "Phone number");
          },
          { text: "Copy phone number", font: 33, radius: 20 },
        );
        control(
          c,
          actions,
          ui,
          "Return to room",
          [46, 1250, 628, 80],
          onClose,
          { text: "Return to room", font: 33, radius: 20 },
        );
      }
    },
    [active, onClose, page, menu, favorite, copied, logo, portrait],
  );
  const surface = useObjectSurface(720, 1480, active, draw, `${page}:${menu}`, {
    enabled: true,
    fps: 1,
  });
  return (
    <group
      name="Contact phone"
      ref={body}
      position={phoneLayout.position}
      rotation={phoneLayout.rotation}
      scale={phoneLayout.scale}
      userData={{ dynamic: true }}
      onClick={(event) => {
        event.stopPropagation();
        if (!active) onOpen();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        setHovered(true);
        if (!active) document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "";
      }}
    >
      <group ref={flip} rotation={[0, Math.PI, 0]}>
        <Box size={[width, height, depth]} color="#aaa4a1" radius={0.005} />
        <Box
          position={[0, 0, -depth / 2 - 0.0003]}
          size={[width - 0.004, height - 0.004, 0.0015]}
          color="#beb5b1"
          radius={0.004}
        />
        <Box
          position={[0, 0, depth / 2 + 0.0005]}
          size={[width - 0.003, height - 0.003, 0.0015]}
          color="#171719"
          radius={0.004}
        />
        <SelectionOutline
          size={[width + 0.003, height + 0.003, depth + 0.002]}
          visible={hovered && !active}
        />
        <mesh position={[0, 0, depth / 2 + 0.0015]} {...surface.events}>
          <planeGeometry args={[width - 0.009, height - 0.018]} />
          <meshBasicMaterial map={surface.texture} toneMapped={false} />
        </mesh>
        <group position={[0, 0, depth / 2 + 0.002]}>
          <GlassPane
            width={width - 0.009}
            height={height - 0.018}
            strength={active ? 0.12 : 0.32}
          />
        </group>
        <group position={[0, 0, depth / 2 + 0.001]}>
          <ScreenGlow
            width={width - 0.009}
            height={height - 0.018}
            strength={0.16}
            spill={false}
          />
        </group>
        <mesh position={[0, height / 2 - 0.018, depth / 2 + 0.0022]}>
          <circleGeometry args={[0.0026, 16]} />
          <meshBasicMaterial color="#111316" />
        </mesh>
        <Box
          position={[0, height / 2 - 0.004, depth / 2 + 0.0013]}
          size={[0.03, 0.0007, 0.001]}
          color="#363739"
          radius={0.0002}
          castShadow={false}
        />
        {/* Rear is -Z: +X appears on the left when viewing the back of the phone. */}
        {[0.111, 0.063, 0.015].map((y) => (
          <group key={y}>
            <Cylinder
              position={[0.045, y, -0.011]}
              rotation={[Math.PI / 2, 0, 0]}
              args={[0.014, 0.014, 0.005]}
              color="#77767a"
            />
            <Cylinder
              position={[0.045, y, -0.014]}
              rotation={[Math.PI / 2, 0, 0]}
              args={[0.0115, 0.0115, 0.002]}
              color="#151b23"
            />
          </group>
        ))}
        {[0.085, 0.045].map((y) => (
          <Cylinder
            key={y}
            position={[0.005, y, -0.0105]}
            rotation={[Math.PI / 2, 0, 0]}
            args={[0.008, 0.008, 0.003]}
            color="#252c34"
          />
        ))}
        <Cylinder
          position={[0.005, 0.115, -0.0098]}
          rotation={[Math.PI / 2, 0, 0]}
          args={[0.004, 0.004, 0.002]}
          color="#e2d7bd"
        />
        <Box
          position={[width / 2 + 0.0007, 0.045, 0]}
          size={[0.002, 0.044, 0.006]}
          color="#8f8d8b"
          radius={0.0006}
        />
        <Box
          position={[width / 2 + 0.0007, -0.01, 0]}
          size={[0.002, 0.026, 0.006]}
          color="#8f8d8b"
          radius={0.0006}
        />
        <Box
          position={[0, -height / 2 - 0.0003, 0]}
          size={[0.024, 0.001, 0.006]}
          color="#24252a"
          radius={0.0003}
        />
        <Cylinder
          position={[-0.047, -height / 2 - 0.0004, 0]}
          args={[0.004, 0.004, 0.001]}
          color="#777376"
        />
        {Array.from({ length: 6 }, (_, i) => (
          <Cylinder
            key={i}
            position={[0.025 + i * 0.004, -height / 2 - 0.0004, 0]}
            args={[0.0011, 0.0011, 0.001]}
            color="#434044"
          />
        ))}
      </group>
    </group>
  );
}
