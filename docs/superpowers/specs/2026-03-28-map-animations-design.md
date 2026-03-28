# Map Animations & Scene Transitions — Design Spec
**Date:** 2026-03-28
**Status:** Approved

---

## Overview

Bring the Billings World map to life with animated character pins, ambient road traffic, and cinematic tick transitions. The map becomes the hero of the UI — it tells the story of what just happened before the text panels update.

---

## Decisions Made

| Question | Decision |
|----------|----------|
| Pin interaction | Hover → tooltip on map; click → selects character in right panel |
| Pin style | Glowing dot + floating name chip (always visible) |
| Road animation | Both: ambient particles always running + triggered trails on tick change |
| Scene transition | Map-first cascade: pins move first, panels update after |
| Location coordinates | Manual config file, percentage-based (0–1 of map dimensions) |
| Architecture | Hybrid: SVG layer for roads/particles/trails + div layer for pins/tooltips |
| Multi-world | Map config as named bundle per world; `world.json` references `active_map` |

---

## Architecture

### New File: `worlds/<world>/maps/<map-id>.json`

Self-contained map bundle. One per named map. Copied to `/dist/maps/` by the build pipeline. Map images go to `app/ui/public/maps/`.

```json
{
  "id": "billings-central",
  "image": "/maps/billings-central.jpg",
  "locations": {
    "downtown":    { "x": 0.42, "y": 0.61, "label": "Downtown" },
    "west-end":    { "x": 0.18, "y": 0.55, "label": "West End" },
    "the-heights": { "x": 0.72, "y": 0.28, "label": "The Heights" },
    "midtown":     { "x": 0.38, "y": 0.48, "label": "Midtown" },
    "home":        null
  },
  "roads": [
    { "id": "grand-ave",   "d": "M 0,390 L 1000,390" },
    { "id": "27th-street", "d": "M 420,0 L 420,671" },
    { "id": "rimrock-rd",  "d": "M 0,200 Q 500,180 1000,210" }
  ]
}
```

- `x`/`y` are fractions of the displayed map dimensions (0.5, 0.5 = dead center)
- `null` locations are not rendered on the map (home, offscreen, etc.)
- Road paths use a `1000×671` viewBox (preserves 5056×3392 native aspect ratio)
- Curved roads use SVG `Q`/`C` commands — both particle drift and trail draw follow the exact same path

### `world.json` addition

```json
{ "active_map": "billings-central", ... }
```

If `active_map` changes between two ticks, the map image crossfades as the first step of the tick transition (before pins animate). This supports future scene-triggered map swaps.

### `useWorldData.js`

Fetches map config bundle when `world.active_map` changes. Falls back to `"billings-central"` if `active_map` is absent (backwards compatibility with existing tick data):

```js
const mapId = world.active_map ?? 'billings-central'
const mapConfig = await fetchJSON(`/dist/maps/${mapId}.json`)
```

Returns `mapConfig` alongside `world`, `characters`, `scene`.

### `MapPanel.jsx` — full rewrite

Receives: `world`, `characters`, `mapConfig`, `transitionPhase`, `prevCharacters`

`prevCharacters` is stored in a `useRef` in `App.jsx` — captured at the moment a tick change is detected (before new characters replace them), so MapPanel can compute which pins need to animate and from where.

Three stacked layers (`position: absolute; inset: 0`):

1. **Map image** — `<img src={mapConfig.image}>`, crossfades if map changes
2. **SVG layer** — road paths (invisible stroke for path geometry), ambient particle circles, tick trail paths
3. **Div layer** — character pins (dot + name chip + tooltip), absolutely positioned using `mapConfig.locations`

### `App.jsx` changes

- Passes `mapConfig` to `MapPanel`
- Drives `transitionPhase` state machine (see Animation section)
- `contentKey` increments at end of `moving` phase, not at tick change

---

## Components

### Character Pin (div layer)

```
┌─────────────┐
│  NAME CHIP  │  ← semi-transparent label, always visible
│      ●      │  ← glowing dot, pulses gently
└─────────────┘
```

- Orange + stronger glow for manual characters (Jolene)
- Cyan for NPCs
- Hover: tooltip appears above pin (`animate-fade-in-up`) showing name + location name
- Click: calls `onSelectCharacter(char.id)` (same as clicking in the list)
- Multiple characters at same location: dots cluster offset by ~8px, single shared name chip shows count

### Tooltip (on hover)

```
┌────────────────────┐
│ Jolene Voss        │  ← name, bold
│ DOWNTOWN           │  ← location, monospace dim
└────────────────────┘
         ▼
```

Dark frosted glass (`rgba(18,17,42,0.95)`, `backdrop-filter: blur(8px)`), matches existing card style.

---

## Animation System

### 1. Ambient Particles (always running)

- 2–3 `<circle>` elements per road, staggered with different `animation-delay` and `animation-duration`
- Uses CSS `offset-path` pointing to the road's SVG path — particles drift along exact road geometry
- Speed: 4–8s per traversal, randomized per particle
- Color: mostly cyan (`#22d3ee` at 0.45 opacity), occasional orange particle for warmth
- Always running, not affected by tick transitions

### 2. Tick Transition (state machine)

Driven by `transitionPhase` in `App.jsx`:

```
idle → moving (600ms) → settling (400ms) → idle
```

**`moving` phase** (0–600ms):
- MapPanel computes diff: which characters changed location
- Renders SVG trail paths from old → new position (`stroke-dashoffset` draw animation, 500ms)
- Pin divs animate from old `x/y` to new `x/y` (CSS transition, `cubic-bezier(0.16, 1, 0.3, 1)`)
- Content panels: opacity dimmed to 0.6 (subtle, not jarring)
- If `active_map` changed: map image crossfades first (200ms), then pins animate

**`settling` phase** (600–1000ms):
- `contentKey` increments → panels crossfade to new content
- Trail SVG paths fade out
- Pins spring-bounce to final position (slight overshoot, `cubic-bezier(0.34, 1.56, 0.64, 1)`)

**`idle`** (after 1000ms):
- Everything stable, ambient particles dominate

### 3. Hover Tooltip

Pure React state (`hoveredPin` in MapPanel). Appears/disappears with `animate-fade-in-up` (already defined in `index.css`). No state machine involvement.

---

## CSS Additions (`index.css`)

Two new keyframes:

**`particle-drift`** — used with `offset-path` for ambient road particles:
```css
@keyframes particle-drift {
  from { offset-distance: 0%; }
  to   { offset-distance: 100%; }
}
```

**`trail-draw`** — already implicitly covered by `stroke-dashoffset` via inline animation style (no new keyframe needed, `stroke-dashoffset` animates via CSS transition or existing animation infrastructure).

The existing `pin-pulse` and `dot-bounce` keyframes in `index.css` (currently unused after the map refactor) will be put back to use for the glowing dots.

---

## Build Pipeline

The world-clock or a separate build step needs to:
1. Copy `worlds/<world>/maps/*.json` → `app/ui/public/dist/maps/`
2. Ensure map images referenced in map config are present in `app/ui/public/maps/`

For now, this can be a manual copy step. The build pipeline integration can be formalized later.

---

## Files Changed

| File | Change |
|------|--------|
| `worlds/billings-montana/maps/billings-central.json` | **New** — map bundle for current world |
| `app/ui/public/maps/billings-central.jpg` | **New** — move/copy current `map.jpg` here |
| `app/ui/public/dist/maps/billings-central.json` | **New** — built copy of map config |
| `app/ui/src/components/MapPanel.jsx` | **Rewrite** — SVG + div layers, animation props |
| `app/ui/src/hooks/useWorldData.js` | **Modify** — fetch and return `mapConfig` |
| `app/ui/src/App.jsx` | **Modify** — `transitionPhase` state machine, pass `mapConfig` |
| `app/ui/src/index.css` | **Modify** — add `particle-drift` keyframe |

---

## Out of Scope

- Coordinate picker UI (manual config file is sufficient for now)
- Multiple simultaneous maps in one view
- Character path history visualization
- Mobile / touch interactions
