# LLM Integration Development Plan

## Goals
- Provide the ability to send the Master Prompt to a chosen Large Language Model (LLM) with a single click.
- Support at least **OpenAI** and **Grok** at launch, with an easy path for adding more providers.
- Design a future-proof architecture for advanced features such as a "Group of Experts" workflow and XML-formatted code patches.

## Project Setup
- [ ] **Environment Configuration**
  - [ ] Add `OPENAI_API_KEY` and `GROK_API_KEY` to `.env` files.
  - [ ] Ensure frontend variables use the `REACT_APP_` prefix (e.g., `REACT_APP_DEFAULT_LLM`).
- [ ] **Dependencies**
  - [ ] Backend: `openai`, `axios`, `xml2js`, `dotenv` (for env vars).
  - [ ] Frontend: No new runtime deps initially (reuse `fetch`), but add `swr` or `react-query` later for streaming if needed.

## Backend Development
1. **LLM Service Layer**
   - [ ] Create `services/llm.js` with wrapper functions:
     - [ ] `sendToOpenAI(prompt, options)`
     - [ ] `sendToGrok(prompt, options)`
     - [ ] Normalize responses to `{ text, raw }`.
   - [ ] Support streaming tokens (upgrade later if necessary).
2. **API Routes**
   - [ ] `POST /llm` – Body `{ engine, prompt, options }` → returns LLM response.
   - [ ] Basic validation (engine allowed, prompt length, token count).
3. **Error Handling**
   - [ ] Map provider-specific errors to generic HTTP status codes + messages.
4. **Group of Experts (Future)**
   - [ ] `POST /llm/group` – Body `{ engine, prompt, n, aggregatorEngine }`.
   - [ ] Spawn `n` parallel requests, collect responses, then send to `aggregatorEngine`.
5. **XML Patch Support (Future)**
   - [ ] Define XML schema for code patches (`<file path="...">…</file>`).
   - [ ] Implement `parseXmlPatches(xml)` → list of patch objects.
   - [ ] Add utility to apply patches to watched directory prompts (with safety checks).

## Frontend Development
1. **UI Components**
   - [ ] `LLMSelector` – Dropdown for engines (OpenAI, Grok, …).
   - [ ] "Send to LLM" button next to "Copy to Clipboard" in `MasterPrompt`.
   - [ ] `LLMResponsePanel` – Displays streaming or final response with syntax highlighting.
2. **State Management**
   - [ ] Store selected LLM and response in `App.js` or Context.
3. **API Integration**
   - [ ] Add `sendPromptToLLM` in `frontend/src/api.js` to hit `POST /llm`.
   - [ ] Handle loading / error / streaming states.
4. **Group of Experts UI (Future)**
   - [ ] Checkbox or modal to enable expert mode (`n = 4`).
   - [ ] Progress indicators for each sub-request and final synthesis.
5. **XML Patch Handling (Future)**
   - [ ] On receiving an XML-formatted response, show "Apply Patch" modal.
   - [ ] Allow user to review and accept/reject individual file changes.

## Testing Stack
### Backend
- [ ] Unit tests for `services/llm.js` (mock provider SDKs).
- [ ] API tests for `/llm` and `/llm/group` using Supertest.
### Frontend
- [ ] Component tests for `LLMSelector`, `LLMResponsePanel`, and send workflow.
- [ ] Cypress E2E: Select LLM → send Master Prompt → receive response.

## Deployment
- [ ] Update README with new env vars and usage instructions.
- [ ] (Optional) Add a mock mode for offline demo/testing.

## Additional Enhancements
- [ ] Add temperature, max-tokens, and system prompt controls.
- [ ] Support Anthropic, Azure OpenAI, and local models.
- [ ] Persist interaction history in SQLite for reference.
- [ ] Token usage tracking and cost estimation per provider.
