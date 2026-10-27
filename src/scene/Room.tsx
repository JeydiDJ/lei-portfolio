import { useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import type { Section } from "../data/portfolio";
import { Box, Plant } from "./Objects";
import DeskLamp from "./DeskLamp";
import StaticBatch from "./StaticBatch";
import CityWindow from "./CityWindow";
import FramedPhoto from "./FramedPhoto";
import RoomShell from "./RoomShell";
import DeskChair from "./DeskChair";
import RoomDetails, { Book, Rug } from "./RoomDetails";
import { deskLayout } from "./layout";
import Desk from "./Desk";

import Workstation from "./workstation/Workstation";
import Tablet from "./interfaces/Tablet";
import ExperienceCards from "./interfaces/ExperienceCards";
import MusicPlayer from "./interfaces/MusicPlayer";
import AdFrame from "./interfaces/AdFrame";
import ContactPhone from "./interfaces/ContactPhone";
import RoseVase from "./RoseVase";

export default function Room({
  onSelect,
  night,
  blindsDown,
  onToggleBlinds,
  activeSection,
  onClose,
  experienceIndex,
  onExperience,
}: {
  onSelect: (section: Section) => void;
  night: number;
  blindsDown: boolean;
  onToggleBlinds: () => void;
  activeSection: Section | null;
  onClose: () => void;
  experienceIndex: number;
  onExperience: (index: number) => void;
}) {
  const gl = useThree((state) => state.gl);
  // Refresh after suspended portrait/texture loading has committed the room meshes.
  useLayoutEffect(() => {
    gl.shadowMap.needsUpdate = true;
  }, [gl]);
  return (
    <StaticBatch>
      <RoomShell />
      <DeskChair />
      <RoomDetails />
      <CityWindow
        night={night}
        blindsDown={blindsDown}
        onToggleBlinds={onToggleBlinds}
      />
      <AdFrame
        format="portrait"
        active={activeSection === "ads-portrait"}
        onSelect={onSelect}
        onClose={onClose}
      />
      <AdFrame
        format="square"
        active={activeSection === "ads-square"}
        onSelect={onSelect}
        onClose={onClose}
      />
      <Rug />
      {/* The open desk keeps the existing workstation height and footprint. */}
      <group position={[0, 0, deskLayout.offsetZ]}>
        <Desk />
        <Workstation
          onNavigate={onSelect}
          onOpen={() => onSelect("work")}
          active={activeSection === "work"}
          onClose={onClose}
        />
        <Tablet
          onNavigate={onSelect}
          onContact={() => onSelect("contact")}
          active={activeSection === "about"}
          onOpen={() => onSelect("about")}
          onClose={onClose}
        />
        <MusicPlayer
          active={activeSection === "music"}
          onOpen={() => onSelect("music")}
          onClose={onClose}
        />
        <DeskLamp />
        <ContactPhone
          active={activeSection === "contact"}
          onOpen={() => onSelect("contact")}
          onClose={onClose}
        />
      </group>
      {/* Shelf, records, framed art and a small plant. */}
      <Box
        position={[-3.65, 2.4, -3.05]}
        size={[1.55, 0.1, 0.52]}
        color="#3b3440"
      />
      {["#bd8899", "#81949b", "#d1b894", "#656c8b", "#a2869e", "#b49d7e"].map(
        (color, i) => (
          <Book
            key={i}
            position={[-4.23 + i * 0.17, 2.76, -3.08]}
            height={0.6 + (i % 2) * 0.13}
            color={color}
            rotation={i === 5 ? -0.15 : 0}
          />
        ),
      )}
      <RoseVase />
      <FramedPhoto />
      <ExperienceCards
        activeIndex={activeSection === "experience" ? experienceIndex : null}
        onSelect={onExperience}
        onClose={onClose}
      />
      {/* Low cabinet and greenery give the room a lived-in silhouette. */}
      <Box
        position={[3.1, 0.57, -2.7]}
        size={[1.4, 1.1, 0.7]}
        color="#32313c"
      />
      {[-0.3, 0.3].map((x) => (
        <Box
          key={x}
          position={[3.1 + x, 0.62, -2.28]}
          size={[0.025, 0.22, 0.018]}
          color="#a89478"
        />
      ))}
      <Plant position={[3.15, 1.13, -2.7]} scale={1.1} />
      <Plant position={[-3.7, 0.02, -1.1]} scale={1.8} />
      <group position={[-3.2, 0.35, 0.9]} rotation={[0, -0.25, 0]}>
        <mesh castShadow scale={[1, 0.32, 0.85]}>
          <sphereGeometry args={[0.8, 32, 16]} />
          <meshStandardMaterial color="#ae8294" roughness={0.95} />
        </mesh>
        <Box
          position={[0, 0.16, -0.05]}
          rotation={[0, 0.15, 0.08]}
          size={[0.67, 0.14, 0.5]}
          color="#cdb1bd"
          radius={0.06}
        />
      </group>
    </StaticBatch>
  );
}
