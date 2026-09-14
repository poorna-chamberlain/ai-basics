# AI Learning Memory & Knowledge Base

Cumulative insights, discoveries, and patterns learned across sessions.

## Session 1: Project Initialization (2026-09-11)

### Key Insights Captured
- Structured learning approach: practical projects > theory
- Documentation-driven knowledge: markdown as permanent memory
- Token budgeting is critical for sustainable learning
- Session compression: knowledge must live outside session context
- **NEW WORKFLOW**: Completed files → notes/completed/, Open questions tracked, Claude Sonnet 5 answers complex questions

### Session 1 Workflow Established
- **Haiku 4.5**: Handles setup, research, documentation
- **Sonnet 5+**: Answers complex questions from OPEN_QUESTIONS_I_HAVE.md
- **Question Flow**: User → OPEN_QUESTIONS_I_HAVE.md → Claude Sonnet session → QUESTIONS_ANSWERED.md
- **File Organization**: 
  - `notes/completed/` - Finished reading files (01-07)
  - `OPEN_QUESTIONS_I_HAVE.md` - Questions during reading
  - `QUESTIONS_ANSWERED.md` - Detailed answers with research

### Important Patterns Discovered
- (To be filled as we learn)

### Gotchas & Lessons Learned
- (To be filled as we encounter them)

---

## Session 2: Questions Answered (2026-09-11, Claude Sonnet 5)

### What Happened
- Read all 11 questions in `OPEN_QUESTIONS_I_HAVE.md` plus the "informations I got" addendum
- Ran ~11 live web searches to verify current (Sept 2026) data before answering — several claims in `notes/completed/01-07` were found **outdated or wrong** and corrected in `QUESTIONS_ANSWERED.md`:
  - Claude context is no longer "200K vs everyone's 1M" — Claude Sonnet 5/Opus 5/Fable 5 are now 1M too; GPT-5.6 line is actually only 400K (272K usable input), smaller than Claude's.
  - Claude vs GPT-6 Astra computer-use gap is ~2 points (70.2% vs 72.6% OSWorld 2.0), not a tier difference like the notes implied.
  - Claude's real cost disadvantage on simple tasks is a **verified, measurable tokenizer inefficiency** (up to 1.73x more tokens than GPT for the same code) + higher output verbosity — not "needs project context."
- Created `MODEL_TEST_PROMPTS.md` (root) for Q11: 6 UI-only prompts, each testing a different capability (state/architecture, accessibility defaults, responsive stability, debug/polish, ambiguous aesthetic judgment, multi-file project-awareness), each ending with a `design.md`-creation step (rule 2 / CLAUDE.md enforcement deliberately skipped — one-shot comparison, not an ongoing project).
- Confirmed the user's own workflow (always Sonnet, manual escalation to Opus, ignoring auto-select/team-roles routing) is empirically what most flat-rate-subscription developers do, not an outlier — team-role routing pays off mainly under per-token billing, not flat plans.

### Key Lesson
- **Always re-verify frontier-model facts with live search before answering** — session 1 (Haiku) generated plausible-sounding but partially stale/incorrect benchmark framing. Treat `notes/completed/*.md` as a first draft, not ground truth, until cross-checked.

---

## Session 3: First Real Model Comparison Results (2026-09-14)

### What Happened
- User actually built both `MODEL_TEST_PROMPTS.md` projects with both models (`projects/claude/` and `projects/chatgpt/`, each with "project 1" and "project_2" subfolders) and reported real, first-hand results — logged directly in `MODEL_TEST_PROMPTS.md`'s log tables.
- **Project 1 (Electron desktop app)**: Claude Opus 5 won clearly on quality ("did best work, its really best"), but user is uneasy about Opus's cost for routine use. GPT-5.6 Sol was cheap/fast but the output quality was poor ("too bad, that's never a good work") — a clean case of cheap-but-broken losing to expensive-but-working.
- **Project 2 (UI component showcase)**: Result flipped — GPT-5.6 Sol produced the best UI, in just a few minutes ("best ui"). Claude's Project 2 output wasn't explicitly scored against GPT by the user.
- **Real-world confirmation**: this is a genuine, first-hand data point for the "route by task, not brand loyalty" principle already documented in `notes/completed/07` and `QUESTIONS_ANSWERED.md` Q2 — Claude won the systems-integration/app task, GPT won the pure-UI task. Neither model is universally better; the earlier research-based conclusion held up under an actual test.
- **Open follow-up the user raised**: does Claude Sonnet 5 (cheaper than Opus) do well enough on Project 1 to avoid needing Opus for this class of task? Not yet tested — worth a 3-way run (Opus vs Sonnet vs GPT-5.6 Sol) next time.
- **Repo hygiene fix**: the built projects came with `node_modules/` (600M+ each), `out/`, `release/` build dirs, and several redundant multi-GB zip backups (`release.zip`, `project 1_with release.zip`, `project 1_node_modules_included.zip`) plus one unrelated/sensitive file (`payslip.zip`) sitting loose in `projects/chatgpt/`. Root `.gitignore` updated to exclude all node/electron build artifacts and all `*.zip` files repo-wide (defense-in-depth on top of each project's own nested `.gitignore`). Flagged the zips (especially `payslip.zip`) to the user rather than silently deleting them.

---

## Model Comparison Notes

### GPT-4 (OpenAI)
- **Strengths**: Best reasoning, code generation, complex tasks
- **Cost**: Higher
- **Speed**: Slower
- **Token Limit**: 128K
- **Best For**: Complex reasoning, code review, planning
- **Notes**: (To be expanded)

### Claude 3.5 (Anthropic)
- **Strengths**: Long context, safe reasoning, balanced capability
- **Cost**: Mid-range
- **Speed**: Fast
- **Token Limit**: 200K
- **Best For**: Long documents, safety-critical tasks
- **Notes**: (To be expanded)

### Llama (Meta)
- **Strengths**: Open-source, on-device capable
- **Cost**: Free (self-hosted) or API
- **Speed**: Variable
- **Token Limit**: Varies
- **Best For**: Privacy-critical, offline scenarios
- **Notes**: (To be expanded)

---

## API Integration Learnings

### Token Counting
- [ ] OpenAI `tiktoken` library
- [ ] Anthropic token counting
- [ ] Estimate vs actual counting
- [ ] Overhead tokens (system prompts, formatting)

### Cost Tracking
- [ ] Per-request logging
- [ ] Running totals per model
- [ ] Cost analysis per task
- [ ] ROI calculations

---

## Agent Framework Observations

### Tool Calling Capabilities
| Framework | Web Search | Code Exec | File Ops | API Integration | Real-time Data |
|-----------|-----------|----------|----------|-----------------|----------------|
| LangChain | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cursor Agents | ✅ | ✅ | ✅ | ✅ | ✅ |
| CrewAI | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| (To be expanded) | | | | | |

---

## Quick Reference: When to Use Which Model

| Task Type | Recommended Model | Reasoning |
|-----------|-------------------|-----------|
| Fast responses | Claude 3.5 Haiku | Speed + low cost |
| Complex reasoning | GPT-4 | Best reasoning capability |
| Code generation | GPT-4 or Claude | Both strong, try both |
| Long documents | Claude 3.5 Sonnet | 200K context |
| Cost-sensitive | Llama or Haiku | Minimal cost |
| (More patterns as we learn) | | |

---

## Code Snippets & Patterns

### Token Counting Template
```python
# (To be documented as we build)
```

### Agent Tool Template
```python
# (To be documented as we build)
```

---

## Session Artifacts

- Session 1: Project initialization (this file + supporting docs)
- (Artifacts from future sessions)

---

**Last Updated**: 2026-09-11 12:33 UTC+5:30
**Next Review**: After Phase 1 completion
