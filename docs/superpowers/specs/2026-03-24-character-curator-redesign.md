# Character Curator — Redesign Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

Redesign the `character-curator` agent from a reference image searcher into a deep, questionnaire-driven character builder. The goal is to produce rich, detailed character files that can be handed off to any image generation, story, or animation tool without requiring further tweaking.

No image search functionality. No browser tools. Pure character building through conversational brainstorming.

---

## Problem with the Current Design

The current `character-curator` agent is focused on finding and downloading reference images, with taste learning as a secondary layer. This is too shallow for the user's goal: creating fully realized characters for stories, movies, images, and cartoons. A reference image approach leaves too much implicit — a character needs to be described precisely enough that any collaborator (human or AI) can recreate her consistently.

---

## New Purpose

Build living, evolving characters through structured dialogue. The agent asks deep questions, proposes ideas for the user to react to, and maintains a multi-file character profile that grows richer over time. When new stories are ingested, the character evolves — her reactions, goals, and relationships update to reflect her experiences.

---

## Character File Structure

Each character lives in `characters/{name}/` with 13 files:

| File | Structure | Purpose |
|------|-----------|---------|
| `soul.md` | Prose paragraphs | Core identity, essence, fundamental values — the things that rarely change even as she grows |
| `appearance.md` | H2 sections per body area (Face, Body, Hair, Skin, Hands, Posture, Presence) | Full physical description. Complete enough to generate an accurate image with no ambiguity |
| `voice.md` | Prose paragraphs | Physical voice: pitch, tone, warmth/coldness, accent, timbre, how she sounds when nervous vs confident |
| `personality.md` | H2 sections (Traits, Fears, Humor, Speech patterns, Tells, Quirks) | Traits, quirks, fears, emotional patterns, verbal tics, what makes her laugh, what gets under her skin |
| `beliefs.md` | H2 section per domain (Love, Money, Loyalty, Spirituality, etc.) | Worldview, values, opinions — evolves as she experiences things |
| `goals.md` | H2 sections (Short-term, Long-term, Secret) | Goals and ambitions — evolves as she experiences things |
| `skills.md` | H2 sections (Strong at, Learning, Bad at, Hides) | What she's good at, actively learning, genuinely bad at, and what she pretends to know |
| `wardrobe.md` | H2 sections per context (Casual, Formal, etc.) + Style Identity section | Style, signature pieces, what she wears in different contexts, colors, what she'd never wear |
| `items.md` | H2 section per item | Meaningful possessions, always-carries, objects tied to her history — with a "why" for each |
| `relationships.md` | H2 section per person (with sub-sections: Who, How they met, Dynamic, History, Feels vs Acts) | Key people — updated as stories are ingested |
| `history.md` | Chronological H2 entries: `## [YYYY-MM] Event Title` | Timeline of significant events: what happened and what it meant for her |
| `scenarios.md` | Timestamped H2 entries per scenario (see format below) | How she reacts to situations — shows evolution over time |
| `memory.md` | Timestamped entries, newest last | Running log of ingested stories; starts with a stub entry on creation |

---

## Character Evolution

The core feature differentiating this design from a static character sheet is that characters **grow through experience**.

### Story Ingestion Trigger

The user triggers ingestion by placing story text in `characters/{name}/INBOX.md`. On the next run, the agent:

1. Detects that `INBOX.md` contains content beyond the default header
2. Reads the story
3. Processes it (see steps below)
4. Clears `INBOX.md` back to its default header stub after ingestion

If the agent is running in synchronous/interactive mode, the user can also paste story text directly in the session. The agent treats input as a story (not a questionnaire response) when: the user prefixes the paste with "Story:" or "Ingest:", or the content is multi-paragraph past-tense narrative prose not directly answering a pending question. When ambiguous, the agent asks: "Is this a story to ingest, or an answer to the last question?"

### Ingesting a Story

When a story is ingested, the agent:

1. Reads and understands what happened
2. Appends the event to `history.md` with a date/timestamp
3. Assesses which files are affected:
   - Did her goals shift? → update `goals.md`
   - Did a relationship change? → update `relationships.md`
   - Did she learn something or change a belief? → update `personality.md` or `beliefs.md`
4. Adds a new timestamped entry to `scenarios.md` showing how she'd react to a reference situation NOW
5. Appends a summary of the story to `memory.md`
6. Clears `INBOX.md` back to its default header stub

### Handling Contradictions

If a story event appears to contradict an existing file value (e.g., she acts against a stated belief), the agent does **not** silently overwrite. Instead it:

- Adds the new behavior/value to the file with a timestamp and a note: `[Updated after: {brief story title}]`
- Preserves the prior value with a note: `[Previously: ...]`
- Writes a contradiction flag to `STATUS.md` under an "Unresolved Contradictions" section: "Story '{title}' shows her doing X, which conflicts with her stated belief Y in beliefs.md — treat as character growth or one-time exception?" This works in both scheduled and interactive modes; in interactive mode the agent may also mention it inline.

This keeps the evolution traceable and the user in control of what counts as real growth vs. a plot exception.

### Scenarios File Format

`scenarios.md` entries are timestamped so the user can see the same scenario handled differently across her life:

```
## [2023-06] She's 22 — early in her career, still figuring herself out
**Scenario:** Someone dismisses her idea in a meeting.
**Reaction:** Goes quiet. Stews. Convinces herself they were right.

## [2026-03] She's 25 — has been burned twice, learned to hold her ground
**Scenario:** Someone dismisses her idea in a meeting.
**Reaction:** Waits until after the meeting. Sends a follow-up email with receipts.
```

Seed scenarios (2–3) are collected during the initial questionnaire to establish a baseline before any stories are ingested.

---

## Session Management

### Character Initialization

When starting work on a character for the first time, the agent creates the `characters/{name}/` directory and all 13 files with stub headers. It also creates `STATUS.md` with an empty "Unresolved Contradictions" section — this file receives contradiction flags during story ingestion. It then begins the questionnaire from `soul.md`.

### Session Resumption

On each run, the agent reads all 13 character files and identifies which are incomplete (containing only a stub header or no substantive content). It resumes from the first incomplete file, briefly noting where it left off: "Last time we covered her soul and appearance — let's continue with her voice."

A file is considered complete when it has substantive content beyond its header and section stubs. For the open-ended files: `relationships.md` is considered complete when it has at least one full relationship entry; `history.md` is considered complete when it has at least two timeline events.

### Session Pacing

A single session should aim to cover 2–3 file areas. At natural transition points (finishing a file area), the agent offers to pause: "We've finished her appearance and voice — want to keep going or save here and continue next time?" This prevents 60+ questions being fired back-to-back.

---

## Interaction Style

Conversational brainstorm — not a form to fill out. The agent:

- Asks one question at a time
- Offers multiple choice options when possible, open-ended when nuance matters
- Proposes concrete ideas for the user to react to ("What if she has a habit of...")
- Adapts direction immediately when the user pivots
- Synthesizes responses into the appropriate file rather than dumping raw answers

The session feels like co-writing a character with a collaborator who has a good eye and no ego about direction.

---

## Questionnaire Coverage

The agent's questions should cover all 13 dimensions. Suggested depth per area:

- **soul.md** — 3–5 questions about essence, what she stands for, what she'd sacrifice
- **appearance.md** — 10+ questions covering every physical dimension, including unusual details (how she holds tension in her body, what she looks like when she's tired)
- **voice.md** — 4–6 questions: pitch, accent origin, how her voice changes with emotion
- **personality.md** — 8–10 questions: what she's like when relaxed vs guarded, her tells, her humor
- **beliefs.md** — 5–7 questions: what she believes about the world, where those beliefs come from
- **goals.md** — 4–5 questions: surface goals, hidden goals, what she tells people vs what's true
- **skills.md** — 4–5 questions: what she's proud of, what she's working on, what she hides
- **wardrobe.md** — 5–7 questions: style identity, specific garments, what her wardrobe says about her
- **items.md** — 4–6 questions: what she always has on her, what she can't throw away and why
- **relationships.md** — open-ended: build each relationship as a mini-profile
- **history.md** — open-ended: key events that shaped her, in rough chronological order
- **scenarios.md** — 2–3 seed scenarios collected during the questionnaire to establish a baseline for evolution tracking
- **memory.md** — seeded with a stub on creation: `## Created [date]\nNo stories ingested yet.` — populated only through story ingestion

---

## Agent SOUL.md Changes

The `character-curator` SOUL.md needs to be fully rewritten to reflect:

- New purpose (deep character building, no image search)
- 13-file structure, their formats, and what each file means
- Session management: how to initialize, detect incomplete files, and resume
- How to conduct the questionnaire (conversational, one question at a time, 2–3 areas per session)
- Story ingestion trigger (INBOX.md or direct paste) and the full ingestion process
- How scenarios.md works (timestamped evolution, seed scenarios during questionnaire)
- Contradiction-handling policy (preserve both values with timestamps, write flag to STATUS.md "Unresolved Contradictions" section)
- MCP tools: none required (no web search, no browser)

---

## Changes to Existing Characters

Elena and Ruby currently have shallow files (`profile.md`, `taste.md`, references folder). The agent will **prompt the user for explicit confirmation before deleting** any existing character directory. Once confirmed, the old directory is deleted and the character is rebuilt from scratch through the new questionnaire flow.

The old files do not contain enough signal to migrate forward — they will not be used as input to the new questionnaire.

---

## What This Does NOT Include

- Image search or browser automation (deliberately removed)
- Automatic story ingestion scheduling (user triggers manually via INBOX.md)
- Cross-character relationship management (future consideration)
- Character export/rendering pipeline (separate concern)

---

## Success Criteria

1. A completed character has all 13 files populated per the question count guidelines in Questionnaire Coverage, with `appearance.md` covering at minimum: face, body proportions, hair, skin tone, posture, and at least two distinctive physical details
2. After ingesting 3–4 stories, `scenarios.md` shows visible evolution in how she handles situations
3. The questionnaire feels like a conversation, not a form — sessions cover 2–3 areas with natural pause points
4. The agent never requires more than one tool (none, in most cases) to do its work
