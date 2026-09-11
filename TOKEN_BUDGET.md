# Token Budget & Cost Tracking

Track token usage across all API calls, models, and projects to maximize learning within budget constraints.

---

## Budget Overview

### Corporate Allocation (2026)
- **Total Budget**: [To be set by user]
- **Allocation Purpose**: AI learning and skill development
- **Current Status**: Active allocation phase
- **Waste Prevention**: Focus of this project

### Monthly Targets
- **Month 1 (Sep 2026)**: [To be set]
- **Month 2-12**: [To be planned]

---

## Model Pricing Reference (as of 2026-09-11)

### OpenAI (September 2026 Pricing)

| Model | Input (1M tokens) | Output (1M tokens) | Context | Notes |
|-------|-------------------|-------------------|---------|-------|
| GPT-6 Astra | $10 | $50 | 1.05M | **Latest frontier**, computer use expert |
| GPT-5.6 Sol | (deprecated) | (deprecated) | — | Replaced by GPT-6 Astra |
| GPT-4o | $5 | $15 | 128K | Still available, less capable |

**Cache Pricing** (GPT-6 Astra):
- Cache read: $1/M tokens (10% of input)
- Cache write: $12.50/M tokens

### Anthropic (September 2026 Pricing)

| Model | Input | Output | Context | Notes |
|-------|-------|--------|---------|-------|
| Claude Fable 5 | $10 | $50 | 1M | **Frontier**, best agentic coding |
| Claude Opus 5 | $5 | $25 | 1M | Flagship (released Jul 24, 2026) |
| Claude Sonnet 5 | $2/$3* | $10/$15* | 1M | *Intro $2/$10 thru Aug 31, then $3/$15 |
| Claude Haiku 4.5 | $1 | $5 | 200K | Fastest, cheapest |

**Cache Pricing** (Claude):
- Cache read: $0.50/M tokens (10% of input)
- 5-min cache write: $6.25/M tokens
- 1-hour cache write: $10/M tokens

### Google (September 2026 Pricing)

| Model | Input | Output | Context | Notes |
|-------|-------|--------|---------|-------|
| Gemini 3.8 Flash | $0.75/$1.50* | $3.75/$7.50* | 1M | *Intro $0.75/$3.75 thru Dec 31, then standard |
| Gemini 3.7 Flash | (legacy) | (legacy) | 1M | Older Flash model |

**Key**: Gemini is **13x cheaper** than Claude/OpenAI (intro pricing)

### Meta (September 2026)

| Model | Type | Distribution | Cost | Notes |
|-------|------|--------------|------|-------|
| Llama 4 Maverick | Open-weight | HuggingFace, ollama | $0 | 400B (17B active), 1M context |
| Muse Spark 1.3 | API | Third-party APIs | ~$1.25/$4.25 | Frontier alternative, best value |
| Muse Glimmer | Open-weight | HuggingFace | $0 | 30B, local agentic model |

### Mistral AI (September 2026)

| Model | Type | Distribution | Cost | Notes |
|-------|------|--------------|------|-------|
| Mistral Medium 3.5 | Open-weight | HuggingFace | $0 | 128B dense, Q4 quantized for Mac |
| Mistral Large 3 | Open-weight | HuggingFace | $0 | 675B MoE (41B active), flagship |

### Open Source (Self-hosted via Ollama, etc.)

| Model | Parameters | Cost | Notes |
|-------|-----------|------|-------|
| Llama 4 Maverick | 400B (17B active) | $0 | Best quality open-source |
| Mistral Medium 3.5 | 128B dense | $0 | Good all-rounder, Q4 quantized |
| Muse Glimmer | 30B | $0 | Local agents, edge deployment |
| Muse Spark 1.3 | Unknown | ~$1.25/$4.25 | Available via third-party APIs |

---

## Session Usage Tracking

### Session 1: Project Initialization (2026-09-11)

| Date | Model | Input Tokens | Output Tokens | Cost | Purpose |
|------|-------|--------------|---------------|------|---------|
| 2026-09-11 | Claude Haiku | ~2,000 | ~3,000 | ~$0.02 | Project setup (this session) |
| | | | | | |

**Session 1 Subtotal**: ~$0.02

---

### Session 2: [To be logged]

| Date | Model | Input Tokens | Output Tokens | Cost | Purpose |
|------|-------|--------------|---------------|------|---------|
| | | | | | |

---

## Usage Patterns & Analysis

### Cost Per Task Type (As We Learn)

| Task | Typical Tokens | Cheap Model | Smart Model | Expensive Model |
|------|----------------|-------------|-------------|-----------------|
| Classification | 100-500 | Haiku | Haiku | GPT-4 |
| Summarization | 500-2K | Haiku/Sonnet | Sonnet | GPT-4 |
| Code Review | 2K-10K | Sonnet | Sonnet | GPT-4 |
| Complex Reasoning | 5K-20K | Sonnet | GPT-4 | GPT-4 Turbo |
| (To be expanded) | | | | |

---

## Token Optimization Strategies

### 1. Model Selection
- [ ] Always use Haiku for fast/simple tasks
- [ ] Use Sonnet as middle-ground
- [ ] Reserve expensive models (GPT-4) for reasoning

### 2. Prompt Optimization
- [ ] Remove unnecessary context
- [ ] Use templates to reduce repetition
- [ ] Compress instructions

### 3. Caching & Reuse
- [ ] Cache common prompts
- [ ] Reuse results when possible
- [ ] Batch similar requests

### 4. Tool Routing
- [ ] Use local tools instead of LLM when possible
- [ ] Pre-process data outside LLM
- [ ] Post-process outside LLM

---

## Cost Allocation by Learning Phase

### Phase 1: Foundations (Budget: TBD)
- API exploration
- Model comparison tests
- Estimated: Low ($20-50)

### Phase 2: Agents (Budget: TBD)
- Framework experimentation
- Multi-agent examples
- Estimated: Medium ($50-100)

### Phase 3: Practical Projects (Budget: TBD)
- Real pipeline building
- Tool integration
- Estimated: Medium-High ($100-200)

### Phase 4: Optimization (Budget: TBD)
- Production testing
- Monitoring setup
- Estimated: Variable

---

## Efficiency Metrics

### Key Metrics to Track

1. **Tokens per insight**: How many tokens to learn something?
2. **Cost per skill**: What's the ROI on skill development?
3. **Waste ratio**: Percentage of tokens in "exploration" vs "productive"
4. **Model performance ratio**: Quality gained per dollar spent

### Target Metrics
- [To be set based on budget]

---

## Running Totals

### All-Time Usage
- **Total Tokens Spent**: ~5,000 (estimated)
- **Total Cost**: ~$0.02
- **Percentage of Budget Used**: TBD

### By Model (All-Time)
- Claude Haiku: ~3,000 tokens ($0.012)
- Claude Sonnet: ~2,000 tokens ($0.008)
- GPT-4: ~0 tokens ($0)
- Other: ~0 tokens ($0)

### By Phase (All-Time)
- Phase 1: ~5,000 tokens ($0.02)
- Phase 2: 0 tokens ($0)
- Phase 3: 0 tokens ($0)
- Phase 4: 0 tokens ($0)

---

## Future Tracking Format

Each session should log:
```
### Session N: [Name] ([Date])

| Model | Task | Input | Output | Cost |
|-------|------|-------|--------|------|
| | | | | |

**Running Total**: $X
```

---

## Notes & Observations

- **2026-09-11**: Starting budget tracking. Need to log all future API calls systematically.
- **2026-09-11**: Set up pricing table as reference for decision-making.
- (More observations as we go)

---

**Last Updated**: 2026-09-11
**Next Update**: End of first practical session
