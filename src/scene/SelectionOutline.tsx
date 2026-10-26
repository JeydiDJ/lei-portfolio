import { Outlines, RoundedBox } from "@react-three/drei";

/** An outline-only shell: it never masks the model or intercepts clicks. */
export default function SelectionOutline({
  size,
  position = [0, 0, 0],
  visible,
}: {
  size: [number, number, number];
  position?: [number, number, number];
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <RoundedBox
      args={size}
      position={position}
      radius={0.012}
      smoothness={2}
      raycast={() => {}}
    >
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        colorWrite={false}
      />
      <Outlines
        color="#ffd6e7"
        thickness={2}
        screenspace={false}
        toneMapped={false}
      />
    </RoundedBox>
  );
}
