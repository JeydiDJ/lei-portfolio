// Shared dimensions keep the architecture, furniture, and interaction points aligned.
export const deskLayout = { width: 4.15, offsetZ: -1.35 };
export const chairLayout = {
  position: [-0.65, 0, 0.35] as [number, number, number],
  yaw: -0.18,
  seatHeight: 1.1,
};
export const adFrameLayouts = {
  portrait: {
    position: [-4.54, 3.4, -0.8] as [number, number, number],
    width: 1.1,
    height: 1.1 * Math.SQRT2,
  },
  square: {
    position: [-4.54, 3.4, 0.65] as [number, number, number],
    width: 0.9,
    height: 0.9,
  },
};
export const musicPlayerLayout = {
  position: [-1.75, 1.8, -0.84] as [number, number, number],
  yaw: Math.atan2(0.92, 2.54),
};
export const phoneLayout = {
  position: [-1.6, 1.464, 0.05] as [number, number, number],
  openLift: 0.006,
  rotation: [-Math.PI / 2, 0, -0.12] as [number, number, number],
  scale: 1.3,
  width: 0.158,
  height: 0.3246,
  depth: 0.0172,
};
export const monitorFocus: [number, number, number] = [
  -0.35,
  2.34,
  -1.21 + deskLayout.offsetZ,
];
export const cameraLimits = {
  minDistance: 2,
  maxDistance: 9.5,
  minAzimuth: -0.42,
  maxAzimuth: 0.65,
  minPolar: 1.3,
  maxPolar: 1.56,
};
export const mobileCameraLimits = {
  minDistance: 2.2,
  maxDistance: 11,
  // A 109° forward-facing arc keeps the unfinished back wall out of view.
  minAzimuth: -0.95,
  maxAzimuth: 0.95,
  minPolar: 1.2,
  maxPolar: 1.65,
};
export const roomLayout = {
  left: -4.7,
  right: 5.8,
  back: -3.5,
  front: 8.5,
  ceilingHeight: 5.2,
  ceilingLight: [-0.1, 5.02, -2.2] as [number, number, number],
  secondaryCeilingLight: [0.4, 5.02, 4.4] as [number, number, number],
};
export const windowLayout = {
  width: deskLayout.width,
  height: 2.65,
  frame: 0.1,
  centerY: 3.05,
};
export const windowOpening = {
  left: -windowLayout.width / 2 + windowLayout.frame,
  right: windowLayout.width / 2 - windowLayout.frame,
  bottom: windowLayout.centerY - windowLayout.height / 2 + windowLayout.frame,
  top: windowLayout.centerY + windowLayout.height / 2 - windowLayout.frame,
};
