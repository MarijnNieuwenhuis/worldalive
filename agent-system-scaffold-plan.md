# Multi-Agent Cowork System — Scaffold Plan

## Goal

Build a directory structure and foundational files for a multi-agent system running on Claude Cowork. The system is managed by an **orchestrator agent** that knows about all other agents, routes work, and manages the system. New agents are created and updated through **skills** (reusable prompt-driven workflows).

This plan is for scaffolding only — no specific agents yet. Just the orchestrator, the templates, and the skills to create/manage agents.

---

## Directory Structure

```
~/agents/
├── ORCHESTRATOR.md          # The orchestrator's instructions
├── REGISTRY.md              # List of all agents, their schedules, and capabilities
├── MCP_REGISTRY.md          # Available MCP tools and which agents may use them
├── STATUS.md                # Auto-updated health/status of all agents
├── inbox/                   # Cross-agent message drop
│   └── .gitkeep
├── templates/               # Base templates for new agents
│   ├── SOUL.md.template     # Default personality/identity template
│   ├── MEMORY.md.template   # Empty memory with section structure
│   └── PREFERENCES.md.template  # Default preferences structure
├── skills/                  # Reusable skills (invoked by orchestrator or manually)
│   ├── create-agent/
│   │   └── SKILL.md
│   ├── update-agent/
│   │   └── SKILL.md
│   ├── compact-memory/
│   │   └── SKILL.md
│   ├── agent-status/
│   │   └── SKILL.md
│   └── route-message/
│       └── SKILL.md
└── [agent-name]/            # One folder per agent (created by create-agent skill)
    ├── SOUL.md              # Identity, personality, role, boundaries
    ├── MEMORY.md            # Persistent memory (appended after each run)
    ├── PREFERENCES.md       # Static config: tools, limits, preferences
    ├── INBOX.md             # Messages from other agents or the orchestrator
    └── STATUS.md            # Last run status, errors, metrics
```

---

## Core Files

### ORCHESTRATOR.md

The orchestrator is the main scheduled task. It runs frequently (e.g., every hour) and decides what to do.

```markdown
# Orchestrator Agent

You are the orchestrator of a multi-agent system. Your job is to manage, coordinate,
and monitor all agents in this system.

## On every run

1. Read REGISTRY.md to know which agents exist and their schedules.
2. Read STATUS.md to check if any agents had errors on their last run.
3. Check inbox/ for any cross-agent messages that need routing.
4. For each agent whose schedule says it should run:
   - Read the agent's SOUL.md, MEMORY.md, and PREFERENCES.md.
   - Execute the agent's task using the MCP tools listed in its PREFERENCES.md.
   - Append results and learnings to the agent's MEMORY.md with a timestamp.
   - Update the agent's STATUS.md with run result (success/failure/skipped).
   - If the agent produced messages for other agents, drop them in inbox/.
5. Update the global STATUS.md with a summary.
6. If any agent had errors 3+ times in a row, flag it in STATUS.md and notify user.

## Rules

- Never modify SOUL.md files — those define identity and are only changed by the user.
- Always append to MEMORY.md, never overwrite (unless running compact-memory skill).
- If unsure whether to act, skip and note in STATUS.md.
- Respect each agent's tool permissions in MCP_REGISTRY.md.
```

### REGISTRY.md

```markdown
# Agent Registry

| Agent | Folder | Schedule | MCP Tools | Status |
|-------|--------|----------|-----------|--------|
| (no agents yet — use create-agent skill to add) | | | | |

## Schedule format

- `hourly` — every orchestrator run
- `daily:09:00` — once per day at approximately 09:00
- `weekdays` — Monday through Friday, once per day
- `on-demand` — only when triggered manually or by another agent
- `every:4h` — every 4 hours
```

### MCP_REGISTRY.md

```markdown
# MCP Tool Registry

Lists all available MCP servers and which agents are authorized to use them.

## Available MCP Servers

| Tool Name | Binary/Endpoint | Description | Status |
|-----------|----------------|-------------|--------|
| (no tools yet — add entries as MCP servers are built) | | | |

## Agent Permissions

| Agent | Allowed Tools |
|-------|--------------|
| orchestrator | all (read-only access to agent files) |

## Adding a new MCP tool

1. Build and test the MCP server binary.
2. Place compiled binary in a stable path (e.g., ~/mcp-servers/).
3. Add entry to this registry.
4. Add the tool to relevant agents' PREFERENCES.md.
5. Update agent permissions table above.
```

### STATUS.md

```markdown
# System Status

Last orchestrator run: (not yet run)

## Agent Status Summary

| Agent | Last Run | Result | Consecutive Errors | Notes |
|-------|----------|--------|--------------------|-------|
| (no agents yet) | | | | |

## Alerts

(none)
```

---

## Templates

### templates/SOUL.md.template

```markdown
# {{AGENT_NAME}}

## Identity

You are {{AGENT_ROLE}}.

## Personality

{{AGENT_PERSONALITY}}

## Responsibilities

{{AGENT_RESPONSIBILITIES}}

## Boundaries

- You only use MCP tools listed in your PREFERENCES.md.
- You always append findings to MEMORY.md, never overwrite.
- You check INBOX.md at the start of each run for messages from other agents.
- If you have information relevant to another agent, write a message to ~/agents/inbox/.
- You never modify your own SOUL.md.
```

### templates/MEMORY.md.template

```markdown
# {{AGENT_NAME}} — Memory

## Recent Activity

(new entries are appended here with timestamps)

## Compacted History

(older entries are summarized here by the compact-memory skill)
```

### templates/PREFERENCES.md.template

```markdown
# {{AGENT_NAME}} — Preferences

## MCP Tools

| Tool | Purpose |
|------|---------|
| (list tools this agent may use) | |

## Configuration

- Working folder: ~/agents/{{AGENT_FOLDER}}/
- Output format: (markdown / json / notification)
- Notification channel: (slack / telegram / none)

## Limits

- Max memory file size before compaction: 50KB
- Max items to process per run: (set per agent)
```

---

## Skills

### skills/create-agent/SKILL.md

```markdown
---
name: create-agent
description: Create a new agent in the multi-agent system
---

# Create Agent Skill

Creates a new agent by scaffolding its folder and registering it.

## Input required

Ask the user for:
1. **Agent name** — short, lowercase, kebab-case (e.g., "price-tracker")
2. **Role** — one sentence describing what this agent does
3. **Personality** — how it should behave (frugal, thorough, concise, etc.)
4. **Responsibilities** — bullet list of specific tasks
5. **Schedule** — how often it should run (hourly, daily:HH:MM, on-demand, every:Xh)
6. **MCP tools** — which tools from MCP_REGISTRY.md it needs access to

## Steps

1. Create folder: `~/agents/{{agent-name}}/`
2. Copy and fill templates:
   - SOUL.md from templates/SOUL.md.template
   - MEMORY.md from templates/MEMORY.md.template
   - PREFERENCES.md from templates/PREFERENCES.md.template
3. Create empty INBOX.md with header: `# {{agent-name}} — Inbox`
4. Create STATUS.md with: `# {{agent-name}} — Status\n\nLast run: never\nResult: pending`
5. Add entry to ~/agents/REGISTRY.md
6. Update MCP_REGISTRY.md agent permissions table
7. Confirm to user: "Agent '{{agent-name}}' created. It will be picked up on the next orchestrator run."

## Validation

- Ensure agent name is unique in REGISTRY.md
- Ensure requested MCP tools exist in MCP_REGISTRY.md
- Ensure folder doesn't already exist
```

### skills/update-agent/SKILL.md

```markdown
---
name: update-agent
description: Update an existing agent's configuration, role, or preferences
---

# Update Agent Skill

Modifies an existing agent's configuration. Never touches MEMORY.md.

## Input required

Ask the user:
1. **Which agent** — name from REGISTRY.md
2. **What to change** — one or more of:
   - Role / responsibilities (updates SOUL.md)
   - Personality (updates SOUL.md)
   - Schedule (updates REGISTRY.md)
   - MCP tool access (updates PREFERENCES.md and MCP_REGISTRY.md)
   - Configuration / limits (updates PREFERENCES.md)

## Steps

1. Read current agent files to understand existing config.
2. Apply requested changes to the appropriate files.
3. Update REGISTRY.md if schedule or tools changed.
4. Update MCP_REGISTRY.md if tool permissions changed.
5. Add a note to the agent's MEMORY.md: "SYSTEM: Agent configuration updated on {{date}}. Changes: {{summary}}."
6. Confirm changes to user.

## Safety

- Always show the user what will change before applying.
- Never delete or overwrite MEMORY.md content.
- If removing MCP tool access, warn if the agent's core responsibilities depend on it.
```

### skills/compact-memory/SKILL.md

```markdown
---
name: compact-memory
description: Compress and prune an agent's memory to prevent context overflow
---

# Compact Memory Skill

Prevents memory files from growing beyond useful size.

## When to run

- Automatically: when an agent's MEMORY.md exceeds 50KB (configurable in PREFERENCES.md)
- Manually: when user requests it
- Scheduled: as a weekly maintenance task for all agents

## Steps

1. Read the agent's MEMORY.md.
2. Identify entries in "Recent Activity" older than 14 days.
3. Summarize those entries into concise bullet points grouped by theme/topic.
4. Move summaries to the "Compacted History" section.
5. Remove the original detailed entries from "Recent Activity."
6. Add a compaction note: "SYSTEM: Memory compacted on {{date}}. {{N}} entries summarized."

## Rules

- Never discard information completely — always summarize before removing.
- Keep the most recent 14 days of detailed entries untouched.
- If Compacted History itself is growing large, summarize it further into key themes.
- Preserve any entry tagged with [IMPORTANT] or [PINNED] regardless of age.
```

### skills/agent-status/SKILL.md

```markdown
---
name: agent-status
description: Get a quick overview of all agents and their health
---

# Agent Status Skill

Provides a human-readable summary of the entire system.

## Steps

1. Read ~/agents/STATUS.md for the global overview.
2. Read REGISTRY.md for the agent list.
3. For each agent, read its STATUS.md.
4. Present a summary:

```
System Overview (as of {{date}})

Agents: {{total}} registered, {{active}} active, {{errored}} with errors

{{For each agent:}}
[agent-name] — {{status}}
  Last run: {{timestamp}}
  Schedule: {{schedule}}
  Memory size: {{file size of MEMORY.md}}
  Notes: {{any alerts or recent errors}}
```

5. If any agents have 3+ consecutive errors, highlight them prominently.
6. If any agent's memory exceeds 50KB, suggest running compact-memory.
```

### skills/route-message/SKILL.md

```markdown
---
name: route-message
description: Send a message from one agent (or the user) to another agent's inbox
---

# Route Message Skill

Delivers a message to a specific agent's inbox for processing on its next run.

## Input required

1. **From** — sender name (user, or an agent name)
2. **To** — target agent name (must exist in REGISTRY.md)
3. **Message** — the content to deliver
4. **Priority** — normal / urgent

## Steps

1. Validate target agent exists in REGISTRY.md.
2. Append to ~/agents/{{target-agent}}/INBOX.md:

```
---
From: {{from}}
Date: {{timestamp}}
Priority: {{priority}}

{{message}}
---
```

3. If priority is urgent, also append to ~/agents/inbox/ global inbox
   with a note: "URGENT for {{target-agent}}: {{short summary}}"
4. Confirm delivery to user.

## Notes

- Agents should check and clear their INBOX.md at the start of each run.
- The orchestrator checks the global inbox/ on every run for urgent items.
```

---

## Setup Checklist for Claude Code

When scaffolding this system, Claude Code should:

1. [ ] Create the full directory structure under `~/agents/`
2. [ ] Write all core files (ORCHESTRATOR.md, REGISTRY.md, MCP_REGISTRY.md, STATUS.md)
3. [ ] Write all template files in `templates/`
4. [ ] Write all skill files in `skills/`
5. [ ] Create empty `inbox/.gitkeep`
6. [ ] Verify all file cross-references are consistent (skill references match file paths)
7. [ ] Output a summary of what was created

## What to set up in Cowork after scaffolding

1. Create a scheduled task pointing to ~/agents/ as the working directory
2. The task prompt: "Read ORCHESTRATOR.md and follow its instructions."
3. Set schedule to hourly (or desired frequency)
4. Ensure MCP servers referenced in MCP_REGISTRY.md are configured in Claude Desktop settings

## What this does NOT include (yet)

- Specific agents (use create-agent skill to add them)
- MCP server code (build those separately with Claude Code)
- Telegram/Slack notification integration (add as MCP tools later)
- Automatic compaction scheduling (add as a scheduled task when needed)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  YOUR PHONE                                             │
│  ┌──────────────┐  ┌──────────────────────────────────┐ │
│  │   Dispatch    │  │   Telegram (Claude Code)         │ │
│  │   (Cowork)    │  │   Build/update MCP servers       │ │
│  │   Command     │  │   Update agent configs           │ │
│  │   agents      │  │   Deploy improvements            │ │
│  └──────┬───────┘  └──────────────┬───────────────────┘ │
└─────────┼──────────────────────────┼────────────────────┘
          │                          │
          ▼                          ▼
┌─────────────────────────────────────────────────────────┐
│  YOUR ALWAYS-ON PC                                      │
│                                                         │
│  ┌─────────────────────────┐  ┌───────────────────────┐ │
│  │  COWORK (Claude Desktop) │  │  CLAUDE CODE          │ │
│  │                          │  │  (Terminal session)    │ │
│  │  Orchestrator task       │  │                        │ │
│  │  runs hourly             │  │  Builds MCP servers    │ │
│  │     │                    │  │  Updates skills        │ │
│  │     ├─→ Agent A          │  │  Deploys binaries      │ │
│  │     ├─→ Agent B          │  │     │                  │ │
│  │     ├─→ Agent C          │  │     ▼                  │ │
│  │     └─→ ...              │  │  ~/mcp-servers/        │ │
│  │         │                │  │  (compiled binaries)   │ │
│  │         ▼                │  │                        │ │
│  │  MCP Servers ◄───────────┼──┼── built by Claude Code │ │
│  │  (spawned as needed)     │  │                        │ │
│  └─────────────────────────┘  └───────────────────────┘ │
│                                                         │
│  ~/agents/  (shared filesystem — the contract)          │
│  ├── ORCHESTRATOR.md     ◄── read by Cowork             │
│  ├── REGISTRY.md         ◄── read by Cowork             │
│  ├── skills/             ◄── can be updated by either   │
│  └── [agent folders]/    ◄── managed by Cowork          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
