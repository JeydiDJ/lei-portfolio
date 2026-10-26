import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Matrix4,
  Quaternion,
  Vector3,
  SphereGeometry,
  CylinderGeometry,
  ConeGeometry,
  LatheGeometry,
  Vector2,
  CatmullRomCurve3,
  TubeGeometry,
  DoubleSide,
  Object3D,
  type SpotLight,
  type PointLight,
  type Group,
  type Mesh,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useSeasonalFeatures } from "../SeasonalFeatures";
import { roomLayout, chairLayout } from "../../scene/layout";
type V3 = [number, number, number];
type EntityPose = "ghost" | "ceiling" | "chair";

/** Separate batched head and body allow violent head motion without moving the torso. */
function buildApparition(pose: EntityPose) {
  const bodyParts: BufferGeometry[] = [],
    headParts: BufferGeometry[] = [];
  let parts = bodyParts;
  const add = (
    geometry: BufferGeometry,
    color: string,
    position: V3 = [0, 0, 0],
    scale: V3 = [1, 1, 1],
  ) => {
    const mesh = geometry.index ? geometry.toNonIndexed() : geometry.clone();
    geometry.dispose();
    mesh.applyMatrix4(
      new Matrix4().compose(
        new Vector3(...position),
        new Quaternion(),
        new Vector3(...scale),
      ),
    );
    const tint = new Color(color),
      colors: number[] = [];
    const normals = mesh.attributes.normal,
      positions = mesh.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const noise =
        Math.sin(
          positions.getX(i) * 131 +
            positions.getY(i) * 97 +
            positions.getZ(i) * 63,
        ) * 0.045;
      const shade = 0.57 + Math.max(0, normals.getZ(i)) * 0.37 + noise;
      colors.push(tint.r * shade, tint.g * shade, tint.b * shade);
    }
    mesh.setAttribute("color", new Float32BufferAttribute(colors, 3));
    mesh.deleteAttribute("uv");
    parts.push(mesh);
  };
  const oval = (position: V3, scale: V3, color: string) =>
    add(new SphereGeometry(1, 18, 12), color, position, scale);
  const bone = (from: V3, to: V3, radius: number, color: string) => {
    const a = new Vector3(...from),
      b = new Vector3(...to),
      d = b.clone().sub(a);
    const tube = new CylinderGeometry(radius * 0.7, radius, d.length(), 7);
    tube.applyQuaternion(
      new Quaternion().setFromUnitVectors(
        new Vector3(0, 1, 0),
        d.clone().normalize(),
      ),
    );
    add(tube, color, a.add(b).multiplyScalar(0.5).toArray() as V3);
  };
  const dress = new LatheGeometry(
    [
      new Vector2(0.4, -1.28),
      new Vector2(0.3, -0.8),
      new Vector2(0.19, -0.35),
      new Vector2(0.17, 0.08),
      new Vector2(0.25, 0.36),
      new Vector2(0.19, 0.47),
      new Vector2(0.055, 0.53),
    ],
    24,
  );
  const pos = dress.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const angle = Math.atan2(pos.getZ(i), pos.getX(i)),
      y = pos.getY(i);
    pos.setX(i, pos.getX(i) * (1 + Math.sin(angle * 9) * 0.075));
    pos.setZ(i, pos.getZ(i) * 0.7);
    if (y < -0.7) pos.setY(i, y + Math.sin(angle * 7) * 0.16);
    if (pose === "ceiling" && y < -0.25)
      pos.setY(i, -0.25 + (pos.getY(i) + 0.25) * 0.35);
    if (pose === "chair" && y < -0.2) {
      const fold = -pos.getY(i) - 0.2;
      pos.setY(
        i,
        -0.45 - Math.min(fold, 0.55) * 0.1 - Math.max(0, fold - 0.55) * 0.95,
      );
      pos.setZ(i, pos.getZ(i) + Math.min(1, fold / 0.5) * 0.52);
    }
  }
  dress.computeVertexNormals();
  add(dress, "#26232b");
  bone(
    [0, 0.45, 0],
    pose === "chair" ? [0, 0.91, -0.6] : [0.015, 0.64, 0.015],
    0.045,
    "#8f9183",
  );
  // A broken, asymmetric spine and dark binding marks break up the plain gown.
  for (let i = 0; i < 6; i++) {
    bone(
      [-0.08, 0.28 - i * 0.09, 0.135],
      [0.075, 0.23 - i * 0.09, 0.15],
      0.008,
      "#592e31",
    );
    bone(
      [0.06, 0.27 - i * 0.09, 0.145],
      [-0.05, 0.21 - i * 0.09, 0.147],
      0.005,
      "#181418",
    );
  }
  for (const side of [-1, 1]) {
    bone(
      [side * 0.19, 0.41, -0.02],
      [side * 0.32, 0.52, -0.08],
      0.017,
      "#56574e",
    );
    bone(
      [side * 0.32, 0.52, -0.08],
      [side * 0.35, 0.64, -0.1],
      0.008,
      "#878775",
    );
  }
  parts = headParts;
  oval([0.015, 0.76, 0.03], [0.128, 0.225, 0.1], "#a5a695");
  // A dislocated lower jaw hangs well below the skull, framing the long mouth void.
  oval([0.025, 0.47, 0.071], [0.088, 0.225, 0.077], "#939783");
  for (const side of [-1, 1]) {
    oval([side * 0.066, 0.796, 0.125], [0.064, 0.071, 0.033], "#07060c");
    bone(
      [side * 0.115, 0.872, 0.122],
      [side * 0.027, 0.855, 0.139],
      0.012,
      "#37382e",
    );
    oval([side * 0.094, 0.687, 0.095], [0.027, 0.043, 0.03], "#656b5c");
    bone(
      [side * 0.101, 0.67, 0.12],
      [side * 0.073, 0.34, 0.131],
      0.013,
      "#797d6a",
    );
    bone(
      [side * 0.06, 0.75, 0.133],
      [side * 0.049, 0.64, 0.135],
      0.006,
      "#3c3837",
    );
  }
  oval([0.014, 0.727, 0.139], [0.016, 0.055, 0.019], "#b1ad99");
  oval([0.024, 0.49, 0.146], [0.062, 0.176, 0.025], "#060409");
  // Jagged fissures in the face, rather than a clean mask-like surface.
  bone([-0.04, 0.95, 0.085], [-0.017, 0.91, 0.124], 0.006, "#3e3733");
  bone([-0.017, 0.91, 0.124], [-0.038, 0.867, 0.131], 0.004, "#332c2a");
  bone([0.08, 0.7, 0.127], [0.054, 0.659, 0.148], 0.005, "#4a3030");
  for (let i = 0; i < 7; i++)
    add(
      new ConeGeometry(0.0045, 0.021 + (i % 2) * 0.007, 4),
      "#b4ad91",
      [-0.004 + i * 0.009, 0.642, 0.153],
      [1, -1, 1],
    );
  for (let i = 0; i < 5; i++)
    add(new ConeGeometry(0.0045, 0.017 + (i % 2) * 0.006, 4), "#aaa58c", [
      0.005 + i * 0.01,
      0.33,
      0.168,
    ]);
  for (let i = 0; i < 22; i++) {
    const angle = (i / 22) * Math.PI * 2,
      x = Math.cos(angle) * 0.137,
      z = Math.sin(angle) * 0.096;
    const length = 0.36 + (i % 5) * 0.075,
      front = z > 0.03;
    if (front && Math.abs(x) < 0.065) continue;
    const path = new CatmullRomCurve3([
      new Vector3(x * 0.65, 0.95, z),
      new Vector3(x * 1.08, 0.81, z + 0.012),
      new Vector3(x * 1.25, 0.62, z + (front ? 0.045 : -0.015)),
      new Vector3(
        x * 1.35 + Math.sin(i) * 0.025,
        0.89 - length,
        z + Math.cos(i) * 0.035,
      ),
    ]);
    add(
      new TubeGeometry(path, 9, 0.009 + (i % 3) * 0.003, 4),
      i % 3 ? "#141217" : "#242127",
    );
  }
  parts = bodyParts;
  for (const side of [-1, 1]) {
    oval([side * 0.23, 0.35, 0], [0.085, 0.1, 0.085], "#302b30");
    const elbow: V3 =
      pose === "ceiling"
        ? [side * 0.48, 0.56, -0.25]
        : pose === "chair"
          ? [side * 0.39, -0.1, 0.15]
          : [side * 0.32, -0.08, side > 0 ? 0.12 : -0.035];
    const wrist: V3 =
      pose === "ceiling"
        ? [side * 0.64, 0.72, -0.45]
        : pose === "chair"
          ? [side * 0.48, -0.3, 0.36]
          : [side * 0.38, -0.51, side > 0 ? 0.26 : 0.1];
    bone([side * 0.25, 0.34, 0], elbow, 0.052, "#353137");
    bone(elbow, wrist, 0.032, "#777b6e");
    oval(
      [wrist[0], wrist[1] - 0.04, wrist[2]],
      [0.041, 0.065, 0.025],
      "#939785",
    );
    for (let finger = 0; finger < 4; finger++) {
      const x = wrist[0] + (finger - 1.5) * 0.018,
        length = 0.15 + (finger % 3) * 0.025;
      const start: V3 = [x, wrist[1] - 0.07, wrist[2]];
      const middle: V3 =
        pose === "ceiling"
          ? [x + side * 0.025, wrist[1] + 0.03, wrist[2] - 0.06]
          : [
              x + side * 0.015,
              wrist[1] - 0.15 - length * 0.45,
              wrist[2] + 0.04,
            ];
      const end: V3 =
        pose === "ceiling"
          ? [x + side * 0.04, wrist[1] + 0.09, wrist[2] - 0.1]
          : [x - side * 0.01, wrist[1] - 0.14 - length, wrist[2] + 0.08];
      bone(start, middle, 0.008, "#959584");
      bone(middle, end, 0.006, "#7e8073");
    }
    bone(
      [wrist[0] - side * 0.03, wrist[1] - 0.03, wrist[2]],
      [wrist[0] - side * 0.08, wrist[1] - 0.13, wrist[2] + 0.06],
      0.009,
      "#929482",
    );
    if (pose === "ceiling") {
      const knee: V3 = [side * 0.5, -0.75, -0.2],
        foot: V3 = [side * 0.58, -0.45, -0.52];
      bone([side * 0.14, -0.3, 0], knee, 0.052, "#353137");
      bone(knee, foot, 0.035, "#777b6e");
      for (let toe = 0; toe < 3; toe++)
        bone(
          foot,
          [
            foot[0] + side * (0.04 + toe * 0.018),
            foot[1] + 0.12,
            foot[2] - 0.025,
          ],
          0.009,
          "#929482",
        );
    }
  }
  const body = mergeGeometries(bodyParts, false)!;
  const head = mergeGeometries(headParts, false)!;
  head.translate(0, -0.52, 0);
  [...bodyParts, ...headParts].forEach((part) => part.dispose());
  return { body, head };
}

export default function Phantom() {
  const state = useSeasonalFeatures();
  const group = useRef<Group>(null),
    head = useRef<Group>(null);
  const bodyMesh = useRef<Mesh>(null),
    headMesh = useRef<Mesh>(null);
  const faceLight = useRef<SpotLight>(null),
    rimLight = useRef<PointLight>(null);
  const lightTarget = useMemo(() => new Object3D(), []);
  const lightPosition = useMemo(() => new Vector3(), []);
  const geometry = useMemo(() => {
    const ghost = buildApparition("ghost"),
      ceiling = buildApparition("ceiling"),
      chair = buildApparition("chair");
    ceiling.head.dispose();
    chair.head.dispose();
    return {
      ghost,
      ceiling: { body: ceiling.body, head: ghost.head },
      chair: { body: chair.body, head: ghost.head },
    };
  }, []);
  useEffect(
    () => () => {
      geometry.ghost.body.dispose();
      geometry.ghost.head.dispose();
      geometry.ceiling.body.dispose();
      geometry.chair.body.dispose();
    },
    [geometry],
  );
  useFrame(({ clock, camera }) => {
    if (!group.current || !head.current) return;
    const event = state.event;
    const active =
      event === "ghost" || event === "ceiling" || event === "chair";
    group.current.visible = active;
    if (faceLight.current) faceLight.current.intensity = active ? 3.2 : 0;
    if (rimLight.current) rimLight.current.intensity = active ? 0.25 : 0;
    if (!active) return;
    const pose = event as EntityPose,
      root = group.current;
    if (bodyMesh.current) bodyMesh.current.geometry = geometry[pose].body;
    if (headMesh.current) headMesh.current.geometry = geometry[pose].head;
    root.scale.setScalar(pose === "ceiling" ? 1 : 1.08);
    if (pose === "ceiling")
      root.position.set(0.4, roomLayout.ceilingHeight - 0.58, -0.3);
    else if (pose === "chair")
      root.position.set(
        chairLayout.position[0],
        chairLayout.seatHeight + 0.55,
        chairLayout.position[2],
      );
    else
      root.position.set(roomLayout.right - 0.58, 1.65, roomLayout.back + 0.58);
    const cameraYaw = Math.atan2(
      camera.position.x - root.position.x,
      camera.position.z - root.position.z,
    );
    // Seated and ceiling bodies face away; their heads turn back through 180 degrees.
    root.rotation.set(
      pose === "ceiling" ? Math.PI / 2 : 0,
      cameraYaw + (pose === "ghost" ? 0 : Math.PI),
      0,
      "YXZ",
    );
    root.updateWorldMatrix(true, false);
    head.current.position.set(
      0,
      pose === "chair" ? 0.91 : 0.52,
      pose === "chair" ? -0.6 : 0,
    );
    head.current.lookAt(camera.position);
    const t = clock.elapsedTime,
      frame = Math.floor(t * 23),
      burst = Math.sin(t * 2.7) > 0.25 ? 1 : 0.18;
    head.current.rotateX(Math.sin(frame * 2.31) * 0.11 * burst - 0.05);
    head.current.rotateY(Math.sin(frame * 4.79) * 0.18 * burst);
    head.current.rotateZ(
      (pose === "ceiling" ? Math.PI : 0.31) +
        Math.sin(frame * 3.73) * 0.23 * burst,
    );
    head.current.position.x = Math.sin(frame * 5.17) * 0.015 * burst;
    head.current.updateWorldMatrix(true, false);
    // The small pool of light follows the twisted face instead of lighting the body's back.
    lightTarget.position.copy(
      head.current.localToWorld(lightPosition.set(0, 0.1, 0.09)),
    );
    if (faceLight.current)
      faceLight.current.position.copy(
        head.current.localToWorld(lightPosition.set(0.32, 0.5, 0.85)),
      );
    if (rimLight.current)
      rimLight.current.position.copy(
        root.localToWorld(lightPosition.set(-0.42, 0.35, -0.38)),
      );
  });
  return (
    <group userData={{ dynamic: true }}>
      <group
        ref={group}
        visible={false}
        userData={{ dynamic: true }}
        name="Halloween entity"
      >
        <mesh ref={bodyMesh} geometry={geometry.ghost.body} raycast={() => {}}>
          <meshStandardMaterial
            vertexColors
            side={DoubleSide}
            roughness={0.98}
            metalness={0}
          />
        </mesh>
        <group ref={head} position={[0, 0.52, 0]} scale={1.12}>
          <mesh
            ref={headMesh}
            geometry={geometry.ghost.head}
            raycast={() => {}}
          >
            <meshStandardMaterial
              vertexColors
              side={DoubleSide}
              roughness={0.9}
              metalness={0}
            />
          </mesh>
        </group>
      </group>
      <primitive object={lightTarget} />
      <spotLight
        ref={faceLight}
        target={lightTarget}
        intensity={0}
        color="#b9c5ca"
        angle={0.48}
        penumbra={0.85}
        decay={2}
        distance={1.65}
      />
      <pointLight
        ref={rimLight}
        intensity={0}
        color="#738ba6"
        decay={2}
        distance={1.8}
      />
    </group>
  );
}
