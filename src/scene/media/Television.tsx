import { useState } from "react";
import { televisionLayout as tv } from "../layout";
import GlassPane from "../GlassPane";
import ScreenGlow from "../ScreenGlow";
import MediaCabinet from "./MediaCabinet";
import NintendoSwitch from "./NintendoSwitch";
import TelevisionHardware from "./TelevisionHardware";
import useTelevisionScreen, { type TVMode } from "./useTelevisionScreen";
import MediaLighting from "./MediaLighting";
import BeanBag from "./BeanBag";

export default function Television({
  active,
  onOpen,
  onClose,
}: {
  active: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [mode, setMode] = useState<TVMode>("videos");
  const surface = useTelevisionScreen(active, mode, setMode, onClose);
  const videoWidth = Math.min(tv.width, tv.height * surface.video.aspect);
  const videoHeight = Math.min(tv.height, tv.width / surface.video.aspect);
  return (
    <group
      position={tv.position}
      rotation={[0, tv.yaw, 0]}
      name="TV and Nintendo Switch media corner"
      userData={{ dynamic: true }}
    >
      <MediaCabinet />
      <BeanBag />
      <MediaLighting />
      <NintendoSwitch
        onOpen={() => {
          setMode("games");
          onOpen();
        }}
      />
      <group
        onClick={(e) => {
          e.stopPropagation();
          if (!active) {
            setMode("videos");
            onOpen();
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (!active) document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "";
        }}
      >
        <TelevisionHardware hovered={hovered} active={active}>
          <mesh position={[0, 0, tv.screenZ - 0.001]}>
            <planeGeometry args={[tv.width, tv.height]} />
            <meshBasicMaterial color="#050505" />
          </mesh>
          {surface.showVideo && surface.video.texture && (
            <mesh position={[0, 0, tv.screenZ]}>
              <planeGeometry args={[videoWidth, videoHeight]} />
              <meshBasicMaterial
                map={surface.video.texture}
                toneMapped={false}
              />
            </mesh>
          )}
          <mesh position={[0, 0, tv.screenZ + 0.001]} {...surface.events}>
            <planeGeometry args={[tv.width, tv.height]} />
            <meshBasicMaterial
              map={surface.texture}
              transparent
              toneMapped={false}
            />
          </mesh>
          <group position={[0, 0, tv.screenZ - 0.0005]}>
            <ScreenGlow
              width={tv.width}
              height={tv.height}
              strength={active ? 0.18 : 0.1}
              spill={false}
            />
          </group>
          <group position={[0, 0, tv.screenZ + 0.002]}>
            <GlassPane
              width={tv.width}
              height={tv.height}
              strength={active ? 0.13 : 0.26}
            />
          </group>
        </TelevisionHardware>
      </group>
    </group>
  );
}
