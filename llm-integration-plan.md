# LLM Integration Development Plan

A milestone-driven roadmap that slices vertically through backend, frontend, and tests so each step is demo-ready and fully testable.

---
## [X] Milestone 0 – Groundwork
* Environment variables (`OPENAI_API_KEY`, `GROK_API_KEY`, `REACT_APP_API_URL`, `REACT_APP_DEFAULT_LLM`)
* Dependencies added to backend (`openai`, `axios`, `xml2js`, `dotenv`)
* `.env.example` committed

Deliverable: Project boots without errors; env configured.

---
## [ ] Milestone 1 – Ping-Pong with OpenAI
Goal: User can send the Master Prompt to OpenAI and view the full reply.

### Backend
1. `services/llm.js` – `sendToOpenAI(prompt)` (sync, no options)
2. `POST /llm` – body `{ engine:"openai", prompt }` → returns `{ text }`
3. Basic validation and `400` error handling

### Frontend
1. "Send to LLM" button in `MasterPrompt`
2. `api.js → sendPromptToLLM(engine, prompt)`
3. Modal/toast displays returned text

### Tests
* Unit: Mock OpenAI SDK → expect normalized `{ text }`
* API: Supertest for happy/error paths
* Cypress: create prompt → click send → see response text

---
## [ ] Milestone 2 – Engine Selector + Grok
Allows choosing between OpenAI and Grok.

### Backend
1. `sendToGrok(prompt)` using provider SDK or axios
2. Extend `/llm` validation for `engine` values

### Frontend
1. `LLMSelector` dropdown (OpenAI | Grok)
2. Persist choice in Context or `App.js`

### Tests
* Unit: mock Grok client
* Cypress: switch engine → send → see correct stubbed reply

### Notes
* Here is a code snippet from XAI for requests to Grok:
```
import OpenAI from "openai";
    
const client = new OpenAI({
  apiKey: XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const completion = await client.chat.completions.create({
  model: "grok-3",
  messages: [
    { role: "user", content: "What is the meaning of life, the universe, and everything?" }
  ]
});
```

---
## [ ] Milestone 3 – Streaming Responses
Incremental tokens for OpenAI.

### Backend
* Upgrade `sendToOpenAI` for stream, expose via Node stream/SSE

### Frontend
* `LLMResponsePanel` appends real-time chunks
* Optional pause / clear UI

### Tests
* Jest: simulate stream chunks → expect aggregation
* Cypress: verify streaming text appears

---
## [ ] Milestone 4 – Group of Experts (GoE) – Alpha
Parallel fan-out and naive aggregation.

### Backend
* `POST /llm/group` – `{ prompt, n }` → returns array + aggregated text

### Frontend
* Checkbox "Expert Mode (n=4)" (disabled for Grok)
* Progress indicators for each sub-request

### Tests
* Supertest: assert `n` results then aggregation
* Cypress: toggle expert mode → observe partials + final merge

---
## [ ] Milestone 5 – XML Patch Preview
Handles XML-formatted code patches from LLMs.

### Backend
* `parseXmlPatches(xml)` utility
* Pass through XML from provider

### Frontend
* Detect XML → "Apply Patch" modal with file list & diffs

### Tests
* Unit: XML → patch objects
* Cypress: mock XML reply → modal appears

---
## Ongoing Guidelines
* After every milestone: run unit, API, and Cypress tests
* Mock external LLM calls in tests; use real keys only for manual QA
* Update README & `.env.example` when new vars are introduced
