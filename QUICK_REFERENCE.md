# ⚡ Quick Reference Card (Print This!)

**Keep this in your IDE or workspace**

---

## Model Selection (30 seconds)

```
┌─ What's your task?
│
├─ Simple Q&A, quick task?
│  └─ Claude Haiku 4.5 ($1/$5)
│
├─ Complex code, project integration?
│  └─ Claude Opus 5 ($5/$25)
│
├─ Algorithm, optimization, math?
│  └─ GPT-5.6 Sol ($5/$30) or GPT-6 Astra ($10/$50)
│
├─ UI/Frontend with specs?
│  └─ Claude Opus 5 (for polish) OR GPT-5.6 Sol (for speed)
│
├─ High-volume, budget-conscious?
│  └─ Gemini 3.8 Flash ($0.75/$3.75) [but 13.3s latency]
│
├─ Overnight batch work?
│  └─ Gemini 3.8 Flash
│
├─ Local/offline required?
│  └─ Llama 4 Maverick or Muse Glimmer (free)
│
└─ When in doubt?
   └─ Try Haiku first ($0.0008), escalate if needed
```

---

## Quick Facts (2026)

### Claude Models
| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| Haiku 4.5 | ⚡⚡⚡ | 70% | $ | 80% of work |
| Sonnet 5 | ⚡⚡ | 85% | $$ | Value pick |
| Opus 5 | ⚡ | 95% | $$$ | Complex work |
| Fable 5 | 🐢 | 99% | $$$$ | Frontier agent |

### GPT Models
| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| GPT-5.6 Luna | ⚡⚡⚡ | 75% | $ | Volume |
| GPT-5.6 Sol | ⚡⚡ | 90% | $$$ | Algorithms |
| GPT-6 Astra | 🐢 | 98% | $$$$ | Complex agents |

### Google Gemini
| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| 3.7 Flash | ⚡⚡ | 75% | $ | Volume, speed |
| 3.8 Flash | 🐢 | 85% | $ | Batch agents |

---

## Your UI Problem: The Fix

### Problem
Claude generates 90s-style UIs with:
- Cream background (#F4F1EA) + terracotta
- Neon dark mode + acid green
- Newspaper layout + hairlines

### Solution (3 Steps)

**Step 1: Create `design.md`**
```markdown
# design.md (200 lines max)
## Colors
- Primary: #0066CC
- Accent: #FF6B35
[... define your tokens ...]

## Typography
- Heading: Inter 700 28px
[... define your fonts ...]

## Spacing
- sm: 8px, md: 16px, lg: 24px
```

**Step 2: Update `CLAUDE.md`**
```markdown
## Design System
You must follow design.md strictly.
@design.md

### Rules
- Use ONLY tokens from design.md
- No invented colors
- No cream (#F4F1EA) backgrounds
- No neon accents
```

**Step 3: Install SnapDiff MCP**
```
Verifies rendered output automatically
Prevents UI drift
```

### Result
UI drift: 100% of sessions → 5% of sessions

---

## Cost Tracking

### This Session
```
Haiku 4.5: $0.16 so far
├─ Prompt 1: $0.0205
├─ Prompt 2: $0.083
└─ Prompt 3: $0.052
```

### When to Compact
- Compact at: $1.00
- Switch tasks: Can continue or new session
- Momentum high: Keep going

### Daily Budget
```
Morning (Haiku Q&A):    $0.02-0.05
Midday (Opus coding):   $0.10-0.30
Evening (Haiku notes):  $0.02-0.05
─────────────────────
Total/day:              $0.14-0.40
Total/week:             $1.00-2.80
Total/month:            $4-12
```

**Reality**: Your corporate allowance covers this 100x over.

---

## Common Scenarios & Solutions

### "Claude keeps generating bad UI"
→ Implement DESIGN.md + SnapDiff (details in notes/07)

### "GPT needs 3 prompts, Claude does 1"
→ Expected (Constitutional AI vs RLHF) - use Claude for architecture

### "Haiku is too weak for my task"
→ Try it first anyway - you might be surprised. If it fails, escalate to Opus.

### "Gemini Flash has 13s latency"
→ Normal. Use only for batch/overnight work. Use 3.7 Flash for speed.

### "How do I choose between 2 models?"
→ See decision flowchart in notes/05

### "Cost keeps climbing"
→ Log in SESSION_COST_TRACKING.md, check if you're using expensive models for cheap work

---

## Decision Flowchart (Daily Use)

```
Is it code generation?
├─ YES: Is it multi-file/architecture?
│  ├─ YES: Claude Opus 5
│  └─ NO: Try Claude Haiku, escalate if needed
│
├─ NO: Is it pure algorithm/math?
│  ├─ YES: GPT-5.6 Sol
│  └─ NO: Continue below
│
├─ NO: Is it UI/frontend?
│  ├─ YES: Claude Opus 5 (for polish) or GPT-5.6 Sol (for speed)
│  └─ NO: Continue below
│
├─ NO: Is it research/information gathering?
│  ├─ YES: Gemini 3.8 Flash
│  └─ NO: Continue below
│
├─ NO: Is it simple Q&A?
│  ├─ YES: Claude Haiku 4.5
│  └─ NO: You're overthinking it
│
└─ When in doubt: Try Haiku first
```

---

## Important Files in This Project

```
/notes/
├─ INDEX.md ← Start here for orientation
├─ 01.model-architecture-overview.md
├─ 02.claude-vs-gpt-deep-comparison.md ← Your experience here
├─ 03.model-team-roles.md ← How to assign roles
├─ 04.gemini-open-source-analysis.md
├─ 05.decision-flowchart-guide.md ← Print & use daily
├─ 06.2026-models-latest-comparison.md
├─ 07.real-world-user-experiences.md ← YOUR SOLUTIONS HERE
└─ SESSION_COST_TRACKING.md ← Log your costs

Also:
├─ QUICK_REFERENCE.md ← This file (keep handy)
├─ LEARNING_PLAN.md ← Your 8-week curriculum
├─ AGENT.md ← Agent frameworks deep dive
├─ SKILLS.md ← Track your progress
└─ TOKEN_BUDGET.md ← Pricing reference
```

---

## One-Liners

```
"Which model should I use?"        → notes/05 (decision tree)
"Why is Claude better?"            → notes/02
"My UI looks 90s"                  → notes/07 (DESIGN.md solution)
"I'm worried about cost"           → SESSION_COST_TRACKING.md
"What can each model do?"          → notes/03 (team roles)
"What's the latest September data?"→ notes/06
"How do I actually use this?"       → notes/07 (real workflows)
"I need to understand architecture"→ notes/01 + notes/02
```

---

## The Three Rules

```
Rule 1: Route by task, not brand loyalty
  → Different models for different jobs
  → No universal "best"

Rule 2: Verify with tools, not hope
  → SnapDiff for UI
  → Tests for code
  → Benchmarks for claims

Rule 3: Optimize for value, not just cost
  → Cost = dollars spent
  → Value = learning gained + code shipped
  → Corporate allowance = optimize for learning speed
```

---

## Your Advantages (September 2026)

✅ You have detailed model comparison (none existed 1 year ago)  
✅ You have real-world experience patterns (from production teams)  
✅ You know the UI fix (most developers still don't)  
✅ You have a decision framework (not guessing)  
✅ You understand the why (not just the what)  
✅ You're using Claude (the best for your use case)  
✅ You have corporate allowance (no budget constraint)  

---

## Print This Card

**Bookmark/Pin/Print this file for:**
- Daily model selection decisions
- Quick cost lookups
- Emergency "what should I use?" moments
- Reference during troubleshooting

---

**Last Updated**: September 11, 2026  
**Print & Keep Handy**: YES ✅
