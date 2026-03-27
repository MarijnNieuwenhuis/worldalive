# Skill Building — Best Practices

> Source: https://agentskills.io/skill-creation/best-practices

---

## Start from real expertise

Don't ask an LLM to generate a skill from nothing — that produces vague, generic procedures. Ground skills in real knowledge.

### Extract from a hands-on task

Complete a real task in conversation with an agent, then extract the reusable pattern. Capture:

- **Steps that worked** — the sequence of actions that led to success
- **Corrections you made** — places where you steered the agent (e.g., "use X not Y", "check for edge case Z")
- **Input/output formats** — what data looked like going in and coming out
- **Context you provided** — project-specific facts, conventions, or constraints the agent didn't already know

### Synthesize from existing project artifacts

Feed real project material into an LLM and ask it to synthesize a skill. Project-specific material always outperforms generic references. Good sources:

- Internal docs, runbooks, and style guides
- API specs, schemas, and config files
- Code review comments and issue trackers (captures recurring concerns)
- Version control history — especially patches and fixes (reveals patterns through what actually changed)
- Real-world failure cases and their resolutions

---

## Refine with real execution

The first draft usually needs refinement. Run the skill against real tasks, then feed results — all of them, not just failures — back in. Ask: what triggered false positives? What was missed? What can be cut?

> **Tip:** Read agent execution *traces*, not just final outputs. Common causes of wasted steps:
> - Instructions too vague → agent tries several approaches before finding one that works
> - Instructions that don't apply to the current task → agent follows them anyway
> - Too many options without a clear default

Even a single execute-then-revise pass noticeably improves quality.

---

## Spending context wisely

A skill's full `SKILL.md` loads into the context window on every activation. Every token competes with conversation history, system context, and other skills.

### Add what the agent lacks, omit what it knows

Focus on what the agent *wouldn't* know without the skill: project conventions, domain procedures, non-obvious edge cases, specific tools/APIs. Don't explain what a PDF is or how HTTP works.

```markdown
<!-- Too verbose -->
PDF files are a common format... use pdfplumber because it handles most cases.

<!-- Better — jumps to what the agent wouldn't know -->
Use pdfplumber for text extraction. For scanned documents, fall back to pdf2image + pytesseract.
```

Ask about each piece of content: "Would the agent get this wrong without this instruction?" If no — cut it.

### Design coherent units

Scope like a function: encapsulate a coherent unit of work that composes well with other skills.
- Too narrow → multiple skills load for one task, risking overhead and conflicting instructions
- Too broad → hard to activate precisely

### Aim for moderate detail

Overly comprehensive skills hurt: the agent struggles to find what's relevant and may follow instructions that don't apply. Concise, stepwise guidance + a working example beats exhaustive docs.

### Structure large skills with progressive disclosure

Keep `SKILL.md` under **500 lines / 5,000 tokens** — just the core instructions needed on every run.

For larger skills, move detailed reference material to `references/`. Tell the agent *when* to load each file:

```markdown
<!-- Good -->
Read `references/api-errors.md` if the API returns a non-200 status code.

<!-- Bad -->
See references/ for details.
```

---

## Calibrating control

Match prescriptiveness to fragility.

### Give freedom when variation is acceptable

Explaining *why* often works better than rigid directives — an agent that understands the purpose makes better context-dependent decisions.

```markdown
## Code review process
1. Check all database queries for SQL injection (use parameterized queries)
2. Verify authentication checks on every endpoint
3. Look for race conditions in concurrent code paths
4. Confirm error messages don't leak internal details
```

### Be prescriptive when fragility demands it

```markdown
## Database migration
Run exactly this sequence:
  python scripts/migrate.py --verify --backup
Do not modify the command or add additional flags.
```

### Provide defaults, not menus

Pick a default and mention alternatives briefly — don't present equal options.

```markdown
<!-- Too many options -->
You can use pypdf, pdfplumber, PyMuPDF, or pdf2image...

<!-- Clear default with escape hatch -->
Use pdfplumber for text extraction.
For scanned PDFs requiring OCR, use pdf2image + pytesseract instead.
```

### Favor procedures over declarations

Teach the agent *how to approach* a class of problems, not *what to produce* for a specific instance.

```markdown
<!-- Specific answer — only useful once -->
Join orders to customers on customer_id, filter region = 'EMEA', sum amount.

<!-- Reusable method -->
1. Read schema from references/schema.yaml to find relevant tables
2. Join using the _id foreign key convention
3. Apply user's filters as WHERE clauses
4. Aggregate numeric columns and format as a markdown table
```

---

## Patterns for effective instructions

### Gotchas sections

Highest-value content: concrete corrections to mistakes the agent *will* make without being told. Not general advice — environment-specific facts that defy reasonable assumptions.

```markdown
## Gotchas
- The `users` table uses soft deletes. Always include `WHERE deleted_at IS NULL`.
- User ID is `user_id` in the DB, `uid` in auth, `accountId` in billing. Same value.
- `/health` returns 200 even if the DB is down. Use `/ready` for full health checks.
```

> **Rule:** When an agent makes a mistake you have to correct, add it to the gotchas section immediately.

### Templates for output format

Concrete templates are more reliable than prose descriptions — agents pattern-match against structure.

```markdown
## Report structure
# [Analysis Title]

## Executive summary
[One-paragraph overview]

## Key findings
- Finding 1 with supporting data

## Recommendations
1. Specific actionable recommendation
```

Short templates: inline in `SKILL.md`. Long or conditional templates: store in `assets/` and reference with a trigger condition.

### Checklists for multi-step workflows

Explicit checklists help the agent track progress and avoid skipping steps.

```markdown
## Form processing workflow
- [ ] Step 1: Analyze form (`python scripts/analyze_form.py`)
- [ ] Step 2: Create field mapping (edit `fields.json`)
- [ ] Step 3: Validate mapping (`python scripts/validate_fields.py`)
- [ ] Step 4: Fill form (`python scripts/fill_form.py`)
- [ ] Step 5: Verify output (`python scripts/verify_output.py`)
```

### Validation loops

Do the work → run a validator → fix issues → repeat until it passes.

```markdown
## Editing workflow
1. Make your edits
2. Run: `python scripts/validate.py output/`
3. If validation fails: review error, fix, re-run
4. Only proceed when validation passes
```

### Plan-validate-execute

For batch or destructive operations: generate a plan in a structured format, validate against a source of truth, then execute.

```markdown
## PDF form filling
1. Extract fields: `python scripts/analyze_form.py input.pdf` → `form_fields.json`
2. Create `field_values.json` mapping each field name to its value
3. Validate: `python scripts/validate_fields.py form_fields.json field_values.json`
4. If validation fails, revise `field_values.json` and re-validate
5. Fill form: `python scripts/fill_form.py input.pdf field_values.json output.pdf`
```

Key: step 3 validates the *plan* against the source of truth. Errors like `"Field 'x' not found — available: a, b, c"` give the agent enough info to self-correct.

### Bundling reusable scripts

If you notice the agent independently reinventing the same logic across runs (building charts, parsing a format, validating output) — write a tested script once and bundle it in `scripts/`.

---

## Quick reference checklist

Before publishing a skill, ask:

- [ ] Grounded in real task execution or project artifacts (not generic LLM output)?
- [ ] Tested against at least one real task and revised based on results?
- [ ] Does every instruction answer "would the agent get this wrong without it"?
- [ ] Under 500 lines / 5,000 tokens in `SKILL.md`?
- [ ] Reference material moved to `references/` with specific load triggers?
- [ ] Default approach chosen (not a menu of options)?
- [ ] Prescriptiveness matches fragility (tight where it matters, loose where it doesn't)?
- [ ] Gotchas section captures real mistakes from real execution?
- [ ] Output format has a concrete template (not just a prose description)?
- [ ] Multi-step workflows have an explicit checklist?
