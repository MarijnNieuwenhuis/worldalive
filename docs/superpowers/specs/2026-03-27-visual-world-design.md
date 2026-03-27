# Visual World — Design Spec

**Date:** 2026-03-27
**Status:** Approved

## Goal

Build a local website that lets you explore the living world visually. Three experiences in one:
- A **fictional SVG map** with character pins showing where everyone is
- A **timeline scrubber** to travel between world-clock ticks
- A **character/scene panel** to read profiles, diaries, and scene files

The world should feel alive — the site auto-updates as new ticks are written, without a page reload. You can also propose clock events from the UI, with a consistency check that prevents impossible situations.

Everything is driven by JSON snapshots converted from the `.md` world files. No database. No cloud (yet).

---

## Architecture

```
worlds/**/*.md
      ↓  (LLM conversion skill — runs after each tick)
dist/ticks/{timestamp}/*.json
      ↑  (validate-events skill writes conflicts back)
dist/pending-events.json
      ↑  (React UI writes proposed events here)
      ↓  (Go app reads local dist/, serves UI)
React frontend (embedded in Go binary)
      ↓
Browser at localhost — polls every 15s for new ticks
```

---

## The 7 Pieces

### ① JSON Schema Spec
**File:** `docs/world-json-schema.md`

Defines every field the conversion skill must produce. Every JSON file carries `"schema_version": 1`. This is the contract between the conversion skill and the React frontend — when either side changes, the schema doc is updated first and the version is bumped.

**Files produced per tick:**
- `world.json` — current clock time, list of locations with coordinates, active events this tick
- `characters/{name}.json` — full character profile: soul, personality, goals, relationships, current location, health status, diary entry for this tick
- `scenes/{timestamp}.json` — scene narrative, which characters were involved, what happened

**Top-level `index.json`:**
- List of all available tick timestamps in chronological order
- Metadata per tick: date/time label, summary sentence, `all_characters` (every character that has a file in the tick), `active_characters` (characters in significant events — for timeline summary)
- `last_modified` timestamp — React uses this to detect new ticks without re-downloading everything

**`pending-events.json`** (written by UI, read by validate-events skill):
```json
{
  "target_time": "2026-03-27-1400",
  "events": [
    {
      "id": "evt-1",
      "description": "Jolene visits the farmers market",
      "characters": ["jolene-voss"],
      "location": "farmers-market"
    }
  ],
  "status": "pending",
  "conflicts": []
}
```

**Schema drift rule:** If the `.md` file structure changes (new file, renamed section), update `docs/world-json-schema.md` first, bump `schema_version`, then update the conversion skill and React frontend together.

### ② LLM Conversion Skill
**File:** `skills/world-to-json/SKILL.md`

Triggered manually after each world-clock tick. Reads all files in `worlds/billings-montana/` and produces JSON into `dist/`. The LLM understands the semi-structured markdown — no fragile parser.

**What it reads:**
- `clock.md` — current world time
- `timeline.md` — list of all past ticks
- `characters/manual/{name}/*.md` — all files per manual character
- `characters/generated/{name}/*.md` — all files per generated/active character
- `scenes/*.md` — one per tick

**What it writes:**
- `dist/index.json` (rebuilt each time — appends new tick, keeps old ones, updates `last_modified`)
- `dist/ticks/{timestamp}/world.json`
- `dist/ticks/{timestamp}/characters/{name}.json` (one per character)
- `dist/ticks/{timestamp}/scenes/{timestamp}.json`

### ③ Validate-Events Skill
**File:** `skills/validate-events/SKILL.md`

Runs before world-clock advances. Reads `dist/pending-events.json` and all current character STATUS.md files. Checks every proposed event for conflicts and writes results back to `pending-events.json`.

**Two levels of conflict:**

| Level | Example | Effect |
|-------|---------|--------|
| **Hard block** | Character is hospitalized, dead, or out of town | Cannot advance — must remove or modify the event |
| **Soft warning** | Character is introverted and wouldn't go to a party | Advance is allowed but warning is shown in the UI |

**Output:** Updates `pending-events.json` with `"status": "validated"` or `"status": "blocked"` and a `conflicts` array. The React UI reads this and shows the result. World-clock skill checks `status` before proceeding — it will not advance if status is `"blocked"`.

### ④ Go 1.26 App
**Location:** `app/`

Single binary. Serves the compiled React + Tailwind bundle from an embedded filesystem (`embed.FS`). Reads and serves JSON from the local `dist/` folder at runtime — no restart needed when new ticks are written.

**Routes:**
- `GET /` — serves the React app shell
- `GET /dist/*` — serves JSON files from local `dist/` directory
- `GET /assets/*` — serves `dist/assets/` (map SVG, portraits)
- `POST /events` — writes proposed events to `dist/pending-events.json`

**Run:** `go run ./app` — open browser at `http://localhost:8080`

**No configuration needed.** Hardcoded port 8080, reads `dist/` relative to working directory.

### ⑤ React Frontend
**Location:** `app/ui/` (built into `app/static/` which Go embeds)

Built with React + Tailwind. Compiled separately (`npm run build`), output embedded into the Go binary.

**On load:**
1. Fetch `/dist/index.json` → populate timeline scrubber
2. Default to the latest tick
3. Fetch that tick's JSON → render all three panels

**Auto-polling:**
- Every 15 seconds, fetch `/dist/index.json` and compare `last_modified`
- If changed and user is on latest tick → silently load new tick, update all panels
- If changed and user is on a historical tick → add new tick to scrubber, show a subtle "New tick available" indicator — do not interrupt the user

**On tick change:**
- Fetch new tick's JSON
- Re-render map pins, character panel, scene panel
- URL updates to `?tick=2026-03-26-2000` so ticks are bookmarkable

**Three panels:**
- **Map panel** — SVG map with character pins. Click a pin → filters to characters at that location
- **Character panel** — list of characters with current location and health status. Click one → full profile, diary entry, relationships
- **Scene panel** — narrative for selected tick, characters involved

**Event creation panel (drawer/sidebar):**
- Propose a new clock advance: target time + free-text event descriptions per character
- Shows every character's current location and health status as you write — visual consistency check
- "Validate" button → calls `POST /events`, then polls `pending-events.json` for result
- Shows hard blocks in red, soft warnings in yellow
- "Advance clock" button only enabled when status is `"validated"` (no hard blocks)
- On advance: user runs world-clock skill in Claude Code (UI shows the command to run)

### ⑥ Custom SVG Map
**File:** `dist/assets/map.svg`

A fictional illustrated map — not tied to real geography. Starts as a placeholder (labeled rectangles for locations), replaced with a proper illustration later without any code changes.

**Coordinate system:** Location coordinates in `world.json` as `x` and `y` (0–100, percentage of map canvas). Character pins are rendered as SVG `<circle>` elements overlaid on the map by the React frontend.

```json
{
  "locations": [
    { "id": "tucks-books", "name": "Tuck's Books", "x": 42, "y": 31 },
    { "id": "downtown", "name": "Downtown", "x": 50, "y": 50 },
    { "id": "hospital", "name": "St. Vincent Hospital", "x": 68, "y": 24 }
  ]
}
```

### ⑦ Validate-Events Skill (see ③ above)
Covered in piece ③.

---

## Local Folder Layout

```
AgentsAtWork/
  app/                          ← Go application
    main.go
    ui/                         ← React + Tailwind source
      src/
      package.json
    static/                     ← compiled React output (embedded by Go)
  dist/                         ← generated by LLM conversion skill
    index.json                  ← tick list + last_modified
    pending-events.json         ← proposed events + validation result
    ticks/
      2026-03-26-0900/
        world.json
        characters/
          jolene-voss.json
          amber-tuck.json
        scenes/
          2026-03-26-0900.json
      2026-03-26-2000/
        ...
    assets/
      map.svg
      portraits/
        jolene-voss.jpg
  skills/
    world-to-json/
      SKILL.md
    validate-events/
      SKILL.md
  docs/
    world-json-schema.md
    superpowers/specs/
      2026-03-27-visual-world-design.md
```

---

## Build Order

| Step | What | Output |
|------|------|--------|
| 1 | Write `docs/world-json-schema.md` | Schema contract |
| 2 | Write `skills/world-to-json/SKILL.md` | Conversion skill |
| 3 | Run conversion skill on existing world | `dist/` populated with real data |
| 4 | Scaffold Go app + React shell | `localhost:8080` serves a blank page |
| 5 | Build timeline scrubber + auto-polling | Ticks load, site updates live |
| 6 | Build character panel + scene panel | Core reading experience works |
| 7 | Build event creation panel + `POST /events` | Can propose events from UI |
| 8 | Write `skills/validate-events/SKILL.md` | Consistency checking works |
| 9 | Build SVG map placeholder + pins | Full visual experience |

---

## Future: Cloud

When ready to share the world publicly:
- GCS bucket for `dist/` (JSON + assets)
- Upload skill: pushes `dist/` to GCS after each tick
- Cloud Run: deploys the Go app as a container
- React fetches JSON from GCS URLs instead of local paths (one config flag in the Go app)

---

## What This Does NOT Include

- User accounts or authentication
- Character editing in the browser (read-only, except event proposals)
- Image generation for portraits (placeholders are fine)
- Automatic world-clock advancement (still triggered manually via Claude Code)
