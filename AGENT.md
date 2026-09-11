# AI Agents: Capabilities & Framework Comparison

Deep dive into different AI agent frameworks, their capabilities, and when to use them.

## What is an AI Agent?

An AI agent is a system that:
1. **Perceives** its environment (context, inputs, tools available)
2. **Reasons** about the current state and goal
3. **Plans** a sequence of actions
4. **Acts** by using tools/APIs to interact with the world
5. **Observes** results and adapts

Key difference from a simple LLM: **autonomy and iterative feedback loops**.

---

## Communication Protocol (Session 1+)

### Multi-Session Workflow

**Session 1 (Haiku 4.5 - Current)**:
- ✅ Create foundation documents
- ✅ Research latest models (web search)
- ✅ Organize notes
- ✅ Set up question tracking system
- ✅ Move completed files to `notes/completed/`

**Session 2+ (Sonnet 5 or higher)**:
- Read `OPEN_QUESTIONS_I_HAVE.md`
- Research questions if needed (Google searches)
- Create detailed answer documents if complex
- Update `QUESTIONS_ANSWERED.md`
- Create new `notes/XX.[TOPIC].md` for detailed answers

**Why This Approach**:
- ✅ Preserves context across sessions
- ✅ Haiku handles documentation efficiently (cheap)
- ✅ Sonnet 5 handles complex questions (high quality)
- ✅ All knowledge tracked in markdown
- ✅ No context lost between sessions

### File Locations

```
/notes/
├─ completed/ (read materials)
│  ├─ 01.model-architecture-overview.md
│  ├─ 02.claude-vs-gpt-deep-comparison.md
│  └─ [... 03-07 ...]
├─ INDEX.md (always current)
└─ XX.[NEW_ANSWERS].md (created as needed)

Root:
├─ OPEN_QUESTIONS_I_HAVE.md (you add questions)
├─ QUESTIONS_ANSWERED.md (Sonnet 5 updates)
├─ MEMORY.md (this file - session tracking)
└─ AGENT.md (this file - workflow protocol)
```

**What it is**: Cursor's native agent framework for IDE-based development.

**Capabilities**:
- ✅ File system operations (read, write, delete)
- ✅ Git operations
- ✅ Code execution and testing
- ✅ Terminal commands
- ✅ Web search and browsing
- ✅ Multiple AI model support
- ✅ Streaming responses
- ✅ Session persistence

**Strengths**:
- Purpose-built for developer workflows
- Integrated with IDE
- Direct file/code access
- Real-time feedback

**Limitations**:
- Specific to Cursor ecosystem
- Workflow-dependent

**Best For**:
- Automated code reviews
- Test generation
- Documentation updates
- Refactoring assistance
- Bug hunting

**Learn Through**:
- Creating custom agents in Cursor
- Exploring agent subagent_types
- Building multi-step workflows

---

### 2. LangChain

**What it is**: Python/JS framework for building applications with language models.

**Capabilities**:
- ✅ Chain composition (sequential operations)
- ✅ Tool calling with arbitrary functions
- ✅ Memory management (short-term, long-term)
- ✅ Agent loops (ReAct pattern)
- ✅ Vector store integration
- ✅ Document loading and processing
- ✅ Multiple model support

**Strengths**:
- Flexible and extensible
- Large ecosystem of integrations
- Good for prototyping
- Well-documented

**Limitations**:
- Steeper learning curve
- Can be verbose
- Abstraction overhead

**Best For**:
- Custom agent implementations
- RAG systems
- Complex multi-step workflows
- Chatbots with custom tools

**Learn Through**:
- Building a simple tool-using agent
- Creating a RAG pipeline
- Integrating multiple models

---

### 3. CrewAI

**What it is**: Framework for building multi-agent systems with division of labor.

**Capabilities**:
- ✅ Agent roles and responsibilities
- ✅ Hierarchical task execution
- ✅ Inter-agent communication
- ✅ Shared knowledge base
- ✅ Task sequencing
- ✅ Tool assignment to agents

**Strengths**:
- Great for complex multi-step problems
- Clear agent/task/tool separation
- Easier debugging
- Good for collaborative scenarios

**Limitations**:
- Newer, smaller community
- Less documentation
- More opinionated

**Best For**:
- Research automation
- Content creation workflows
- Complex data analysis
- Multi-perspective problem solving

**Learn Through**:
- Building a 3-agent research system
- Creating an editorial review workflow

---

### 4. AutoGPT / Autonomous Agents

**What it is**: Pattern for fully autonomous agents with minimal human guidance.

**Capabilities**:
- ✅ Goal-based reasoning
- ✅ Unlimited iteration loops
- ✅ Self-correction
- ✅ Long-term planning
- ✅ Resource management

**Strengths**:
- Minimal human intervention needed
- Powerful for open-ended problems
- Can discover novel solutions

**Limitations**:
- Expensive (many API calls)
- Can go off-track
- Hard to debug
- Not always safe

**Best For**:
- Research tasks
- Data exploration
- Problem decomposition
- Autonomous workflows

**Learn Through**:
- Building a self-correcting agent
- Implementing goal-based reasoning

---

## Capability Comparison Matrix

| Feature | Cursor Agents | LangChain | CrewAI | AutoGPT |
|---------|---------------|-----------|--------|---------|
| **File Operations** | ✅ Native | ⚠️ Via tools | ⚠️ Via tools | ⚠️ Via tools |
| **Code Execution** | ✅ Native | ⚠️ Sandboxed | ⚠️ Via tools | ⚠️ Via tools |
| **Web Search** | ✅ Built-in | ⚠️ Via integration | ⚠️ Via tools | ✅ Common |
| **Multi-Agent** | ✅ Subagents | ✅ Supported | ✅ Native | ⚠️ Possible |
| **Memory** | ✅ Session-based | ✅ Pluggable | ✅ Shared | ✅ Configurable |
| **Token Efficiency** | ✅ Good | ✅ Good | ✅ Good | ⚠️ Poor |
| **Ease of Use** | ✅ High | ⚠️ Medium | ✅ High | ⚠️ Low |
| **Production Ready** | ✅ Yes | ✅ Yes | ⚠️ Emerging | ⚠️ Case-by-case |

---

## Tool Calling Patterns

### What is Tool Calling?

Tool calling is when an LLM can:
1. Recognize when it needs external information/action
2. Request a specific tool with specific parameters
3. Receive results and continue reasoning

**Example**: Model realizes it needs to multiply 2 numbers, calls `calculator(a=2, b=3)`, gets `6`, continues.

### Tool Types by Framework

**Cursor Agents**:
- File I/O (read, write, delete)
- Git operations
- Terminal execution
- Web operations

**LangChain**:
- Custom Python functions
- Wikipedia, Google, etc.
- Calculators
- SQL databases
- APIs

**CrewAI**:
- Similar to LangChain
- Specialized for agent tools
- Built-in integrations

---

## Model Selection Within Agents

### Factors to Consider
1. **Speed vs Intelligence**: Fast models (Haiku) vs powerful (GPT-4)
2. **Cost**: Token pricing, API calls
3. **Context Window**: How much info can you feed?
4. **Specialization**: Some models better for specific domains

### Common Patterns
- **Fast lane**: Claude Haiku for classification, routing
- **Smart lane**: GPT-4 for reasoning, planning
- **Long context**: Claude Sonnet for document analysis

---

## When to Use Which Agent Type

### Use Cursor Agents When:
- Building within Cursor IDE
- Need direct file/code access
- Want seamless developer experience
- Task is development-focused

### Use LangChain When:
- Need maximum flexibility
- Building custom agents from scratch
- Want framework-agnostic code
- Need fine-grained control

### Use CrewAI When:
- Multiple specialized agents needed
- Clear role/responsibility separation
- Want easier debugging/monitoring
- Building team-like systems

### Use AutoGPT When:
- Task is open-ended
- Want minimal human guidance
- Can afford higher costs
- Safety/guardrails are in place

---

## Deep Dives (To Be Filled)

### Subagent Types Deep Dive
- generalPurpose vs explore vs ci-investigator
- When each is optimal
- Performance characteristics

### Tool Calling Best Practices
- Designing good tool interfaces
- Error handling in tools
- Tool composition patterns

### Agent State Management
- Session vs long-term memory
- Context windows
- Cleanup strategies

### Debugging Agents
- Logging patterns
- Tracing execution
- Common failure modes

---

**Last Updated**: 2026-09-11
**Next Update**: After Phase 2 completion
