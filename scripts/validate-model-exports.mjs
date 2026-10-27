import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { Box3, Mesh, Vector3 } from "three";

const root = resolve("exports/models");
for (const name of ["desk-monitor-setup", "quick-quack-duck"]) {
  const folder = resolve(root, name);
  const obj = await readFile(resolve(folder, `${name}.obj`), "utf8");
  const mtl = await readFile(resolve(folder, `${name}.mtl`), "utf8");
  const materials = new Set(
    [...mtl.matchAll(/^newmtl (.+)$/gm)].map((match) => match[1]),
  );
  for (const [, material] of obj.matchAll(/^usemtl (.+)$/gm))
    assert(materials.has(material), `Missing material ${material}`);
  for (const [, texture] of mtl.matchAll(/^map_(?:Kd|d) .* (textures\/.+)$/gm))
    await access(resolve(folder, texture));
  const parsed = new OBJLoader().parse(obj);
  let meshes = 0,
    triangles = 0;
  parsed.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    meshes++;
    const positions = object.geometry.getAttribute("position");
    triangles += positions.count / 3;
    for (const value of positions.array)
      assert(Number.isFinite(value), "Non-finite vertex");
  });
  const box = new Box3().setFromObject(parsed);
  const size = box.getSize(new Vector3());
  assert(meshes > 0 && triangles > 0);
  assert(Math.abs(box.min.y) < 0.00001, "Model must rest at Y=0");
  assert(Math.abs((box.min.x + box.max.x) / 2) < 0.00001);
  assert(Math.abs((box.min.z + box.max.z) / 2) < 0.00001);
  assert.equal(
    obj.includes("Quick_Quack_duck_display"),
    name === "quick-quack-duck",
    "Duck must be separate from setup",
  );
  const buffer = await readFile(resolve(folder, `${name}.glb`));
  assert.equal(buffer.readUInt32LE(0), 0x46546c67);
  assert.equal(buffer.readUInt32LE(4), 2);
  assert.equal(buffer.readUInt32LE(8), buffer.length);
  assert.equal(buffer.readUInt32LE(16), 0x4e4f534a);
  const gltf = JSON.parse(
    buffer.subarray(20, 20 + buffer.readUInt32LE(12)).toString(),
  );
  assert(gltf.meshes.length > 0 && gltf.materials.length > 0);
  for (const image of gltf.images ?? [])
    assert(image.bufferView !== undefined, "GLB images must be embedded");
  for (const view of gltf.bufferViews)
    assert(view.byteOffset + view.byteLength <= gltf.buffers[0].byteLength);
  console.log(
    `${name}: ${meshes} meshes, ${triangles.toLocaleString()} triangles, bounds ${size
      .toArray()
      .map((v) => v.toFixed(3))
      .join(" × ")} m; OBJ/MTL/textures and GLB validated.`,
  );
}
