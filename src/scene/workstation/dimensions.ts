// The existing 725mm-high desk establishes the scale: 2 scene units per metre.
export const unitsPerMetre = 2;
// Presentation scale is tuned against the room's stylized furniture and props.
export const workstationScale = { keyboard: 1.45, mouse: 1.5, tower: 1.3 };
export const towerYaw = 0;
export const gpuLift = 0.045;
// Rear I/O location in desk coordinates, including the case's display angle.
function towerPointToDesk(
  x: number,
  y: number,
  z: number,
): [number, number, number] {
  return [
    1.42 +
      workstationScale.tower *
        (x * Math.cos(towerYaw) + z * Math.sin(towerYaw)),
    1.45 + workstationScale.tower * (0.51 + y),
    -0.96 +
      workstationScale.tower *
        (-x * Math.sin(towerYaw) + z * Math.cos(towerYaw)),
  ];
}
export const towerRearPort = towerPointToDesk(-0.015, -0.104 + gpuLift, -0.45);
export const towerUsbPort = towerPointToDesk(0.136, -0.015, -0.452);
const displayWidth = 2.1;
export const monitorDimensions = {
  width: displayWidth,
  height: (displayWidth * 9) / 16,
  radius: 3.2,
  depth: 0.022 * unitsPerMetre,
};
export const keyboardDimensions = {
  width: 0.365 * unitsPerMetre,
  depth: 0.14 * unitsPerMetre,
  pitch: 0.01905 * unitsPerMetre,
};
export const mouseDimensions = {
  // Logitech PRO X Superlight 2 proportions, without manufacturer branding.
  width: 0.0635 * unitsPerMetre,
  length: 0.125 * unitsPerMetre,
  height: 0.04 * unitsPerMetre,
};
export const towerDimensions = {
  width: 0.22 * unitsPerMetre,
  height: 0.46 * unitsPerMetre,
  depth: 0.43 * unitsPerMetre,
};
