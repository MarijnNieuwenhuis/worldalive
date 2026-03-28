# Map Animations & Scene Transitions — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the Billings World map to life with animated character pins, ambient road particles, and a cinematic map-first tick transition.

**Architecture:** Hybrid SVG + div layers over the map image. SVG handles road geometry, ambient particle animations (`<animateMotion>`), and tick trail draw (`<animate>`). HTML divs handle character pins (dot + name chip) with hover tooltips and click-to-select. App.jsx drives a 3-phase transition state machine (`idle → moving → settling → idle`) that animates the map before updating the content panels.

**Tech Stack:** React 19, Vite, Tailwind CSS, vanilla SVG animations (`animateMotion`, `animate`), CSS custom properties

---

## Important: Where Files Live

- World tick data served by Go server from `dist/` at `http://localhost:8080/dist/`
- Vite dev server proxies `/dist/*` → `http://localhost:8080/dist/`
- Map config JSON goes in `dist/maps/` (served at `/dist/maps/<id>.json`)
- Map images go in `app/ui/public/maps/` (served by Vite at `/maps/<file>.jpg`)
- Source of truth for map config: `worlds/<world>/maps/<id>.json` → manually copied to `dist/maps/`
- `world.json` already has `locations[]` with `x`/`y` as integers 0–100 (percent of map dimensions)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `worlds/billings-montana/maps/billings-central.json` | **Create** | Source map bundle (roads + image ref) |
| `app/ui/public/maps/billings-central.jpg` | **Create** | Copy of existing `map.jpg`, new location |
| `dist/maps/billings-central.json` | **Create** | Runtime copy served at `/dist/maps/` |
| `dist/ticks/*/world.json` | **Modify** | Add `"active_map": "billings-central"` to each |
| `app/ui/src/hooks/useWorldData.js` | **Modify** | Fetch and return `mapConfig` per tick |
| `app/ui/src/components/MapPanel.jsx` | **Rewrite** | SVG layer + div pin layer + transition props |
| `app/ui/src/App.jsx` | **Modify** | Transition state machine + prevCharacters ref + pass new props |
| `app/ui/src/index.css` | **Modify** | Add `pin-arrive` keyframe |

---

## Task 1: Map bundle, image, and world.json wiring

**Files:**
- Create: `worlds/billings-montana/maps/billings-central.json`
- Create: `app/ui/public/maps/billings-central.jpg` (copy of existing map)
- Create: `dist/maps/billings-central.json` (copy of bundle)
- Modify: all `dist/ticks/*/world.json`

- [ ] **Step 1: Create the worlds map bundle**

```bash
mkdir -p worlds/billings-montana/maps
```

Create `worlds/billings-montana/maps/billings-central.json`:

```json
{
  "id": "billings-central",
  "image": "/maps/billings-central.jpg",
  "roads": [
    { "id": "grand-ave",    "d": "M 0,268 L 1000,268" },
    { "id": "central-ave",  "d": "M 0,415 L 1000,415" },
    { "id": "27th-street",  "d": "M 420,0 L 420,671" },
    { "id": "king-ave",     "d": "M 0,470 L 1000,470" },
    { "id": "rimrock-drive","d": "M 0,134 Q 400,115 720,161 Q 900,181 1000,201" }
  ]
}
```

> Road paths use a 1000×671 viewBox (matches the map's 5056×3392 native aspect ratio, scaled ÷5.056). `x`-values in road paths are 0–1000, `y`-values are 0–671. These are rough approximations — adjust `d` values after visual verification in Step 5.

- [ ] **Step 2: Copy the map image to the new location**

```bash
mkdir -p app/ui/public/maps
cp app/ui/public/map.jpg app/ui/public/maps/billings-central.jpg
```

> Keep `app/ui/public/map.jpg` in place for now — it will be removed in Task 3 when MapPanel stops referencing it.

- [ ] **Step 3: Create the dist/maps directory and copy the bundle**

```bash
mkdir -p dist/maps
cp worlds/billings-montana/maps/billings-central.json dist/maps/billings-central.json
```

- [ ] **Step 4: Add `active_map` to every world.json tick file**

Run this to patch all existing ticks:

```bash
for f in dist/ticks/*/world.json; do
  # Insert "active_map" after the opening brace if not already present
  if ! grep -q '"active_map"' "$f"; then
    sed -i 's/^{/{/' "$f"
    # Use node for reliable JSON editing
    node -e "
      const fs = require('fs');
      const d = JSON.parse(fs.readFileSync('$f','utf8'));
      d.active_map = 'billings-central';
      fs.writeFileSync('$f', JSON.stringify(d, null, 2));
    "
  fi
done
```

Verify:
```bash
cat dist/ticks/2026-03-26-0900/world.json | grep active_map
```
Expected: `"active_map": "billings-central"`

- [ ] **Step 5: Verify files exist**

```bash
ls dist/maps/
ls app/ui/public/maps/
```
Expected output:
```
dist/maps/:
billings-central.json

app/ui/public/maps/:
billings-central.jpg
```

- [ ] **Step 6: Commit**

```bash
git add worlds/billings-montana/maps/billings-central.json
git add app/ui/public/maps/billings-central.jpg
git add dist/maps/billings-central.json
git add dist/ticks/
git commit -m "feat: add billings-central map bundle and wire active_map to all ticks"
```

---

## Task 2: useWorldData — fetch mapConfig

**Files:**
- Modify: `app/ui/src/hooks/useWorldData.js`

- [ ] **Step 1: Add mapConfig state and fetch logic**

Open `app/ui/src/hooks/useWorldData.js`. Replace the entire file with:

```js
import { useState, useEffect, useRef, useCallback } from 'react'

const POLL_INTERVAL_MS = 15000

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  return res.json()
}

export function useWorldData(currentTick, setTick) {
  const [index, setIndex] = useState(null)
  const [world, setWorld] = useState(null)
  const [characters, setCharacters] = useState([])
  const [scene, setScene] = useState(null)
  const [mapConfig, setMapConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTickAvailable, setNewTickAvailable] = useState(false)

  const lastModifiedRef = useRef(null)
  const lastMapIdRef = useRef(null)

  const resolveActiveTick = useCallback((idx, tick) => {
    if (tick) return tick
    return idx.ticks[idx.ticks.length - 1]?.timestamp ?? null
  }, [])

  const loadTick = useCallback(async (timestamp) => {
    const base = `/dist/ticks/${timestamp}`
    const [worldData, sceneData] = await Promise.all([
      fetchJSON(`${base}/world.json`),
      fetchJSON(`${base}/scenes/${timestamp}.json`),
    ])

    const idx = await fetchJSON('/dist/index.json')
    const tickMeta = idx.ticks.find(t => t.timestamp === timestamp)
    const allCharIds = tickMeta?.all_characters ?? []

    const charData = await Promise.all(
      allCharIds.map(id => fetchJSON(`${base}/characters/${id}.json`))
    )

    // Fetch map config only when it changes (or on first load)
    const mapId = worldData.active_map ?? 'billings-central'
    let mapCfg = null
    if (mapId !== lastMapIdRef.current) {
      mapCfg = await fetchJSON(`/dist/maps/${mapId}.json`)
      lastMapIdRef.current = mapId
    }

    return { worldData, sceneData, charData, mapCfg }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchJSON('/dist/index.json')
      .then(async (idx) => {
        if (cancelled) return
        lastModifiedRef.current = idx.last_modified
        setIndex(idx)

        const activeTick = resolveActiveTick(idx, currentTick)
        if (!activeTick) { setLoading(false); return }

        const { worldData, sceneData, charData, mapCfg } = await loadTick(activeTick)
        if (cancelled) return
        setWorld(worldData)
        setScene(sceneData)
        setCharacters(charData)
        if (mapCfg) setMapConfig(mapCfg)
        setLoading(false)
      })
      .catch(err => {
        if (!cancelled) { setError(err.message); setLoading(false) }
      })

    return () => { cancelled = true }
  }, [currentTick])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const idx = await fetchJSON('/dist/index.json')
        if (idx.last_modified === lastModifiedRef.current) return

        lastModifiedRef.current = idx.last_modified
        setIndex(idx)

        const isOnLatest = !currentTick ||
          currentTick === index?.ticks[index.ticks.length - 1]?.timestamp

        if (isOnLatest) {
          const newLatest = idx.ticks[idx.ticks.length - 1]?.timestamp
          if (newLatest) {
            const { worldData, sceneData, charData, mapCfg } = await loadTick(newLatest)
            setWorld(worldData)
            setScene(sceneData)
            setCharacters(charData)
            if (mapCfg) setMapConfig(mapCfg)
            setTick(newLatest)
          }
        } else {
          setNewTickAvailable(true)
        }
      } catch (_) {
        // Silent fail on poll
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [currentTick, index, loadTick, setTick])

  return { index, world, characters, scene, mapConfig, loading, error, newTickAvailable, setNewTickAvailable }
}
```

- [ ] **Step 2: Update App.jsx to destructure mapConfig**

In `app/ui/src/App.jsx`, find the `useWorldData` destructure line and add `mapConfig`:

```js
const {
  index, world, characters, scene, mapConfig,
  loading, error,
  newTickAvailable, setNewTickAvailable
} = useWorldData(currentTick, setTick)
```

- [ ] **Step 3: Verify in browser**

Start the dev server: `cd app/ui && npm run dev`

Open browser devtools console. Add a temporary log in App.jsx after the destructure:

```js
console.log('mapConfig', mapConfig)
```

Reload. Expected: `mapConfig { id: "billings-central", image: "/maps/billings-central.jpg", roads: [...] }`

Remove the console.log after verifying.

- [ ] **Step 4: Commit**

```bash
git add app/ui/src/hooks/useWorldData.js app/ui/src/App.jsx
git commit -m "feat: useWorldData fetches mapConfig from /dist/maps/"
```

---

## Task 3: MapPanel — map image + SVG roads + ambient particles

**Files:**
- Rewrite: `app/ui/src/components/MapPanel.jsx`

- [ ] **Step 1: Rewrite MapPanel with image layer and SVG ambient layer**

Replace `app/ui/src/components/MapPanel.jsx` entirely:

```jsx
import { useState } from 'react'

export default function MapPanel({ world, characters, mapConfig, transitionPhase, prevCharacters, onSelectCharacter }) {
  const [hoveredPin, setHoveredPin] = useState(null)

  // Defensive: render nothing until mapConfig is loaded
  if (!mapConfig) {
    return (
      <div className="absolute inset-0" style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }} />
    )
  }

  return (
    <div className="absolute inset-0" style={{ background: '#12112a', borderRadius: 'var(--radius-card)' }}>

      {/* ── Layer 1: Map image ── */}
      <img
        src={mapConfig.image}
        alt=""
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'fill',
          borderRadius: 'var(--radius-card)',
          opacity: 0.96,
        }}
      />

      {/* ── Layer 2: SVG — roads + ambient particles + tick trails ── */}
      <svg
        viewBox="0 0 1000 671"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {mapConfig.roads.map(road => (
            <path key={road.id} id={`road-${road.id}`} d={road.d} />
          ))}
        </defs>

        {/* Road strokes — subtle dark lines */}
        {mapConfig.roads.map(road => (
          <use key={road.id} href={`#road-${road.id}`} fill="none" stroke="#1a1936" strokeWidth="4" />
        ))}

        {/* Ambient particles — 3 per road, staggered timing */}
        {mapConfig.roads.flatMap((road, ri) =>
          [0, 1, 2].map(pi => {
            const isOrange = pi === 0 && ri % 4 === 0
            const dur = `${4.5 + ri * 0.7 + pi * 1.3}s`
            const begin = `${-(pi * 1.8 + ri * 0.55)}s`  // negative begin = start mid-animation
            return (
              <circle
                key={`${road.id}-p${pi}`}
                r={pi === 0 ? 2 : 1.5}
                fill={isOrange ? '#f97316' : '#22d3ee'}
                opacity={pi === 0 ? 0.5 : 0.3}
                style={{ filter: `blur(${pi === 0 ? 0 : 0.5}px)` }}
              >
                <animateMotion dur={dur} repeatCount="indefinite" begin={begin}>
                  <mpath href={`#road-${road.id}`} />
                </animateMotion>
              </circle>
            )
          })
        )}

        {/* Tick transition trails — added in Task 6 */}
      </svg>

      {/* ── Layer 3: Character pins ── added in Task 4 */}

      {/* Active count chip */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        {(() => {
          const active = characters.filter(c => {
            const locName = world?.locations?.find(l => l.id === c.current_location)?.name ?? ''
            return locName.toLowerCase() !== 'home'
          }).length
          return (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
              style={{
                background: 'rgba(18,17,31,0.72)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(38,37,69,0.5)',
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: 3, background: '#22d3ee', display: 'inline-block', boxShadow: '0 0 5px rgba(34,211,238,0.5)', flexShrink: 0 }} />
              <span className="font-mono text-[10px]" style={{ color: '#64748b' }}>
                {active} <span style={{ color: '#4a4970' }}>out in Billings</span>
              </span>
            </div>
          )
        })()}
      </div>

    </div>
  )
}
```

- [ ] **Step 2: Pass mapConfig and new props from App.jsx**

In `app/ui/src/App.jsx`, find the `<MapPanel` usage and update it:

```jsx
<MapPanel
  world={world}
  characters={characters}
  mapConfig={mapConfig}
  transitionPhase="idle"
  prevCharacters={[]}
  onSelectCharacter={setSelectedCharacter}
/>
```

> `transitionPhase` and `prevCharacters` are hardcoded stubs for now — wired up properly in Task 5.

- [ ] **Step 3: Verify in browser**

Run `cd app/ui && npm run dev`. Open the app.

Expected:
- Map image displays as before (now from `/maps/billings-central.jpg`)
- Tiny glowing dots drift along the road lines you defined
- No console errors about mapConfig

If particles are invisible: adjust road `d` values in `billings-central.json` so paths cross visible map areas. After editing `worlds/billings-montana/maps/billings-central.json`, copy to `dist/maps/`:
```bash
cp worlds/billings-montana/maps/billings-central.json dist/maps/billings-central.json
```

- [ ] **Step 4: Commit**

```bash
git add app/ui/src/components/MapPanel.jsx app/ui/src/App.jsx
git commit -m "feat: MapPanel SVG layer with road paths and ambient particle animations"
```

---

## Task 4: MapPanel — character pins (div layer)

**Files:**
- Modify: `app/ui/src/components/MapPanel.jsx`
- Modify: `app/ui/src/index.css`

- [ ] **Step 1: Add pin-arrive keyframe to index.css**

In `app/ui/src/index.css`, add after the existing `@keyframes tick-bounce` block:

```css
@keyframes pin-arrive {
  0%   { transform: scale(0.4); opacity: 0; }
  60%  { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(1.0); opacity: 1; }
}

.animate-pin-arrive { animation: pin-arrive 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
```

- [ ] **Step 2: Add the pin rendering function and character pins layer to MapPanel**

In `app/ui/src/components/MapPanel.jsx`, add the `CharacterPin` component before the `export default` line, and add the pins layer inside the main return:

```jsx
function CharacterPin({ char, loc, isHovered, onHover, onClick }) {
  const isManual = char.type === 'manual'
  const color = isManual ? '#f97316' : '#22d3ee'
  const dotSize = isManual ? 10 : 8
  const firstName = char.name.split(' ')[0].toUpperCase()

  return (
    <div
      style={{
        position: 'absolute',
        left: `${loc.x}%`,
        top: `${loc.y}%`,
        transform: 'translate(-50%, -50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        cursor: 'pointer',
        zIndex: isManual ? 10 : 5,
      }}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover(null)}
      onClick={onClick}
    >
      {/* Tooltip — shown on hover */}
      {isHovered && (
        <div
          className="animate-fade-in-up"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(18,17,42,0.95)',
            border: '1px solid #262545',
            borderRadius: 10,
            padding: '6px 10px',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(8px)',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f1f5f9', fontFamily: 'system-ui' }}>
            {char.name}
          </div>
          <div style={{ fontSize: 9, color: '#64748b', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>
            {loc.name}
          </div>
          {/* Arrow */}
          <div style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '5px solid #262545',
          }} />
        </div>
      )}

      {/* Name chip */}
      <div style={{
        fontSize: 9, fontWeight: 700, fontFamily: 'monospace',
        padding: '2px 6px', borderRadius: 5,
        background: isManual ? 'rgba(249,115,22,0.15)' : 'rgba(34,211,238,0.08)',
        border: `1px solid ${isManual ? 'rgba(249,115,22,0.35)' : 'rgba(34,211,238,0.2)'}`,
        color,
        whiteSpace: 'nowrap', letterSpacing: '0.05em',
        pointerEvents: 'none',
      }}>
        {firstName}
      </div>

      {/* Glowing dot + pulse ring */}
      <div style={{ position: 'relative', width: dotSize, height: dotSize, flexShrink: 0 }}>
        {/* Pulse ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: `1.5px solid ${color}`,
          animation: 'pin-pulse 2.5s ease-out infinite',
          opacity: 0.6,
        }} />
        {/* Dot */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          background: color,
          boxShadow: isManual
            ? '0 0 10px rgba(249,115,22,0.7), 0 0 20px rgba(249,115,22,0.3)'
            : '0 0 8px rgba(34,211,238,0.6)',
          animation: 'glow-pulse 3s ease-in-out infinite',
        }} />
      </div>
    </div>
  )
}
```

Then inside `MapPanel`'s return, after the `</svg>` closing tag and before the active count chip, add the pin layer:

```jsx
{/* ── Layer 3: Character pins ── */}
{(() => {
  // Group characters by location to handle clustering
  const byLocation = {}
  characters.forEach(char => {
    const loc = world?.locations?.find(l => l.id === char.current_location)
    if (!loc) return
    if (!byLocation[char.current_location]) byLocation[char.current_location] = { loc, chars: [] }
    byLocation[char.current_location].chars.push(char)
  })

  return Object.values(byLocation).flatMap(({ loc, chars }) =>
    chars.map((char, idx) => {
      // Cluster offset: spread multiple chars at same location horizontally
      const clusterOffset = chars.length > 1 ? (idx - (chars.length - 1) / 2) * 14 : 0
      const adjustedLoc = { ...loc, x: loc.x + (clusterOffset / /* mapW estimate */ 600) * 100 }

      return (
        <CharacterPin
          key={char.id}
          char={char}
          loc={adjustedLoc}
          isHovered={hoveredPin === char.id}
          onHover={(e) => e ? setHoveredPin(char.id) : setHoveredPin(null)}
          onClick={() => onSelectCharacter(char.id)}
        />
      )
    })
  )
})()}
```

> The cluster offset uses a rough pixel-to-percent conversion. Adjust the `600` divisor to match your typical map display width if pins look too spread.

- [ ] **Step 3: Verify in browser**

Run the dev server. Expected:
- Character name chips and glowing dots appear on the map at their locations
- Hovering a pin shows a frosted-glass tooltip with name + location
- Clicking a pin selects that character in the right panel
- Multiple characters at the same location are spread horizontally, not overlapping

- [ ] **Step 4: Commit**

```bash
git add app/ui/src/components/MapPanel.jsx app/ui/src/index.css
git commit -m "feat: character pins on map with hover tooltip and click-to-select"
```

---

## Task 5: App.jsx — transition state machine

**Files:**
- Modify: `app/ui/src/App.jsx`

- [ ] **Step 1: Add transition state and prevCharacters ref**

In `app/ui/src/App.jsx`, after the existing `const prevTick = useRef(currentTick)` line, add:

```js
const [transitionPhase, setTransitionPhase] = useState('idle')
const prevCharactersRef = useRef([])
```

- [ ] **Step 2: Freeze prevCharacters when idle**

Add this effect after the existing state declarations:

```js
// Keep prevCharacters up to date while idle — frozen at transition start
useEffect(() => {
  if (transitionPhase === 'idle' && !loading) {
    prevCharactersRef.current = characters
  }
}, [characters, transitionPhase, loading])
```

- [ ] **Step 3: Replace the existing tick-change effect with the 3-phase machine**

Find and remove this existing effect in App.jsx:

```js
// Trigger crossfade animation when tick changes
useEffect(() => {
  if (prevTick.current !== currentTick) {
    setContentKey(k => k + 1)
    prevTick.current = currentTick
  }
}, [currentTick])
```

Replace it with:

```js
// 3-phase tick transition: idle → moving → settling → idle
useEffect(() => {
  if (prevTick.current === currentTick) return

  setTransitionPhase('moving')

  const t1 = setTimeout(() => {
    setContentKey(k => k + 1)   // panels update here, after map has moved
    setTransitionPhase('settling')
  }, 600)

  const t2 = setTimeout(() => {
    setTransitionPhase('idle')
  }, 1000)

  prevTick.current = currentTick

  return () => { clearTimeout(t1); clearTimeout(t2) }
}, [currentTick])
```

- [ ] **Step 4: Dim content panels during moving phase**

Find the Scene Brief panel's scrollable area in App.jsx. It currently reads:

```jsx
<div key={contentKey} className="flex-1 overflow-y-auto card-scroll scroll-fade animate-crossfade">
```

Replace with:

```jsx
<div
  key={contentKey}
  className="flex-1 overflow-y-auto card-scroll scroll-fade animate-crossfade"
  style={{ opacity: transitionPhase === 'moving' ? 0.5 : 1, transition: 'opacity 0.3s ease' }}
>
```

Find the CharacterPanel wrapper div. It currently reads:

```jsx
<div
  className="dash-card overflow-hidden flex flex-col animate-card-enter stagger-2"
  style={{ width: 380, flexShrink: 0, padding: '20px' }}
>
```

Replace with:

```jsx
<div
  className="dash-card overflow-hidden flex flex-col animate-card-enter stagger-2"
  style={{
    width: 380, flexShrink: 0, padding: '20px',
    opacity: transitionPhase === 'moving' ? 0.5 : 1,
    transition: 'opacity 0.3s ease',
  }}
>
```

- [ ] **Step 5: Pass transition props to MapPanel**

Find the `<MapPanel` usage in App.jsx. Replace the stub props from Task 3 with live values:

```jsx
<MapPanel
  world={world}
  characters={characters}
  mapConfig={mapConfig}
  transitionPhase={transitionPhase}
  prevCharacters={prevCharactersRef.current}
  onSelectCharacter={setSelectedCharacter}
/>
```

- [ ] **Step 6: Verify in browser**

Run the dev server. Click a different tick on the timeline scrubber. Expected:
- Content panels (scene brief + character panel) briefly dim (opacity 0.5) for ~600ms
- Then crossfade to new content
- No console errors

- [ ] **Step 7: Commit**

```bash
git add app/ui/src/App.jsx
git commit -m "feat: 3-phase tick transition state machine with panel dimming"
```

---

## Task 6: MapPanel — tick transition trail animations

**Files:**
- Modify: `app/ui/src/components/MapPanel.jsx`

- [ ] **Step 1: Add a TrailPath component above CharacterPin**

In `app/ui/src/components/MapPanel.jsx`, add this component before `CharacterPin`:

```jsx
function TrailPath({ char, oldLoc, newLoc }) {
  const isManual = char.type === 'manual'
  const color = isManual ? '#f97316' : '#22d3ee'
  const strokeW = isManual ? 2.5 : 2

  // Convert 0-100 percent coords to SVG 1000×671 viewBox coords
  const ox = oldLoc.x * 10
  const oy = oldLoc.y * 6.71
  const nx = newLoc.x * 10
  const ny = newLoc.y * 6.71

  // L-shaped path: move horizontally first, then vertically
  const d = `M ${ox.toFixed(1)},${oy.toFixed(1)} L ${nx.toFixed(1)},${oy.toFixed(1)} L ${nx.toFixed(1)},${ny.toFixed(1)}`

  // Path length estimate (Manhattan distance in SVG space)
  const pathLen = Math.round(Math.abs(nx - ox) + Math.abs(ny - oy))
  if (pathLen < 5) return null  // skip if barely moved

  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={strokeW}
      strokeLinecap="round"
      strokeDasharray={pathLen}
      strokeDashoffset={pathLen}
      style={{ filter: `drop-shadow(0 0 4px ${color}80)` }}
    >
      {/* Draw trail from start to end */}
      <animate
        attributeName="stroke-dashoffset"
        from={pathLen}
        to={0}
        dur="0.5s"
        begin="0s"
        fill="freeze"
        calcMode="spline"
        keySplines="0.16 1 0.3 1"
        keyTimes="0;1"
      />
      {/* Fade out after draw completes */}
      <animate
        attributeName="opacity"
        from={1}
        to={0}
        dur="0.35s"
        begin="0.5s"
        fill="freeze"
      />
    </path>
  )
}
```

- [ ] **Step 2: Render trails inside the SVG layer**

In `MapPanel`'s SVG element, find the comment `{/* Tick transition trails — added in Task 6 */}` and replace it with:

```jsx
{/* Tick transition trails — rendered during moving and settling phases */}
{transitionPhase !== 'idle' && prevCharacters.map(prevChar => {
  const currChar = characters.find(c => c.id === prevChar.id)
  if (!currChar) return null
  if (prevChar.current_location === currChar.current_location) return null

  const oldLoc = world?.locations?.find(l => l.id === prevChar.current_location)
  const newLoc = world?.locations?.find(l => l.id === currChar.current_location)
  if (!oldLoc || !newLoc) return null

  return (
    <TrailPath
      key={`trail-${prevChar.id}`}
      char={prevChar}
      oldLoc={oldLoc}
      newLoc={newLoc}
    />
  )
})}
```

- [ ] **Step 3: Animate arriving pins**

In the `CharacterPin` component, add an `arrived` prop. When `true`, the dot plays the arrival animation.

Update the `CharacterPin` signature:

```jsx
function CharacterPin({ char, loc, isHovered, onHover, onClick, arrived }) {
```

Update the dot element inside `CharacterPin` to conditionally apply the arrival animation:

```jsx
{/* Dot */}
<div style={{
  position: 'absolute', inset: 0,
  borderRadius: '50%',
  background: color,
  boxShadow: isManual
    ? '0 0 10px rgba(249,115,22,0.7), 0 0 20px rgba(249,115,22,0.3)'
    : '0 0 8px rgba(34,211,238,0.6)',
  animation: arrived
    ? 'pin-arrive 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both'
    : 'glow-pulse 3s ease-in-out infinite',
}} />
```

Update the pins layer in MapPanel to pass the `arrived` prop. In the `Object.values(byLocation).flatMap(...)` block, add the moved-character detection:

```jsx
// Build a set of character IDs that moved this tick
const movedIds = new Set(
  (prevCharacters ?? [])
    .filter(pc => {
      const cc = characters.find(c => c.id === pc.id)
      return cc && pc.current_location !== cc.current_location
    })
    .map(pc => pc.id)
)
```

Add this const before the `Object.values(byLocation)` call in the pins layer, and pass `arrived` to each pin:

```jsx
return (
  <CharacterPin
    key={char.id}
    char={char}
    loc={adjustedLoc}
    isHovered={hoveredPin === char.id}
    onHover={(e) => e ? setHoveredPin(char.id) : setHoveredPin(null)}
    onClick={() => onSelectCharacter(char.id)}
    arrived={transitionPhase === 'settling' && movedIds.has(char.id)}
  />
)
```

- [ ] **Step 4: Verify in browser**

Run the dev server. Click a different tick on the timeline. Expected:
- Map shows glowing trail lines from old locations to new locations
- Trails draw themselves (dashoffset animation) then fade out
- Arriving pins spring-bounce (scale overshoot) at their new location
- Content panels update after the trails begin (slightly delayed)
- Ambient particles continue running throughout

If no trails appear: check that `prevCharactersRef.current` is being populated (add a temporary `console.log(prevCharactersRef.current)` in the transition effect). Most common issue: prevCharacters was empty when the transition fired — ensure the idle-phase freeze effect is running before any tick changes.

- [ ] **Step 5: Final polish check**

Verify all three behaviors work together:
1. Ambient particles drift along roads — always running ✓
2. Click a tick → map shows character movement trails → panels dim and then crossfade ✓
3. Click a character pin → selects character in right panel ✓
4. Hover a character pin → tooltip appears ✓

- [ ] **Step 6: Commit**

```bash
git add app/ui/src/components/MapPanel.jsx
git commit -m "feat: tick transition trail animations and pin arrival spring effect"
```

---

## Self-Review Notes

- **Spec coverage:** All 7 decisions from the spec are covered: hover+click pins ✓, dot+chip pin style ✓, ambient particles ✓, triggered trails ✓, map-first transition ✓, manual config file ✓, multi-world map bundle ✓
- **Placeholder check:** No TBDs. All code blocks complete.
- **Type consistency:** `transitionPhase` is `'idle' | 'moving' | 'settling'` throughout. `prevCharacters` is always an array (defaults to `[]`). `mapConfig` can be `null` (MapPanel handles gracefully). `loc` objects from `world.locations` have `id`, `name`, `x`, `y` (confirmed from actual world.json).
- **One adjustment from spec:** `particle-drift` CSS keyframe not needed — using SVG `animateMotion`/`mpath` instead, which is cleaner and more browser-compatible. The spec allowed for this ("existing animation infrastructure").
