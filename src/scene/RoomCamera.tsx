import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MathUtils, PerspectiveCamera, TOUCH, Vector3 } from "three";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Section } from "../data/portfolio";
import {
  cameraLimits,
  mobileCameraLimits,
  deskLayout,
  monitorFocus,
  roomLayout,
  musicPlayerLayout,
  adFrameLayouts,
  phoneLayout,
  tabletLayout,
  televisionLayout,
} from "./layout";

export default function RoomCamera({
  section,
  resetKey,
  experienceIndex,
}: {
  section: Section | null;
  resetKey: number;
  experienceIndex: number;
}) {
  const { camera, size } = useThree();
  const mobile = size.width < 700;
  // Ignore the ID reset that happens after Experience closes. Otherwise it can
  // restart the camera effect midway through restoring the saved room pose.
  const experienceFocus = section === "experience" ? experienceIndex : -1;
  const controls = useRef<OrbitControlsImpl>(null),
    moving = useRef(true);
  const destination = useRef(new Vector3()),
    target = useRef(new Vector3()),
    fov = useRef(48);
  const roomPose = useRef<{
    position: Vector3;
    target: Vector3;
    fov: number;
  } | null>(null);
  const previous = useRef<{
    section: Section | null;
    resetKey: number;
    mobile: boolean;
  } | null>(null);
  useEffect(() => {
    const prior = previous.current;
    const presetChanged = Boolean(prior && prior.resetKey !== resetKey);
    const viewportChanged = prior && prior.mobile !== mobile;
    if (presetChanged) roomPose.current = null;
    // Save only a settled free-exploration position. Opening another object while
    // the camera is still returning must not replace the room pose with a point
    // midway through that transition.
    if (section && !prior?.section && !presetChanged) {
      if (!moving.current || !roomPose.current) {
        roomPose.current = {
          position: (moving.current
            ? destination.current
            : camera.position
          ).clone(),
          // Free exploration orbits around the PC. Mobile panning may temporarily
          // move the controls target, but object close always restores this focus.
          target: new Vector3(...monitorFocus),
          fov:
            moving.current || !(camera instanceof PerspectiveCamera)
              ? fov.current
              : camera.fov,
        };
      }
    }
    previous.current = { section, resetKey, mobile };
    // A close, wide lens keeps the portrait-screen view in front of the chair.
    fov.current = section
      ? mobile && section === "work"
        ? 100
        : 40
      : mobile
        ? 80
        : 48;
    if (viewportChanged && roomPose.current) {
      roomPose.current.fov = mobile ? 80 : 48;
    }
    if (controls.current) {
      controls.current.minDistance = 0.15;
      controls.current.maxDistance = 20;
      controls.current.minPolarAngle = 0.01;
      controls.current.maxPolarAngle = Math.PI - 0.01;
      controls.current.minAzimuthAngle = -Infinity;
      controls.current.maxAzimuthAngle = Infinity;
      if (prior?.section !== section) {
        // Drain leftover orbit damping without changing the visible starting pose.
        const position = camera.position.clone();
        const lookAt = controls.current.target.clone();
        const damping = controls.current.enableDamping;
        controls.current.enableDamping = false;
        controls.current.update();
        controls.current.enableDamping = damping;
        camera.position.copy(position);
        controls.current.target.copy(lookAt);
      }
    }
    const fit = (width: number, height: number) =>
      (Math.max(height, width / (size.width / size.height)) /
        (2 * Math.tan((fov.current * Math.PI) / 360))) *
      1.24;
    if (section === "work") {
      target.current.set(...monitorFocus);
      target.current.z += 0.025;
      destination.current.set(
        target.current.x,
        target.current.y + 0.025,
        target.current.z + fit(2.1, 1.18125),
      );
    } else if (section === "ads-portrait" || section === "ads-square") {
      const layout =
        adFrameLayouts[section === "ads-portrait" ? "portrait" : "square"];
      target.current.set(
        layout.position[0] + 0.052,
        layout.position[1],
        layout.position[2],
      );
      destination.current.set(
        target.current.x + fit(layout.width + 0.2, layout.height + 0.2),
        target.current.y,
        target.current.z,
      );
    } else if (section === "tv") {
      const tv = televisionLayout;
      const distance = mobile ? fit(3.0, 1.78) : fit(3.4, 2.9);
      const x = tv.position[0] + Math.sin(tv.yaw) * tv.screenZ;
      const z = tv.position[2] + Math.cos(tv.yaw) * tv.screenZ;
      target.current.set(x, mobile ? tv.screenY : 1.45, z);
      destination.current.set(
        x + Math.sin(tv.yaw) * distance,
        target.current.y + 0.03,
        z + Math.cos(tv.yaw) * distance,
      );
    } else if (section === "about") {
      target.current.set(
        tabletLayout.position[0],
        tabletLayout.position[1] + tabletLayout.screenY,
        tabletLayout.position[2] + deskLayout.offsetZ,
      );
      const distance = fit(0.7, 0.44);
      destination.current.set(
        target.current.x - 0.03 * distance,
        target.current.y + distance,
        target.current.z + 0.13 * distance,
      );
    } else if (section === "contact") {
      const [x, y, z] = phoneLayout.position;
      target.current.set(
        x,
        y +
          phoneLayout.openLift +
          (phoneLayout.depth * phoneLayout.scale) / 2 +
          0.002,
        z + deskLayout.offsetZ,
      );
      const distance = fit(
        phoneLayout.width * phoneLayout.scale + 0.025,
        phoneLayout.height * phoneLayout.scale + 0.025,
      );
      destination.current.set(
        x,
        target.current.y + distance,
        target.current.z + distance * 0.11,
      );
    } else if (section === "music") {
      const [x, y, z] = musicPlayerLayout.position;
      const directionX = Math.sin(musicPlayerLayout.yaw);
      const directionZ = Math.cos(musicPlayerLayout.yaw);
      const [screenX, screenY, screenZ] = musicPlayerLayout.screen;
      const distance = mobile ? fit(0.43, 0.3) : fit(0.62, 0.6);
      target.current.set(
        x + directionZ * screenX + directionX * screenZ,
        y + (mobile ? screenY : 0),
        z + deskLayout.offsetZ - directionX * screenX + directionZ * screenZ,
      );
      destination.current.set(
        target.current.x + directionX * distance,
        target.current.y + 0.008,
        target.current.z + directionZ * distance,
      );
    } else if (section === "experience") {
      const overview = experienceFocus < 0;
      target.current.set(
        overview ? 3.25 : 3.25 - 0.55 + experienceFocus * 0.55,
        overview ? 2.95 : 2.83,
        -3.176,
      );
      destination.current.set(
        target.current.x,
        target.current.y,
        target.current.z + (overview ? fit(2.05, 1.5) : fit(0.43, 0.59)),
      );
    } else {
      const returning =
        prior?.section && !presetChanged ? roomPose.current : null;
      if (returning) {
        destination.current.copy(returning.position);
        target.current.copy(returning.target);
        fov.current = returning.fov;
      } else if (prior && !presetChanged && !viewportChanged) {
        // A resize while exploring should preserve the user's current orbit too.
        destination.current.copy(camera.position);
        target.current.copy(
          controls.current?.target ?? new Vector3(...monitorFocus),
        );
        if (camera instanceof PerspectiveCamera) fov.current = camera.fov;
      } else {
        destination.current.fromArray(mobile ? [0.8, 2.9, 6.8] : [4, 3.2, 4.6]);
        target.current.set(...monitorFocus);
      }
    }
    moving.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      camera.position.copy(destination.current);
      controls.current?.target.copy(target.current);
      controls.current?.update();
      if (camera instanceof PerspectiveCamera) {
        camera.fov = fov.current;
        camera.updateProjectionMatrix();
      }
      moving.current = false;
    }
  }, [
    camera,
    section,
    resetKey,
    experienceFocus,
    size.width,
    size.height,
    mobile,
  ]);
  useFrame((_, delta) => {
    if (!controls.current) return;
    if (moving.current) {
      const step = 1 - Math.exp(-delta * 5);
      camera.position.lerp(destination.current, step);
      controls.current.target.lerp(target.current, step);
      controls.current.update();
      if (
        camera.position.distanceTo(destination.current) < 0.003 &&
        controls.current.target.distanceTo(target.current) < 0.003
      ) {
        camera.position.copy(destination.current);
        controls.current.target.copy(target.current);
        moving.current = false;
      }
    }
    if (
      camera instanceof PerspectiveCamera &&
      Math.abs(camera.fov - fov.current) > 0.001
    ) {
      camera.fov = MathUtils.damp(camera.fov, fov.current, 5, delta);
      camera.updateProjectionMatrix();
    }
    const guided = !section && !moving.current;
    const limits = mobile ? mobileCameraLimits : cameraLimits;
    controls.current.minDistance = guided ? limits.minDistance : 0.15;
    controls.current.maxDistance = guided ? limits.maxDistance : 20;
    controls.current.minPolarAngle = guided ? limits.minPolar : 0.01;
    controls.current.maxPolarAngle = guided ? limits.maxPolar : Math.PI - 0.01;
    controls.current.minAzimuthAngle = guided ? limits.minAzimuth : -Infinity;
    controls.current.maxAzimuthAngle = guided ? limits.maxAzimuth : Infinity;
    if (guided && mobile) {
      // Two-finger pan can shift attention to either wall, within the studio.
      const focus = controls.current.target;
      const x = MathUtils.clamp(focus.x, -3.5, 3.8);
      const y = MathUtils.clamp(focus.y, 1.7, 3.5);
      // Travel along the furnished walls rather than moving the focus behind us.
      const z = monitorFocus[2];
      camera.position.x += x - focus.x;
      camera.position.y += y - focus.y;
      camera.position.z += z - focus.z;
      focus.set(x, y, z);
    }
    camera.position.x = Math.max(
      roomLayout.left + 0.25,
      Math.min(roomLayout.right - 0.25, camera.position.x),
    );
    camera.position.y = Math.max(
      0.3,
      Math.min(roomLayout.ceilingHeight - 0.2, camera.position.y),
    );
    camera.position.z = Math.max(
      roomLayout.back + 0.18,
      Math.min(roomLayout.front - 0.25, camera.position.z),
    );
    camera.lookAt(controls.current.target);
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={monitorFocus}
      enabled={!section}
      enablePan={mobile}
      panSpeed={mobile ? 1 : 0.65}
      screenSpacePanning
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN }}
      enableZoom
      minDistance={0.15}
      maxDistance={20}
      minPolarAngle={0.01}
      maxPolarAngle={Math.PI - 0.01}
      rotateSpeed={mobile ? 0.65 : 0.5}
      zoomSpeed={0.65}
      enableDamping
      dampingFactor={0.07}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}
