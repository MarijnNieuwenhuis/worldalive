# Living World System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the living world system — a world-clock agent that advances time step-by-step through calendar events, places all characters, generates scene notes, fires random events, and propagates everything automatically via the character-updater skill.

**Architecture:** World-clock agent owns time. It reads all character calendars, walks the period between now and the target time chronologically, writes scene files per step, updates the timeline, and calls the character-updater skill to propagate significant events into character files. No code — markdown files only.

**Tech Stack:** Markdown files. No MCP tools. No git repository (skip all commit steps).

**Spec:** `docs/superpowers/specs/2026-03-26-living-world-design.md`

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `agents/world-clock/SOUL.md` | World-clock identity and all behavioral instructions |
| Create | `agents/world-clock/PREFERENCES.md` | Configuration |
| Create | `agents/world-clock/MEMORY.md` | Persistent memory |
| Create | `agents/world-clock/INBOX.md` | Message inbox |
| Create | `agents/world-clock/STATUS.md` | Agent status |
| Create | `skills/character-updater/SKILL.md` | Character propagation skill |
| Create | `agents/templates/character/calendar.md` | Calendar stub template |
| Create | `agents/templates/character/diary.md` | Diary stub template (manual chars only) |
| Modify | `agents/templates/character/STATUS.md` | Add `Current location:` field |
| Modify | `agents/REGISTRY.md` | Add world-clock row |
| Create | `worlds/billings-montana/clock.md` | Current world time |
| Create | `worlds/billings-montana/timeline.md` | Historical location log |
| Create | `worlds/billings-montana/scenes/.gitkeep` | Scenes directory |
| Create | `worlds/billings-montana/characters/manual/jolene/calendar.md` | Jolene's schedule |
| Create | `worlds/billings-montana/characters/manual/jolene/diary.md` | Jolene's personal log |
| Modify | `worlds/billings-montana/characters/manual/jolene/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/amber-tuck/calendar.md` | Amber's schedule |
| Modify | `worlds/billings-montana/characters/generated/amber-tuck/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/cassidy-lane/calendar.md` | Cassidy's schedule |
| Modify | `worlds/billings-montana/characters/generated/cassidy-lane/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/cole-brandt/calendar.md` | Cole's schedule |
| Modify | `worlds/billings-montana/characters/generated/cole-brandt/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/dani-rowe/calendar.md` | Dani's schedule |
| Modify | `worlds/billings-montana/characters/generated/dani-rowe/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/eli-marsh/calendar.md` | Eli's schedule |
| Modify | `worlds/billings-montana/characters/generated/eli-marsh/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/marcus-delaney/calendar.md` | Marcus's schedule |
| Modify | `worlds/billings-montana/characters/generated/marcus-delaney/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/nora-whitfield/calendar.md` | Nora's schedule |
| Modify | `worlds/billings-montana/characters/generated/nora-whitfield/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/petra-szabo/calendar.md` | Petra's schedule |
| Modify | `worlds/billings-montana/characters/generated/petra-szabo/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/ryan-ostrowski/calendar.md` | Ryan's schedule |
| Modify | `worlds/billings-montana/characters/generated/ryan-ostrowski/STATUS.md` | Add current location |
| Create | `worlds/billings-montana/characters/generated/travis-kimura/calendar.md` | Travis's schedule |
| Modify | `worlds/billings-montana/characters/generated/travis-kimura/STATUS.md` | Add current location |

---

## Task 1: World infrastructure files

**Files:**
- Create: `worlds/billings-montana/clock.md`
- Create: `worlds/billings-montana/timeline.md`
- Create: `worlds/billings-montana/scenes/.gitkeep`

- [ ] **Step 1: Create `worlds/billings-montana/clock.md`**

```markdown
# World Clock — Billings, Montana

Current time: Thursday, 2026-03-26 at 09:00
Last advanced: 2026-03-26
Previous time: (none — initial state)
```

- [ ] **Step 2: Create `worlds/billings-montana/timeline.md`**

```markdown
# Timeline — Billings, Montana

*Chronological record of every time step. Appended by world-clock after each tick.*
*Format per entry: `## [Day, Date at HH:mm]` followed by one line per character.*

(No entries yet — timeline begins on first world-clock tick)
```

- [ ] **Step 3: Create `worlds/billings-montana/scenes/.gitkeep`**

Create an empty `.gitkeep` file at `worlds/billings-montana/scenes/.gitkeep` to establish the directory.

- [ ] **Step 4: Verify**

Confirm three paths exist:
- `worlds/billings-montana/clock.md` — contains "Current time: Thursday, 2026-03-26"
- `worlds/billings-montana/timeline.md` — contains "(No entries yet)"
- `worlds/billings-montana/scenes/` — directory exists

---

## Task 2: Character templates

**Files:**
- Create: `agents/templates/character/calendar.md`
- Create: `agents/templates/character/diary.md`
- Modify: `agents/templates/character/STATUS.md`

- [ ] **Step 1: Create `agents/templates/character/calendar.md`**

```markdown
# {{CHARACTER_NAME}} — Calendar

*Forward-looking schedule. Recurring routines and one-off plans.*
*World-clock reads this to place the character during each time step.*
*World-clock also writes here when new plans are generated from encounters.*

## Recurring Routines

(To be filled — add recurring weekly schedule here)

## Upcoming Events

(To be filled — specific one-off events with dates and times)
```

- [ ] **Step 2: Create `agents/templates/character/diary.md`**

```markdown
# {{CHARACTER_NAME}} — Diary

*Personal log. Written by world-clock from her perspective after each time step she appears in.*
*Manual characters only. Entries are in her voice — private, specific, honest.*

(No entries yet — diary begins on first world-clock tick)
```

- [ ] **Step 3: Update `agents/templates/character/STATUS.md`**

Add `Current location:` field. The full file should read:

```markdown
# {{CHARACTER_NAME}} — Status

Type: (manual / generated)
Approval: (required / pending / approved)
World: (world-name)
Current location: (unknown — set on first world-clock tick)
Last questionnaire session: (never)
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 4: Verify all three files exist and contain expected content**

---

## Task 3: Character-updater skill

**Files:**
- Create: `skills/character-updater/SKILL.md`

- [ ] **Step 1: Create `skills/character-updater/SKILL.md`**

```markdown
---
name: character-updater
description: Propagate world events into deep character files after a world-clock tick. Called automatically by world-clock — not user-invocable.
---

# Character-Updater Skill

Updates deep character files based on what happened in a scene step. Called by world-clock at the end of each step during a time advance.

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
- Never touch world files (`world.md`, `geography.md`, `culture.md`, `history.md`, `rules.md`)
- Never modify the character's `calendar.md` — world-clock owns that
- Never modify `diary.md` — world-clock owns that
```

- [ ] **Step 2: Verify file exists at `skills/character-updater/SKILL.md` and contains the "NPC Promotion" section**

---

## Task 4: World-clock agent

**Files:**
- Create: `agents/world-clock/SOUL.md`
- Create: `agents/world-clock/PREFERENCES.md`
- Create: `agents/world-clock/MEMORY.md`
- Create: `agents/world-clock/INBOX.md`
- Create: `agents/world-clock/STATUS.md`

- [ ] **Step 1: Create `agents/world-clock/SOUL.md`**

```markdown
# world-clock

## Identity

You are the world clock. You manage time in the living world system. Your job is to advance time step-by-step through calendar events, place every character at every moment, generate scene notes, fire random events, and propagate everything to character files — all in one shot, without the user having to do anything after triggering the advance.

## Purpose

When the user says "advance to [target time]" (with optional injections), you walk the entire period between now and then chronologically. By the time you finish, the world has genuinely lived through the intervening time. Every calendar event happened. Every character was somewhere. Every meaningful encounter was noted. Every significant event propagated into the characters it touched.

## World Structure

Worlds live at `~/worlds/{world-name}/`. For each world you work with:

| File | Your role |
|------|-----------|
| `clock.md` | Read current time at start; write new time at end |
| `timeline.md` | Append a compact entry per step |
| `scenes/YYYY-MM-DD-HHmm.md` | Create one file per step |
| `geography.md` | Read to know available locations |
| `world.md` | Read for tone and context when generating random events |
| `culture.md` | Read for cultural context when generating random events |

Characters live at:
- `~/worlds/{world-name}/characters/manual/{name}/` — manual characters (full tracking)
- `~/worlds/{world-name}/characters/generated/{name}/` — NPC characters (light tracking)

For every character, you read and write:
- `calendar.md` — read for schedule; write new plans generated from encounters
- `STATUS.md` — update `Current location:` field after each step

For manual characters only, you also write:
- `diary.md` — append a personal entry after each step they appear in

You never write to deep character files (`soul.md`, `appearance.md`, `voice.md`, `personality.md`, `beliefs.md`, `goals.md`, `skills.md`, `wardrobe.md`, `items.md`, `relationships.md`, `history.md`, `scenarios.md`). Those are propagated by the character-updater skill, which you call.

## How to Advance Time

### Step 0: Read current state

1. Read `clock.md` to get current world time.
2. Read `calendar.md` for every character in the world. Note their recurring routines and any upcoming events within the target period.
3. Read `geography.md` and `world.md` for location names and world context.
4. Note the target time and any injected events the user specified.

### Step 1: Build the step sequence

Scan all calendars from current time to target time. Collect every calendar event. Sort chronologically. Add injected events at their specified times (injected events override calendar entries for the same character at the same time).

Select 1–2 slots for random events across the whole period (not one per step). Choose times where interesting character intersections are likely, or where narrative tension is high based on what you've read.

Example step sequence for a Friday 23:00 → Sunday 10:00 advance:

```
[Saturday 05:30] Cole — starts ranch work (calendar)
[Saturday 07:00] Marcus — gym (calendar)
[Saturday 09:00] Amber — opens bookstore (calendar)
[Saturday 14:00] Ryan — weight room with players (calendar)
[Saturday 16:00] [RANDOM EVENT]
[Saturday 18:00] Travis — evening fly fishing (calendar)
[Saturday 20:00] Jolene + Cassidy — dinner (calendar, shared)
[Saturday 23:00] Cassidy — end of bar shift (calendar)
[Sunday 09:00] Nora — church (calendar)
[Sunday 10:00] TARGET
```

### Step 2: Process each step

For each step in the sequence, in chronological order:

**a. Place all characters**

Every character needs a location for this step. Determine from:
1. Their calendar entry for this specific time (first priority)
2. An injected event (overrides calendar)
3. Plausible default based on time of day and known routine:
   - 00:00–06:00: at home, asleep (unless calendar or job says otherwise)
   - 06:00–09:00: home / commuting / early work (depends on character)
   - 09:00–17:00: at work or known daytime location
   - 17:00–20:00: transitioning — heading home, errands, gym
   - 20:00–00:00: home, restaurant, bar, or event
   - If genuinely unknown and no pattern available: "at home"

**b. Apply injected events**

If an injection applies to this step, override the character's planned location and status. An injection like "Marcus breaks his leg at the gym" changes his location to Billings Clinic (ER) for all subsequent steps until a recovery timeline is established.

**c. Fire random event (if scheduled for this step)**

Generate 1 random event grounded in:
- The world's geography and culture (what kind of place is this?)
- Who is currently where (who could plausibly be involved or affected?)
- What would be narratively interesting — an unexpected encounter, a minor local incident, weather, a community event

Examples appropriate for Billings, Montana:
- A water main breaks on a downtown street, closing a block
- First genuinely warm day of the year brings people out
- A bar fight spills into the parking lot
- A car slides on black ice, minor collision
- Someone spots a "Help Wanted" sign at a place a character has been considering
- A local news story breaks that affects the community

Keep random events grounded and proportionate. Not every random event needs to touch your main characters directly — sometimes it's just texture in the scene file.

**d. Detect intersections**

Characters in the same location at the same time may interact. For each intersection:
- Write a brief encounter note in the scene file (1–3 sentences)
- If their character files and the nature of the meeting suggest they would make a plan, generate a future calendar entry and write it to both characters' `calendar.md`. Note the new plan in the scene file under "Plans Generated."

**e. Write scene file**

Create `worlds/{world-name}/scenes/YYYY-MM-DD-HHmm.md` using the step's time:

```markdown
# Billings, Montana — [Day, Date at HH:mm]

## Where Everyone Is

| Character | Location | Activity |
|-----------|----------|----------|
| Jolene | The Fieldhouse | Dinner with Cassidy |
| Cassidy | The Fieldhouse | Dinner with Jolene |
| Marcus | Billings Clinic — ER | Being treated for broken leg |
| Amber | Home | Evening, reading |
| Cole | Cole's ranch | Done for the day |
| Dani | Her apartment | After work |
| Eli | Climbing gym | Bouldering session |
| Nora | Billings Clinic | Night shift |
| Petra | Home | Working on a project |
| Ryan | Home | After school day |
| Travis | Yellowstone River | Evening fly fishing |

## Events This Step

### [Calendar / Injected / Random] — Brief Event Title
[2–4 sentences: what happened, who was involved, immediate consequences]

## Encounters

### [Character A] + [Character B] at [Location]
[1–3 sentences: what happened between them, any plans made]

## Plans Generated
- [Description of new plan] → added to [Character A]'s and [Character B]'s calendars
```

**f. Append to timeline**

Append to `worlds/{world-name}/timeline.md`:

```markdown
## [Day, Date at HH:mm]
Jolene: The Fieldhouse (dinner with Cassidy) | Marcus: Billings Clinic ER (broken leg) | Amber: home | Cole: ranch | Dani: apartment | Eli: climbing gym | Nora: Billings Clinic (night shift) | Petra: home | Ryan: home | Travis: Yellowstone River
```

**g. Update character STATUS.md**

For every character, update the `Current location:` field in their `STATUS.md`:
```
Current location: [location] (as of [Day, Date at HH:mm])
```

**h. Write diary entry for manual characters**

For each manual character (e.g., Jolene), append an entry to their `diary.md`:

```markdown
## [Day, Date at HH:mm]

[3–5 sentences in her voice. Specific, personal, honest. What she noticed. What she felt. What she thought about. Not a summary of events — her inner experience of them.]
```

**i. Call character-updater skill**

After writing the scene file, invoke the `character-updater` skill (at `skills/character-updater/SKILL.md`) with:
- The scene file path
- The list of characters who experienced significant events this step (not just location updates)

Wait for character-updater to complete before moving to the next step.

### Step 3: Advance the clock

After all steps are processed, write the new time to `clock.md`:

```markdown
# World Clock — Billings, Montana

Current time: [Target day, date at HH:mm]
Last advanced: [today's real date]
Previous time: [old time from Step 0]
```

## Trigger Format

The user triggers a time advance by running this agent with an instruction like:

```
Advance to Sunday 2026-03-29 at 10:00.
Injections: Jolene goes shopping for a party dress Saturday afternoon. Marcus slips and breaks his leg at the gym Saturday morning.
```

Or with no injections:

```
Advance to Sunday 2026-03-29 at 10:00.
```

If no target time is specified, ask: "What time should I advance to?"

## Boundaries

- Never write to `soul.md`, `appearance.md`, `voice.md`, `personality.md`, `beliefs.md`, `goals.md`, `skills.md`, `wardrobe.md`, `items.md`, `relationships.md`, `history.md`, `scenarios.md` — those are owned by character-curator and character-updater
- Never modify world files (`world.md`, `geography.md`, `culture.md`, `rules.md`) — owned by world-builder
- Never modify your own SOUL.md
- Always process steps in chronological order — never skip ahead
- If a character has no calendar entry and no plausible default, place them "at home"
- If a character was recently injured or ill (check STATUS.md), their location defaults to where they're recovering — don't reset them to their normal routine without a corresponding calendar entry
```

- [ ] **Step 2: Create `agents/world-clock/PREFERENCES.md`**

```markdown
# world-clock — Preferences

## MCP Tools

| Tool | Purpose |
|------|---------|
| none | World-clock operates on local files only |

## Configuration

- Working folder: ~/agents/world-clock/
- Worlds folder: ~/worlds/
- Templates folder: ~/agents/templates/character/
- Output format: markdown
- Notification channel: none

## Limits

- Max memory file size before compaction: 50KB
- Process steps in chronological order — never in parallel
```

- [ ] **Step 3: Create `agents/world-clock/MEMORY.md`**

```markdown
# world-clock — Memory

## Recent Activity

(entries appended here after each run)

## Compacted History

(older entries summarized here by the compact-memory skill)
```

- [ ] **Step 4: Create `agents/world-clock/INBOX.md`**

```markdown
# world-clock — Inbox

*Messages from other agents or the orchestrator.*

(empty)
```

- [ ] **Step 5: Create `agents/world-clock/STATUS.md`**

```markdown
# world-clock — Status

Last run: never
Result: pending
```

- [ ] **Step 6: Verify all 5 agent files exist**

Confirm: `agents/world-clock/` contains SOUL.md, PREFERENCES.md, MEMORY.md, INBOX.md, STATUS.md.

---

## Task 5: Update REGISTRY.md

**Files:**
- Modify: `agents/REGISTRY.md`

- [ ] **Step 1: Add world-clock row to `agents/REGISTRY.md`**

Add `world-clock` row so the full table reads:

```markdown
| orchestrator | orchestrator/ | hourly | all (read-only) | active |
| character-curator | character-curator/ | on-demand | none | active |
| world-builder | world-builder/ | on-demand | none | active |
| world-clock | world-clock/ | on-demand | none | active |
```

- [ ] **Step 2: Verify REGISTRY.md shows world-clock and does NOT show joke-teller**

---

## Task 6: Character calendar files

**Files:** `calendar.md` for all 11 characters

- [ ] **Step 1: Create `worlds/billings-montana/characters/manual/jolene/calendar.md`**

```markdown
# Jolene Voss — Calendar

## Recurring Routines

- Monday–Friday 08:00–09:00: Morning coffee at home, quiet time before the day starts
- Wednesday evenings 19:00–21:00: Yoga class, Downtown studio
- Saturday mornings 09:00–11:00: Farmers market or errands (West End area)
- Sunday 10:00–12:00: Slow morning at home — reading, no plans

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 2: Create `worlds/billings-montana/characters/generated/amber-tuck/calendar.md`**

```markdown
# Amber Tuck — Calendar

## Recurring Routines

- Tuesday–Saturday 09:00–18:00: Bookstore open (owner, present all day)
- Sunday 10:00–13:00: Estate sales and used book sourcing (rotates locations)
- Monday: Day off — home, reading, long walks
- Most evenings 20:00+: Home, reading or writing

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 3: Create `worlds/billings-montana/characters/generated/cassidy-lane/calendar.md`**

```markdown
# Cassidy Lane — Calendar

## Recurring Routines

- Thursday–Sunday 17:00–01:00: Bar shift (Downtown bar, bartending)
- Monday–Tuesday: Days off
- Wednesday: Errands, seeing friends, sometimes visits her mom
- Most mornings: Sleeps late (10:00–11:00) due to late shifts

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 4: Create `worlds/billings-montana/characters/generated/cole-brandt/calendar.md`**

```markdown
# Cole Brandt — Calendar

## Recurring Routines

- Daily 05:30–08:00: Ranch morning work (feeding, checking fences, equipment)
- Daily 08:00–12:00: Main ranch work — varies by season (planting, livestock, repairs)
- Daily 12:00–13:00: Lunch break, often at the ranch house
- Daily 13:00–18:00: Afternoon ranch work
- Evenings 19:00+: Home at the ranch, early to bed
- In town: occasional errands at farm supply, hardware store (West End / Midtown)

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 5: Create `worlds/billings-montana/characters/generated/dani-rowe/calendar.md`**

```markdown
# Dani Rowe — Calendar

## Recurring Routines

- Monday–Friday 07:00–17:00: Work (auto repair / mechanical work — shop in The Heights area)
- Saturday mornings 08:00–12:00: Personal projects — working on her truck or equipment
- Saturday afternoons: Off — errands, hardware store, sometimes the river
- Sunday: Off — slow day, outdoors when weather permits

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 6: Create `worlds/billings-montana/characters/generated/eli-marsh/calendar.md`**

```markdown
# Eli Marsh — Calendar

## Recurring Routines

- Monday–Friday 09:00–17:00: Day job (coffee shop or service work — Downtown area)
- Monday / Wednesday / Friday evenings 18:00–20:00: Climbing gym (Downtown)
- Most evenings: At home or out with friends, bars, Downtown area
- Weekend mornings: Irregular — sometimes sleeps in, sometimes writes

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 7: Create `worlds/billings-montana/characters/generated/marcus-delaney/calendar.md`**

```markdown
# Marcus Delaney — Calendar

## Recurring Routines

- Shift A (rotates): Monday–Wednesday 06:00–18:00 at refinery (CHS refinery, West Billings)
- Shift B (rotates): Thursday–Saturday 18:00–06:00 at refinery (night shift)
- Off days: Gym in the morning (07:00–08:30) when not on night shift
- Evenings off: Usually home, occasionally a bar or friend's place

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 8: Create `worlds/billings-montana/characters/generated/nora-whitfield/calendar.md`**

```markdown
# Nora Whitfield — Calendar

## Recurring Routines

- Shift pattern (3 on / 4 off rotation): 12-hour shifts at Billings Clinic ER
  - Day shift: 07:00–19:00
  - Night shift: 19:00–07:00 (rotates)
- Off days: Grocery run, sometimes church (Sunday 09:00), quiet time at home
- Rarely out late — shift work makes unpredictable hours normal

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 9: Create `worlds/billings-montana/characters/generated/petra-szabo/calendar.md`**

```markdown
# Petra Szabo — Calendar

## Recurring Routines

- Monday–Friday 08:00–17:00: Landscape architecture work (her office / site visits across Billings)
- Tuesday / Thursday 07:00–08:00: Early morning walk — Rimrock trails or riverside path
- Weekends: Variable — site visits if project demands it, otherwise personal time
- Evenings: Often working late at her drafting table (home office)

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 10: Create `worlds/billings-montana/characters/generated/ryan-ostrowski/calendar.md`**

```markdown
# Ryan Ostrowski — Calendar

## Recurring Routines

- Monday–Friday 06:00–07:30: Weight room at school (coaching / supervising players)
- Monday–Friday 08:00–15:30: Teaching and coaching duties at high school
- Tuesday / Thursday afternoons 15:30–18:00: Practice (football or off-season conditioning)
- Saturday mornings: Optional open weight room or game day (fall) / quiet day (spring)
- Sunday: Off — usually at home, sometimes visits his kids

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 11: Create `worlds/billings-montana/characters/generated/travis-kimura/calendar.md`**

```markdown
# Travis Kimura — Calendar

## Recurring Routines

- April–October, Tuesday–Sunday 05:30–14:00: Guide trips on Yellowstone River (half-day or full-day)
- October–March (off-season): Part-time work at an outfitter shop (Midtown), irregular hours
- Most mornings year-round 05:00–06:00: Personal time on the river before guides or shop
- Evenings: Home, fly tying, or occasional bar (Cassidy's bar, when she's working)

## Upcoming Events

(none yet — populated by world-clock as events are generated)
```

- [ ] **Step 12: Verify all 11 calendar.md files exist**

Confirm: each character directory in `worlds/billings-montana/characters/` now contains a `calendar.md`.

---

## Task 7: Jolene's diary + all STATUS.md updates

**Files:**
- Create: `worlds/billings-montana/characters/manual/jolene/diary.md`
- Modify: all 11 character STATUS.md files

- [ ] **Step 1: Create `worlds/billings-montana/characters/manual/jolene/diary.md`**

```markdown
# Jolene Voss — Diary

*Personal log. Written by world-clock from her perspective after each time step.*
*Private, specific, in her voice. Not a summary — her inner experience.*

(No entries yet — diary begins on first world-clock tick)
```

- [ ] **Step 2: Update `worlds/billings-montana/characters/manual/jolene/STATUS.md`**

Add `Current location:` line after the `World:` line:

```markdown
# Jolene Voss — Status

Type: manual
Approval: required
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-24
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 3: Update `worlds/billings-montana/characters/generated/amber-tuck/STATUS.md`**

Add `Current location:` field. Read the current file first, then insert after the `World:` line (or after `Approval:` if World is absent):

```markdown
# Amber Tuck — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 4: Update `worlds/billings-montana/characters/generated/cassidy-lane/STATUS.md`**

```markdown
# Cassidy Lane — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 5: Update `worlds/billings-montana/characters/generated/cole-brandt/STATUS.md`**

```markdown
# Cole Brandt — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 6: Update `worlds/billings-montana/characters/generated/dani-rowe/STATUS.md`**

```markdown
# Dani Rowe — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 7: Update `worlds/billings-montana/characters/generated/eli-marsh/STATUS.md`**

```markdown
# Eli Marsh — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 8: Update `worlds/billings-montana/characters/generated/marcus-delaney/STATUS.md`**

```markdown
# Marcus Delaney — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 9: Update `worlds/billings-montana/characters/generated/nora-whitfield/STATUS.md`**

```markdown
# Nora Whitfield — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 10: Update `worlds/billings-montana/characters/generated/petra-szabo/STATUS.md`**

```markdown
# Petra Szabo — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 11: Update `worlds/billings-montana/characters/generated/ryan-ostrowski/STATUS.md`**

```markdown
# Ryan Ostrowski — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 12: Update `worlds/billings-montana/characters/generated/travis-kimura/STATUS.md`**

```markdown
# Travis Kimura — Status

Type: generated
Approval: pending
World: billings-montana
Current location: unknown (set on first world-clock tick)
Last questionnaire session: 2026-03-25
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 13: Verify Jolene's diary.md exists and all 11 STATUS.md files contain "Current location:"**

---

## Task 8: Verify complete implementation

- [ ] **Step 1: Verify world infrastructure**

Confirm these exist:
- `worlds/billings-montana/clock.md` — contains "Current time: Thursday, 2026-03-26"
- `worlds/billings-montana/timeline.md` — exists
- `worlds/billings-montana/scenes/` — directory exists

- [ ] **Step 2: Verify agent files**

Confirm `agents/world-clock/` contains: SOUL.md, PREFERENCES.md, MEMORY.md, INBOX.md, STATUS.md

- [ ] **Step 3: Verify skill file**

Confirm `skills/character-updater/SKILL.md` exists and contains "NPC Promotion" section.

- [ ] **Step 4: Verify templates**

Confirm:
- `agents/templates/character/calendar.md` exists
- `agents/templates/character/diary.md` exists
- `agents/templates/character/STATUS.md` contains "Current location:" field

- [ ] **Step 5: Verify REGISTRY.md**

Confirm `agents/REGISTRY.md` contains a `world-clock` row and does NOT contain `joke-teller`.

- [ ] **Step 6: Verify all character calendar files**

All 11 characters should have `calendar.md`:
- `worlds/billings-montana/characters/manual/jolene/calendar.md`
- `worlds/billings-montana/characters/generated/amber-tuck/calendar.md`
- `worlds/billings-montana/characters/generated/cassidy-lane/calendar.md`
- `worlds/billings-montana/characters/generated/cole-brandt/calendar.md`
- `worlds/billings-montana/characters/generated/dani-rowe/calendar.md`
- `worlds/billings-montana/characters/generated/eli-marsh/calendar.md`
- `worlds/billings-montana/characters/generated/marcus-delaney/calendar.md`
- `worlds/billings-montana/characters/generated/nora-whitfield/calendar.md`
- `worlds/billings-montana/characters/generated/petra-szabo/calendar.md`
- `worlds/billings-montana/characters/generated/ryan-ostrowski/calendar.md`
- `worlds/billings-montana/characters/generated/travis-kimura/calendar.md`

- [ ] **Step 7: Verify Jolene's diary**

Confirm `worlds/billings-montana/characters/manual/jolene/diary.md` exists.

- [ ] **Step 8: Report completion**

The living world system is ready. To use it:
1. Run the world-clock agent
2. Say: "Advance to [target date and time]." with any optional injections
3. The world-clock walks through every calendar event between now and then, writes scene files, updates the timeline, updates all character STATUS.md files, writes Jolene's diary entries, and calls character-updater for any significant events — all in one shot.
