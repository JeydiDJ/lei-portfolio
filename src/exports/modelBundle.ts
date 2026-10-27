import {
  Box3,
  Color,
  DoubleSide,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector3,
  type Material,
  type BufferGeometry,
  type Object3D,
  type Texture,
} from "three";
import { OBJExporter } from "three/addons/exporters/OBJExporter.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

type Files = Map<string, Uint8Array>;
const utf8 = new TextEncoder();
const safe = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "_");

/** Capture the authored meshes, expanding GPU instances and excluding hidden batches/effects. */
export function prepareModel(source: Object3D, excludeDuck = false) {
  source.updateWorldMatrix(true, true);
  const inverse = source.matrixWorld.clone().invert();
  const result = new Group();
  result.name = safe(source.name);
  const materials = new Map<string, Material>();
  const snapshots = new Map<Texture, Texture>();
  const geometries = new Set<import("three").BufferGeometry>();
  const visit = (object: Object3D, label: string) => {
    if (
      !object.visible ||
      (excludeDuck && object.name === "Quick Quack duck display")
    )
      return;
    const path = object.name ? `${label}_${safe(object.name)}` : label;
    if (object instanceof Mesh) {
      const original = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (let slot = 0; slot < original.length; slot++) {
        let material = original[slot];
        // Procedural glare and light halos have no representation in OBJ/glTF.
        if ("isShaderMaterial" in material) {
          if (!(
            "daylight" in material.uniforms &&
            "ceilingLight" in material.uniforms
          ))
            continue;
          material = new MeshStandardMaterial({
            color: "#d2e0eb",
            transparent: true,
            opacity: 0.12,
            roughness: 0.16,
            metalness: 0.15,
            side: DoubleSide,
            depthWrite: false,
          });
          materials.set(`glass_${material.uuid}`, material);
        }
        if (!(
          material instanceof MeshStandardMaterial ||
          material instanceof MeshBasicMaterial
        ))
          continue;
        if (material.opacity === 0 || !material.visible) continue;
        let geometry: BufferGeometry = object.geometry;
        if (original.length > 1) {
          geometry = geometry.index
            ? geometry.toNonIndexed()
            : geometry.clone();
          const groups = (object.geometry as BufferGeometry).groups.filter(
            (g) => g.materialIndex === slot,
          );
          const indices = groups.flatMap((g) =>
            Array.from({ length: g.count }, (_, i) => g.start + i),
          );
          geometry.setIndex(indices);
          geometry.clearGroups();
          geometries.add(geometry);
        }
        const count = object instanceof InstancedMesh ? object.count : 1;
        for (let instance = 0; instance < count; instance++) {
          const color = new Color(1, 1, 1);
          const transform = new Matrix4().multiplyMatrices(
            inverse,
            object.matrixWorld,
          );
          if (object instanceof InstancedMesh) {
            const local = new Matrix4();
            object.getMatrixAt(instance, local);
            transform.multiply(local);
            if (object.instanceColor) object.getColorAt(instance, color);
          }
          const key = `${material.uuid}:${color.getHexString()}`;
          let copy = materials.get(key);
          if (!copy) {
            copy = material.clone();
            (copy as MeshStandardMaterial).color.multiply(color);
            // Freeze live screen/clock canvases before asynchronous file encoding.
            if (material.map?.image instanceof HTMLCanvasElement) {
              let snapshot = snapshots.get(material.map);
              if (!snapshot) {
                const canvas = document.createElement("canvas");
                canvas.width = material.map.image.width;
                canvas.height = material.map.image.height;
                canvas.getContext("2d")!.drawImage(material.map.image, 0, 0);
                snapshot = material.map.clone();
                snapshot.image = canvas;
                snapshots.set(material.map, snapshot);
              }
              (copy as MeshStandardMaterial).map = snapshot;
            }
            copy.name = `material_${materials.size + 1}`;
            materials.set(key, copy);
          }
          const mesh = new Mesh(geometry, copy);
          mesh.name = `${path}_part_${result.children.length + 1}`;
          transform.decompose(mesh.position, mesh.quaternion, mesh.scale);
          result.add(mesh);
        }
      }
    }
    for (const child of object.children) visit(child, path);
  };
  visit(source, result.name);
  result.updateMatrixWorld(true);
  const box = new Box3().setFromObject(result, true);
  const center = box.getCenter(new Vector3());
  // Floor on Y=0, horizontal center at origin; Y-up, one unit = one meter.
  for (const mesh of result.children)
    mesh.position.sub(new Vector3(center.x, box.min.y, center.z));
  result.updateMatrixWorld(true);
  return {
    model: result,
    dispose: () => {
      materials.forEach((material) => material.dispose());
      snapshots.forEach((texture) => texture.dispose());
      geometries.forEach((geometry) => geometry.dispose());
    },
  };
}

function textureImage(texture: Texture, alpha = false) {
  const image = texture.image as HTMLCanvasElement | HTMLImageElement;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  if (alpha) {
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      pixels.data[i] =
        pixels.data[i + 1] =
        pixels.data[i + 2] =
          pixels.data[i + 3];
      pixels.data[i + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
  }
  return canvas;
}
async function png(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error("Texture encoding failed")),
      "image/png",
    ),
  );
  return new Uint8Array(await blob.arrayBuffer());
}
function colorLine(key: string, color: Color) {
  const rgb = color.clone().convertLinearToSRGB();
  return `${key} ${rgb.r.toFixed(6)} ${rgb.g.toFixed(6)} ${rgb.b.toFixed(6)}\n`;
}
async function writeModel(
  files: Files,
  source: Object3D,
  name: string,
  excludeDuck = false,
) {
  const { model, dispose } = prepareModel(source, excludeDuck);
  try {
    files.set(
      `${name}/${name}.obj`,
      utf8.encode(
        `# Leila portfolio - Y up, meters, static model\nmtllib ${name}.mtl\n${new OBJExporter().parse(model)}`,
      ),
    );
    let mtl = "# Companion materials; keep textures/ beside this file.\n";
    const seen = new Set<Material>();
    const textures = new Map<Texture, string>();
    const alphaTextures = new Map<Texture, string>();
    for (const child of model.children) {
      const material = (child as Mesh).material as MeshStandardMaterial;
      if (seen.has(material)) continue;
      seen.add(material);
      mtl += `\nnewmtl ${material.name}\n` + colorLine("Kd", material.color);
      mtl += `Ka 0 0 0\nKs 0.15 0.15 0.15\nNs ${Math.round((1 - (material.roughness ?? 0.7)) * 300)}\nd ${material.opacity}\nillum 2\n`;
      if (material.emissive)
        mtl += colorLine(
          "Ke",
          material.emissive.clone().multiplyScalar(material.emissiveIntensity),
        );
      if (material.map) {
        const map = material.map;
        let filename = textures.get(map);
        if (!filename) {
          filename = `textures/texture_${textures.size + 1}.png`;
          files.set(`${name}/${filename}`, await png(textureImage(map)));
          textures.set(map, filename);
        }
        const options = `-s ${map.repeat.x} ${map.repeat.y} 1 -o ${map.offset.x} ${map.offset.y} 0`;
        mtl += `map_Kd ${options} ${filename}\n`;
        if (material.transparent || material.alphaTest > 0) {
          let alpha = alphaTextures.get(map);
          if (!alpha) {
            alpha = filename.replace(".png", "_alpha.png");
            files.set(`${name}/${alpha}`, await png(textureImage(map, true)));
            alphaTextures.set(map, alpha);
          }
          mtl += `map_d ${options} ${alpha}\n`;
        }
      }
    }
    files.set(`${name}/${name}.mtl`, utf8.encode(mtl));
    const glb = await new GLTFExporter().parseAsync(model, {
      binary: true,
      onlyVisible: true,
      maxTextureSize: 4096,
    });
    files.set(`${name}/${name}.glb`, new Uint8Array(glb as ArrayBuffer));
  } finally {
    dispose();
  }
}

// Store-mode ZIP keeps this local export tool dependency-free.
export function zipFiles(files: Files) {
  const chunks: Uint8Array[] = [],
    central: Uint8Array[] = [];
  let offset = 0;
  const crc = (data: Uint8Array) => {
    let value = 0xffffffff;
    for (const byte of data) {
      value ^= byte;
      for (let bit = 0; bit < 8; bit++)
        value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
    }
    return (value ^ 0xffffffff) >>> 0;
  };
  for (const [path, data] of files) {
    const name = utf8.encode(path),
      checksum = crc(data);
    const local = new Uint8Array(30 + name.length),
      lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x800, true);
    lv.setUint16(12, 0x21, true);
    lv.setUint32(14, checksum, true);
    lv.setUint32(18, data.length, true);
    lv.setUint32(22, data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);
    const entry = new Uint8Array(46 + name.length),
      ev = new DataView(entry.buffer);
    ev.setUint32(0, 0x02014b50, true);
    ev.setUint16(4, 20, true);
    ev.setUint16(6, 20, true);
    ev.setUint16(8, 0x800, true);
    ev.setUint16(14, 0x21, true);
    ev.setUint32(16, checksum, true);
    ev.setUint32(20, data.length, true);
    ev.setUint32(24, data.length, true);
    ev.setUint16(28, name.length, true);
    ev.setUint32(42, offset, true);
    entry.set(name, 46);
    chunks.push(local, data);
    central.push(entry);
    offset += local.length + data.length;
  }
  const directorySize = central.reduce((size, entry) => size + entry.length, 0);
  const end = new Uint8Array(22),
    view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, files.size, true);
  view.setUint16(10, files.size, true);
  view.setUint32(12, directorySize, true);
  view.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, end] as BlobPart[], {
    type: "application/zip",
  });
}
export async function exportModels(setup: Object3D, duck: Object3D) {
  const files: Files = new Map();
  await writeModel(files, setup, "desk-monitor-setup", true);
  await writeModel(files, duck, "quick-quack-duck");
  files.set(
    "README.txt",
    utf8.encode(`LEILA PORTFOLIO - MODEL EXPORTS

Two independent assets exported directly from the authored Three.js geometry:
- desk-monitor-setup: desk, monitor, PC and internals, keyboard, mouse, mouse pad, clock, desk lamp. Duck excluded.
- quick-quack-duck: neutral-pose low-poly duck and display plinth.

Both are Y-up, one unit = one meter, centered horizontally, lowest point at Y=0.
Each folder contains OBJ geometry, companion MTL, PNG textures (if any), and GLB.

THREE.JS EDITOR
Use File > Import with the GLB for the easiest material-preserving import.
OBJ can be imported as geometry. For OBJ materials in a Three.js application,
load the MTL with MTLLoader first, then pass it to OBJLoader.setMaterials().
Keep OBJ, MTL, and textures/ together. OBJ does not embed materials.

These are static models. Fans and duck do not animate; screen content is a snapshot.
Web interactions, procedural glass glare, light halos, and seasonal effects are not exported.
Procedural glass is replaced by a static transparent material; light halos are omitted.
OBJ/MTL approximates PBR roughness, metalness and emissive lighting; GLB retains PBR materials.
Keyboard GPU instances are expanded into individual colored meshes.

To regenerate from current source: npm run dev, open /?exportModels=1,
then click Download model bundle. This tool is available only in development.
`),
  );
  return zipFiles(files);
}
