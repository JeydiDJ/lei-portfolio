import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  BufferAttribute,
  Group,
  InstancedMesh,
  SkinnedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type BufferGeometry,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { useThree } from "@react-three/fiber";

/** Merge immutable opaque parts by material; interactive and animated models stay separate. */
export default function StaticBatch({ children }: { children: ReactNode }) {
  const root = useRef<Group>(null);
  const gl = useThree((state) => state.gl);
  useLayoutEffect(() => {
    if (!root.current) return;
    const group = root.current;
    group.updateWorldMatrix(true, true);
    const inverse = group.matrixWorld.clone().invert();
    const batches = new Map<
      string,
      {
        material: MeshStandardMaterial;
        originals: Mesh[];
        geometries: BufferGeometry[];
      }
    >();
    const visit = (node: import("three").Object3D) => {
      if (node.userData.dynamic || !node.visible) return;
      if (
        node instanceof Mesh &&
        !(node instanceof InstancedMesh) &&
        !(node instanceof SkinnedMesh)
      ) {
        const material = node.material;
        if (
          material instanceof MeshStandardMaterial &&
          !material.transparent &&
          !material.vertexColors &&
          material.emissive.getHex() === 0 &&
          !Object.keys(node.geometry.morphAttributes).length
        ) {
          const key = [
            material.type,
            material.color.getHex(),
            material.roughness,
            material.metalness,
            material.side,
            material.alphaTest,
            material.flatShading,
            material.depthWrite,
            material.map?.uuid,
            material.normalMap?.uuid,
            material.roughnessMap?.uuid,
            material.metalnessMap?.uuid,
            node.castShadow,
            node.receiveShadow,
            node.renderOrder,
          ].join("/");
          const geometry = node.geometry.index
            ? node.geometry.toNonIndexed()
            : node.geometry.clone();
          geometry.applyMatrix4(
            new Matrix4().multiplyMatrices(inverse, node.matrixWorld),
          );
          for (const attribute of Object.keys(geometry.attributes))
            if (!["position", "normal", "uv"].includes(attribute))
              geometry.deleteAttribute(attribute);
          if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
          if (!geometry.getAttribute("uv"))
            geometry.setAttribute(
              "uv",
              new BufferAttribute(
                new Float32Array(geometry.getAttribute("position").count * 2),
                2,
              ),
            );
          geometry.clearGroups();
          const batch = batches.get(key) ?? {
            material,
            originals: [],
            geometries: [],
          };
          batch.originals.push(node);
          batch.geometries.push(geometry);
          batches.set(key, batch);
        }
      }
      for (const child of node.children) visit(child);
    };
    for (const child of group.children) visit(child);
    const merged: Mesh[] = [];
    const hidden: Mesh[] = [];
    for (const batch of batches.values()) {
      if (batch.originals.length > 1) {
        const geometry = mergeGeometries(batch.geometries, false);
        if (geometry) {
          geometry.computeBoundingSphere();
          const mesh = new Mesh(geometry, batch.material);
          mesh.castShadow = batch.originals[0].castShadow;
          mesh.receiveShadow = batch.originals[0].receiveShadow;
          mesh.renderOrder = batch.originals[0].renderOrder;
          mesh.matrixAutoUpdate = false;
          group.add(mesh);
          merged.push(mesh);
          for (const original of batch.originals) {
            original.visible = false;
            hidden.push(original);
          }
        }
      }
      for (const geometry of batch.geometries) geometry.dispose();
    }
    gl.shadowMap.needsUpdate = true;
    return () => {
      for (const original of hidden) original.visible = true;
      for (const mesh of merged) {
        group.remove(mesh);
        mesh.geometry.dispose();
      }
      gl.shadowMap.needsUpdate = true;
    };
  }, [gl]);
  return <group ref={root}>{children}</group>;
}
