# Seasonal features

`SeasonalFeatures.tsx` owns a shared, frame-based event scheduler. Each season's room objects live in their own subfolder. `calendar.ts` is the single date/time gate, using Asia/Manila to match the desk clock.

Halloween decorations appear throughout October, continuing until 5 AM on November 1. Random events run only from 6 PM inclusive until 5 AM exclusive: instantaneous blackout and a gaunt humanoid in the right corner, clinging to the ceiling, or sitting in the chair (4.5 seconds each), plus a cursed duck (2.8 seconds). The former outdoor/window event has been removed. Appearances are sudden, without fades; lighting restores immediately when the entity vanishes. The first event waits 18–35 seconds; subsequent events wait 45–100 seconds and never immediately repeat the previous type.

Effects stop at 5 AM, when a content view opens, when the tab is hidden, or when reduced motion is requested. The original light slider is never overwritten. No full-screen postprocessing, flashing lights, extra shadow lights, audio, or camera movement are added.

The indoor entity is anchored inside the actual back-right wall junction, with clearance for its arms. Its body turns toward the camera; a separate head pivot tracks the camera vertically and adds irregular 23 Hz twitch bursts. Head and torso geometry remain two merged meshes, including the facial fissures, hair, stitched bindings, and bony shoulder details.

The ceiling pose has bent elbows and knees, with fingers and feet meeting the underside of the ceiling. Its body points away and its head is inverted 180 degrees toward the camera. The chair pose uses a folded skirt, hands at the armrests, and a neck bent backward over the backrest; its body faces away and the head turns back toward the camera. Both retain camera tracking and head jitter. All three poses share one entity renderer and one pair of short-range lights.

Both entity meshes use rough, light-reactive materials. A short-range cold spotlight reveals the enlarged empty sockets and dislocated jaw; a faint rear fill catches the silhouette while the dress stays dark. These lights have no shadows, remain mounted to keep shader light counts stable, and have zero intensity outside their entity's event.

Development-only inspection: `?seasonalPreview=ghost`, `?seasonalPreview=ceiling`, `?seasonalPreview=chair`, or `?seasonalPreview=duck` holds the chosen effect at its midpoint. This still respects the real seasonal and time gate; production ignores the parameter.
