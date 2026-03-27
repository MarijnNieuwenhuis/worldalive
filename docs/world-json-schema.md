# World JSON Schema

Version: 1. Every file carries `"schema_version": 1`.
When the schema changes: update this doc, bump version, update conversion skill and React frontend together.

---

## index.json

Root file. Rebuilt after every tick.

```json
{
  "schema_version": 1,
  "last_modified": "2026-03-27T10:00:00Z",
  "ticks": [
    {
      "timestamp": "2026-03-26-0900",
      "label": "Thursday, March 26 · 09:00",
      "summary": "One sentence describing what happened this tick.",
      "all_characters": ["jolene-voss", "amber-tuck", "marcus-delaney"],
      "active_characters": ["jolene-voss", "amber-tuck"]
    }
  ]
}
```

`last_modified`: ISO 8601 UTC. React uses this to detect new ticks without diffing the full array.
`timestamp`: Format `YYYY-MM-DD-HHmm`. Used as folder name and URL parameter.
`all_characters`: Every character with a JSON file in this tick's `characters/` folder. Used by the character panel to load everyone.
`active_characters`: Character IDs present in a significant event this tick. Used for timeline summary only.

---

## dist/ticks/{timestamp}/world.json

```json
{
  "schema_version": 1,
  "timestamp": "2026-03-26-0900",
  "clock": "Thursday, March 26, 2026 at 09:00",
  "locations": [
    { "id": "tucks-books", "name": "Tuck's Books", "x": 42, "y": 31 },
    { "id": "downtown", "name": "Downtown", "x": 50, "y": 50 },
    { "id": "hospital", "name": "St. Vincent Hospital", "x": 68, "y": 24 }
  ],
  "events": ["Water main break on 1st Ave N Downtown"]
}
```

`x`, `y`: 0–100, percentage of map canvas. Never changes for a given location.
`events`: lists world-level events (things that happened in the world this tick). Distinct from `events` in `scenes/*.json`, which lists scene-specific events (plot points within that scene).

---

## dist/ticks/{timestamp}/characters/{id}.json

```json
{
  "schema_version": 1,
  "id": "jolene-voss",
  "name": "Jolene Voss",
  "type": "manual",
  "current_location": "tucks-books",
  "health_status": "healthy",
  "soul_summary": "One paragraph distilled from soul.md.",
  "personality_summary": "Two sentences from personality.md.",
  "goals_summary": "Current top goal in one sentence.",
  "relationships": [
    {
      "character_id": "amber-tuck",
      "name": "Amber Tuck",
      "dynamic": "recent acquaintance"
    }
  ],
  "diary_entry": "Full diary entry for this tick, written in character voice."
}
```

`type`: one of `manual` (user-crafted, requires approval for changes) or `generated` (AI-generated, auto-updated). Promoted generated characters keep the `generated` type.
`health_status`: one of `healthy`, `injured`, `hospitalized`, `deceased`, `absent`.
`current_location`: must match a location `id` in `world.json`.
`conflicts`: defaults to `[]` (never omitted, never null).
`diary_entry`: defaults to `""` for characters without diary entries (never omitted).

---

## dist/ticks/{timestamp}/scenes/{timestamp}.json

Exactly ONE scene file exists per tick. Path is `dist/ticks/{timestamp}/scenes/{timestamp}.json` — the timestamp is identical to the parent folder's timestamp.

```json
{
  "schema_version": 1,
  "timestamp": "2026-03-26-0900",
  "narrative": "Full scene narrative prose.",
  "characters_involved": ["jolene-voss", "amber-tuck"],
  "location": "tucks-books",
  "events": ["First encounter between Jolene and Amber"]
}
```

`location`: must match a location `id` in `world.json`.
`events`: lists scene-specific events (plot points within that scene). Distinct from `events` in `world.json`, which lists world-level events (things that happened in the world this tick).

---

## dist/pending-events.json

Written by the React UI via `POST /events`. Read and updated by the validate-events skill. Holds ONE pending submission at a time. It is overwritten on each new submission.

```json
{
  "schema_version": 1,
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

`target_time`: the single target time for all events in this submission. One submission = one `target_time`, one `events` array.
`events[].id`: unique identifier within the submission. Format `evt-{unix-timestamp}` is recommended.
`events[].location`: must match a location `id` in `world.json`, same constraint as `current_location` in character files.
`status`: `pending` (just written) → `validated` (no hard blocks) → `blocked` (has hard blocks).

Conflict entry format:
```json
{
  "event_id": "evt-1",
  "character": "jolene-voss",
  "level": "hard",
  "reason": "Jolene is currently hospitalized at St. Vincent Hospital."
}
```

`level`: `hard` (blocks advance) or `warning` (advisory only).
