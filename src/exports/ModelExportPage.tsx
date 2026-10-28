import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import Desk from "../scene/Desk";
import DeskLamp from "../scene/DeskLamp";
import Workstation from "../scene/workstation/Workstation";
import DuckDisplay from "../scene/workstation/DuckDisplay";
import { EnvironmentTransition } from "../scene/EnvironmentTransition";
import SeasonalFeatures from "../seasonal/SeasonalFeatures";
import { exportModels } from "./modelBundle";

const noop = () => {};
function ExportPreview({ name }: { name: string }) {
  const { scene } = useGLTF(`/exports/models/${name}/${name}.glb`);
  return <primitive object={scene} />;
}
export default function ModelExportPage() {
  const preview = new URLSearchParams(window.location.search).get("preview");
  const previewName =
    preview === "duck"
      ? "quick-quack-duck"
      : preview === "setup"
        ? "desk-monitor-setup"
        : null;
  const setup = useRef<Group>(null),
    duck = useRef<Group>(null);
  const [status, setStatus] = useState("Ready to export two separate models.");
  const [busy, setBusy] = useState(false);
  const download = async () => {
    if (!setup.current || !duck.current) return;
    setBusy(true);
    setStatus("Preparing geometry, materials and textures…");
    try {
      const blob = await exportModels(setup.current, duck.current);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "leila-portfolio-models.zip";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setStatus(
        `Export complete: ${(blob.size / 1024 / 1024).toFixed(1)} MB. Two OBJ/MTL assets plus GLB versions.`,
      );
    } catch (error) {
      setStatus(`Export failed: ${String(error)}`);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main
      style={{
        height: "100dvh",
        background: "#222024",
        color: "#f6f3f0",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          padding: "20px 28px",
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ fontSize: 20, margin: "0 0 6px" }}>
            Portfolio model exports
          </h1>
          <p role="status" style={{ margin: 0, fontSize: 14 }}>
            {status}
          </p>
        </div>
        <button
          disabled={busy || previewName !== null}
          onClick={download}
          style={{
            padding: "12px 18px",
            border: 0,
            borderRadius: 6,
            color: "white",
            background: "#781b20",
            cursor: "pointer",
          }}
        >
          Download model bundle
        </button>
        <a href="?exportModels=1&preview=setup" style={{ color: "#ddd" }}>
          View exported setup
        </a>
        <a href="?exportModels=1&preview=duck" style={{ color: "#ddd" }}>
          View exported duck
        </a>
        <a href="/" style={{ color: "#ddd" }}>
          Back to portfolio
        </a>
      </div>
      <Canvas
        frameloop="demand"
        camera={{
          position: preview === "duck" ? [0.65, 0.4, 0.8] : [-4, 3.4, 5],
          fov: 45,
        }}
        dpr={1}
      >
        <color attach="background" args={["#28262b"]} />
        <ambientLight intensity={1.6} />
        <directionalLight position={[2, 6, 4]} intensity={3} />
        {previewName ? (
          <Suspense fallback={null}>
            <ExportPreview name={previewName} />
          </Suspense>
        ) : (
          <SeasonalFeatures paused>
            <EnvironmentTransition
              sunDirection={[-0.3, 0.7, -0.65]}
              night={0}
              twilight={0}
              roomLight={0.7}
              blindsDown={false}
            >
              <group ref={setup} name="Desk_monitor_setup">
                <group name="Desk">
                  <Desk />
                </group>
                <group name="Workstation">
                  <Workstation
                    active={false}
                    onOpen={noop}
                    onClose={noop}
                    onNavigate={noop}
                  />
                </group>
                <group name="Desk_lamp">
                  <DeskLamp />
                </group>
              </group>
              <group
                ref={duck}
                name="Quick_quack_duck"
                position={[-2.6, 1.45, 0]}
              >
                <DuckDisplay staticPose />
              </group>
            </EnvironmentTransition>
          </SeasonalFeatures>
        )}
        <OrbitControls
          target={preview === "duck" ? [0, 0.18, 0] : [0, 1.2, -0.5]}
        />
      </Canvas>
    </main>
  );
}
