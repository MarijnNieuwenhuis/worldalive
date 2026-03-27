---
name: character
description: Manage characters — create new, resume questionnaire, update files, generate NPCs, or list all characters
---

# Character Skill

Unified skill for all character operations. All session behavior (questionnaire flow, story ingestion, scenario generation) lives in `~/agents/character-curator/SOUL.md`.

**Always read `~/agents/character-curator/SOUL.md` and `~/worlds/{world-name}/world.md` before starting any operation** — the SOUL.md governs how to run the session and world.md provides setting context (accent, tone, era, geography) that informs character details.

## Directory Structure

```
~/worlds/
  {world-name}/
    world.md                  — setting, lore, rules, tone
    characters/
      manual/                 — human-crafted (approval: required)
        {name}/
      generated/              — AI-generated (approval: auto)
        {name}/
    events/                   — world events that affect characters
    stories/                  — ingested stories
```

A character's `STATUS.md` contains:
- `Type: manual` or `Type: generated`
- `Approval: required` or `Approval: auto`
- `World: {world-name}`

**Manual characters:** Every file change must be shown to the user and approved before writing. No silent updates.
**Generated characters:** Can be updated automatically without confirmation.

## Gotchas

- Template stubs live in `~/agents/templates/character/`. If that directory is missing, stop and tell the user — do not invent file contents.
- Character folder names must be lowercase kebab-case. If the user provides a name with spaces or capitals, convert it (e.g., "Jolene Voss" → `jolene-voss`).
- A character with `Approval: required` must never be modified without showing the diff first — even for small fixes.
- If a character folder already exists under `/generated/` and you're promoting it to `/manual/`, move the folder rather than recreating it — don't lose existing files.

---

## Sub-commands

### /character new

Start a new manual character from scratch via the questionnaire.

1. Ask for the character's name and which world they belong to.
2. Create `~/worlds/{world-name}/characters/manual/{name}/` directory.
3. Copy all stub files from `~/agents/templates/character/` into it, replacing `{{CHARACTER_NAME}}` with the actual name and `[DATE]` with today's date.
4. Set `STATUS.md`: `Type: manual`, `Approval: required`, `Last questionnaire session: {date}`, `Stories ingested: 0`
5. Begin the questionnaire from `soul.md` per character-curator SOUL.md.

---

### /character resume [name]

Resume the questionnaire for an existing manual character.

1. Read all files in `~/worlds/{world-name}/characters/manual/{name}/`.
2. Identify incomplete files and H2 sections (stub content only).
3. Report briefly: "Covered: soul, appearance, voice. Picking up at: personality."
4. Resume from the first incomplete file or section per character-curator SOUL.md.
5. After the session, update `STATUS.md` — set "Last questionnaire session" to today's date and note what was covered.

---

### /character update [name]

Update a specific character based on changed requirements, new information, or user direction.

1. Ask what needs updating (or read the context if it's clear).
2. Read the character's current files.
3. If `Approval: required`: show all proposed changes to the user and get approval before dispatching.
4. Dispatch a subagent to apply the approved changes:
   - Subagent receives: character directory path, current file contents, exact changes to make
   - Subagent writes updates and reports what it changed
5. Note the update in `STATUS.md`.

---

### /character update-all

Propagate changes to all characters in parallel — used when character-curator SOUL.md adds new requirements, new file types, or new H2 sections, or when a story/world event affects the whole cast.

1. Ask which world to update (or all worlds). Read all characters in that world's `characters/manual/` and `characters/generated/`.
2. For each character, identify what needs updating (gaps, new requirements, event impact).
3. **Manual characters first:** Collect all proposed changes across all manual characters, present them to the user grouped by character, and get approval before proceeding.
4. Once approved (or for generated characters without approval needed), dispatch one subagent per character in parallel:
   - Each subagent receives: character directory path, current file contents, exact changes to make
   - Each subagent applies changes and reports what it did
5. After all subagents complete, report: "Updated N characters. Changes: [summary per character]"

---

### /character generate [n]

Auto-generate N characters in parallel using multiple subagents.

**Input required:**
1. How many characters (n)
2. Optional brief for each or for all: genre, role, relationship to others, any constraints

**Steps:**
1. If no brief given, ask for one — even "diverse supporting cast for a noir story" is enough.
2. Dispatch N subagents in parallel, each generating one complete character:
   - Each subagent creates `~/worlds/{world-name}/characters/generated/{generated-name}/`
   - Copies templates, fills all 13 files based on the brief
   - Sets `STATUS.md`: `Type: generated`, `Approval: auto`
   - Writes a short summary of who they created
3. After all subagents complete, present a summary of all generated characters.
4. Ask the user: "Want to promote any of these to manual?" — promoted characters move to `manual/`, their STATUS.md updates to `Approval: required`.

**Naming:** Use lowercase kebab-case real names unless the brief specifies otherwise (e.g., `amber-tuck`, `marcus-delaney`). Avoid role-based names like `the-bartender` unless the character is intentionally anonymous.

---

### /character list

Show all characters and their status.

1. List all worlds in `~/worlds/`. For each world, read `STATUS.md` for every character in `characters/manual/` and `characters/generated/`.
2. Present a table:

```
Manual characters:
  jolene-voss   — last session: 2026-03-24, stories: 0, files: 12/13 complete

Generated characters:
  amber-tuck    — active, last updated: 2026-03-26
  ...
```

3. Flag any character with incomplete files or unresolved contradictions.

---

## Notes

- When a story event or world event affects characters, use `/character update [name]` or `/character update-all` with the event as context.
- Never delete a character directory without explicit user confirmation, regardless of type.
