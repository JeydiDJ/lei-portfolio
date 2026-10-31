import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "../styles/intro.css";

const sections = [
  ["Work", "Monitor & TV", "Design, games, videos and more."],
  ["About Me", "Tablet", "A little about the creative behind the room."],
  ["Experience", "ID cards", "The roles and projects along the way."],
  ["Ads", "Wall frames", "Explore the advertising collections."],
  ["Contact", "Phone", "Let’s make something together."],
];

export default function IntroSplash({
  ready,
  loading,
  onComplete,
  onExitStart,
}: {
  ready: boolean;
  loading: { progress: number; errors: number };
  onComplete: () => void;
  onExitStart: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const blackout = useRef<HTMLDivElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  const exiting = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const [step, setStep] = useState(0);
  const { progress, errors } = loading;
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const cover = blackout.current;
    const reveal = gsap.to(cover, {
      opacity: ready ? 0 : 1,
      duration: ready && !reduced ? 1.25 : 0,
      ease: "power2.inOut",
    });
    return () => {
      reveal.kill();
    };
  }, [ready, reduced]);
  const [target, setTarget] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
    compact: boolean;
  } | null>(null);
  useEffect(() => {
    const update = () => {
      const element = document.querySelector(
        step === 1 ? ".control-buttons" : ".room-sections",
      );
      if (step === 0 || !element) {
        setTarget(null);
        return;
      }
      const bounds = element.getBoundingClientRect();
      setTarget({
        x: bounds.x - 8,
        y: bounds.y - 8,
        w: bounds.width + 16,
        h: bounds.height + 16,
        compact: window.innerWidth <= 600,
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [step, ready]);
  useEffect(() => {
    if (!target) return;
    const animation = gsap.context(() => {
      gsap
        .timeline()
        .fromTo(
          ".intro-focus-outline",
          { opacity: 0 },
          { opacity: 1, duration: reduced ? 0 : 0.35 },
        )
        .fromTo(
          ".intro-leader",
          { strokeDashoffset: 500 },
          {
            strokeDashoffset: 0,
            duration: reduced ? 0 : 0.9,
            ease: "power2.out",
          },
        )
        .fromTo(
          ".intro-pointer-label",
          { opacity: 0 },
          { opacity: 1, duration: reduced ? 0 : 0.3 },
        );
    }, root);
    return () => animation.revert();
  }, [target, reduced]);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    nextButton.current?.focus();
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-intro-reveal]",
        { opacity: 0, y: reduced ? 0 : 18 },
        {
          opacity: 1,
          y: 0,
          duration: reduced ? 0 : 0.65,
          stagger: reduced ? 0 : 0.09,
          ease: "power2.out",
        },
      );
      if (step === 1 && !reduced) {
        gsap.to(".intro-gesture-path", {
          strokeDashoffset: 0,
          duration: 1.8,
          repeat: -1,
          repeatDelay: 1,
          ease: "power1.inOut",
        });
      }
    }, content);
    // Leave reading and progression under the visitor's control.
    return () => context.revert();
  }, [step, reduced]);

  const changeStep = (next: number) => {
    gsap.to(content.current, {
      opacity: 0,
      duration: reduced ? 0 : 0.18,
      onComplete: () => {
        setStep(next);
        gsap.set(content.current, { opacity: 1 });
      },
    });
  };
  const enter = () => {
    if (!ready || exiting.current) return;
    exiting.current = true;
    setLeaving(true);
    onExitStart();
    // Release the canvas immediately; the visual fade must not block dragging.
    gsap.set(root.current, { pointerEvents: "none" });
    gsap.to(root.current, {
      opacity: 0,
      duration: reduced ? 0 : 0.65,
      ease: "power2.inOut",
      onComplete,
    });
  };

  useEffect(
    () => () => {
      gsap.killTweensOf(root.current);
      gsap.killTweensOf(content.current);
    },
    [],
  );

  return (
    <div
      ref={root}
      className={`intro-splash intro-step-${step}`}
      role="dialog"
      aria-modal={!leaving}
      inert={leaving}
      aria-labelledby="intro-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          enter();
        }
        if (event.key === "Tab") {
          const buttons = Array.from(
            root.current!.querySelectorAll<HTMLButtonElement>(
              "button:not(:disabled)",
            ),
          );
          const first = buttons[0],
            last = buttons[buttons.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }}
    >
      <div ref={blackout} className="intro-blackout" aria-hidden="true" />
      <svg
        className="intro-spotlight"
        width="100%"
        height="100%"
        aria-hidden="true"
      >
        <defs>
          <mask id="intro-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {target && (
              <rect
                x={target.x}
                y={target.y}
                width={target.w}
                height={target.h}
                rx="5"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="black"
          fillOpacity=".76"
          mask="url(#intro-spotlight-mask)"
        />
        {target && (
          <g>
            <rect
              className="intro-focus-outline"
              x={target.x}
              y={target.y}
              width={target.w}
              height={target.h}
              rx="5"
            />
            <path
              className="intro-leader"
              d={
                step === 1
                  ? `M ${Math.max(30, target.x - 155)} ${target.y + target.h / 2 - 34} h 94 l 42 34 h 19`
                  : target.compact
                    ? `M ${target.x + Math.min(target.w / 2, 160) + 20} ${target.y - 28} v 28`
                    : `M ${target.x + Math.min(target.w / 2, 160)} ${target.y - 48} v 20 l 20 20 v 8`
              }
            />
            <circle
              cx={
                step === 1
                  ? target.x
                  : target.x + Math.min(target.w / 2, 160) + 20
              }
              cy={step === 1 ? target.y + target.h / 2 : target.y}
              r="3"
              fill="white"
            />
            <text
              className="intro-pointer-label"
              x={
                step === 1
                  ? Math.max(30, target.x - 155)
                  : target.compact
                    ? target.x + 12
                    : target.x + Math.min(target.w / 2, 160)
              }
              y={
                step === 1
                  ? target.y + target.h / 2 - 45
                  : target.y - (target.compact ? 12 : 60)
              }
              fill="white"
              fontSize="12"
            >
              {step === 1 ? "Room controls" : "Navigation shortcuts"}
            </text>
          </g>
        )}
      </svg>
      <header className="intro-brand">
        <img src="/images/leila-logo.png" alt="" width="36" height="42" />
        <span>Leila Rose Parungo</span>
        <button onClick={enter} disabled={!ready} className="intro-skip">
          Skip intro ↗
        </button>
      </header>
      <div ref={content} className="intro-content" aria-live="polite">
        {step === 0 && (
          <>
            <p data-intro-reveal className="intro-step-count">
              01 / 03 — Hello there
            </p>
            <h1 data-intro-reveal id="intro-title">
              Welcome to
              <br />
              my portfolio.
            </h1>
            <p data-intro-reveal className="intro-copy">
              I’m Leila, a creative all-rounder. Step inside my room and
              discover the things I make.
            </p>
            <p data-intro-reveal className="intro-note">
              Design · Motion · Games · Sound
            </p>
          </>
        )}
        {step === 1 && (
          <>
            <p data-intro-reveal className="intro-step-count">
              02 / 03 — Make yourself at home
            </p>
            <h1 data-intro-reveal id="intro-title">
              Take a look around.
            </h1>
            <p data-intro-reveal className="intro-copy">
              The room is the portfolio. Move around, get closer, and select an
              object to explore.
            </p>
            <div className="intro-gestures" data-intro-reveal>
              <div>
                <svg viewBox="0 0 100 72" aria-hidden="true">
                  <rect x="35" y="11" width="30" height="49" rx="14" />
                  <path d="M50 11v17M35 28h30" />
                  <path
                    className="intro-gesture-path"
                    d="M12 36h15m-4-4 4 4-4 4m65-4H73m4-4-4 4 4 4"
                  />
                </svg>
                <h2>Move</h2>
                <p>
                  <span className="intro-desktop">Drag to orbit.</span>
                  <span className="intro-touch">
                    Drag to look. Two fingers to move.
                  </span>
                </p>
              </div>
              <div>
                <svg viewBox="0 0 100 72" aria-hidden="true">
                  <circle cx="44" cy="31" r="18" />
                  <path d="m57 45 17 17M35 31h18M44 22v18" />
                  <path
                    className="intro-gesture-path"
                    d="m12 17 10-7m56 32 10 7"
                  />
                </svg>
                <h2>Get closer</h2>
                <p>
                  <span className="intro-desktop">
                    Scroll to zoom in and out.
                  </span>
                  <span className="intro-touch">Pinch to zoom in and out.</span>
                </p>
              </div>
              <div>
                <svg viewBox="0 0 100 72" aria-hidden="true">
                  <path d="m36 12 0 38 10-10 9 17 8-5-9-16 14-2Z" />
                  <path
                    className="intro-gesture-path"
                    d="M24 13H14m14-7-7-6m16 0V-8M24 24l-8 8"
                  />
                </svg>
                <h2>Explore</h2>
                <p>
                  <span className="intro-desktop">
                    Click objects. Esc returns to the room.
                  </span>
                  <span className="intro-touch">
                    Tap objects. Use Back to room to return.
                  </span>
                </p>
              </div>
            </div>
          </>
        )}
        {step === 1 && (
          <p data-intro-reveal className="intro-note">
            On the side: music, portfolio, blinds, light intensity, and reset
            view.
          </p>
        )}
        {step === 2 && (
          <>
            <p data-intro-reveal className="intro-step-count">
              03 / 03 — Your guide to the room
            </p>
            <h1 data-intro-reveal id="intro-title">
              Everything has a place.
            </h1>
            <div className="intro-sections" data-intro-reveal>
              {sections.map(([name, object, description], index) => (
                <div key={name}>
                  <span className="intro-section-number">0{index + 1}</span>
                  <h2>
                    {name}
                    <span>{object}</span>
                  </h2>
                  <p>{description}</p>
                </div>
              ))}
            </div>
            <p data-intro-reveal className="intro-note">
              Use the navigation below for shortcuts. The side controls let you
              play music, adjust the blinds and lighting, or reset your view.
            </p>
          </>
        )}
      </div>
      <footer className="intro-footer">
        <div className="intro-load" role="status">
          <span>
            {ready
              ? "Your room is ready"
              : errors
                ? "Preparing the room… Some assets could not load."
                : "Loading the room in the background…"}
          </span>
          <div className="intro-load-track" aria-hidden="true">
            <span
              style={{
                width: `${ready ? 100 : Math.min(99, progress)}%`,
              }}
            />
          </div>
        </div>
        <div className="intro-actions">
          {step > 0 && (
            <button className="intro-back" onClick={() => changeStep(step - 1)}>
              Back
            </button>
          )}
          <button
            ref={nextButton}
            className="intro-next"
            disabled={step === 2 && !ready}
            onClick={() => (step < 2 ? changeStep(step + 1) : enter())}
          >
            {step === 0
              ? "Show me around"
              : step === 1
                ? "The room guide"
                : ready
                  ? "Enter room"
                  : "Preparing room…"}
            <span aria-hidden="true">↗</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
