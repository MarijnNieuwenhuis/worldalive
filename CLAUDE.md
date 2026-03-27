# AgentsAtWork — Project Context

## What this project is

A creative and agentic system driven by **Claude Code** (this terminal) + **Telegram** for remote control from the user's phone.

- **Claude Code** is the engine — runs skills, manages agents, advances the world, builds new capabilities.
- **Telegram bot** is the remote control — user sends commands from their phone, Claude Code executes them.
- No scheduled orchestrator. No Cowork. Everything is triggered manually or via Telegram.

## Living World

The main use-case is a **living world simulation** set in Billings, Montana with 11 characters.

- 1 manual character: **Jolene Voss**
- 10 generated characters; 1 promoted to active: **Amber Tuck**
- `agents/world-clock/` advances time step-by-step through calendar events
- `skills/backup-world/` zips `worlds/` before every tick (hard stop on failure)
- `skills/character-updater/` propagates events into deep character files

## Key files to read at session start

| File | Why |
|------|-----|
| `docs/update-history.md` | What was built and when — always read this first |
| `agents/REGISTRY.md` | All agents and their capabilities |
| `docs/skill-building-best-practices.md` | Rules for writing good skills |

## Key locations

| Path | Purpose |
|------|---------|
| `agents/` | All agent folders + registry |
| `skills/` | Project-level skills |
| `.claude/skills/` | Claude Code skills (create-agent, route-message, etc.) |
| `worlds/billings-montana/` | The living world |
| `docs/` | Dev log, best practices, reference docs |
| `backups/` | Zip snapshots before each world-clock advance |

## Rules

- Never modify an agent's `SOUL.md` — those are identity files, user-only.
- Always append to `MEMORY.md`, never overwrite (unless running compact-memory skill).
- Always run backup-world before advancing the world clock.
- When writing or updating skills, follow `docs/skill-building-best-practices.md`.
