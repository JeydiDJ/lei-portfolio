import { Box } from "./Objects";
import { roomLayout, windowOpening } from "./layout";

// The window is an opening in the architecture, rather than a surface on a wall.
export default function BackWall() {
  const { left, right, bottom, top } = windowOpening;
  const ceiling = roomLayout.ceilingHeight;
  return (
    <group>
      <Box
        position={[(roomLayout.left + left) / 2, ceiling / 2, -3.5]}
        size={[left - roomLayout.left, ceiling, 0.25]}
        color="#f4f1eb"
        radius={0}
      />
      <Box
        position={[(right + roomLayout.right) / 2, ceiling / 2, -3.5]}
        size={[roomLayout.right - right, ceiling, 0.25]}
        color="#f4f1eb"
        radius={0}
      />
      <Box
        position={[(left + right) / 2, bottom / 2, -3.5]}
        size={[right - left, bottom, 0.25]}
        color="#f4f1eb"
        radius={0}
      />
      <Box
        position={[(left + right) / 2, (top + ceiling) / 2, -3.5]}
        size={[right - left, ceiling - top, 0.25]}
        color="#f4f1eb"
        radius={0}
      />
    </group>
  );
}
