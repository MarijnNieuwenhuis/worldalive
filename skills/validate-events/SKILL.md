---
name: validate-events
description: Check proposed clock events in dist/pending-events.json against current character states. Run before advancing the world clock.
---

# Validate-Events Skill

Reads `dist/pending-events.json` and current character JSON files. Checks every proposed event for conflicts. Updates `pending-events.json` with results.

## Steps

1. Read `dist/pending-events.json`. If it doesn't exist or `status` is not `pending`, stop: "No pending events to validate."

2. Read `dist/index.json`. If it doesn't exist or the `ticks` array is empty, skip character state checks and set status to `"validated"` with a warning: "No world state loaded — character checks skipped." Otherwise read the last entry in `ticks` and load each character's JSON from `dist/ticks/{latest-timestamp}/characters/`.

3. For each event in `pending-events.json`:
   - For each character listed in `event.characters`:
     - Check `health_status`:
       - `hospitalized`, `deceased`, or `absent` → **hard block**: "Cannot participate — currently {health_status}."
       - `injured` and the event location is physically demanding (e.g., hiking trail, farm, construction site, sports field — anywhere that requires physical exertion) → **warning**: "Character is injured."
     - Check `event.location`: if it is not in the world's `locations` list (from `dist/ticks/{latest-timestamp}/world.json`) → **hard block**: "Location '{location}' not found in world."
     - Check the character's `personality_summary` field from their character JSON. If the proposed activity strongly contradicts their personality → **warning** only (never a hard block).

4. Build the `conflicts` array. Each entry: `{ "event_id": "...", "character": "...", "level": "hard" | "warning", "reason": "..." }`.

5. Set `status`:
   - `"blocked"` if any conflict has `level: "hard"`
   - `"validated"` if there are only warnings or no conflicts

6. Write the updated object back to `dist/pending-events.json`.

7. Report:
   - If blocked: "Validation BLOCKED. {N} hard conflicts: [list reasons]"
   - If validated with warnings: "Validation PASSED with {N} warnings: [list warnings]"
   - If clean: "Validation PASSED. No conflicts."

## Gotchas

- Only check characters listed in `event.characters` — do not infer other characters who might be at the same location.
- Personality checks are advisory only — never hard-block based on personality. A shy character visiting a bar is a warning, not a block.
- If `dist/ticks/` is empty (no ticks yet), skip character state checks and set status to `"validated"` with a warning: "No world state loaded — character checks skipped."
- `absent` is a hard block (covered in Step 3) — an absent character is not physically present and cannot participate.
