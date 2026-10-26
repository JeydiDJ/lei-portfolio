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
import { brand, brandButton, brandMark, rule } from "./brandDrawing";
import { rect, text, wrap } from "./drawing";

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
  const [copied, setCopied] = useState(false);
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
  const { width, height, depth } = phoneLayout;
  const draw = useCallback<SurfaceDraw>(
    (c, actions) => {
      rect(c, 0, 0, 720, 1480, brand.paper);
      if (active)
        brandButton(c, actions, "← Room", [48, 66, 166, 64], onClose, {
          font: 30,
        });
      text(c, "Contacts", 56, 235, 68, brand.ink, 600);
      brandMark(c, logo, 48, 294, 124);
      text(c, profile.fullName, 198, 346, 44, brand.ink, 600);
      text(c, "Creative designer", 198, 394, 31, brand.muted);
      text(c, profile.location, 198, 438, 27, brand.muted);
      rule(c, 56, 462, 608);
      wrap(
        c,
        "Have a project in mind? Let’s talk.",
        56,
        552,
        604,
        46,
        61,
        brand.ink,
      );
      text(c, "Email", 56, 748, 28, brand.muted);
      text(c, profile.email, 56, 807, 37, brand.burgundy, 500);
      text(c, "↗", 618, 806, 38, brand.burgundy);
      rule(c, 56, 852, 608);
      actions.push({
        label: `Email ${profile.email}`,
        rect: [48, 694, 624, 158],
        run: () => {
          window.location.href = `mailto:${profile.email}`;
        },
      });
      text(c, "LinkedIn", 56, 924, 28, brand.muted);
      text(c, "Leila Parungo", 56, 982, 40, brand.burgundy, 500);
      text(c, "↗", 618, 981, 38, brand.burgundy);
      rule(c, 56, 1027, 608);
      actions.push({
        label: "Open Leila’s LinkedIn profile",
        rect: [48, 869, 624, 158],
        run: () => {
          window.open(profile.linkedIn, "_blank", "noopener,noreferrer");
        },
      });
      text(c, "Phone", 56, 1080, 28, brand.muted);
      text(c, profile.phone, 56, 1138, 38, brand.burgundy, 500);
      rule(c, 56, 1174, 608);
      actions.push({
        label: `Call ${profile.phone}`,
        rect: [48, 1040, 624, 134],
        run: () => {
          window.location.href = `tel:+63${profile.phone.slice(1)}`;
        },
      });
      text(c, "Portfolio", 56, 1224, 28, brand.muted);
      text(
        c,
        "leilaparungo.my.canva.site ↗",
        56,
        1274,
        31,
        brand.burgundy,
        500,
      );
      actions.push({
        label: "Open Leila’s Canva portfolio",
        rect: [48, 1190, 624, 108],
        run: () => {
          window.open(profile.website, "_blank", "noopener,noreferrer");
        },
      });
      brandButton(
        c,
        actions,
        copied ? "Email copied" : "Copy email",
        [56, 1330, 608, 64],
        async () => {
          try {
            await navigator.clipboard.writeText(profile.email);
            setCopied(true);
          } catch {
            setCopied(false);
          }
        },
        { filled: true, font: 34 },
      );
      rect(c, 265, 1425, 190, 7, brand.ink, 4);
    },
    [active, copied, logo, onClose],
  );
  const surface = useObjectSurface(720, 1480, active, draw, String(copied));
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
