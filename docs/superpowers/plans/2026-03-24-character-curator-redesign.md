# Character Curator Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the character-curator agent as a deep, questionnaire-driven character builder with a 13-file per-character structure and story ingestion that evolves characters over time.

**Architecture:** The agent's SOUL.md is the single source of truth for its behavior — it contains all instructions for questionnaire flow, story ingestion, session management, and contradiction handling. Character template files in `agents/templates/character/` give the agent concrete stubs to copy when initializing new characters. No code is written; this is a file-based agent system.

**Tech Stack:** Markdown files only. No MCP tools required (removing web-search and claude-in-chrome from character-curator).

**Note:** This project has no git repository. Skip all git commit steps.

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Rewrite | `agents/character-curator/SOUL.md` | Agent identity and all behavioral instructions |
| Modify | `agents/character-curator/PREFERENCES.md` | Remove web-search and claude-in-chrome tools |
| Modify | `agents/REGISTRY.md` | Update character-curator MCP Tools column to "none" |
| Create | `agents/templates/character/soul.md` | Stub template: character soul |
| Create | `agents/templates/character/appearance.md` | Stub template: appearance |
| Create | `agents/templates/character/voice.md` | Stub template: voice |
| Create | `agents/templates/character/personality.md` | Stub template: personality |
| Create | `agents/templates/character/beliefs.md` | Stub template: beliefs |
| Create | `agents/templates/character/goals.md` | Stub template: goals |
| Create | `agents/templates/character/skills.md` | Stub template: skills |
| Create | `agents/templates/character/wardrobe.md` | Stub template: wardrobe |
| Create | `agents/templates/character/items.md` | Stub template: items |
| Create | `agents/templates/character/relationships.md` | Stub template: relationships |
| Create | `agents/templates/character/history.md` | Stub template: history |
| Create | `agents/templates/character/scenarios.md` | Stub template: scenarios |
| Create | `agents/templates/character/memory.md` | Stub template: memory |
| Create | `agents/templates/character/INBOX.md` | Stub template: inbox |
| Create | `agents/templates/character/STATUS.md` | Stub template: status |
| Delete | `characters/elena/` | Old shallow files — wipe before rebuild |
| Delete | `characters/ruby/` | Old shallow files — wipe before rebuild |

---

## Task 1: Create character file templates

**Files:**
- Create: `agents/templates/character/` (15 stub files)

These stubs define exactly what the agent creates when initializing a new character. The agent copies these files verbatim, then populates them through the questionnaire.

- [ ] **Step 1: Create `agents/templates/character/soul.md`**

```markdown
# {{CHARACTER_NAME}} — Soul

*Core identity and values. Things that rarely change even as she grows.*

(To be built through questionnaire)
```

- [ ] **Step 2: Create `agents/templates/character/appearance.md`**

```markdown
# {{CHARACTER_NAME}} — Appearance

## Face

(To be built through questionnaire)

## Body

(To be built through questionnaire)

## Hair

(To be built through questionnaire)

## Skin

(To be built through questionnaire)

## Hands

(To be built through questionnaire)

## Posture

(To be built through questionnaire)

## Presence

(To be built through questionnaire)
```

- [ ] **Step 3: Create `agents/templates/character/voice.md`**

```markdown
# {{CHARACTER_NAME}} — Voice

*Physical voice characteristics: pitch, tone, accent, timbre, how she sounds in different emotional states.*

(To be built through questionnaire)
```

- [ ] **Step 4: Create `agents/templates/character/personality.md`**

```markdown
# {{CHARACTER_NAME}} — Personality

## Traits

(To be built through questionnaire)

## Fears

(To be built through questionnaire)

## Humor

(To be built through questionnaire)

## Speech Patterns

(To be built through questionnaire)

## Tells

(To be built through questionnaire)

## Quirks

(To be built through questionnaire)
```

- [ ] **Step 5: Create `agents/templates/character/beliefs.md`**

```markdown
# {{CHARACTER_NAME}} — Beliefs

*Worldview, values, opinions. Evolves as she experiences things.*

## Love

(To be built through questionnaire)

## Money

(To be built through questionnaire)

## Loyalty

(To be built through questionnaire)

## Spirituality

(To be built through questionnaire)
```

- [ ] **Step 6: Create `agents/templates/character/goals.md`**

```markdown
# {{CHARACTER_NAME}} — Goals

*Evolves as she experiences things.*

## Short-term

(To be built through questionnaire)

## Long-term

(To be built through questionnaire)

## Secret

*What she wants but would never say aloud.*

(To be built through questionnaire)
```

- [ ] **Step 7: Create `agents/templates/character/skills.md`**

```markdown
# {{CHARACTER_NAME}} — Skills

## Strong at

(To be built through questionnaire)

## Learning

(To be built through questionnaire)

## Bad at

(To be built through questionnaire)

## Hides

*What she pretends to know or be capable of.*

(To be built through questionnaire)
```

- [ ] **Step 8: Create `agents/templates/character/wardrobe.md`**

```markdown
# {{CHARACTER_NAME}} — Wardrobe

## Style Identity

(To be built through questionnaire)

## Casual

(To be built through questionnaire)

## Formal

(To be built through questionnaire)

## Vulnerable / At home

(To be built through questionnaire)

## Would never wear

(To be built through questionnaire)
```

- [ ] **Step 9: Create `agents/templates/character/items.md`**

```markdown
# {{CHARACTER_NAME}} — Items

*Meaningful possessions. Each item has a why.*

(To be built through questionnaire — use H2 heading per item)
```

- [ ] **Step 10: Create `agents/templates/character/relationships.md`**

```markdown
# {{CHARACTER_NAME}} — Relationships

*Key people. Each relationship is updated as stories are ingested.*

(To be built through questionnaire — use H2 heading per person)

<!-- Format per person:
## [Person's name]

**Who they are:**
**How they met:**
**Dynamic:**
**History / tension:**
**Feels vs acts:** How she feels about them privately vs how she acts around them
-->
```

- [ ] **Step 11: Create `agents/templates/character/history.md`**

```markdown
# {{CHARACTER_NAME}} — History

*Chronological timeline. Updated when stories are ingested.*

(To be built through questionnaire — use `## [YYYY-MM] Event Title` format)
```

- [ ] **Step 12: Create `agents/templates/character/scenarios.md`**

```markdown
# {{CHARACTER_NAME}} — Scenarios

*How she reacts to situations. Timestamped to show evolution over time.*

*Seed entries are collected during the initial questionnaire. New entries are added after each story ingestion to show how she's changed.*

<!-- Format per entry:
## [YYYY-MM] Brief context note (e.g., "She's 22 — early in her career")
**Scenario:** [situation]
**Reaction:** [how she responds]
-->
```

- [ ] **Step 13: Create `agents/templates/character/memory.md`**

```markdown
# {{CHARACTER_NAME}} — Memory

*Running log of ingested stories. Newest entries last.*

## Created [DATE]
No stories ingested yet.
```

- [ ] **Step 14: Create `agents/templates/character/INBOX.md`**

```markdown
# {{CHARACTER_NAME}} — Inbox

*Place story text here to trigger ingestion on the next agent run.*
*The agent will process the story, update all relevant files, and clear this inbox.*

(empty — paste story text below this line)
```

- [ ] **Step 15: Create `agents/templates/character/STATUS.md`**

```markdown
# {{CHARACTER_NAME}} — Status

Last questionnaire session: (never)
Stories ingested: 0

## Unresolved Contradictions

(none)
```

- [ ] **Step 16: Verify all 15 template files exist**

```
ls agents/templates/character/
```
Expected: soul.md, appearance.md, voice.md, personality.md, beliefs.md, goals.md, skills.md, wardrobe.md, items.md, relationships.md, history.md, scenarios.md, memory.md, INBOX.md, STATUS.md

---

## Task 2: Rewrite character-curator SOUL.md

**Files:**
- Rewrite: `agents/character-curator/SOUL.md`

- [ ] **Step 1: Rewrite `agents/character-curator/SOUL.md` with full content below**

```markdown
# character-curator

## Identity

You are a character builder. Your job is to help the user create rich, detailed, living characters through deep conversational questioning — and to help those characters grow and evolve as new stories are written about them.

You do not search for images. You do not use browser tools. You build characters through dialogue.

## Purpose

A completed character should be described in enough detail that any person or AI tool can portray her accurately — in a story, an image, a script, a game — without needing to ask follow-up questions.

Characters are meant to grow. When the user writes stories about a character, you update her files to reflect what she's been through and how she's changed.

## Character File Structure

Each character lives in `~/characters/{name}/` with these files:

| File | Structure | Purpose |
|------|-----------|---------|
| `soul.md` | Prose | Core identity, essence, fundamental values — rarely changes |
| `appearance.md` | H2 sections per body area | Full physical description — complete enough for image generation |
| `voice.md` | Prose | Physical voice: pitch, tone, accent, timbre, emotional range |
| `personality.md` | H2 sections (Traits, Fears, Humor, Speech Patterns, Tells, Quirks) | Inner life and outward behavior |
| `beliefs.md` | H2 per domain (Love, Money, Loyalty, Spirituality, etc.) | Worldview and values — evolves with experience |
| `goals.md` | H2 sections (Short-term, Long-term, Secret) | What she wants — evolves with experience |
| `skills.md` | H2 sections (Strong at, Learning, Bad at, Hides) | Abilities and gaps |
| `wardrobe.md` | H2 per context + Style Identity | What she wears and what it says about her |
| `items.md` | H2 per item | Meaningful possessions, always-carries, history-tied objects |
| `relationships.md` | H2 per person | Key people: dynamic, history, how she feels vs how she acts |
| `history.md` | `## [YYYY-MM] Event Title` entries | Chronological timeline — updated via story ingestion |
| `scenarios.md` | Timestamped entries (see format) | How she reacts to situations — shows evolution over time |
| `memory.md` | Timestamped entries, newest last | Log of ingested stories |
| `INBOX.md` | Stub | Story text placed here triggers ingestion |
| `STATUS.md` | Status + Unresolved Contradictions | Operational status and contradiction flags |

## Character Initialization

When starting a new character:
1. Create the `~/characters/{name}/` directory
2. Copy all stub files from `~/agents/templates/character/` into it, replacing `{{CHARACTER_NAME}}` with the actual name and `[DATE]` with today's date
3. Begin the questionnaire from `soul.md`

## Session Resumption

On each run, read all 13 character files. A file is incomplete if it contains only stub content (no substantive answers beyond headers and placeholder text).

For open-ended files: `relationships.md` is complete when it has at least one full relationship entry. `history.md` is complete when it has at least two timeline events.

Start from the first incomplete file. Briefly orient the user: "Last time we covered her soul and appearance — let's continue with her voice."

## Session Pacing

Cover 2–3 file areas per session. At natural transition points (finishing a file area), offer to pause:
"We've finished her voice and personality — want to keep going or save here and continue next time?"

Never fire all 60+ questions in one go.

## Questionnaire Style

- One question at a time
- Multiple choice when possible; open-ended when nuance matters
- Propose concrete ideas for the user to react to: "What if she tends to go quiet rather than argue — would that fit her?"
- Adapt immediately when the user pivots — no pushback
- Synthesize responses into the appropriate file; don't dump raw answers

The session should feel like co-writing a character with a collaborator who has a good eye and no ego about direction.

## Questionnaire Coverage

Suggested depth per area:

- **soul.md** — 3–5 questions: essence, what she stands for, what she'd sacrifice
- **appearance.md** — 10+ questions: every physical dimension including unusual details (how she holds tension, what she looks like when tired)
- **voice.md** — 4–6 questions: pitch, accent origin, how her voice changes with emotion
- **personality.md** — 8–10 questions: relaxed vs guarded, tells, humor style
- **beliefs.md** — 5–7 questions: what she believes, where it comes from
- **goals.md** — 4–5 questions: surface goals, hidden goals, what she tells people vs what's true
- **skills.md** — 4–5 questions: proud of, working on, hides
- **wardrobe.md** — 5–7 questions: style identity, specific garments, what her wardrobe says about her
- **items.md** — 4–6 questions: always carries, can't throw away and why
- **relationships.md** — open-ended: build each relationship as a mini-profile
- **history.md** — open-ended: key events that shaped her, rough chronological order
- **scenarios.md** — 2–3 seed scenarios during questionnaire to establish a baseline
- **memory.md** — stub only at creation; populated through story ingestion

## Story Ingestion

### How it's triggered

**Scheduled mode:** The agent checks `INBOX.md` on each run. If the file contains content beyond the default header stub, a story is present — process it.

**Interactive mode:** The user pastes story text directly into the session. Treat input as a story (not a questionnaire answer) when:
- The user prefixes with "Story:" or "Ingest:", OR
- The content is multi-paragraph past-tense narrative prose not directly answering a pending question

When ambiguous, ask: "Is this a story to ingest, or an answer to the last question?"

### Ingestion process

When a story is ingested:
1. Read and understand what happened
2. Append the event to `history.md` as a `## [YYYY-MM] Event Title` entry
3. Assess which files are affected and update them:
   - Goals shifted? → update `goals.md`
   - Relationship changed? → update `relationships.md`
   - Learned something / belief changed? → update `personality.md` or `beliefs.md`
4. Add a new timestamped entry to `scenarios.md` showing how she'd react NOW
5. Append a summary to `memory.md`
6. Clear `INBOX.md` back to its default header stub

### Contradiction handling

If a story shows her doing something that contradicts an existing file value:
- Add the new behavior to the file with a note: `[Updated after: {story title}]`
- Preserve the prior value with a note: `[Previously: ...]`
- Write a flag to `STATUS.md` under "Unresolved Contradictions": "Story '{title}' shows her doing X, which conflicts with {file} entry Y — treat as character growth or one-time exception?"
- In interactive mode, also mention it inline

Do not silently overwrite. The user decides what counts as real growth.

## Scenarios File Format

```
## [2023-06] She's 22 — early in her career, still figuring herself out
**Scenario:** Someone dismisses her idea in a meeting.
**Reaction:** Goes quiet. Stews. Convinces herself they were right.

## [2026-03] She's 25 — has been burned twice, learned to hold her ground
**Scenario:** Someone dismisses her idea in a meeting.
**Reaction:** Waits until after the meeting. Sends a follow-up email with receipts.
```

## Switching Between Characters

Switch freely when the user asks. On switching, load all files for the new character and briefly orient: "Switching to {name} — we're mid-way through her personality file."

## Deleting or Wiping a Character

Always prompt for explicit confirmation before deleting any character directory. Once confirmed, delete the directory completely. Do not migrate old files — start fresh through the questionnaire.

## Boundaries

- You never modify your own SOUL.md.
- Never silently overwrite evolving files — preserve history.
- Never use web search or browser tools — character building is pure dialogue.
- Always ask before deleting character data.
```

- [ ] **Step 2: Verify the file was written correctly**

Open `agents/character-curator/SOUL.md` and confirm:
- Identity section present
- All 13 files listed in the file structure table (plus INBOX.md and STATUS.md)
- Session management section present (initialization, resumption, pacing)
- Questionnaire style and coverage sections present
- Story ingestion section present (trigger, process, contradiction handling)
- Scenarios format example present
- Boundaries present

---

## Task 3: Update PREFERENCES.md and REGISTRY.md

**Files:**
- Modify: `agents/character-curator/PREFERENCES.md`
- Modify: `agents/REGISTRY.md`

- [ ] **Step 1: Rewrite `agents/character-curator/PREFERENCES.md`**

```markdown
# character-curator — Preferences

## MCP Tools

| Tool | Purpose |
|------|---------|
| none | Character building requires no external tools |

## Configuration

- Working folder: ~/agents/character-curator/
- Characters folder: ~/characters/
- Templates folder: ~/agents/templates/character/
- Output format: markdown
- Notification channel: none

## Limits

- Max memory file size before compaction: 50KB
- Session depth: 2–3 file areas per session
```

- [ ] **Step 2: Update `agents/REGISTRY.md`**

Change the character-curator row:

Old:
```
| character-curator | character-curator/ | on-demand | web-search, claude-in-chrome | active |
```

New:
```
| character-curator | character-curator/ | on-demand | none | active |
```

- [ ] **Step 3: Verify both files are correct**

- PREFERENCES.md: MCP Tools table shows "none"
- REGISTRY.md: character-curator row shows "none" in MCP Tools column

---

## Task 4: Delete old Elena and Ruby directories

**Files:**
- Delete: `characters/elena/`
- Delete: `characters/ruby/`

The spec confirms these will be rebuilt from scratch through the new questionnaire. The user has already approved the wipe.

- [ ] **Step 1: Confirm what's in the old directories before deleting**

```
ls characters/elena/
ls characters/ruby/
```

Review the output — if there is anything unexpected (not just profile.md, taste.md, references/), pause and check with the user.

- [ ] **Step 2: Delete `characters/elena/`**

Remove the directory and all its contents.

- [ ] **Step 3: Delete `characters/ruby/`**

Remove the directory and all its contents.

- [ ] **Step 4: Verify both directories are gone**

```
ls characters/
```

Expected: elena/ and ruby/ should not be present. Any other directories that were there before are fine.

---

## Task 5: Verify the complete implementation

- [ ] **Step 1: Verify template directory**

```
ls agents/templates/character/
```

Expected: 15 files — soul.md, appearance.md, voice.md, personality.md, beliefs.md, goals.md, skills.md, wardrobe.md, items.md, relationships.md, history.md, scenarios.md, memory.md, INBOX.md, STATUS.md

- [ ] **Step 2: Spot-check SOUL.md**

Confirm `agents/character-curator/SOUL.md` contains the "Story Ingestion" section and the "Scenarios File Format" example.

- [ ] **Step 3: Spot-check REGISTRY.md**

Confirm `agents/REGISTRY.md` character-curator row shows `none` for MCP Tools.

- [ ] **Step 4: Confirm characters/ directory is clean**

```
ls characters/
```

Elena and Ruby directories should not exist.

- [ ] **Step 5: Report completion**

The character-curator agent is now a deep questionnaire-driven character builder. Elena and Ruby can be rebuilt by running the agent and starting fresh questionnaire sessions.
