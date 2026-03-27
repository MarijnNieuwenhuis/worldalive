---
name: world
description: Manage worlds — create new, resume world-building, create events, check consistency, or list all worlds
---

# World Skill

Unified skill for all world-building operations. Full session behavior lives in `~/agents/world-builder/SOUL.md`.

**Always read `~/agents/world-builder/SOUL.md` before starting any operation** — it governs tone, depth, and how to run the session.

## Directory Structure

```
~/worlds/
  {world-name}/
    world.md          — summary, tone, era, what makes it distinct
    geography.md      — landscape, cities, key locations
    culture.md        — social structure, values, customs, daily life
    history.md        — chronological timeline of world events
    rules.md          — law, technology, economy, unusual rules
    events/           — one file per event: YYYY-MM-event-title.md
    stories/          — ingested stories set in this world
    characters/
      manual/         — human-crafted characters
      generated/      — AI-generated characters
```

## Gotchas

- World folder names must be lowercase kebab-case. Convert user-provided names (e.g., "Billings Montana" → `billings-montana`).
- Template stubs live in `~/agents/templates/world/`. If that directory is missing, stop and tell the user — do not invent file contents.
- Never modify `rules.md` to accommodate a story or event retroactively — flag the contradiction in `world.md` under "## Unresolved Contradictions" and let the user decide.
- When creating an event that affects characters, always list the affected characters in the event file before triggering `/character update-all` — don't let the update run blind.

---

## Sub-commands

### /world new

Create a new world from scratch via questionnaire.

1. Ask for the world's name (will become the folder name in kebab-case) and a one-line concept.
2. Create `~/worlds/{world-name}/` and all subdirectories (`events/`, `stories/`, `characters/manual/`, `characters/generated/`).
3. Copy stub files from `~/agents/templates/world/`.
4. Begin the questionnaire from `world.md` per world-builder SOUL.md.

---

### /world resume [name]

Resume building an existing world.

1. Read all files in `~/worlds/{name}/`.
2. Identify incomplete files and H2 sections.
3. Report: "Covered: world.md, geography. Picking up at: culture."
4. Resume from the first incomplete file or section per world-builder SOUL.md.

---

### /world event [world-name]

Create a world event and propagate its effects.

1. Ask the user to describe what happened (or read from context).
2. Read relevant world files to understand impact.
3. Create `~/worlds/{world-name}/events/YYYY-MM-{event-title}.md` with: what happened, where/when, who's affected, how the world changes.
4. Update `history.md` with a new timeline entry.
5. Update any directly affected world files (geography, culture, rules).
6. List all affected characters in the event file.
7. Offer to trigger `/character update-all` for that world with the event as context — dispatches one subagent per affected character in parallel.

---

### /world list

Show all worlds and their status.

1. List all directories in `~/worlds/`.
2. For each world, read `world.md` (first paragraph) and count characters.
3. Present:

```
billings-montana  — Billings, MT, present day — 11 characters (manual: 1, generated: 10)
...
```

---

### /world consistency-check [world-name]

Check a world (and optionally a specific story or event) for internal contradictions.

1. Read all world files.
2. Optionally read a specific story or event file.
3. Identify contradictions: timeline gaps, geography conflicts, rule violations.
4. Report findings. Flag serious issues in `world.md` under "## Unresolved Contradictions".

---

## Notes

- When world events affect characters, use `/character update-all` with the world name and event file as context.
- Never delete a world without explicit user confirmation.
