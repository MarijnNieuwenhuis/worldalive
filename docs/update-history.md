# Update History

---

## What This Project Is

**AgentsAtWork** is a multi-agent system built on Claude Cowork (Claude Desktop) and Claude Code.

### Core architecture

- **Cowork** runs an **orchestrator** agent on a schedule (e.g. hourly). The orchestrator reads `agents/REGISTRY.md`, checks each agent's schedule, runs them in sequence, and maintains `agents/STATUS.md`.
- **Claude Code** (this terminal session) is the "dev side" — it builds and updates skills, creates agents, writes MCP servers, and keeps the scaffold healthy.
- **Telegram** (via a bot MCP) is the command channel: the user sends instructions from their phone, Claude Code executes them.
- All agents share a **filesystem contract**: soul, memory, preferences, inbox, and status files under `agents/[agent-name]/`.

### The Living World

The main use-case built so far is a **Living World simulation** set in Billings, Montana.

- 11 characters (1 manual: Jolene Voss; 10 generated, 1 promoted to active: Amber Tuck)
- A **world-clock** agent advances time step-by-step through calendar events
- Each tick: random events are generated, character intersections detected, encounters written, files updated
- Per-character files: `soul.md`, `memory.md`, `relationships.md`, `history.md`, `goals.md`, `calendar.md`, `diary.md`, `STATUS.md`
- Per-world files: `clock.md` (current time), `timeline.md` (historical log), `scenes/` (one file per tick)
- A **backup-world** skill zips `worlds/` before every clock advance (hard stop on failure)
- A **character-updater** skill propagates significant events into deep character files and handles NPC promotion

### Key locations

| Path | Purpose |
|------|---------|
| `agents/REGISTRY.md` | All agents, schedules, MCP tools |
| `agents/ORCHESTRATOR.md` | Orchestrator instructions |
| `agents/MCP_REGISTRY.md` | Available MCP servers and agent permissions |
| `agents/STATUS.md` | Live health summary |
| `skills/` | Reusable skills (invoked by orchestrator or user) |
| `worlds/billings-montana/` | The living world |
| `docs/update-history.md` | This file — chronological dev log |
| `backups/` | Zip snapshots before each world-clock advance |

---

## 2026-03-27

### Architectural decision: removed Cowork orchestrator

Simplified the system architecture. No more scheduled Cowork orchestrator. Everything is now triggered manually or via Telegram → Claude Code.

- Updated `CLAUDE.md` to reflect the new architecture
- Removed orchestrator scheduling references from all context files
- `agents/REGISTRY.md` and agent folders remain as reference/identity files, but nothing runs on a schedule

---

### Removed joke-teller agent
Deleted `agents/joke-teller/` and removed the row from `agents/REGISTRY.md`.

---

### Built the Living World system

Designed and implemented a full time-advancement system for the billings-montana world. Characters are now always somewhere, time moves step-by-step through calendar events, and everything propagates automatically.

**New agent: world-clock**
- Lives at `agents/world-clock/`
- Triggered with "Advance to [date/time]" plus optional event injections
- Walks chronologically through all calendar events between now and the target
- Generates 1–2 random events per period grounded in Billings, Montana context
- Detects character intersections and generates encounters and plans
- Calls character-updater skill automatically after each step

**New skill: character-updater** (`skills/character-updater/SKILL.md`)
- Called by world-clock after each step — not user-invocable
- Propagates significant events into deep character files (history.md, relationships.md, goals.md, etc.)
- Handles NPC promotion: generated characters become active when touched by a significant event
- Contradiction handling: never silently overwrites, flags conflicts to STATUS.md

**New skill: backup-world** (`skills/backup-world/SKILL.md`)
- Zips `worlds/` to `backups/backup-YYYY-MM-DD-HHmm.zip` before every clock advance
- Hard stop: world-clock will not proceed if backup fails
- Requires shell/bash MCP tool in Cowork

**New files per world**
- `clock.md` — current world time with write contract for agents
- `timeline.md` — historical record of every step: who was where and when
- `scenes/` — one scene file per time step

**New files per character (all 11)**
- `calendar.md` — recurring routines and upcoming events, seeded from each character's soul
- `Birthday:` field in `STATUS.md`
- `Current location:` field in `STATUS.md` (updated after each tick)

**New file per manual character**
- `diary.md` — personal log written by world-clock in the character's voice after each step

**Birthdays assigned**

| Character | Birthday |
|-----------|----------|
| Jolene Voss | April 3 |
| Amber Tuck | November 14 |
| Cassidy Lane | August 22 |
| Cole Brandt | March 4 |
| Dani Rowe | July 11 |
| Eli Marsh | May 27 |
| Marcus Delaney | February 8 |
| Nora Whitfield | January 19 |
| Petra Szabo | September 30 |
| Ryan Ostrowski | October 15 |
| Travis Kimura | April 28 |

---

### First live tick

Advanced the world from Thursday 2026-03-26 at 09:00 to 20:00.

- Backup created: `backups/backup-2026-03-26-0900.zip` (224 KB)
- 4 scene files written
- Timeline populated with 4 entries
- All 11 character STATUS.md files updated with current locations
- Random event: water main break on 1st Ave N Downtown
- Jolene wandered into Tuck's Books during the detour — first encounter with Amber Tuck
- Both characters' `relationships.md` updated
- Amber promoted from `generated` to `active`
- Jolene's diary written for all 4 steps
