---
name: world-to-json
description: Convert world .md files to versioned JSON snapshots in dist/ after each world-clock tick
---

# World-to-JSON Conversion Skill

Reads all world files and produces a full set of JSON snapshots in `dist/`. Run this after every world-clock tick.

## Output schema

Always follow `docs/world-json-schema.md` exactly. Every file must include `"schema_version": 1`.

## Steps

1. Read `worlds/billings-montana/clock.md` to get the current timestamp. Parse the `Current time:` line and convert to `YYYY-MM-DD-HHmm` format (e.g., `Thursday 2026-03-26 at 09:00` → `2026-03-26-0900`). This is `{timestamp}`.

2. Create directories:
   - `dist/ticks/{timestamp}/`
   - `dist/ticks/{timestamp}/characters/`
   - `dist/ticks/{timestamp}/scenes/`
   - `dist/assets/` (if it doesn't exist)

3. Write `dist/ticks/{timestamp}/world.json`:
   - Read `worlds/billings-montana/geography.md` to extract location names
   - Assign x/y coordinates to locations (use existing coordinates if `dist/assets/locations.json` exists, otherwise assign sensible defaults spread across the 0–100 grid)
   - Read `worlds/billings-montana/clock.md` for active events this tick
   - Output per schema

4. For each character in `worlds/billings-montana/characters/manual/` and `worlds/billings-montana/characters/generated/` where `STATUS.md` shows `Type: active` or `Type: manual`:
   - Read all their `.md` files
   - Extract: current location from STATUS.md, health status from STATUS.md (default `healthy` if not set)
   - Distill soul.md into a 1-paragraph `soul_summary`
   - Distill personality.md into 2-sentence `personality_summary`
   - Extract top current goal from goals.md into 1-sentence `goals_summary`
   - Extract all relationships from relationships.md into the relationships array
   - Extract the diary entry for this tick from diary.md (the most recent entry)
   - Write `dist/ticks/{timestamp}/characters/{character-id}.json`
   - Add character ID to both `all_characters` and (if in a significant event) `active_characters` in the index entry

5. Read the scene file for this tick from `worlds/billings-montana/scenes/`. The scene file is named `{timestamp}.md`. Extract narrative, characters involved, location, and events list. Write `dist/ticks/{timestamp}/scenes/{timestamp}.json`.

6. Read existing `dist/index.json` (create it fresh if it doesn't exist). Add a new entry for this tick:
   - `timestamp`: the current `{timestamp}`
   - `label`: human-readable (e.g., `Thursday, March 26 · 09:00`)
   - `summary`: one sentence summarising what happened this tick (from the scene)
   - `all_characters`: list of ALL character IDs written this tick
   - `active_characters`: list of character IDs involved in significant events
   - `last_modified`: current UTC time in ISO 8601
   Write `dist/index.json`.

7. Verify: read back each written file and confirm it is valid JSON with `schema_version: 1`. If any file is malformed, fix it before reporting done.

8. Report: "Conversion complete. Wrote {N} character files + world.json + scene file. dist/index.json now has {M} ticks."

## Gotchas

- `health_status` must be one of: `healthy`, `injured`, `hospitalized`, `deceased`, `absent`. If STATUS.md doesn't mention health, use `healthy`.
- `current_location` must match a location `id` in `world.json`. If a character's location from STATUS.md doesn't match any location, add it to the locations list with a default coordinate.
- Never overwrite an existing tick's files — if `dist/ticks/{timestamp}/` already exists, skip and report: "Tick {timestamp} already exists — skipping. Delete the folder to regenerate."
- Diary entries in `diary.md` are separated by `## ` headings. Extract only the entry whose heading matches this tick's date/time.
- If a character has no diary entry for this tick (generated characters without diary.md), set `diary_entry` to `""`.
- Character `type` comes from STATUS.md: `Type: manual` → `"manual"`, `Type: active` or `Type: generated` → `"generated"`.
