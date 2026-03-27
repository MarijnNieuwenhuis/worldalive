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
2. Verify it contains a "## Recent Activity" section. If the file is empty or missing this section, report: "MEMORY.md is empty or not yet structured — nothing to compact." Stop.
3. Identify entries in "Recent Activity" older than 14 days.
4. If no entries are older than 14 days, report: "Nothing to compact — all entries are within the last 14 days." Stop.
5. Summarize the older entries into concise bullet points grouped by theme/topic.
6. Move summaries to the "## Compacted History" section (create the section if it doesn't exist).
7. Remove the original detailed entries from "Recent Activity."
8. Add a compaction note at the top of "Compacted History":
   `SYSTEM: Memory compacted on {{date}}. {{N}} entries summarized.`

## Rules

- Never discard information completely — always summarize before removing.
- Keep the most recent 14 days of detailed entries untouched.
- If Compacted History itself is growing large, summarize it further into key themes.
- Preserve any entry tagged with [IMPORTANT] or [PINNED] regardless of age.

## Gotchas

- Some MEMORY.md files may use "## Recent Runs" instead of "## Recent Activity" — check for both and treat them as equivalent.
- If the agent is currently mid-run (STATUS.md shows "running"), do not compact — entries may still be written.
