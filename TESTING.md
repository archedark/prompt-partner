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
  - **Steps:**
    1. Launch the application in a browser.
    2. Navigate to the PromptEditor section.
    3. Enter "Test Prompt" in the name field, "Test Content" in the content field, and "tag1" in the tags field.
    4. Click the "Add" button.
    5. Wait for the prompt to appear in the PromptList section.
    6. Verify the prompt is stored in the backend by checking the database (via Cypress or API call).
  - **Expected Result:** The new prompt "Test Prompt" with content "Test Content" and tags "tag1" appears in the PromptList, and the backend database contains the new prompt with a unique ID and correct `created_at` timestamp.

  #### Test Case 2: Prompt Editing Workflow
  - **Description:** Ensure editing a prompt updates the backend and reflects changes in the UI.
  - **Preconditions:** At least one prompt exists in the database (e.g., ID 1, "Old Name", "Old Content", "oldtag").
  - **Steps:**
    1. Launch the application with the pre-existing prompt visible in PromptList.
    2. Click the "Edit" button next to the prompt with ID 1.
    3. In the PromptEditor, update the name to "New Name", content to "New Content", and tags to "newtag".
    4. Click the "Update" button.
    5. Wait for the PromptList to refresh.
    6. Verify the backend database reflects the updated prompt.
  - **Expected Result:** The PromptList shows the updated prompt with "New Name", "New Content", and "newtag", and the backend database reflects these changes for ID 1.

  #### Test Case 3: Prompt Deletion Workflow
  - **Description:** Confirm that deleting a prompt removes it from the backend and updates the UI.
  - **Preconditions:** At least one prompt exists in the database (e.g., ID 1, "Test Prompt", "Test Content", "tag1").
  - **Steps:**
    1. Launch the application with the pre-existing prompt in PromptList.
    2. Click the "Delete" button next to the prompt with ID 1.
    3. Wait for the PromptList to refresh.
    4. Verify the prompt is no longer in the backend database.
  - **Expected Result:** The prompt with ID 1 is removed from the PromptList, and the backend database no longer contains the prompt.

  #### Test Case 4: Master Prompt Generation and Copy
  - **Description:** Validate that selecting prompts, reordering them, and copying the master prompt works end-to-end.
  - **Preconditions:** Multiple prompts exist in the database (e.g., ID 1: "Prompt A", ID 2: "Prompt B", ID 3: "Prompt C").
  - **Steps:**
    1. Launch the application with the prompts visible in PromptList.
    2. Check the boxes for "Prompt A" and "Prompt B".
    3. In SelectedPromptList, drag "Prompt B" above "Prompt A" to reorder them.
    4. Verify the MasterPrompt textarea shows "Prompt B\nPrompt A".
    5. Click the "Copy to Clipboard" button.
    6. Check the clipboard contents (via Cypress).
  - **Expected Result:** The MasterPrompt displays "Prompt B\nPrompt A" after reordering, and the clipboard contains the same text after copying.

  #### Test Case 5: API Error Handling - Invalid Creation
  - **Description:** Test that the frontend handles a backend error (e.g., missing content) during prompt creation.
  - **Preconditions:** Backend configured to reject invalid requests (e.g., returns 400 for missing content).
  - **Steps:**
    1. Launch the application with an empty PromptList.
    2. Navigate to PromptEditor.
    3. Enter "Test Prompt" in the name field, leave the content field empty, and add "tag1" in the tags field.
    4. Click the "Add" button.
    5. Observe the frontend response (e.g., no new prompt added, optional error message).
    6. Verify the backend database remains unchanged.
  - **Expected Result:** No new prompt appears in PromptList, the backend database is unchanged, and the frontend optionally displays an error (e.g., via toast if implemented).

  #### Test Case 6: API Error Handling - Database Failure
  - **Description:** Ensure the frontend gracefully handles a backend database failure during retrieval.
  - **Preconditions:** Backend configured to simulate database errors (e.g., `GET /prompts` returns 500).
  - **Steps:**
    1. Launch the application with the backend set to fail on `GET /prompts`.
    2. Observe the PromptList section on page load.
    3. Verify no prompts are displayed or an error state is shown.
  - **Expected Result:** PromptList shows "No prompts found" or an error message, and the application remains functional without crashing.

  #### Test Case 7: State Sync After Reordering
  - **Description:** Verify that reordering selected prompts in the UI updates the master prompt state consistently.
  - **Preconditions:** Multiple prompts selected in the UI (e.g., ID 1: "Prompt A", ID 2: "Prompt B" selected).
  - **Steps:**
    1. Launch the application with "Prompt A" and "Prompt B" in PromptList.
    2. Check the boxes for both prompts.
    3. Verify MasterPrompt initially shows "Prompt A\nPrompt B".
    4. In SelectedPromptList, drag "Prompt B" above "Prompt A".
    5. Check the MasterPrompt textarea after reordering.
  - **Expected Result:** MasterPrompt updates to "Prompt B\nPrompt A" after reordering, reflecting the new order in SelectedPromptList.

### 6.7 Tag Filtering Integration Tests (`promptWorkflows.spec.js`)

#### Test Case 1: Basic Tag Filtering
- **Description:** Verifies that the tag filtering system works correctly across the full application stack.
- **Preconditions:** Clean test database with predefined prompts having various tags.
- **Steps:**
  1. Create test prompts with different tags via API
  2. Visit the application
  3. Verify all prompts are initially visible
  4. Filter by "coding" tag
  5. Verify only prompts with "coding" tag are visible
  6. Clear filter
  7. Verify all prompts are visible again
- **Expected Result:** Tag filtering correctly shows/hides prompts based on tag selection.

#### Test Case 2: Non-existent Tag Handling
- **Description:** Tests the application's behavior when filtering by a non-existent tag.
- **Preconditions:** Clean test database with predefined prompts.
- **Steps:**
  1. Create test prompts with known tags
  2. Visit the application
  3. Filter by "nonexistent" tag
  4. Verify "No prompts found" message
  5. Clear filter
  6. Verify all prompts reappear
- **Expected Result:** Application gracefully handles non-matching tag filters.

#### Test Case 3: Filter State Persistence
- **Description:** Validates that the filter state persists when adding new prompts.
- **Preconditions:** Clean test database.
- **Steps:**
  1. Create initial prompts with tags
  2. Visit the application
  3. Apply "coding" tag filter
  4. Add new prompt with "coding" tag
  5. Verify new prompt appears in filtered list
  6. Add prompt without "coding" tag
  7. Verify non-matching prompt doesn't appear
- **Expected Result:** Filter state maintains consistency when adding new prompts.

#### Test Case 4: Case-Insensitive Tag Filtering
- **Description:** Confirms that tag filtering works regardless of case.
- **Preconditions:** Clean test database with prompts having mixed-case tags.
- **Steps:**
  1. Create prompts with various tag cases
  2. Visit the application
  3. Test uppercase filter
  4. Test mixed-case filter
  5. Verify matches are found regardless of case
- **Expected Result:** Tag filtering works case-insensitively.

#### Test Case 5: Partial Tag Match Filtering
- **Description:** Verifies that tag filtering works with partial matches at the start of tags.
- **Preconditions:** Clean test database with prompts having various tags.
- **Steps:**
  1. Create prompts with various tags
  2. Visit the application
  3. Enter partial tag "cod"
  4. Verify prompts with tags starting with "cod" are shown
  5. Enter partial tag "writ"
  6. Verify prompts with tags starting with "writ" are shown
  7. Test with very short partial match "co"
- **Expected Result:** Tag filtering shows prompts where any tag starts with the entered text.

---

This testing strategy provides a comprehensive plan to ensure the reliability and quality of the Prompt Partner application. By combining manual, unit, integration, and optional performance tests, we lay a strong foundation for both immediate quality assurance and future scalability.