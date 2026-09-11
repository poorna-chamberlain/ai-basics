# Hands-On Projects & Case Studies

Document all practical projects, experiments, and real-world applications built during this learning journey.

---

## Project Structure

Each project includes:
- **Goal**: What skill/concept to learn
- **Approach**: How we'll build it
- **Implementation**: Code and steps
- **Results**: What we learned
- **Token Cost**: Cost for this project
- **Next Steps**: Future improvements

---

## Phase 1 Projects: Foundations

### Project 1.1: Model API Comparison Tool
**Status**: 🔴 Not Started

**Goal**: 
Learn to integrate multiple AI model APIs and compare their responses.

**Skills Addressed**:
- API Integration Basics
- Token Management
- Cost Analysis

**Approach**:
1. Set up clients for OpenAI (GPT), Anthropic (Claude), and one open-source model
2. Create a prompt to ask all three models the same question
3. Compare: quality, speed, cost, token usage
4. Log results to CSV

**Implementation**: [To be created]

**Expected Token Cost**: ~2-5K tokens

**Timeline**: Session 2

---

### Project 1.2: Prompt Engineering Playground
**Status**: 🔴 Not Started

**Goal**:
Master different prompting techniques through systematic experimentation.

**Skills Addressed**:
- Prompt Engineering Fundamentals
- LLM Understanding

**Approach**:
1. Pick a complex task (e.g., "Extract entities from unstructured text")
2. Test 5 different prompt variations:
   - Basic instruction
   - Few-shot examples
   - Chain-of-thought
   - System prompt variation
   - Temperature/parameter changes
3. Compare results and cost
4. Document best prompt pattern

**Implementation**: [To be created]

**Expected Token Cost**: ~5K tokens

**Timeline**: Session 2-3

---

### Project 1.3: Token Counter & Budget Dashboard
**Status**: 🔴 Not Started

**Goal**:
Build a utility to track tokens and cost in real-time.

**Skills Addressed**:
- Token Management
- Cost Tracking

**Approach**:
1. Implement token counter for each model
2. Create request logger (model, tokens, cost)
3. Build simple dashboard showing:
   - Running total cost
   - Cost by model
   - Cost by phase
   - Remaining budget
4. Export monthly report

**Implementation**: [To be created]

**Expected Token Cost**: Minimal (mostly local computation)

**Timeline**: Session 2

---

## Phase 2 Projects: AI Agents

### Project 2.1: Simple Tool-Using Agent
**Status**: 🔴 Not Started

**Goal**:
Build a basic agent that can use tools to solve problems.

**Skills Addressed**:
- Agent Concepts
- Tool Calling Patterns
- LangChain basics

**Approach**:
1. Create 3 simple tools:
   - Calculator (math operations)
   - Web searcher (simulated)
   - Data lookup (JSON file)
2. Build LangChain agent with ReAct loop
3. Give it a complex task requiring multiple tools
4. Observe and document the reasoning process

**Example Task**: "What's the capital of France, how far is it from London, and what's 100 * 2?"

**Implementation**: [To be created]

**Expected Token Cost**: ~10K tokens

**Timeline**: Session 3-4

---

### Project 2.2: Cursor Agent: Code Review Bot
**Status**: 🔴 Not Started

**Goal**:
Learn Cursor agents by building a code review automation tool.

**Skills Addressed**:
- Cursor Agents
- Subagent management
- File operations

**Approach**:
1. Create a Cursor agent that:
   - Watches for new code files
   - Performs automated code review
   - Reports issues
   - Suggests improvements
2. Test on real project files
3. Iterate and improve

**Implementation**: [To be created]

**Expected Token Cost**: ~5-10K tokens

**Timeline**: Session 3

---

### Project 2.3: Multi-Agent Research System
**Status**: 🔴 Not Started

**Goal**:
Build a team of specialized agents working together.

**Skills Addressed**:
- CrewAI
- Multi-agent systems
- Collaboration patterns

**Approach**:
1. Create 3 specialized agents:
   - Researcher (finds information)
   - Analyzer (processes findings)
   - Summarizer (creates report)
2. Give them a research topic
3. Watch them collaborate
4. Document interaction patterns

**Example Topic**: "Best practices in prompt engineering (2026)"

**Implementation**: [To be created]

**Expected Token Cost**: ~15K tokens

**Timeline**: Session 4-5

---

## Phase 3 Projects: Practical Pipelines

### Project 3.1: Document Summarization Pipeline
**Status**: 🔴 Not Started

**Goal**:
Build an end-to-end pipeline for intelligent document summarization.

**Skills Addressed**:
- Practical Skills: Data Processing
- Pipeline architecture
- Chunking strategies

**Approach**:
1. Load a long document (>10K tokens)
2. Split into chunks
3. Summarize each chunk
4. Aggregate summaries
5. Generate final summary
6. Track costs at each step

**Implementation**: [To be created]

**Expected Token Cost**: ~10-20K tokens

**Timeline**: Session 5

---

### Project 3.2: Code Generation & Testing Loop
**Status**: 🔴 Not Started

**Goal**:
Create a system that writes code and validates it.

**Skills Addressed**:
- Test Generation
- Code Analysis
- Validation loops

**Approach**:
1. Given a specification (e.g., "Write a function that sorts arrays")
2. Agent generates code
3. Agent writes tests
4. Run tests, observe results
5. Agent iterates if needed
6. Document final solution

**Implementation**: [To be created]

**Expected Token Cost**: ~10-15K tokens

**Timeline**: Session 5-6

---

### Project 3.3: Full-Stack RAG System
**Status**: 🔴 Not Started

**Goal**:
Build a Retrieval-Augmented Generation system.

**Skills Addressed**:
- Advanced patterns (RAG)
- Vector databases
- Multi-model pipelines

**Approach**:
1. Create embeddings for a knowledge base
2. Store in vector DB
3. Build retrieval function
4. Chain retrieval + generation
5. Query and evaluate results

**Implementation**: [To be created]

**Expected Token Cost**: ~20-30K tokens

**Timeline**: Session 6-7

---

## Phase 4 Projects: Optimization & Production

### Project 4.1: Cost Optimization Audit
**Status**: 🔴 Not Started

**Goal**:
Analyze all previous projects and optimize for cost.

**Skills Addressed**:
- Token Efficiency
- Cost Optimization
- Production Patterns

**Approach**:
1. Review all previous projects
2. Identify inefficiencies
3. Re-implement with optimizations:
   - Model selection
   - Prompt compression
   - Caching
   - Batching
4. Compare before/after costs
5. Document learnings

**Implementation**: [To be created]

**Expected Token Cost**: ~5-10K tokens (mostly analysis)

**Timeline**: Session 7

---

### Project 4.2: Production Agent Deployment
**Status**: 🔴 Not Started

**Goal**:
Deploy a real agent for production use.

**Skills Addressed**:
- Production Patterns
- Monitoring
- Error Handling

**Approach**:
1. Choose one agent from previous projects
2. Add production features:
   - Error handling
   - Logging/monitoring
   - Fallback models
   - Rate limiting
3. Deploy and test
4. Monitor and iterate

**Implementation**: [To be created]

**Expected Token Cost**: ~5-10K tokens

**Timeline**: Session 7-8

---

## Project Outcomes Summary

| Project | Status | Skills Gained | Cost | Completion |
|---------|--------|---------------|------|-----------|
| 1.1: Model Comparison | 🔴 | API Integration | ~$0.05 | TBD |
| 1.2: Prompt Playground | 🔴 | Prompt Engineering | ~$0.08 | TBD |
| 1.3: Budget Dashboard | 🔴 | Token Mgmt | ~$0.01 | TBD |
| 2.1: Simple Agent | 🔴 | Agent Concepts | ~$0.12 | TBD |
| 2.2: Code Review Bot | 🔴 | Cursor Agents | ~$0.10 | TBD |
| 2.3: Multi-Agent | 🔴 | CrewAI | ~$0.20 | TBD |
| 3.1: Summarization | 🔴 | Pipelines | ~$0.25 | TBD |
| 3.2: Code Gen Loop | 🔴 | Testing | ~$0.18 | TBD |
| 3.3: RAG System | 🔴 | Advanced | ~$0.35 | TBD |
| 4.1: Cost Audit | 🔴 | Optimization | ~$0.10 | TBD |
| 4.2: Production Deploy | 🔴 | Production | ~$0.15 | TBD |
| | | | | |
| **Total Estimated** | | | **~$1.59** | **8-10 weeks** |

---

## Quick Navigation

- **Ready Now** (Phase 1): Projects 1.1, 1.2, 1.3
- **Next** (Phase 2): Projects 2.1, 2.2, 2.3
- **After** (Phase 3): Projects 3.1, 3.2, 3.3
- **Final** (Phase 4): Projects 4.1, 4.2

---

**Last Updated**: 2026-09-11
**Last Completed Project**: None yet
