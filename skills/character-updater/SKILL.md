---
name: character-updater
description: Propagate world events into deep character files after a world-clock tick. Called automatically by world-clock — not user-invocable.
---

# Character-Updater Skill

Updates deep character files based on what happened in a scene. Called by world-clock at the end of each step during a time advance.

## Input

You will be given:
- The path to the scene file for this step (e.g., `worlds/billings-montana/scenes/2026-03-28-2000.md`)
- A list of characters affected by significant events this step, and what happened to each

## What counts as a significant event

Not every location update needs deep file changes. Only update deep files when something actually happened to the character:

| What happened | Files to update |
|--------------|-----------------|
| Injury, illness, or physical crisis | `history.md` (add `## [YYYY-MM] Event Title` entry), `goals.md` if recovery shifts priorities |
| First meaningful encounter with another character | `relationships.md` (add H2 section for the person) |
| Existing relationship changes — deepens, fractures, shifts | `relationships.md` (update the relevant H2 section) |
| Experience that challenges or confirms a belief | `beliefs.md` and/or `personality.md` |
| Achievement, failure, or turning-point event | `history.md`, optionally `goals.md` or `skills.md` |
| NPC appears in significant event for first time | Promote to active (see NPC Promotion below) |

If the only thing that happened to a character is that they went somewhere per their calendar, do not update their deep files.

## How to write updates

- Always append or update within the file's existing format — never overwrite the whole file
- For `history.md`: add `## [YYYY-MM] Event Title` followed by 2–4 sentences: what happened and what it meant
- For `relationships.md`: add or update an H2 section per person using the standard sub-sections (Who, How they met, Dynamic, History, Feels vs Acts)
- For `beliefs.md`, `goals.md`, `skills.md`, `personality.md`: update the relevant H2 section; preserve what was there

## Contradiction handling

If an event shows a character doing something that contradicts an existing file value:
- Add the new value with a timestamp note: `[Updated after: {scene title, e.g. "Saturday 20:00 — dinner at The Fieldhouse"}]`
- Keep the old value with a note: `[Previously: ...]`
- Append to the character's `STATUS.md` under "Unresolved Contradictions":
  `Scene '{scene title}' shows her doing X, which conflicts with {file}.md entry Y — treat as character growth or one-time exception?`

Never silently overwrite. The user decides what counts as real growth.

## NPC Promotion

When a generated (NPC) character appears in a significant event for the first time, promote them from loosely-tracked to active:

1. Read what the scene revealed about them
2. For each deep file that is stub-only (`soul.md`, `personality.md`, etc.):
   - If the event gave you real information about this dimension, write a minimal entry
   - If the event told you nothing about this dimension, leave it as a stub — do not invent
3. Write `Type: active` to their `STATUS.md`

Only write what the scene actually showed you. A character who broke his leg at the gym gets a `history.md` entry and possibly a `goals.md` update (recovery). He does not get an invented belief system.

## Boundaries

- Never touch `soul.md` — that is owned by character-curator
- Never touch `appearance.md`, `voice.md`, `wardrobe.md`, `items.md` — owned by character-curator
- Never touch world files (`world.md`, `geography.md`, `culture.md`, `rules.md`)
- Never modify the character's `calendar.md` — world-clock owns that
- Never modify `diary.md` — world-clock owns that
