---
name: agent-status
description: Get a quick overview of all agents and their health
---

# Agent Status Skill

Provides a human-readable summary of the entire system.

## Steps

1. Read `agents/STATUS.md` for the global overview.
2. Read `agents/REGISTRY.md` for the agent list.
3. For each agent in the registry, read its `STATUS.md`. If a STATUS.md is missing, note it as "status file not found" rather than skipping the agent.
4. Present a summary:

```
System Overview (as of {{date}})

Agents: {{total}} registered, {{active}} active, {{errored}} with errors

[agent-name] — {{status}}
  Last run: {{timestamp}}
  Schedule: {{schedule}}
  Memory size: {{file size of MEMORY.md}}
  Notes: {{any alerts or recent errors}}
```

5. If any agents have 3+ consecutive errors, highlight them prominently at the top.
6. If any agent's memory exceeds 50KB, suggest running compact-memory.
7. If any agent folder listed in REGISTRY.md doesn't exist on disk, flag it as "registered but folder missing."

## Gotchas

- REGISTRY.md is a markdown table — the agent count is the number of data rows, not total lines.
- Memory size can be estimated from line count if file size tools aren't available: flag any MEMORY.md over ~1,500 lines.
