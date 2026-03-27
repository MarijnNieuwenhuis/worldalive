# Orchestrator Protocol

Reference doc for how the orchestrator agent operates within the multi-agent system.

## Flow

1. User sends a task → dispatch passes it to orchestrator (in-memory)
2. Orchestrator reads REGISTRY.md to find the right agent
3. Orchestrator delegates to the agent (in-memory for sync, INBOX.md for async)
4. Agent responds → orchestrator returns result to user

## Communication modes

### Synchronous (default)
Everything runs in one turn. No files written. Fast.

### Asynchronous
Uses INBOX.md files. Only for multi-step tasks or cross-agent handoffs across runs.

## File write rules

| File | Write when | Skip when |
|------|-----------|-----------|
| MEMORY.md | Errors, roster changes, unusual decisions, user preferences | Routine delegations, simple tasks |
| INBOX.md | Async handoffs, multi-run tasks | Synchronous single-turn tasks |
| STATUS.md | Errors, roster changes | Routine successful runs |

## Rules

- Never modify SOUL.md files.
- Always append to MEMORY.md, never overwrite.
- Respect agent tool permissions in MCP_REGISTRY.md.
- If unsure, skip and note in STATUS.md.
