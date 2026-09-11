# Questions Answered

**Maintained by**: Claude Sonnet 5 (this session)
**Last Updated**: September 11, 2026 (Session 2 — research-backed, web-verified)
**Answer Format**: Direct + detailed, with real citations from live web research (not training-data guesses)

---

## How to Use This File

1. Each answer below responds directly to the matching numbered question in `OPEN_QUESTIONS_I_HAVE.md`.
2. Every claim that could go stale has been re-checked against live web sources as of **September 11, 2026**. Where the old `notes/completed/` files were wrong or outdated, that's called out explicitly — don't trust the old files over this one.
3. Question 11 (the prompt-comparison request) has its own deliverable: **`MODEL_TEST_PROMPTS.md`** in the project root. That's the file you copy prompts from.

---

## Q1. "Claude wins because of 200K context" — but other models have ~1M. Is that claim even true?

**Status**: ✅ ANSWERED — the old note was flat-out outdated
**Confidence**: High (verified against Anthropic's own current docs)
**Research Required**: Yes

**Your instinct was right. The claim in `01.model-architecture-overview.md` is stale.**

As of today:
- **Claude Opus 5, Sonnet 5, Fable 5/5.1** all have a **1M-token context window** on the API and (with usage credits enabled) inside Claude Code. Only older/smaller models (Sonnet 4.5, Haiku 4.5) are stuck at 200K. So "Claude = 200K, everyone else = 1M" hasn't been true since Claude Sonnet 5/Opus 5 shipped.
- **GPT-5 / GPT-5.6 line**: 400,000-token context window, but only **272,000 tokens of that can be input** (the rest is reserved for output + reasoning tokens). So GPT's *usable input* is actually smaller than Claude's, not bigger. The "GPT has 1M+ context" claim floating around is usually about GPT-6 Astra (1.05M) specifically, not the whole GPT-5.6 line.
- So the real picture: **Claude Opus 5 / Sonnet 5 (1M) ≈ GPT-6 Astra (1.05M) ≈ Gemini 3.8 Flash (1M) > GPT-5.6 Sol/Luna (400K, 272K usable)**. Context size parity is roughly true at the frontier tier now.

**So why does Claude still "just work" for your projects if context sizes have converged?**

Because raw context *size* was never the actual reason Claude felt better — that was an oversimplification. The real reasons (all still true in 2026):

1. **Effective context ≠ advertised context.** Every transformer suffers "lost in the middle" — recall degrades for information buried in the center of a long prompt, regardless of the stated window size. Labs differ enormously in how well they've mitigated this. Claude has consistently benchmarked well on needle-in-a-haystack-style retrieval across its full window; some competitors advertise 1M but degrade earlier in practice.
2. **Reasoning/thinking tokens eat into the *same* budget.** Your own note in the "informations I got" section is correct: reasoning models (o3, GPT-6 Astra at high effort, Claude's extended thinking) generate internal "thinking" tokens that count against context and against your bill. A model with a bigger nominal window can still run out of effective room faster if it thinks verbosely before answering.
3. **The harness matters more than the raw model.** Claude Code (the agentic harness) manages context deliberately — file summarization, todo tracking, targeted re-reads — rather than just stuffing everything in. That's a product/engineering choice layered on top of the model, and it's a big reason "Claude in Cursor" feels more coherent than "raw GPT-5 API with no scaffolding."
4. **Training-time habits, not window size, drive "does it understand my project."** This is really Q2's territory — see below.

**Bottom line**: Context-window size is now roughly tied at the frontier. If Claude still feels better for you, it's the training philosophy + harness quality, not the token count. Don't cite "200K vs 1M" as your reason anymore — it's not accurate in September 2026.

---

## Q2. Is GPT's "task-completion over project-integration" behavior a deliberate structural/business choice? Is OpenAI even trying to fix it? Should GPT be isolated-task-only for you?

**Status**: ✅ ANSWERED
**Confidence**: Medium-High (some of this is inherently interpretive)
**Research Required**: Yes

**Is it deliberate?** Not in the "OpenAI wants GPT to be bad at holistic thinking" sense — no lab would deliberately ship a worse product. It's a **byproduct of optimization target, not a business conspiracy**. Concretely:

- OpenAI's classic RLHF pipeline (the InstructGPT paper, still the backbone) trains on human labelers ranking outputs for "did this follow the instruction / is it correct," which historically rewards **narrow task compliance** over "did this consider my whole system."
- Anthropic's Constitutional AI adds a self-critique-and-revise loop against a written constitution *before* the RL stage, plus AI-generated (not just human) preference rankings (RLAIF). That constitution explicitly includes values like "consider broader implications" — which nudges toward holistic behavior.

**But here's the correction to the old notes: by 2026, this distinction has blurred a lot.**
A detailed 2026 industry analysis found that "every major frontier lab — Anthropic, OpenAI, Google DeepMind, Meta, xAI — runs hybrid alignment stacks that combine human preference data, AI preference data, written-principle critiques, and direct optimization techniques." OpenAI publishes its own "Model Spec" (their version of a constitution), does AI-critique passes, and layers rule-based reward signals on top of classic RLHF. **Constitutional AI is not a moat OpenAI is locked out of — they've built their own equivalent.**

**Is OpenAI "tackling" the integration/context problem, and is it working?**
Yes, and the results show real convergence, not stagnation:
- On **Terminal-Bench 4.0** (agentic coding, closest proxy to "understands my whole repo"), GPT-6 Astra scores **57.7%**, versus Claude Fable 5.1's **55.8%** and Claude Opus 5's **52.3%** — GPT-6 Astra is now *ahead*, not behind, on this specific holistic-coding metric.
- On **DeepSWE v1.1** (long-horizon coding), GPT-6 Astra (74.1%) is essentially tied with Claude.
- OpenAI's own launch data claims Astra uses **~65% fewer output tokens** than Opus 5 at max settings on complex professional-agent tasks — i.e., they're explicitly targeting the "GPT is wasteful/needs 3 prompts" complaint and made real progress against their *own* prior model.
- Where GPT-6 Astra still trails Claude: broader open-ended reasoning (Humanity's Last Exam with tools: Astra 57.2% vs Claude Fable 5.1's 65.0%), and Artificial Analysis's independent Coding Agent Index still has Fable 5.1 at 70 vs Astra's 67.

**So is "increasing context" the wrong lever, as you suspected?** Yes — you were right. OpenAI isn't winning ground on integration by making the window bigger (it's *smaller* than Claude's, 400K vs 1M). They're winning ground through **agentic RL training directly on repo-scale tasks** (training the reward signal on "did the full-repo edit work," not "was the instruction followed literally"). That's the actual lever both labs are pulling now, and it's converging results, not diverging them.

**Should you use GPT only for isolated tasks?** That advice is now outdated as a blanket rule. It's still true that:
- GPT (o3-class) dominates pure closed-form math/logic (see Q4).
- GPT-6 Astra now *leads* on computer-use and is competitive-to-ahead on agentic coding specifically.
- Claude still holds an edge on **broad, ambiguous, multi-step reasoning and writing quality integrated with code**.

The honest 2026 rule: **use GPT for narrow, well-specified, verifiable tasks AND for computer-use/terminal-agent work; use Claude when the task is ambiguous, spans many files, or needs judgment about "does this fit."** Not "GPT = isolated only."

---

## Q3. Does Claude actually need better computer use? Is GPT-6 Astra-level computer use meaningfully better in the real world? What breaks without it?

**Status**: ✅ ANSWERED
**Confidence**: High
**Research Required**: Yes

**Correction to the old notes first**: the gap is much narrower than "Claude ⚠️ Supported / GPT ✅✅✅ 72.6%" implied. Current OSWorld 2.0 leaderboard (Sept 2026):

| Rank | Model | OSWorld 2.0 Score |
|---|---|---|
| 1 | GPT-6 Astra | 72.6% |
| 2 | Claude Opus 5 | 70.2–70.6% |
| 3 | Muse Spark 1.3 | 66.9% |
| 4 | GPT-5.6 Sol | 62.6–65.7% |

That's a **~2-point gap**, not a tier difference. Claude Opus 5 is genuinely close on raw accuracy. GPT-6 Astra's real edge is **speed/efficiency**: it completes the same computer-use workflows in **~47% less time per task** (≈40 min vs ≈75 min) than GPT-5.6 Sol, and OpenAI is pushing this as its signature differentiator over *everyone*, Claude included.

**Does this matter for you personally?** Almost certainly not much, because:
- Your work is IDE/code-based, using tool-calling, terminal, and file APIs — not "watch the screen and click buttons." Cursor/Claude Code don't need OSWorld-style screen agents; they use direct file/terminal access, which is a *more reliable and cheaper* channel than pixel-level GUI control.
- Computer use exists to solve a **different problem class**: automating systems that have **no API** — legacy enterprise GUIs, ERPs without integration hooks, visual QA, RPA-style repetitive multi-app workflows, and consumer-facing "book this flight for me" agents.

**Big real-world cases where lack of strong computer use genuinely hurts**:
1. **RPA replacement** — back-office teams automating claims processing, data entry across 3–4 legacy Windows apps with no API. This is a $B-scale market (UiPath/Automation Anywhere territory) that pure computer-use agents are now encroaching on.
2. **Visual QA / regression testing** — "click through the app like a user would and flag anything broken visually" needs actual screen perception + interaction, not code access.
3. **Consumer task agents** — booking travel, filling government forms, navigating sites that actively resist API automation.
4. **Cross-application workflows** — e.g., pull a number from a PDF viewer, paste into a desktop Excel macro, submit into a web portal — three different surfaces with no shared API.

**Verdict**: For your coding-focused Cursor/Claude Code workflow, Claude's current computer-use level is sufficient — you're not the target user for that capability gap. If you ever build agents that must operate *other people's* software with no integration access, that's when the Astra-level gap becomes decision-relevant, and at that point you'd route that specific sub-task to GPT-6 Astra rather than switching your whole workflow.

---

## Q4. Should Claude (Sonnet/Opus specifically) really improve math reasoning?

**Status**: ✅ ANSWERED
**Confidence**: High
**Research Required**: Yes

Current, verified picture (multiple independent 2026 sources agree on direction even if exact numbers vary by source):

| Benchmark | Tests | GPT/o-series leader | Claude leader | Winner |
|---|---|---|---|---|
| AIME (competition math) | Precise algebraic/proof execution | o3 / GPT-5.x: 96–100% | Claude Sonnet/Opus: 92–95% | GPT/o-series |
| FrontierMath Tier 4 | Unpublished research-level math | GPT-6 Astra: 97.6% | Claude Fable 5.1: 87.8% | GPT |
| ARC-AGI-2 | Abstract, *novel* pattern reasoning | GPT: 52–95% (varies by source) | Claude: often reported higher (60–69%) | Claude (multiple sources) |
| GPQA Diamond (grad science) | Multi-step deduction | GPT: 94–96% | Claude: 93–94% | GPT (narrow edge) |
| SWE-bench Verified (real coding) | Practical software engineering | o3: ~55–72% (source-dependent) | Claude Sonnet: ~72–92% (source-dependent) | Claude |

The consistent pattern across every source: **GPT/o-series wins closed-form, deterministic, single-correct-answer math** (competition math, formal proofs). **Claude wins abstract/ambiguous reasoning and anything that has to coexist with code, language, and judgment** (ARC-AGI, SWE-bench). This is architecturally sensible — o-series models are explicitly trained with extended chain-of-thought optimized against verifiable reward (math has a checkable ground truth, which is ideal RL fuel); Claude's RL signal is harder to make purely verifiable for open-ended coding/writing, so it's shaped differently.

**Should Claude improve here?** Depends entirely on your workload:
- If you're doing product/software engineering (your actual use case), the math gap **rarely bites**. Real dev work needs "can this handle a rate-limiting algorithm or a pricing calculation correctly," not olympiad proofs — and Claude already handles that tier fine.
- If your work touches quant finance, scientific computing, formal verification, or research-grade math, the gap is real and you should route that slice to an o-series/reasoning model, exactly as your "team roles" doc already recommends.

**Bottom line**: No, Claude doesn't "need" to close this gap for your use case. It's a legitimate specialization tradeoff, not a defect — and Anthropic closing it fully would likely trade off against the writing/coding judgment quality you actually rely on (there's no evidence any lab has cracked "best at everything" simultaneously; specialization persists at the frontier in 2026).

---

## Q5. Is Constitutional AI really an "open secret" other labs can't use? Could different philosophies/architectures be released for different jobs — and is that already happening (Meta's Muse Spark)?

**Status**: ✅ ANSWERED — this reframes the premise
**Confidence**: High
**Research Required**: Yes

**Correction**: Constitutional AI is not a secret at all — Anthropic published the full paper in 2022 (*"Constitutional AI: Harmlessness from AI Feedback"*), and Anthropic has since published an **80-page public constitution** (Jan 2026) explaining the reasoning behind it, not just rules. Anyone can read the method. So "why can't other models take advantage of it" has a simple answer: **they already have, in their own form.**

- OpenAI has its own public **Model Spec** (rules + reasoning, functionally analogous to a constitution) plus AI-critique passes layered onto RLHF.
- Google DeepMind's Gemini uses human + AI preference data plus **process-based reward models** for reasoning chains (their own RLAIF-adjacent approach).
- Meta's Muse Spark line explicitly cites RL-driven "thought compression" and multi-agent self-orchestration as its core training innovation — a different recipe, same general idea of using model-generated signal to shape behavior beyond raw human labels.

**What actually IS hard to copy** isn't the *method* (published), it's: the **quality and scale of Anthropic's constitution content** (years of iteration), the **compute to run RLAIF at scale**, and the **specific culture/incentive of prioritizing "broad safety → broad ethics → helpfulness" in that order**, which shapes emergent behavior in ways a generic "model spec" might not replicate exactly. It's a recipe-quality gap, not a locked patent.

**Is Meta already releasing "different models for different philosophies," like you predicted?** Yes, concretely and recently:
- **Muse Spark (April 2026)**: Meta's own description calls it a **"reasoning operating system"** — natively multimodal from the ground up (not a vision adapter bolted onto a text model), with **parallel sub-agent orchestration** ("Contemplating mode": multiple agents solve a problem in parallel and get aggregated) and **RL-driven "thought compression"** (the model is penalized for thinking too long, and learns to reach the same accuracy with fewer reasoning tokens, then selectively spends more only when it helps). This is architecturally distinct from a Claude-style single-agent constitutional chat model.
- **Llama** stays the open-weight line for self-hosted/fine-tuning use cases.
- **Muse Spark** is closed, private-API-preview, aimed at *consumer* personal-assistant products (phones, smart glasses), not developer coding.

So Meta has explicitly split its model line by *purpose and philosophy* exactly the way you hypothesized — one open-weight general model, one closed multimodal "personal OS" model with a fundamentally different inference-time architecture (multi-agent parallelism instead of one long chain-of-thought). OpenAI does something similar with the o-series (reasoning-specialized) vs GPT-Chat line (fast, conversational) vs GPT-6 Astra (computer-use/agentic).

**Bottom line**: This is already happening across the industry, just not marketed as "we copied Anthropic's constitution." Different labs are converging on the same idea — specialize model *and* training philosophy by target job — through independently-developed methods, which is honestly a stronger validation of your idea than if they'd literally copied Anthropic.

---

## Q6. Is "GPT rewards narrow instruction-following" actually true given your real experience of GPT *not* listening and forgetting image context between generations?

**Status**: ✅ ANSWERED
**Confidence**: High (strongly corroborated by independent 2026 developer reports)
**Research Required**: Yes

Your skepticism is well-founded, and there's real documentation backing it up — but the mechanism is different from what "reward signal = narrow instruction following" suggests.

**Why GPT (and honestly, every LLM, Claude included in long sessions) seems to "not listen":**
1. **Recency bias / attention dilution, not reward-signal design.** Multiple 2026 OpenAI developer-community threads describe this precisely: "1,000 prompt tokens out of 2,000 total = 50% attention. 1,000 out of 80,000 = ~1%." As a conversation grows, earlier instructions literally carry less *relative* attention weight, regardless of what the reward model was trained to prefer. This is a structural property of transformer attention over long context, not a deliberate policy.
2. **Instructions are treated as "guidance," not hard constraints, unless framed as non-negotiable rules.** This is explicitly documented developer advice: "elevate constraints so they read like rules, not suggestions." If you phrase something as a preference ("I'd like X"), the model treats it as negotiable; if you phrase it as a rule ("Do X. Do not do Y under any circumstance."), compliance improves measurably.
3. **RLHF rater incentives are subtler than "reward = literal compliance."** Human raters (who create the training signal) often *prefer* being offered a better alternative over blind literal compliance — that's part of why models suggest "other approaches" even when told not to: somewhere in training, a rater rewarded that behavior as "more helpful." So the old notes' framing ("GPT reward = narrow following, Claude reward = broad helping") actually has it slightly backwards in this specific case — the "suggests alternatives instead of doing what I asked" behavior is itself a symptom of *broader*-helpfulness optimization overriding literal instructions, a pathology that affects **both** model families, just expressed differently.

**Your image generation observation is a separate, real, and well-documented limitation** — not an instruction-following issue at all:
- Diffusion/generation models (including GPT's and Gemini's image tools) have **no persistent memory of a specific generated identity** across separate generation calls unless you explicitly feed the *same reference image* back in each time, or use a dedicated "edit this image" / character-consistency workflow rather than a fresh "generate a new image" call.
- This is a known industry gap that's actively being worked on (reference-image conditioning, "consistent character" features), but as of today, **starting a new generation without re-attaching the original image will produce a new person**, on every major provider — it's not GPT-specific or an "instruction-following" failure, it's an architectural limitation of how these image models condition on identity.

**Practical fixes for your real pain point** (from documented 2026 dev practice):
- Frame constraints as absolute rules, not preferences, and repeat the critical ones near the end of long prompts (recency helps you too).
- For multi-turn work, re-attach source material (including reference images) explicitly each time rather than assuming persistence.
- Keep sessions shorter / start fresh when you notice drift rather than fighting an already-diluted context.
- This affects Claude too in long sessions — it's not a GPT-only defect, though your subjective experience of it being worse on GPT is plausible given GPT's narrower usable context (272K input vs Claude's ~1M) causing dilution to kick in sooner.

---

## Q7. How do you actually use Gemini day-to-day? What's its real, undisputed edge?

**Status**: ✅ ANSWERED
**Confidence**: High
**Research Required**: Yes

Your read on Gemini is accurate and shared by others: it's not a coding/reasoning competitor to Claude/GPT for dedicated dev work, and it does show sycophancy/over-confident-summary behavior (a documented industry-wide RLHF pathology, not Gemini-unique, but frequently reported as more pronounced there).

**Its real, current, undisputed edge — confirmed by live 2026 usage patterns — is NOT chat Q&A. It's:**

1. **Action-oriented personal assistant integrated into your life, not a chatbot.** Real 2026 user workflows describe Gemini as a "personal operating system": connect Gmail, Calendar, Maps, WhatsApp, Photos, Drive via **Connected Apps**, and use `@app` mentions to pull/act across them in one request ("find the invoice attached to the email from my client last Thursday and summarize the line items" — no manual app-switching). This is Gemini's actual differentiated use case for daily life, exactly matching your "I just use AI Mode instead of Google Search" instinct — except it goes further than search: it *acts* (creates calendar events, sends messages, starts navigation), not just retrieves.
2. **Gems** — saved, reusable custom-instruction assistants for recurring jobs (meal planning from your fridge contents, email triage, a fixed-style editor) — the equivalent of a personal automation, not a one-off prompt.
3. **Deep Research** — a genuinely different capability class: it browses up to hundreds of sources (plus your own Gmail/Drive/Chat if permitted), self-plans, self-reflects, and produces a multi-page synthesized report, then can convert that into a document/quiz/audio overview. This is closer to a research analyst than a chatbot, and is a legitimate edge for literature/competitive/market research tasks.
4. **True native multimodal + long context** — 1M tokens across text+image+video+audio *natively* trained together (not bolted on), which is real for tasks like "read this 40-page PDF full of charts and tell me X" or "watch this video and summarize the demo," where Claude/GPT still process visuals with more of an attached-adapter feel.
5. **Batch/overnight agentic work** where its ~13s+ latency doesn't matter and its price ($0.75/$3.75) does.

**What NOT to use it for**: dedicated coding, anything where you need deep skeptical reasoning it might "oversell," or anything high-stakes where its tendency to agree/flatter could mislead you (your description of it "selling dreams" is a real, reported trait — treat its confident-sounding answers as a first draft to verify, especially on judgment calls, not on factual retrieval it did via Deep Research with sources).

**Bottom line**: Gemini's edge in 2026 is "personal life assistant + multimodal document/video analyst + research synthesizer," not "better chatbot." If you're not using Connected Apps/Gems/Deep Research, you're not actually using Gemini's differentiated value yet — you're just using a worse Claude for text chat, which is why it feels useless to you.

---

## Q8. Training data is mostly public internet data — so why can't more companies (like yours) train their own model instead of just using big labs' models inside an internal harness?

**Status**: ✅ ANSWERED
**Confidence**: High
**Research Required**: Yes

This is really a **build vs. buy economics** question, and the 2026 consensus answer is blunt: **almost nobody should build a foundation model from scratch, and your company's approach (build the harness, rent the model) is the industry-standard rational choice, not a compromise.**

**Why "just train on internet data" doesn't actually work for a random company:**
- Raw internet data alone doesn't get you a frontier model. The gap between raw pretraining and a Claude/GPT-quality model is almost entirely in **post-training**: RLHF/RLAIF infrastructure, tens of thousands of hours of human preference labeling, safety red-teaming, and iterative alignment — none of which is "internet data," all of which is enormously expensive, specialized labor.
- **Full pretraining-from-scratch only makes sense for roughly 15–20 companies globally**, per current enterprise-AI-strategy analysis — specifically those with **sustained hyperscale inference demand (500M+ tokens/day)** where owned infra beats API economics, or **genuinely unique proprietary data with durable advantage** (the standard example: Bloomberg built BloombergGPT because their financial data corpus is proprietary and unmatched — most companies have no equivalent moat-grade dataset).
- Even **self-hosting an existing open-weight model** (not training from scratch) only pays off past roughly **2.5 billion tokens/month of steady, predictable usage**, and even then it needs **~1.5 senior ML-ops engineers dedicated to keeping it alive** (vector stores, eval harnesses, drift monitoring, prompt versioning) — around $330K/year in people cost before you save a dollar on inference. Below that volume, renting via API is simply cheaper once you count engineering time honestly.
- The realistic middle path companies *do* take is **fine-tuning an open-weight model (Llama, Mistral, Qwen, DeepSeek)** on their own data for a narrow task — that is "making your own small AI model" in the way that's actually economical, and plenty of companies do exactly this. Full pretraining is the part that's out of reach, not customization in general.

**Why your company's "harness + rented models" strategy specifically makes sense**: The real differentiated engineering value in 2026 has moved to the **orchestration layer** — tool-calling, context management, guardrails, evaluation, multi-model routing — not the base model. One industry analysis put it directly: *"comparing bare model names is a shrinking part of the decision"* because vendors increasingly ship the harness as the product (Claude Agent SDK, Copilot's agent mode, Cursor's agent framework) and the switchable model underneath is treated as a replaceable component behind an abstraction layer. Building your own harness while treating the underlying model as swappable is precisely the recommended pattern — it gives you the reversibility to switch models as the market shifts without re-architecting anything, which building your own foundation model would forfeit.

**Bottom line**: Your company isn't skipping model-building out of laziness — it's making the financially correct call that the entire 2026 enterprise-AI industry has converged on. Model training is a 15–20-company game; harness-building is where everyone else's real competitive advantage lives.

---

## Q9. Why does Claude cost more tokens/dollars than GPT for the *same* simple task, even when no project context is involved?

**Status**: ✅ ANSWERED — and this has a very concrete, verifiable technical cause
**Confidence**: High
**Research Required**: Yes

This isn't about project-awareness at all — it's two compounding, measurable technical facts:

**1. Claude's tokenizer is less efficient than GPT's for the same text, so it *bills more tokens* for identical input.**
Anthropic's own docs state it plainly: their newer tokenizer (Opus 4.7+) "may use up to 35% more tokens for the same fixed text" compared to their own previous tokenizer. Independent byte-level analysis found Claude's current tokenizer produces **1.36–1.42x more tokens on prose/HTML/JSON, and 1.50–1.73x more tokens on code** (TypeScript specifically hit the top of that range: the *same file* was 681 tokens on GPT's o200k tokenizer vs 1,178 tokens on Claude's tokenizer — a 73% inflation). **This means the advertised $/M-token price is not an apples-to-apples comparison across vendors** — a "token" is a different amount of actual text depending on whose tokenizer counted it. For code-heavy simple tasks specifically, this is the single biggest hidden cost driver, and it's exactly the content type (code) you're comparing them on.

**2. Claude tends to generate more output tokens for the same task (verbosity), independent of tokenizer.**
A 2026 cost-benchmark analysis running both models on the identical workload found Claude Opus 5 generated **56% more output tokens than GPT-5.6 Sol** on the same task, and on a larger evaluation (Artificial Analysis's Intelligence Index), Opus 5 used **140M output tokens vs GPT-5.6 Sol's 90M** for the same test — despite Opus 5's per-token *rate* being only 1.25x Sol's, its **total bill was 2.1x** Sol's. That gap (1.25x rate → 2.1x bill) is verbosity, not pricing.

**Why does Claude generate more output/reasoning tokens even on simple tasks?** This does trace back to Constitutional-AI-style training: Claude is shaped to be thorough, explain itself, consider edge cases, and hedge appropriately even when a task doesn't strictly require it — a byproduct of the same "consider broader implications" training that makes it good at holistic project work. On a genuinely trivial, isolated task, that thoroughness is pure overhead with no payoff, which is exactly your observed pattern.

**Bottom line — this validates your Q11 experiment idea directly**: for narrow, simple, well-specified tasks, GPT should legitimately come out cheaper *and* faster, for two combinable, measurable reasons (tokenizer inflation + output verbosity), not because Claude "needs" project context to justify its cost. The comparison prompts in `MODEL_TEST_PROMPTS.md` will let you see this gap directly in the token counts your tools report per model.

---

## Q10. Is manually always using one model (Sonnet, escalating to Opus) unusual, or is that what most real users actually do? Should the "model team roles" framework just be ignored for now?

**Status**: ✅ ANSWERED
**Confidence**: Medium-High (no single canonical survey exists, but multiple 2026 data points converge)
**Research Required**: Yes

**You are not an outlier — you're the median real-world user, and there's good evidence for why.**

- A **First Factory August 2026 engineering survey** found **70% of engineers name Claude as the model they trust most, across all six task categories measured** — meaning most professionals, like you, lean on one trusted model family for nearly everything rather than actively routing task-by-task. Multi-model routing is discussed heavily in vendor marketing, but the practitioner-reported default is "pick the one you trust, use it broadly."
- Both major IDE ecosystems now ship **auto model selection** (GitHub Copilot's "Auto," GA across its surfaces; Cursor's "Router," launched July 2026, trained on 600K+ live requests, claiming 60% lower cost with no quality drop). Notably: **Cursor Router launched only for Teams/Enterprise plans — individual/Hobby users weren't even given access at launch.** That's a strong signal about who actually benefits economically from routing: high-volume, metered organizations, not individual subscribers.
- Coverage of the Router launch itself makes your exact point explicit: *"If you're cost-sensitive and already comfortable manually picking cheaper models for routine work, Router may save you the cognitive overhead more than it saves you money — measure before assuming the [savings] figure applies to your workload."* Auto-selection is explicitly framed as **"an alternative to manual selection, not a removal."**

**Why manual-single-model is economically rational for you specifically**: The entire "team roles" cost-optimization framework (notes/03, notes/05) assumes you're paying **per-token** and trying to minimize $/task. But you said it yourself — you're on a **flat-rate subscription**, and "API metered normal people are mostly not going to be used by all as they can get subscription quota." Under a flat plan:
- Token-level cost optimization has **near-zero marginal value to you** — you're not billed more for choosing Opus over Haiku within your plan's usage envelope.
- What *does* have value to you is **consistency, predictability, and trust** — not re-explaining your architecture, not getting a worse answer that costs you review/rework time. That's precisely what you described valuing about Sonnet.
- Team-role routing becomes valuable specifically for **high-volume, API-metered production systems** (real enterprises processing millions of requests where a real 40-60% cost delta is actual money) — not for a single developer under a flat plan making a few dozen requests a day.

**Is auto-select being unpopular by choice, not accident?** Likely partially yes — the framing "may save cognitive overhead more than money" plus enterprise-only initial rollout suggests the *primary* buyer for routing is a cost center (engineering leadership managing API spend across a team), not an individual developer who already has a trusted default and doesn't want an opaque system silently downgrading quality on a task that matters to them.

**Should you ignore the "team roles" framework for now?** **Yes, largely — and that's a reasonable, evidence-backed call, not laziness.** Keep it as reference for the specific situations where it actually pays off:
- API-metered work (your own scripts/automations calling models directly, not through a subscribed IDE) — here $/token matters and routing to Haiku/Gemini for trivial calls is real savings.
- The moment you're building something for scale/production rather than your own dev workflow.
- Specialist escalation for math/computer-use edge cases (Q3, Q4) — that part of the framework still holds regardless of subscription vs. API billing, because it's about *quality fit*, not cost.

Otherwise: **defaulting to Sonnet, escalating to Opus for hard problems, is exactly what the data says most real professional users do, and it's the economically correct behavior under a flat-rate plan.** The decision-flowchart file (05) not mattering to you right now is the correct read of your own situation, not a failure to internalize it.

---

## Addendum: Correcting the "informations I got during my readings" note

- **"GPT context size is 128K only"** — outdated. The current GPT-5/5.6 line is **400K total / 272K max input / 128K output**. 128K-only applies to older/legacy chat endpoints (e.g., `gpt-5-chat-latest` specifically), not the frontier API models. Still smaller usable-input than Claude's 1M, but not as small as "128K only" implies.
- **"Hidden thinking tokens eat context for reasoning models"** — confirmed true, and this is a real, underappreciated cost/context driver (see Q1 and Q9). Reasoning effort settings (low/medium/high/max) directly trade latency and cost for quality, and are one of the biggest levers you can pull yourself before switching models entirely — worth experimenting with "medium" effort before assuming you need a different model.
- **"Claude retains context better than others despite similar size"** — directionally still likely true (Claude has consistently benchmarked well on long-context retrieval), but treat this as "probably still an edge," not "proven decisively," since independent apples-to-apples long-context retrieval benchmarks across all 2026 frontier models are less mature than the coding/math benchmarks cited above.

---

## Q11. Prompt-comparison task set (Claude Opus 5 vs GPT-5.6 Sol) — UI-focused, capability-testing prompts

**Status**: ✅ ANSWERED — see dedicated file
**Confidence**: High
**Research Required**: Yes (grounded in real 2026 frontend-model benchmarking methodology)

Per your refinement — testing different *capabilities* but scoped to **a single task domain (UI building)**, with a **`design.md` creation step appended after the model finishes the UI** (rule 2 / CLAUDE.md enforcement intentionally skipped, since this is a one-shot comparison, not an ongoing project) — see:

👉 **`MODEL_TEST_PROMPTS.md`** (project root)

That file contains 6 ready-to-copy prompts, each isolating a different capability (stateful app architecture, accessibility defaults without being told to be accessible, responsive layout stability, debugging/polish vs. greenfield generation, ambiguous aesthetic/creative judgment — directly testing the "Claude produces 90s-style UI" claim — and project-aware multi-file integration), plus a scoring rubric and a token/cost logging table so your side-by-side review captures both **quality** and the **Q9 cost-gap** in the same run.

---

**Session Status**: All 11 questions answered with live-verified, cited 2026 data.
**Next**: Copy prompts from `MODEL_TEST_PROMPTS.md`, run against Claude Opus 5 and GPT-5.6 Sol, log results.
