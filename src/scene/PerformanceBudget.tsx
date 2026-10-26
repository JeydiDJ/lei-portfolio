import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

export default function PerformanceBudget() {
  const gl = useThree((state) => state.gl);
  const sample = useRef({ elapsed: 0, frames: 0 });
  useFrame((_, delta) => {
    const dataset = gl.domElement.dataset;
    const calls = String(gl.info.render.calls);
    if (dataset.sceneDrawCalls !== calls) {
      dataset.sceneDrawCalls = calls;
      dataset.sceneTriangles = String(gl.info.render.triangles);
    }
    const resolution = gl.getPixelRatio().toFixed(2);
    if (dataset.sceneDpr !== resolution) dataset.sceneDpr = resolution;
    if (delta > 0.25) return;
    sample.current.elapsed += delta;
    sample.current.frames++;
    if (sample.current.elapsed < 2) return;
    const fps = sample.current.frames / sample.current.elapsed;
    gl.domElement.dataset.sceneFps = fps.toFixed(1);
    gl.domElement.dataset.sceneDrawCalls = String(gl.info.render.calls);
    gl.domElement.dataset.sceneTriangles = String(gl.info.render.triangles);
    gl.domElement.dataset.sceneDpr = gl.getPixelRatio().toFixed(2);
    sample.current = { elapsed: 0, frames: 0 };
  });
  return null;
}
