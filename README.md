# Lei's creative room

An interactive commission portfolio built with React, TypeScript, Vite, Three.js, React Three Fiber, and Drei. All room models are built locally from geometry; no external model downloads are required.

Rendering uses material-based static geometry batches and instanced city buildings. Interactive models, blinds, fan rotors, and changing emissive materials remain separate. Models retain their original rounded edges, with simple boxes used only for explicitly flat geometry. Rendering follows the device pixel ratio, bounded between 1× and 1.75×, without automatic resolution reduction. Portrait and screen textures use anisotropic filtering for angled views. Canvas `data-scene-fps`, `data-scene-draw-calls`, `data-scene-triangles`, and `data-scene-dpr` attributes expose lightweight runtime diagnostics. Static batches must not contain moving models unless their root has `userData.dynamic = true`.

## Run

```sh
npm install
npm run dev
```

`npm run build` checks TypeScript and produces the production website in `dist/`. `npm run preview` serves the production build.

The cream-and-rose digital clock below the monitor shows Leila's Philippine time using `Asia/Manila`, regardless of the visitor's location. Large 12-hour digits, AM/PM, smaller seconds, a Philippine date, and a PHT/UTC+8 label sit on a warm dark display. Its texture updates once per real second and resynchronizes on focus/visibility changes.

The outdoor sky, city window lights, and indoor lighting follow the same real-time Philippine day/night cycle. Manila (14.6°N, 120.98°E) is the daylight reference; approximate solar elevation follows NOAA's general solar equations, including seasonal and leap-year changes. Warm dawn/dusk colors and night illumination blend gradually. The toolbar sun/moon is a live status indicator. The cycle refreshes every 15 seconds and resynchronizes when the page becomes visible or focused. Run `npm run test:daylight` for time-of-day, continuity, seasonal, and timezone checks.

The duck occasionally looks around, shakes, or waddles in place, with randomized quiet intervals. Head and body have separate pivots, the plinth stays fixed, and each moving section keeps its own geometry batches. Gestures use elapsed real time, pause in hidden tabs, and honor reduced-motion preferences.

Window panes, the PC side panel, picture-frame covers, and device displays use shared view-dependent glass highlights. The shader combines grazing-angle reflection, soft glare, and simplified reflections of the ceiling fixture and window footprints, respecting the live daylight/blind blend. Screen and gallery close-ups reduce glare for readability. Glass overlays do not intercept pointer hits or require extra scene-render/refraction passes.

During music playback, the speaker emits three expanding rose-colored sound rings and five floating music-note sprites. A small Web Audio analyser measures the actual output to modulate their intensity. The accents fade out on pause or zero volume, remain visible after returning to the room, and use static accents for reduced-motion preferences. They do not cast shadows or intercept clicks.

After 30 seconds without monitor activity, the monitor displays Leila's original logo centered on black and reduces its light spill. Pointer activity on the monitor, opening Work, or keyboard activity while viewing Work restores the current portfolio page. The first click on a sleeping monitor only wakes it; project selection is preserved. The idle duration is configured in `src/scene/interfaces/useMonitorIdle.ts`.

Blueprint-style callouts group the room into Work, About Me, Experience, and Contact. Each category has one clickable label and a single dot-and-line leader: Work points to the monitor, About Me to the tablet, Experience to the center of the ID card group, and Contact to the phone. Screen-space projection follows the camera without adding WebGL draw calls. Labels avoid each other and disappear during object close-ups. Other room controls retain their existing interactions without individual callout labels.

An Ultra-style phone replaces the coffee mug on the left side of the desk. It rests screen-down with the rear lenses visible, then lifts and flips screen-up when selected. Closing the contact view flips it back down. The contact screen provides the supplied business email and LinkedIn profile, plus a copy-email action. Its camera framing, navigation button, and callout share the model's layout dimensions. Reduced-motion preferences skip the flip animation.

## Structure

```text
src/
  App.tsx                   Page layout and interaction state
  main.tsx                  React entry point
  components/
    Icon.tsx                Shared SVG icons
  data/
    portfolio.ts            Editable client profile and sample projects
  scene/
    Studio.tsx              WebGL scene, environment, and fallback
    interfaces/             Texture-based work browser, tablet pages, and experience cards
    RoomCamera.tsx          Monitor-centered orbit controls, zoom, and view transitions
    BackWall.tsx            Wall panels and seams around the actual window opening
    Ceiling.tsx             Physical ceiling, perimeter trim, and overhead fixture
    Lighting.tsx            Day/night light sources and cached shadow maps
    CityWindow.tsx          Open window frame and world-space sky
    CityBuildings.tsx       3D city blocks, rooftops, and instanced facade windows
    FramedPhoto.tsx         Leila's portrait with its original image proportions
    RollerBlind.tsx         Clickable, animated roller blind and pull loop
    Desk.tsx                Oak desktop, tapered legs, and cream drawer pedestal
    layout.ts               Shared desk/window dimensions and furniture offsets
    workstation/            Curved monitor, 87-key keyboard, mouse, tower, and cables
      dimensions.ts         Real-world reference dimensions at 2 scene units/metre
    Room.tsx                Room composition and interactive objects
    RoomShell.tsx           Finite four-wall enclosure, floor, door, and corner trim
    DeskChair.tsx           Upholstered swivel chair, armrests, controls, and castors
    RoomDetails.tsx         Visible cabinet details, books, mug, and rug
    Objects.tsx             Reusable geometry, plants, and canvas artwork
  styles/
    global.css              Responsive room controls and keyboard access
public/
  images/                   Add approved portfolio images here
  models/                   Add future GLB/GLTF assets here
```

## Personalize before launch

The two left-wall frames are selectable advertising galleries with client selectors for DAX Eyewear and Nathaniel’s. The portrait/A4 frame contains six DAX ads and three Nathaniel’s pieces. The square frame contains six wider Nathaniel’s pieces. All supplied PNGs are kept under `public/images/ads/` and displayed without cropping or stretching. Previous/next controls and client buttons live on each frame. Add approved items to `src/data/ads.ts`, including their client ID. The bottom Ads button provides keyboard access; Escape returns to the room.

The monitor and speaker share a restrained burgundy, warm-paper, and charcoal identity using Leila's supplied logo. The monitor lists the supplied eyewear and food/beverage campaigns and Quick, Quack collaborative game artwork, with uncropped image navigation. Animation and overlay categories remain empty until work is supplied. The introduction remains draft copy; exact experience roles and dates are still pending. The supplied email and LinkedIn URL are stored in `src/data/portfolio.ts`; contact links open the visitor's email client or LinkedIn, with no inquiry form or server-side collection.

The room fills the viewport without a site header, hero, or footer. Its interior perspective, dusk lighting, numbered navigation, and object-focused camera transitions take inspiration from the reference at https://www.raomuhammadhamza.tech/. All geometry and artwork are built for this project; no assets from the reference are included.

Drag to rotate and scroll to zoom. Click the monitor to zoom into its curved screen and browse work by category, open projects, and view pictures. Click the tablet for her portrait, introduction, and biography; its contact button opens the phone. Click the phone to flip it over and view her email and LinkedIn. Click an ID card to read her experience; previous/next controls move between the three cards. These interfaces are drawn onto the models themselves and use texture coordinates for pointer interaction. Bottom navigation and keyboard-accessible action buttons offer alternative controls. Use the on-object Room button, Back to room, or Escape to return. Focus transitions respect reduced motion.

Approved experience details belong in `experiences` in `src/data/portfolio.ts`; current cards are clearly marked placeholders. Add images under `public/images/` and set each project's optional `images` array to paths such as `/images/project-01.jpg`. Multiple images enable previous/next picture controls on the monitor.

The compact speaker to the monitor's left opens Room Radio. Its display provides Play/Pause, Next loop, and volume controls. Three original ambient loops are synthesized locally with Web Audio; no streaming service or downloaded music is required. Audio starts only after pressing Play, continues while exploring the room, and stops on Pause or when the page closes. The sound button in the bottom toolbar also opens the player.

The city outside is world-space geometry behind a real wall opening. Four rows of buildings sit at different distances and elevations, so section/view camera transitions reveal perspective and occlusion naturally. Facade windows are batched into two instanced meshes; rooftop equipment and atmospheric fog establish depth. The day/night control also updates the outdoor sky and window illumination. There is no skyline image or opaque window plane.

Click the roller, fabric, or bead chain to raise/lower the Korean-style zebra blind, or use the labeled button in the bottom controls. Two separated fabric layers alternate opaque woven and translucent sheer bands; the stripe spacing remains fixed as the fabric rolls. The animation reverses smoothly if toggled mid-motion and respects reduced motion. Lowering it retains some diffuse daylight and lets sun through the sheer bands. The roller spins along its axle, and an instanced bead chain follows a continuous loop between its clutch and wall-mounted tensioner. Hover highlights only the perimeter and hardware outlines. The window frame is a single extruded ring with a separate, non-overlapping sill.

Lighting follows physical sources. Day mode uses sunlight through the window, cool sky bounce, and unlit exterior windows. Night mode uses the warm ceiling fixture, desk lamp, a dark blue sky, and lit city windows. Closing the blinds in daytime turns on the overhead fixture. The room has a 5.2-unit ceiling; camera movement stays below it. The sun and ceiling light keep cached 1024px shadow maps on narrow viewports and 2048px on desktop. Both remain registered during fades to avoid shader recompilation. Shadow maps are reused during lighting fades and camera movement, and refreshed when assets finish loading, the viewport changes, or the blind moves. Decorative seam lines do not cast shadows.

The workstation uses generic hardware reference shapes rather than a manufacturer CAD model. The monitor is a slim curved 16:9 display with a 2.1-unit-wide active area and matching screen artwork. Presentation scales in `workstation/dimensions.ts` tune the detailed models to the stylized room: keyboard 1.45×, mouse 1.5×, and tower 1.3× their original reference models. The keyboard retains its 87-key layout and consistent spacing; the tower retains its glass side panel, components, vents, ports, and feet. Enlarged models are anchored to the desktop, with cable routes, mouse mat, and interaction markers adjusted to fit.

The tower uses a conventional left-window layout: local +Z is the case front, -X is the left glass panel, and +X holds the solid cable-management panel and motherboard tray. Components extend inward from the right-side tray toward the left. The GPU is horizontal with fans facing down; the CPU tower cooler has horizontal fins and a front-facing fan. The tower sits straight across the desk; rear USB/display connections and cable endpoints share its orientation. `TowerInternals.tsx` keeps this component layout separate from the chassis.

Day/night and blinds lighting share a frame-rate-independent transition in `EnvironmentTransition.tsx`. Day/night settles gradually over roughly two seconds; blind lighting follows the fabric travel. Ceiling and lamp glow, all light intensities and colors, exposure, fog, sky, and city windows use the same shared blend. Reversing a toggle starts from the current value. Reduced-motion preferences use immediate changes.

The complete room has four finite walls bounded by `roomLayout.left/right/back/front`, a matching floor and ceiling, and continuous corner/base/crown trim. The front wall includes a framed door. Dragging orbits around the monitor, with constrained horizontal/vertical travel and bounded zoom. Panning is disabled. The monitor remains the fixed focal point. Limits and the neutral monitor focal point are defined in `layout.ts`. The cube button opens a wider composition while retaining monitor focus. The camera stays inside the walls and beneath the ceiling. Reset returns to the default desk view. Mobile uses a wider field of view and an interior camera position. A second ceiling fixture illuminates the entry/reading area and follows the same lighting transition without adding another shadow map.

Visible details include a gaming chair with headrest and lumbar support, detailed book spines, mug handle/rim/coffee, plant stems and pot rims, experience cards, cabinet doors, and a woven rug with fringe. Furniture and decorations behind the camera have been removed to reduce scene geometry and material overhead. Wood grain and woven textures are generated locally.
