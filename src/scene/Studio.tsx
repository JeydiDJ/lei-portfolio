import {
  Component,
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import Room from "./Room";
import type { Section } from "../data/portfolio";
import {
  experiences,
  profile,
  projects,
  skills,
  tools,
  education,
  learning,
} from "../data/portfolio";
import RoomCamera from "./RoomCamera";
import PerformanceBudget from "./PerformanceBudget";
import ObjectCallouts from "./ObjectCallouts";
import Lighting from "./Lighting";
import type { LunarSky } from "./lunarSky";
import { EnvironmentTransition } from "./EnvironmentTransition";
import SeasonalFeatures from "../seasonal/SeasonalFeatures";
import HalloweenRoom from "../seasonal/halloween/HalloweenRoom";
import SceneReady from "./SceneReady";

function SceneFallback({
  onSelect,
  onReady,
}: {
  onSelect: (section: Section) => void;
  onReady?: () => void;
}) {
  return (
    <div className="scene-fallback">
      {onReady && <SceneReady onReady={onReady} />}
      <span>✳</span>
      <p>This little room needs WebGL.</p>
      <div className="fallback-links">
        <button onClick={() => onSelect("work")}>Work</button>
        <button onClick={() => onSelect("about")}>About</button>
        <button onClick={() => onSelect("experience")}>Experience</button>
        <button onClick={() => onSelect("contact")}>Contact</button>
      </div>
      <div className="fallback-content">
        <h2>{profile.fullName}</h2>
        <p>{profile.introduction}</p>
        <p>{profile.bio}</p>
        <p>{profile.location}</p>
        <h2>Skills & tools</h2>
        <p>{[...skills, ...tools].join(" · ")}</p>
        <h2>Education</h2>
        <p>
          {education.degree} · {education.school} · {education.period}
        </p>
        <h2>Seminars & certification</h2>
        {learning.map((entry) => (
          <p key={entry.title}>
            {entry.title} · {entry.type} · {entry.period}
          </p>
        ))}
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a> ·{" "}
          <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          {" · "}
          <a href={`tel:+63${profile.phone.slice(1)}`}>{profile.phone}</a>
          {" · "}
          <a href={profile.website} target="_blank" rel="noopener noreferrer">
            Canva portfolio
          </a>
        </p>
        <h2>Selected work</h2>
        {projects.map((project) => (
          <article key={project.id}>
            <h3>{project.title}</h3>
            <p>
              {project.category} · {project.description}
            </p>
          </article>
        ))}
        <h2>Experience</h2>
        {experiences.map((entry) => (
          <article key={entry.title}>
            <h3>{entry.title}</h3>
            <p>
              {entry.organization} · {entry.role} · {entry.period} ·{" "}
              {entry.description}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
class SceneBoundary extends Component<
  {
    children: ReactNode;
    onSelect: (section: Section) => void;
    onReady: () => void;
  },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <SceneFallback
        onSelect={this.props.onSelect}
        onReady={this.props.onReady}
      />
    ) : (
      this.props.children
    );
  }
}
export default function Studio({
  onReady,
  onLoading,
  introOpen,
  onSelect,
  night,
  twilight,
  sunDirection,
  moon,
  roomLight,
  resetKey,
  activeSection,
  blindsDown,
  onToggleBlinds,
  onClose,
  experienceIndex,
  onExperience,
}: {
  onReady: () => void;
  onLoading: (loading: { progress: number; errors: number }) => void;
  introOpen: boolean;
  onSelect: (section: Section) => void;
  night: number;
  twilight: number;
  sunDirection: [number, number, number];
  moon: LunarSky;
  roomLight: number;
  resetKey: number;
  activeSection: Section | null;
  blindsDown: boolean;
  onToggleBlinds: () => void;
  onClose: () => void;
  experienceIndex: number;
  onExperience: (index: number) => void;
}) {
  const { progress, errors, active } = useProgress();
  const [painted, setPainted] = useState(false);
  const markPainted = useCallback(() => setPainted(true), []);
  useEffect(() => {
    if (painted && !active) onReady();
  }, [painted, active, onReady]);
  useEffect(() => {
    onLoading({ progress, errors: errors.length });
  }, [progress, errors, onLoading]);
  return (
    <SceneBoundary onSelect={onSelect} onReady={onReady}>
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [4, 3.2, 4.6], fov: 48, near: 0.05, far: 150 }}
        gl={{ antialias: true }}
        fallback={<SceneFallback onSelect={onSelect} />}
      >
        <PerformanceBudget />
        <SeasonalFeatures paused={introOpen || activeSection !== null}>
          <EnvironmentTransition
            night={night}
            twilight={twilight}
            sunDirection={sunDirection}
            moon={moon}
            roomLight={roomLight}
            blindsDown={blindsDown}
          >
            <color
              attach="background"
              args={[night > 0.5 ? "#25232e" : "#68606a"]}
            />
            <fog
              attach="fog"
              args={[night > 0.5 ? "#17233b" : "#b7cadc", 28, 95]}
            />
            <RoomCamera
              section={activeSection}
              resetKey={resetKey}
              experienceIndex={experienceIndex}
            />
            <Lighting />
            <Suspense fallback={null}>
              <Room
                onSelect={onSelect}
                night={night}
                blindsDown={blindsDown}
                onToggleBlinds={onToggleBlinds}
                activeSection={activeSection}
                onClose={onClose}
                experienceIndex={experienceIndex}
                onExperience={onExperience}
              />
              <ObjectCallouts
                activeSection={activeSection}
                onSelect={onSelect}
              />
              <HalloweenRoom />
              <SceneReady onReady={markPainted} />
            </Suspense>
          </EnvironmentTransition>
        </SeasonalFeatures>
      </Canvas>
    </SceneBoundary>
  );
}
