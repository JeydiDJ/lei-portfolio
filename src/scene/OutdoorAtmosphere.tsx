import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BackSide,
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Mesh,
  Quaternion,
  ShaderMaterial,
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
  float stars(vec2 angular, float scale, float threshold) {
    vec2 p=angular*scale, cell=floor(p), f=fract(p);
    float seed=hash(cell);
    vec2 center=vec2(hash(cell+71.7),hash(cell-19.2))*0.7+0.15;
    float radius=mix(0.035,0.09,hash(cell+41.0));
    float aa=max(fwidth(p.x),fwidth(p.y))*0.65;
    return step(threshold,seed)*(1.0-smoothstep(radius,radius+aa,length(f-center)))*mix(0.35,1.0,hash(cell+8.1));
  }
`;

export default function OutdoorAtmosphere() {
  const environment = useEnvironmentTransition();
  const shafts = useRef<Mesh>(null);
  const skyMaterial = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      daylight: { value: 1 },
      directSun: { value: 1 },
      twilight: { value: 0 },
      sunDirection: { value: new Vector3() },
      moonDirection: { value: new Vector3() },
      moonIllumination: { value: 0 },
      moonAboveHorizon: { value: 0 },
      moonSunDirection: { value: new Vector3() },
      top: { value: new Color() },
      bottom: { value: new Color() },
      sunColor: { value: new Color() },
    }),
    [],
  );
  const moonRotation = useMemo(() => new Quaternion(), []);
  const colors = useMemo(
    () => ({
      dayTop: new Color("#6099cd"),
      dayBottom: new Color("#d5e1e7"),
      nightTop: new Color("#02040b"),
      nightBottom: new Color("#101a2a"),
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
    if (!skyMaterial.current) return;
    const uniforms = skyMaterial.current.uniforms;
    const n = environment.night,
      t = environment.twilight;
    uniforms.daylight.value = 1 - n;
    uniforms.directSun.value = Math.max(
      0,
      Math.min(1, environment.sunDirection.y / 0.08),
    );
    uniforms.twilight.value = t;
    uniforms.sunDirection.value.copy(environment.sunDirection);
    // Compose the moon within the studio's narrow window view. The phase and
    // horizon visibility use the ephemeris; its displayed altitude is artistic.
    const displayMoon = uniforms.moonDirection.value;
    displayMoon
      .set(
        -0.28 + environment.moonDirection.x * 0.08,
        0.075 + Math.max(0, environment.moonDirection.y) * 0.02,
        -1,
      )
      .normalize();
    moonRotation.setFromUnitVectors(environment.moonDirection, displayMoon);
    uniforms.moonSunDirection.value
      .copy(environment.sunDirection)
      .applyQuaternion(moonRotation);
    uniforms.moonAboveHorizon.value = Math.max(
      0,
      Math.min(1, environment.moonDirection.y / 0.05),
    );
    uniforms.moonIllumination.value = environment.moonIllumination;
    uniforms.top.value
      .lerpColors(colors.dayTop, colors.nightTop, n)
      .lerp(colors.duskTop, t * 0.55);
    uniforms.bottom.value
      .lerpColors(colors.dayBottom, colors.nightBottom, n)
      .lerp(colors.duskBottom, t * 0.85);
    uniforms.sunColor.value.lerpColors(colors.noon, colors.dusk, t);
    if (shafts.current) {
      shafts.current.visible = environment.sunDirection.y > 0 && n < 0.995;
      const beamUniforms = (shafts.current.material as ShaderMaterial).uniforms;
      beamUniforms.daylight.value = uniforms.daylight.value;
      beamUniforms.directSun.value = uniforms.directSun.value;
      beamUniforms.sunDirection.value.copy(environment.sunDirection);
      beamUniforms.sunColor.value.copy(uniforms.sunColor.value);
    }
  });
  return (
    <group>
      <mesh renderOrder={-10} raycast={() => {}}>
        <sphereGeometry args={[74, 32, 16]} />
        <shaderMaterial
          ref={skyMaterial}
          side={BackSide}
          depthWrite={false}
          uniforms={uniforms}
          vertexShader={`varying vec3 direction; void main(){ vec4 world=modelMatrix*vec4(position,1.0); direction=world.xyz-cameraPosition; gl_Position=projectionMatrix*viewMatrix*world; }`}
          fragmentShader={`
          uniform vec3 top,bottom,sunDirection,sunColor,moonDirection,moonSunDirection;
          uniform float daylight,twilight,moonIllumination,moonAboveHorizon;
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
            float night=pow(1.0-daylight,3.0);
            if(night>0.001){
              float above=moonAboveHorizon;
              vec2 angular=vec2(atan(d.z,d.x),asin(clamp(d.y,-1.0,1.0)));
              float starfield=stars(angular,110.0,0.982)+stars(angular+0.431,185.0,0.994)*0.65;
              sky+=vec3(0.78,0.86,1.0)*starfield*night*smoothstep(-0.025,0.08,d.y)*(1.0-0.35*moonIllumination*above);
              vec3 reference=abs(moonDirection.y)>0.98?vec3(0,0,1):vec3(0,1,0);
              vec3 lunarRight=normalize(cross(moonDirection,reference));
              vec3 lunarUp=cross(lunarRight,moonDirection);
              vec2 discPoint=vec2(dot(d,lunarRight),dot(d,lunarUp))/0.009;
              float radius=length(discPoint);
              float edge=max(fwidth(radius),0.008);
              float moonMask=(1.0-smoothstep(1.0-edge,1.0+edge,radius))*step(0.0,dot(d,moonDirection))*above*night;
              if(moonMask>0.0){
                vec3 surfaceNormal=discPoint.x*lunarRight+discPoint.y*lunarUp-moonDirection*sqrt(max(0.0,1.0-radius*radius));
                float sunlight=dot(surfaceNormal,moonSunDirection);
                float terminator=smoothstep(-0.035,0.035,sunlight);
                float maria=cloud(discPoint*4.2+vec2(8.1,14.3));
                float craters=noise(discPoint*39.0);
                float terrain=0.66+maria*0.25+craters*0.09;
                vec3 lunarColor=vec3(0.91,0.92,0.88)*terrain*(0.018+terminator*(0.27+0.73*max(0.0,sunlight)));
                sky=mix(sky,lunarColor,moonMask);
              }
              float moonAngle=acos(clamp(dot(d,moonDirection),-1.0,1.0));
              sky+=vec3(0.38,0.48,0.68)*exp(-moonAngle*55.0)*0.10*moonIllumination*above*night;
            }
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
