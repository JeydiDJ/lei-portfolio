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
      {[0.8, 2.35, 3.9].flatMap((y) => {
        const spans =
          y > bottom && y < top
            ? [
                [roomLayout.left, left],
                [right, roomLayout.right],
              ]
            : [[roomLayout.left, roomLayout.right]];
        return spans.map(([a, b], i) => (
          <Box
            key={`${y}-${i}`}
            position={[(a + b) / 2, y, -3.36]}
            size={[b - a, 0.016, 0.012]}
            color="#dedbd4"
            radius={0}
            castShadow={false}
            receiveShadow
          />
        ));
      })}
      {Array.from({ length: 5 }, (_, i) => -4 + i * 2).flatMap((x) => {
        const spans =
          x > left && x < right
            ? [
                [0, bottom],
                [top, ceiling],
              ]
            : [[0, ceiling]];
        return spans.map(([a, b], i) => (
          <Box
            key={`${x}-${i}`}
            position={[x, (a + b) / 2, -3.36]}
            size={[0.014, b - a, 0.015]}
            color="#dedbd4"
            radius={0}
            castShadow={false}
            receiveShadow
          />
        ));
      })}
    </group>
  );
}
