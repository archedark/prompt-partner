# Testing Strategy for Prompt Partner

This document outlines the testing strategy for both the frontend React application and the backend API built with Node.js and SQLite. The goal is to ensure that both the user interface and API endpoints work reliably and meet the requirements for the MVP.

---

## 1. Overview

The testing strategy is divided into three primary areas:
- **Manual Testing:** Developer-led testing to verify functionality and user interactions.
- **Unit Testing:** Isolated tests for individual components and API functions.
- **Integration & End-to-End Testing:** Testing interactions between components and simulating real user scenarios.

---

## 2. Frontend Testing Strategy

### 2.1 Manual Testing
- **Objective:** Verify that the UI components (e.g., PromptList, PromptEditor, MasterPrompt, SelectedPromptList) work as expected.
- **Approach:**
  - Interact with the application in a web browser.
  - Confirm that prompts are fetched, added, edited, deleted, and combined correctly.
  - Validate clipboard operations and drag-and-drop reordering.

### 2.2 Unit Testing
- **Tools:** Jest and React Testing Library.
- **Objectives:**
  - Test individual React components for correct rendering, state updates, and event handling.
- **Examples:**
  - **PromptEditor:** Verify that form inputs capture user data and submit the correct values.
  - **MasterPrompt:** Confirm that the combined text is displayed properly and that clicking the "Copy" button triggers clipboard functionality.
  - **PromptList:** Check that prompts are rendered, and selection toggling works as intended.

### 2.3 Integration and End-to-End Testing
- **Tools:** Cypress (or a similar framework) for E2E testing.
- **Objectives:**
  - Simulate user workflows such as adding, editing, deleting prompts, and reordering selections.
  - Validate the complete flow from the frontend UI to backend API responses.
- **Approach:**
  - Automate user actions in a real browser environment.
  - Verify that UI changes reflect the underlying API data correctly.

---

## 3. Backend API Testing Strategy

### 3.1 Manual Testing
- **Tools:** Postman or cURL.
- **Objectives:**
  - Manually test all API endpoints (`GET /prompts`, `POST /prompts`, `PUT /prompts/:id`, `DELETE /prompts/:id`).
  - Validate correct HTTP status codes, response formats, and error handling for invalid inputs.

### 3.2 Unit Testing
- **Tools:** Jest and Supertest.
- **Objectives:**
  - Write tests for individual API routes to ensure proper handling of valid and invalid data.
  - Verify that database operations (using SQLite) return expected results.
- **Examples:**
  - **POST /prompts:** Ensure a new prompt is created with valid data and returns a new prompt ID.
  - **GET /prompts:** Verify that prompts are returned in the expected order (newest first).
  - **PUT /prompts/:id:** Confirm that an update modifies the intended prompt.
  - **DELETE /prompts/:id:** Validate that a prompt is successfully removed from the database.

### 3.3 Integration Testing
- **Objectives:**
  - Test the complete API flow by chaining operations (create, retrieve, update, delete) using a temporary or in-memory test database.
  - Validate seamless integration between the frontend React application and backend API, ensuring end-to-end workflows function as expected.
  - Confirm that state management in the frontend correctly reflects backend data updates.
- **Approach:**
  - Set up a separate testing configuration with an in-memory SQLite database to avoid data conflicts with the production environment.
  - Use Cypress for end-to-end testing to simulate user interactions in a browser, interacting with both frontend and backend.
  - Chain API calls and UI actions to verify data consistency across the full application stack.
  - Validate error handling across frontend-backend interactions for robustness.
- **Tools:**
  - Cypress: For browser-based end-to-end testing of frontend-backend integration.
  - Jest/Supertest: For API-level integration tests if needed outside of Cypress.
  - SQLite in-memory: To provide a clean, isolated database for each test run.
- **Test Cases:**
  Below are placeholders for integration test cases to be implemented. These focus on end-to-end workflows, API response handling, and state management.

  #### Test Case 1: Full Prompt Creation Workflow
  - **Description:** Verify that adding a prompt via the UI successfully updates the backend and frontend state.
  - **Preconditions:** Empty prompt list, backend running with in-memory database.
  - **Steps:** (TODO: Define steps for creating a prompt and checking results)
  - **Expected Result:** (TODO: Define expected outcome)

  #### Test Case 2: Prompt Editing Workflow
  - **Description:** Ensure editing a prompt updates the backend and reflects changes in the UI.
  - **Preconditions:** At least one prompt exists in the database.
  - **Steps:** (TODO: Define steps for editing a prompt)
  - **Expected Result:** (TODO: Define expected outcome)

  #### Test Case 3: Prompt Deletion Workflow
  - **Description:** Confirm that deleting a prompt removes it from the backend and updates the UI.
  - **Preconditions:** At least one prompt exists in the database.
  - **Steps:** (TODO: Define steps for deleting a prompt)
  - **Expected Result:** (TODO: Define expected outcome)

  #### Test Case 4: Master Prompt Generation and Copy
  - **Description:** Validate that selecting prompts, reordering them, and copying the master prompt works end-to-end.
  - **Preconditions:** Multiple prompts exist in the database.
  - **Steps:** (TODO: Define steps for selecting, reordering, and copying)
  - **Expected Result:** (TODO: Define expected outcome)

  #### Test Case 5: API Error Handling - Invalid Creation
  - **Description:** Test that the frontend handles a backend error (e.g., missing content) during prompt creation.
  - **Preconditions:** Backend configured to reject invalid requests.
  - **Steps:** (TODO: Define steps for submitting an invalid prompt)
  - **Expected Result:** (TODO: Define expected outcome)

  #### Test Case 6: API Error Handling - Database Failure
  - **Description:** Ensure the frontend gracefully handles a backend database failure during retrieval.
  - **Preconditions:** Backend configured to simulate database errors.
  - **Steps:** (TODO: Define steps for triggering a database error)
  - **Expected Result:** (TODO: Define expected outcome)

  #### Test Case 7: State Sync After Reordering
  - **Description:** Verify that reordering selected prompts in the UI updates the master prompt state consistently.
  - **Preconditions:** Multiple prompts selected in the UI.
  - **Steps:** (TODO: Define steps for reordering prompts)
  - **Expected Result:** (TODO: Define expected outcome)

---

## 4. Testing Environment Setup

### Frontend
- **Dependencies:** Ensure that `jest`, `@testing-library/react`, and related packages are installed.
- **Scripts:** Add or update test scripts in `package.json` (for example, `"test": "react-scripts test"`).
- **Running Tests:** Execute `npm test` in the frontend directory.

### Backend
- **Dependencies:** Install `jest`, `supertest`, and any necessary mocking libraries.
- **Scripts:** Add or update test scripts in the backend `package.json` (for example, `"test": "jest"`).
- **Running Tests:** Execute `npm test` in the backend directory.
- **Note:** Use a separate test database configuration to avoid data conflicts with the production environment.

---

## 5. Future Considerations

- **Continuous Integration:** Integrate with CI/CD pipelines (e.g., GitHub Actions) to run tests automatically on pushes or pull requests.
- **Code Coverage:** Utilize tools like Istanbul/nyc to monitor code coverage.
- **User Feedback:** Adapt and expand test cases based on real-world usage and reported issues.

---

## 6. Test Cases

Below are the documented test cases for the frontend components based on existing unit tests in `frontend/src/components/__tests__/` and `frontend/src/App.test.js`. Backend test cases are not yet implemented.

### 6.1 App Component (`App.test.js`)

#### Test Case 1: Renders the Main Header
- **Description:** Verifies that the "Prompt Partner" header is rendered on the screen.
- **Preconditions:** 
  - `getPrompts` API call is mocked to return an empty array
  - All API mocks are cleared before each test
- **Steps:**
  1. Mock `getPrompts` to resolve with an empty array
  2. Render the `<App />` component
  3. Check for the presence of the "Prompt Partner" text
- **Expected Result:** The header text "Prompt Partner" is found in the document

#### Test Case 2: Fetches and Displays Prompts on Mount
- **Description:** Ensures that prompts are fetched on component mount and displayed in the UI.
- **Preconditions:** 
  - `getPrompts` API call is mocked
  - All API mocks are cleared before each test
- **Steps:**
  1. Mock `getPrompts` to resolve with a single prompt `{ id: 101, name: 'Test Prompt', content: 'Test Content' }`
  2. Render the `<App />` component
  3. Wait for the fetch to resolve using `waitFor`
  4. Check for the presence of "Test Prompt" in the document
  5. Verify that `getPrompts` was called exactly once
- **Expected Result:** 
  - "Test Prompt" is displayed in the document
  - `getPrompts` is called exactly once

### 6.2 MasterPrompt Component (`MasterPrompt.test.js`)

#### Test Case 1: Renders the Combined Text in the Textarea
- **Description:** Confirms that the `selectedPromptsText` prop is displayed in the textarea.
- **Preconditions:** None.
- **Steps:**
  1. Render `<MasterPrompt selectedPromptsText="Example combined text" />`.
  2. Check the textarea's value for "Example combined text".
- **Expected Result:** The textarea displays "Example combined text".

#### Test Case 2: Copy Button is Disabled if No Text is Present
- **Description:** Verifies that the "Copy to Clipboard" button is disabled when `selectedPromptsText` is empty.
- **Preconditions:** Clipboard API is mocked.
- **Steps:**
  1. Render `<MasterPrompt selectedPromptsText="" />`.
  2. Check if the "Copy to Clipboard" button is disabled.
- **Expected Result:** The button is disabled.

#### Test Case 3: Clicking Copy Button Writes Text to Clipboard if Text is Present
- **Description:** Ensures that clicking the copy button calls the clipboard API with the correct text when `selectedPromptsText` is non-empty.
- **Preconditions:** Clipboard API is mocked.
- **Steps:**
  1. Render `<MasterPrompt selectedPromptsText="Some text" />`.
  2. Verify the "Copy to Clipboard" button is not disabled.
  3. Click the button.
  4. Check if `navigator.clipboard.writeText` was called with "Some text".
- **Expected Result:** Button is enabled, and `writeText` is called with "Some text".

### 6.3 PromptEditor Component (`PromptEditor.test.js`)

#### Test Case 1: Renders Add Prompt Form When editingPrompt is Null
- **Description:** Verifies that the form renders in "add" mode and submits correctly when no prompt is being edited.
- **Preconditions:** `onAddPrompt` and `onEditPrompt` are mocked.
- **Steps:**
  1. Render `<PromptEditor onAddPrompt={mock} onEditPrompt={mock} editingPrompt={null} />`.
  2. Check for "Add Prompt" heading.
  3. Fill name input with "New Prompt" and content textarea with "New content".
  4. Click the "Add" button.
  5. Verify `onAddPrompt` was called with "New Prompt", "New content", and empty tags.
- **Expected Result:** "Add Prompt" is displayed, and `onAddPrompt` is called with correct arguments.

#### Test Case 2: Renders Edit Prompt Form When editingPrompt is Provided
- **Description:** Ensures the form renders in "edit" mode with pre-filled values and submits updates correctly.
- **Preconditions:** `onAddPrompt` and `onEditPrompt` are mocked; `editingPrompt` is `{ id: 3, name: 'Editing Name', content: 'Editing content', tags: 'tagX,tagY' }`.
- **Steps:**
  1. Render `<PromptEditor onAddPrompt={mock} onEditPrompt={mock} editingPrompt={editingData} />`.
  2. Check for "Edit Prompt" heading.
  3. Verify initial values in inputs.
  4. Update name to "Updated Name", content to "Updated content", tags to "tagUpdated".
  5. Click the "Update" button.
  6. Verify `onEditPrompt` was called with 3, "Updated Name", "Updated content", "tagUpdated".
- **Expected Result:** "Edit Prompt" is displayed, inputs show initial values, and `onEditPrompt` is called with updated values.

### 6.4 PromptList Component (`PromptList.test.js`)

#### Test Case 1: Renders "No prompts found" When Prompts Array is Empty
- **Description:** Confirms that an empty prompt list displays a "No prompts found" message.
- **Preconditions:** All callbacks are mocked.
- **Steps:**
  1. Render `<PromptList prompts={[]} selectedPrompts={[]} onSelectPrompt={mock} onDeletePrompt={mock} onEditPromptClick={mock} />`.
  2. Check for "No prompts found" text.
- **Expected Result:** "No prompts found" is displayed.

#### Test Case 2: Renders Prompt List and Checks Default States
- **Description:** Verifies that prompts are rendered with correct details and unselected by default.
- **Preconditions:** `prompts` is an array with two sample prompts; all callbacks are mocked.
- **Steps:**
  1. Render `<PromptList prompts={samplePrompts} selectedPrompts={[]} ... />`.
  2. Check for prompt names and tags.
  3. Verify all checkboxes are unchecked.
- **Expected Result:** Prompt names and tags are displayed, and checkboxes are unchecked.

#### Test Case 3: Selecting a Prompt Calls onSelectPrompt with its ID
- **Description:** Ensures clicking a checkbox triggers the `onSelectPrompt` callback with the prompt's ID.
- **Preconditions:** `prompts` is populated; all callbacks are mocked.
- **Steps:**
  1. Render `<PromptList prompts={samplePrompts} selectedPrompts={[]} ... />`.
  2. Click the first prompt's checkbox.
  3. Verify `onSelectPrompt` was called with ID 1.
- **Expected Result:** `onSelectPrompt` is called with 1.

#### Test Case 4: Delete Button Calls onDeletePrompt with Prompt ID
- **Description:** Confirms clicking a delete button triggers `onDeletePrompt` with the correct ID.
- **Preconditions:** `prompts` is populated; all callbacks are mocked.
- **Steps:**
  1. Render `<PromptList prompts={samplePrompts} selectedPrompts={[]} ... />`.
  2. Click the first prompt's delete button.
  3. Verify `onDeletePrompt` was called with ID 1.
- **Expected Result:** `onDeletePrompt` is called with 1.

#### Test Case 5: Edit Button Calls onEditPromptClick with Prompt Data
- **Description:** Ensures clicking an edit button triggers `onEditPromptClick` with the prompt's data.
- **Preconditions:** `prompts` is populated; all callbacks are mocked.
- **Steps:**
  1. Render `<PromptList prompts={samplePrompts} selectedPrompts={[]} ... />`.
  2. Click the second prompt's edit button.
  3. Verify `onEditPromptClick` was called with the second prompt's data.
- **Expected Result:** `onEditPromptClick` is called with `{ id: 2, name: 'Prompt B', content: 'Content B', tags: 'work, personal' }`.

### 6.5 SelectedPromptList Component (`SelectedPromptList.test.js`)

#### Test Case 1: Shows "No prompts selected" Message When None Are Selected
- **Description:** Verifies that an empty selection displays a "No prompts selected" message.
- **Preconditions:** `selectedPrompts` is empty; `prompts` is populated; `onReorder` is mocked.
- **Steps:**
  1. Render `<SelectedPromptList selectedPrompts={[]} prompts={samplePrompts} onReorder={mock} />`.
  2. Check for "No prompts selected" text.
- **Expected Result:** "No prompts selected" is displayed.

#### Test Case 2: Renders Selected Prompts in Provided Order
- **Description:** Ensures selected prompts are rendered in the order specified by `selectedPrompts`.
- **Preconditions:** `selectedPrompts` is `[33, 22]`; `prompts` is populated; `onReorder` is mocked.
- **Steps:**
  1. Render `<SelectedPromptList selectedPrompts={[33, 22]} prompts={samplePrompts} onReorder={mock} />`.
  2. Check for "SP C" and "SP B" presence, and absence of "SP A".
- **Expected Result:** "SP C" and "SP B" are displayed; "SP A" is not.

### 6.6 SortablePrompt Component (`SortablePrompt.test.js`)

#### Test Case 1: Displays Prompt Name and Content
- **Description:** Confirms that the component renders the prompt's name and content.
- **Preconditions:** `@dnd-kit/sortable` is mocked; `prompt` is `{ id: 123, name: 'Sortable Name', content: 'Sortable content' }`.
- **Steps:**
  1. Render `<SortablePrompt prompt={promptData} />`.
  2. Check for "Sortable Name" and "Sortable content".
- **Expected Result:** Both "Sortable Name" and "Sortable content" are displayed.

---

This testing strategy provides a comprehensive plan to ensure the reliability and quality of the Prompt Partner application. By combining manual, unit, integration, and optional performance tests, we lay a strong foundation for both immediate quality assurance and future scalability.