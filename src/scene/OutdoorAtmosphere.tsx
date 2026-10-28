import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  Vector3,
} from "three";
import { useEnvironmentTransition } from "./EnvironmentTransition";

const noise = `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float cloud(vec2 p) {
    return noise(p)*0.57 + noise(p*2.07+13.4)*0.28 + noise(p*4.13-7.2)*0.15;
  }
`;

export default function OutdoorAtmosphere() {
  const environment = useEnvironmentTransition();
  const shafts = useRef<Mesh>(null);
  const uniforms = useMemo(
    () => ({
      daylight: { value: 1 },
      directSun: { value: 1 },
      twilight: { value: 0 },
      sunDirection: { value: new Vector3() },
      top: { value: new Color() },
      bottom: { value: new Color() },
      sunColor: { value: new Color() },
    }),
    [],
  );
  const colors = useMemo(
    () => ({
      dayTop: new Color("#6099cd"),
      dayBottom: new Color("#d5e1e7"),
      nightTop: new Color("#080e21"),
      nightBottom: new Color("#29364e"),
      duskTop: new Color("#9386a8"),
      duskBottom: new Color("#efad7e"),
      noon: new Color("#fff4d9"),
      dusk: new Color("#ffb16b"),
    }),
    [],
  );
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions: number[] = [],
      bases: number[] = [],
      uv: number[] = [],
      indices: number[] = [];
    // Light volumes live entirely outside. Buildings depth-test against them;
    // camera-facing ribbons give parallax without a full-screen raymarch pass.
    const beams = [
      [0.6, -5, 0.55],
      [3.2, -6, 0.7],
      [-13, -10, 0.8],
      [-7, -17, 1.15],
      [2, -24, 1.5],
      [10, -12, 0.65],
      [17, -22, 1.2],
    ];
    beams.forEach(([x, z, width], i) => {
      for (const [side, along] of [
        [-1, 0],
        [1, 0],
        [-1, 1],
        [1, 1],
      ]) {
        positions.push(side * width, along * 30, 0);
        bases.push(x, i < 2 ? 0 : -5, z);
        uv.push((side + 1) / 2, along);
      }
      const j = i * 4;
      indices.push(j, j + 1, j + 2, j + 2, j + 1, j + 3);
    });
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("beamBase", new Float32BufferAttribute(bases, 3));
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    geometry.setIndex(indices);
    return geometry;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(() => {
    const n = environment.night,
      t = environment.twilight;
    uniforms.daylight.value = 1 - n;
    uniforms.directSun.value = Math.max(
      0,
      Math.min(1, environment.sunDirection.y / 0.08),
    );
    uniforms.twilight.value = t;
    uniforms.sunDirection.value.copy(environment.sunDirection);
    uniforms.top.value
      .lerpColors(colors.dayTop, colors.nightTop, n)
      .lerp(colors.duskTop, t * 0.55);
    uniforms.bottom.value
      .lerpColors(colors.dayBottom, colors.nightBottom, n)
      .lerp(colors.duskBottom, t * 0.85);
    uniforms.sunColor.value.lerpColors(colors.noon, colors.dusk, t);
    if (shafts.current)
      shafts.current.visible = environment.sunDirection.y > 0 && n < 0.995;
  });
  return (
    <group>
      <mesh renderOrder={-10} raycast={() => {}}>
        <sphereGeometry args={[74, 32, 16]} />
        <shaderMaterial
          side={BackSide}
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={`varying vec3 direction; void main(){ vec4 world=modelMatrix*vec4(position,1.0); direction=world.xyz-cameraPosition; gl_Position=projectionMatrix*viewMatrix*world; }`}
          fragmentShader={`
          uniform vec3 top,bottom,sunDirection,sunColor;
          uniform float daylight,twilight;
          varying vec3 direction;
          ${noise}
          void main(){
            vec3 d=normalize(direction);
            float h=smoothstep(-0.12,0.65,d.y);
            vec3 sky=mix(bottom,top,h);
            float cosine=clamp(dot(d,sunDirection),-1.0,1.0);
            float angle=acos(cosine);
            float halo=exp(-angle*7.0)*0.65+exp(-angle*angle*130.0)*0.5;
            float disc=1.0-smoothstep(0.008,0.012,angle);
            // High thin cloud banks scatter the sun; gaps break the broad rays.
            vec2 p=d.xz/max(d.y+0.35,0.08)*2.1;
            float clouds=smoothstep(0.53,0.76,cloud(p));
            float horizon=1.0-smoothstep(-0.02,0.30,d.y);
            sky=mix(sky,mix(bottom,vec3(1.0,0.97,0.91),0.65),clouds*daylight*0.43);
            vec3 side=normalize(cross(sunDirection,vec3(0,1,0)));
            vec3 up=cross(side,sunDirection);
            float azimuth=atan(dot(d,up),dot(d,side));
            float gaps=pow(0.5+0.5*sin(azimuth*21.0+sin(azimuth*9.0)*2.0),6.0);
            float rays=gaps*exp(-angle*4.0)*smoothstep(0.02,0.08,angle)*(1.0-clouds*0.8);
            sky+=sunColor*daylight*(halo+disc*4.0+rays*0.15);
            sky+=sunColor*daylight*horizon*0.045;
            gl_FragColor=vec4(sky,1.0);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`}
        />
      </mesh>
      <mesh
        ref={shafts}
        geometry={geometry}
        frustumCulled={false}
        raycast={() => {}}
        renderOrder={1}
      >
        <shaderMaterial
          transparent
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={`
          attribute vec3 beamBase; uniform vec3 sunDirection; varying vec2 vUv; varying vec3 worldPoint;
          void main(){
            vec3 center=beamBase+sunDirection*position.y;
            vec3 across=normalize(cross(sunDirection,normalize(cameraPosition-center)));
            vec3 world=center+across*position.x*(1.6-uv.y*0.9);
            worldPoint=world;
            vUv=uv; gl_Position=projectionMatrix*viewMatrix*vec4(world,1.0);
          }`}
          fragmentShader={`
          uniform float daylight,directSun; uniform vec3 sunColor; varying vec2 vUv; varying vec3 worldPoint;
          void main(){
            // The sun moves around the whole studio. Clip shafts to the city
            // side of the wall so a northerly summer sun cannot enter the room.
            if(worldPoint.z > -3.8 || worldPoint.y < -12.0) discard;
            float edge=exp(-pow((vUv.x-0.5)*4.8,2.0));
            float ends=smoothstep(0.0,0.24,vUv.y)*(1.0-smoothstep(0.72,1.0,vUv.y));
            gl_FragColor=vec4(sunColor,edge*ends*daylight*directSun*0.18);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }`}
        />
      </mesh>
    </group>
  );
}
