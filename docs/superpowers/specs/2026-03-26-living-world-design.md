# Living World System — Design Spec

**Date:** 2026-03-26
**Status:** Approved

---

## Overview

Transform the static world/character system into a living world where time advances step-by-step through calendar events, characters are always somewhere, plans propagate automatically, and random events fire without user input. The user controls when time moves and can inject specific events at any point.

---

## Architecture

Three agents with clean separation of concerns:

| Agent | Owns | Does |
|-------|------|------|
| **world-clock** | Time, location, calendar, scenes | Advances time step-by-step, places characters, generates scenes, fires random events, calls character-updater |
| **world-builder** | World files, geography, culture | Builds and maintains the world itself — unchanged |
| **character-curator** | Deep character files | Builds characters through questionnaire — unchanged |

The **character-updater** is a skill (not an agent) called automatically by world-clock during every tick. It propagates events into character files without user intervention.

world-clock and character-curator coordinate through files only — world-clock never writes to deep character files (`soul.md`, `appearance.md`, `voice.md`, etc.). Those stay owned by character-curator.

---

## Time Model

- **User-controlled** — time only advances when the user triggers it
- **Step-by-step through calendar events** — a jump from Friday 23:00 to Sunday 10:00 does not land directly at Sunday 10:00. The world-clock reads all character calendars for the period, identifies every meaningful moment, and processes each as a mini-tick in sequence before arriving at the target time
- **Injection-compatible** — when triggering a time advance, the user can inject specific events: "skip to Sunday 10:00, but Jolene goes shopping Saturday afternoon and Marcus breaks his leg at the gym"
- **Future-ready for visualization** — the step-by-step structure (one scene file per step) makes the timeline trivially visualizable later

### Example: Friday 23:00 → Sunday 10:00

The world-clock discovers these calendar events in the period and processes them in order:

```
→ Saturday 08:00 — X goes to the gym (from calendar)
→ Saturday 14:00 — Y watches a movie (from calendar)
→ Saturday 20:00 — Jolene and Cassidy have a date (from calendar)
→ [Saturday 21:30] — random event fires (world-clock generated)
→ Saturday 23:00 — Z leaves the bar (from calendar)
→ Sunday 10:00 — target reached
```

Each step gets its own `scenes/` file. Characters update after each step. By the time the clock lands at Sunday 10:00, the world has genuinely lived through Saturday.

### Random Events

World-clock generates 1–2 random events per time period (not per step). They fire at the most narratively appropriate step, drawn from world context — a random event in Billings Montana is grounded in that world's geography, culture, and the characters currently present. They are indistinguishable in the output from calendar events.

---

## File Structure

### Per World (`worlds/{world-name}/`)

| File | Purpose |
|------|---------|
| `clock.md` | Current world date and time — single source of truth for "now" |
| `timeline.md` | Historical log — every step appended here: who was where, what happened |
| `scenes/YYYY-MM-DD-HHmm.md` | One file per step — scene notes, encounters, injected and random events |

### Per Character (all characters)

| File | Purpose |
|------|---------|
| `calendar.md` | Forward-looking schedule — recurring routines, one-off plans, shared appointments with other characters |

Current location is written to the character's existing `STATUS.md` after each step (new field: `Current location:`). No separate location file needed.

### Per Manual Character Only

| File | Purpose |
|------|---------|
| `diary.md` | Personal log — how she experienced each step, what she noticed, how she felt |

### File Naming Convention

Follows existing project convention:
- `UPPERCASE.md` — operational/system files (`STATUS.md`, `INBOX.md`)
- `lowercase.md` — content files (`clock.md`, `calendar.md`, `diary.md`, `timeline.md`)

---

## Calendar Mechanics

Calendars are the backbone of time. They define when meaningful things happen.

### What lives in `calendar.md`

- **Recurring routines** — "gym every weekday 07:00–08:30", "church Sunday 09:00"
- **One-off events** — "dentist Wednesday 14:00", "job interview Thursday 10:00"
- **Shared appointments** — entries that appear on two or more characters' calendars, linked by the same event name

### How plans are created

Plans enter the calendar two ways:

1. **User-injected** — "Jolene and Cassidy have coffee Wednesday at 10am" → world-clock writes this to both calendars
2. **Autonomously generated** — when two characters cross paths during a step and the world-clock determines they would make a plan, it adds the future appointment to both calendars. The scene file notes what was arranged.

### Shared appointments

When a calendar entry involves two or more characters, it appears on each character's `calendar.md`. The world-clock treats them as linked — if one character's status changes (hospitalised, out of town), the clock notes the conflict in the scene file.

---

## Time Advance Flow

**Full tick, one shot.** The user triggers once; everything propagates automatically before the clock lands at the target time.

### Input

```
Target time: [date and time]
Injections (optional): [list of specific events to inject]
```

### Steps

1. **Read current state** — `clock.md` (current time), all character `calendar.md` files, `geography.md` (available locations in the world)

2. **Build the step sequence** — identify all calendar events between now and target time. Sort chronologically. Add injected events at their specified times. Reserve 1–2 slots for random events.

3. **For each step in sequence:**
   a. Place all characters — from calendar or plausible default based on time of day and routine
   b. Apply any injected event at this step
   c. Fire random event if scheduled for this step
   d. Detect intersections — characters in the same location at the same time get an encounter note; the clock may generate a future plan and add it to both calendars
   e. Write `scenes/YYYY-MM-DD-HHmm.md` — who was where, what happened, encounters, events
   f. Append compact entry to `timeline.md`
   g. Update `STATUS.md` for each character (current location)
   h. Write `diary.md` entry for each manual character (her experience of this step)
   i. Call **character-updater skill** with scene context — updates affected character files

4. **Advance the clock** — write new time to `clock.md`

---

## Character-Updater Skill

Called automatically by world-clock at the end of each step. Never called manually.

### What it does

Reads the scene file for the step and determines which deep character files need updating:

| Event type | Files updated |
|------------|--------------|
| Injury or illness | `history.md`, `goals.md` (if recovery becomes a goal) |
| New relationship or encounter | `relationships.md` |
| Belief-challenging experience | `beliefs.md`, `personality.md` |
| Achievement or failure | `history.md`, `goals.md`, `skills.md` |
| NPC promoted to active | Creates missing content files, populates from event context |

### NPC promotion

An NPC becomes "active" when they appear in a significant event. The character-updater creates any missing deep character files and seeds them with what the event revealed — a character who breaks his leg at the gym gets a `history.md` entry, and if he was previously a stub NPC, his `soul.md` and `personality.md` get initial content based on how he handled the injury.

### Contradiction handling

Follows the same policy as character-curator: never silently overwrite. If an event contradicts an existing file value, the updater preserves both with timestamps and writes a flag to the character's `STATUS.md` under "Unresolved Contradictions."

---

## Two-Tier Character Tracking

| Tier | Characters | Tracked by world-clock |
|------|-----------|----------------------|
| **Manual** | Jolene (and any future manual characters) | Full: location, diary entry per step, deep file updates via character-updater |
| **NPC** | All generated characters | Light: location in STATUS.md, calendar.md maintained. Deep files only updated when touched by an event |

---

## New Agent: world-clock

Lives at `agents/world-clock/` with the standard file set: `SOUL.md`, `PREFERENCES.md`, `MEMORY.md`, `INBOX.md`, `STATUS.md`.

Added to `agents/REGISTRY.md` as `on-demand` — runs only when user triggers a time advance.

The world-clock SOUL.md contains all behavioral instructions: how to walk through steps, how to generate random events, how to detect encounters, when to call character-updater, and what to write to each output file.

---

## New Skill: character-updater

Lives at `skills/character-updater/SKILL.md`.

Not user-invocable. Only world-clock calls it.

---

## What This Does NOT Include

- Automatic time advancement (world-clock is on-demand only — no scheduling)
- Cross-world character tracking
- UI or visualization (file structure is designed to support it later)
- Story generation (world-clock generates scene *notes*, not narrative prose)

---

## Success Criteria

1. Advancing from Friday 23:00 to Sunday 10:00 produces one scene file per calendar step, with all characters placed and all relevant character files updated — without any additional user input
2. A shared calendar appointment appears correctly on both characters' calendars and fires at the right step
3. An injected event (e.g., "Marcus breaks his leg") fully propagates: scene note written, `history.md` updated, NPC promoted if needed — all in one tick
4. "Where was Jolene at Saturday 20:00?" is answerable by reading `timeline.md` or `scenes/YYYY-MM-DD-2000.md`
5. Random events feel grounded in the world — not generic
