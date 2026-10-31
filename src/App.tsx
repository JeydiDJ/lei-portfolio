import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "./components/Icon";
import IntroSplash from "./components/IntroSplash";
import type { Section } from "./data/portfolio";
import usePhilippineDaylight from "./scene/usePhilippineDaylight";
const Studio = lazy(() => import("./scene/Studio"));

export default function App() {
  const [introOpen, setIntroOpen] = useState(true);
  const [introExiting, setIntroExiting] = useState(false);
  const beginIntroExit = useCallback(() => setIntroExiting(true), []);
  const [roomReady, setRoomReady] = useState(false);
  const [loading, setLoading] = useState({ progress: 0, errors: 0 });
  const markRoomReady = useCallback(() => setRoomReady(true), []);
  const finishIntro = useCallback(() => {
    setIntroOpen(false);
  }, []);
  useEffect(() => {
    if (!introExiting) return;
    const frame = requestAnimationFrame(() =>
      document
        .querySelector<HTMLButtonElement>(".room-sections button")
        ?.focus(),
    );
    return () => cancelAnimationFrame(frame);
  }, [introExiting]);
  const [section, setSection] = useState<Section | null>(null);
  const { night, twilight, sunDirection, moon } = usePhilippineDaylight();
  const [blindsDown, setBlindsDown] = useState(false);
  const [roomLight, setRoomLight] = useState(45);
  const [lightControlsOpen, setLightControlsOpen] = useState(false);
  const lightControls = useRef<HTMLDivElement>(null);
  const lightButton = useRef<HTMLButtonElement>(null);
  const toggleBlinds = useCallback(() => setBlindsDown((value) => !value), []);
  const [resetKey, setResetKey] = useState(0);
  const close = useCallback(() => setSection(null), []);
  // -1 frames the bulletin board; nonnegative values focus an individual ID.
  const [experienceIndex, setExperienceIndex] = useState(-1);
  useEffect(() => {
    if (section !== "experience") setExperienceIndex(-1);
  }, [section]);
  const openExperience = useCallback(
    (index: number) => {
      setExperienceIndex(section === "experience" ? index : -1);
      setSection("experience");
    },
    [section],
  );
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (lightControlsOpen) {
          setLightControlsOpen(false);
          lightButton.current?.focus();
        } else close();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close, lightControlsOpen]);
  useEffect(() => {
    if (!lightControlsOpen) return;
    const dismiss = (event: PointerEvent) => {
      if (!lightControls.current?.contains(event.target as Node)) {
        setLightControlsOpen(false);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [lightControlsOpen]);

  return (
    <div className={`app ${night > 0.5 ? "night" : ""}`}>
      <main
        className="room-page"
        aria-label="Lei’s creative room"
        inert={introOpen && !introExiting}
      >
        <div
          className="scene-container"
          role="region"
          aria-label="Interactive 3D creative studio. Drag to rotate, or use the labeled buttons to explore."
        >
          <Suspense
            fallback={
              <div className="loading-room">
                <span>✳</span>Making room for imagination…
              </div>
            }
          >
            <Studio
              onReady={markRoomReady}
              onLoading={setLoading}
              introOpen={introOpen}
              onSelect={setSection}
              night={night}
              twilight={twilight}
              sunDirection={sunDirection}
              moon={moon}
              roomLight={roomLight / 100}
              resetKey={resetKey}
              activeSection={section}
              blindsDown={blindsDown}
              onToggleBlinds={toggleBlinds}
              onClose={close}
              experienceIndex={experienceIndex}
              onExperience={openExperience}
            />
          </Suspense>
        </div>
        <div className="room-controls">
          <nav className="room-sections" aria-label="Room sections">
            <button
              aria-current={
                section === "work" || section === "tv" ? "page" : undefined
              }
              onClick={() => setSection("work")}
            >
              <span>01</span> Work
            </button>
            <button
              aria-current={section === "about" ? "page" : undefined}
              onClick={() => setSection("about")}
            >
              <span>02</span> About Me
            </button>
            <button
              aria-current={section === "experience" ? "page" : undefined}
              onClick={() => openExperience(-1)}
            >
              <span>03</span> Experience
            </button>
            <button
              aria-current={section?.startsWith("ads-") ? "page" : undefined}
              onClick={() => setSection("ads-portrait")}
            >
              <span>04</span> Ads
            </button>
            <button
              aria-current={section === "contact" ? "page" : undefined}
              onClick={() => setSection("contact")}
            >
              <span>05</span> Contact
            </button>
          </nav>
          <span
            className="drag-hint"
            style={{ visibility: lightControlsOpen ? "hidden" : undefined }}
          >
            <span className="mouse-camera-hint">
              {section
                ? "Use the controls on the object · Esc to return"
                : "Click an object · Drag to orbit · Scroll to zoom"}
            </span>
            <span className="touch-camera-hint">
              {section
                ? "Use the controls on the object"
                : "Two fingers to move · Pinch to zoom"}
            </span>
          </span>
          <div className="control-buttons">
            <button
              className="icon-button"
              aria-label="Open music player"
              title="Music player"
              onClick={() => setSection("music")}
            >
              <Icon name="sound" />
            </button>
            <button
              className="icon-button"
              aria-label="Open portfolio"
              onClick={() => setSection("work")}
            >
              <Icon name="grid" />
            </button>
            <button
              className="icon-button"
              aria-label={blindsDown ? "Raise blinds" : "Lower blinds"}
              title={blindsDown ? "Raise blinds" : "Lower blinds"}
              aria-pressed={blindsDown}
              onClick={toggleBlinds}
            >
              <Icon name="blinds" />
            </button>
            <div
              className="light-intensity-controls"
              ref={lightControls}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setLightControlsOpen(false);
                }
              }}
            >
              <button
                ref={lightButton}
                className="icon-button"
                aria-label="Light intensity"
                title="Light intensity"
                aria-expanded={lightControlsOpen}
                aria-controls="room-light-slider"
                onClick={() => setLightControlsOpen((value) => !value)}
              >
                <Icon name="light" />
              </button>
              {lightControlsOpen && (
                <label className="room-light-control" id="room-light-slider">
                  <span>
                    Room light{" "}
                    <output>{roomLight === 0 ? "Off" : `${roomLight}%`}</output>
                  </span>
                  <input
                    type="range"
                    aria-label="Room light"
                    aria-valuetext={
                      roomLight === 0 ? "Off" : `${roomLight}% brightness`
                    }
                    min={0}
                    max={100}
                    step={1}
                    value={roomLight}
                    onChange={(event) =>
                      setRoomLight(Number(event.target.value))
                    }
                  />
                  <span className="room-light-scale">
                    <span>Off</span>
                    <span>Maximum</span>
                  </span>
                </label>
              )}
            </div>
            <button
              className="icon-button"
              aria-label="Reset room view"
              onClick={() => {
                close();
                setResetKey((k) => k + 1);
              }}
            >
              <Icon name="reset" />
            </button>
          </div>
        </div>
      </main>
      {introOpen && (
        <IntroSplash
          onExitStart={beginIntroExit}
          ready={roomReady}
          loading={loading}
          onComplete={finishIntro}
        />
      )}
      {section && (
        <button className="object-return" onClick={close}>
          ← Back to room
        </button>
      )}
    </div>
  );
}
