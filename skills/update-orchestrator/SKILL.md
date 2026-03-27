---
name: update-orchestrator
description: Notify the orchestrator when an agent is added, updated, or removed from the registry
---

# Update Orchestrator Skill

Notifies the orchestrator agent when the agent roster changes.

## When to use

Run this skill after:
- A new agent is created (via create-agent skill)
- An existing agent is updated (via update-agent skill)
- An agent is removed or disabled

## Input required

1. **Event type** — `agent-added`, `agent-updated`, or `agent-removed`
2. **Agent name** — the affected agent's name
3. **Summary** — one-line description of what changed

## Steps

1. Verify the orchestrator agent exists at `~/agents/orchestrator/`.
2. Append to `~/agents/orchestrator/MEMORY.md` (this is worth remembering):

```
### {{timestamp}} — Registry update
- Event: {{event-type}}
- Agent: {{agent-name}}
- Change: {{summary}}
```

3. Only write to orchestrator's INBOX.md if the change is urgent (e.g., agent removed while tasks are in flight). Otherwise the orchestrator reads REGISTRY.md on each run anyway.

4. Confirm to user: "Orchestrator notified about {{event-type}} for '{{agent-name}}'."

## Notes

- The orchestrator reads REGISTRY.md at the start of each run, so routine additions don't need inbox messages.
- Memory writes here are justified because roster changes affect future routing decisions.
