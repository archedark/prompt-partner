# Prompt Partner App Development Plan

## Project Setup
- [X] Create a new directory named `prompt-partner`.
- [X] Initialize a Git repository.

## Set Up Subdirectories
- [X] Create `frontend` and `backend`.

## Backend Development
1. **Initialize Backend**  
   - [X] `npm init -y`
2. **Install Dependencies**  
   - [X] `express`, `sqlite3`, `cors`, `nodemon`
3. **Set Up SQLite Database**  
   - [X] Create `prompts` table with schema (id, content, tags, created_at)
4. **Implement API Routes**  
   - [X] `POST /prompts`, `GET /prompts`, `PUT /prompts/:id`, `DELETE /prompts/:id`
   - [X] Enable CORS
5. **Run the Server**  
   - [X] Use `nodemon server.js`

## Frontend Development
1. **Initialize Frontend**  
   - [X] `npx create-react-app .`
2. **Create Components**  
   - [X] `PromptList.js`, `PromptEditor.js`, `MasterPrompt.js`
3. **Set Up Main Layout**  
   - [X] In `App.js`
4. **Manage State**  
   - [X] Use `useState` + `useEffect`
5. **Connect to Backend**  
   - [X] Implement `fetch` API calls in `api.js`

## Implement Prompt Management
1. **PromptEditor Functionality**  
   - [X] POST (create), PUT (update)
2. **PromptList Functionality**  
   - [X] GET (display), DELETE

## Implement Master Prompt Functionality
1. **Prompt Selection**  
   - [X] Checkboxes
2. **Combine Prompts**  
   - [X] Combine selected text
3. **Copy to Clipboard**  
   - [X] Clipboard API

## Styling and UI
1. **Apply Basic Styling**  
   - [X] Implement Chakra UI for a modern design
2. **Ensure Functional Layout**  
   - [X] Responsive columns/stacking

## Testing
1. **Manual Testing**  
   - [X] Perform manual UI testing
2. **Test Setup**
   - [X] Configure Jest for backend
   - [X] Configure React Testing Library for frontend
   - [X] Add test scripts to package.json
3. **Unit Testing**
   - [X] Frontend Tests
     - [X] Component rendering
     - [X] User interactions
     - [X] API integration
     - [X] Verify tests pass
   - [X] Backend Tests
     - [X] Database operations
     - [X] API endpoints
     - [X] Error handling
     - [X] Verify tests pass
4. **Integration Testing**
   - [X] End-to-end workflows
   - [X] API response handling
   - [X] State management
   - [X] Use in-memory SQLite database for testing
   - [X] Verify tests pass

## Additional Features
1. **Prompt Reordering**
   - [X] Write tests for drag-and-drop reordering
     - [X] Test drag start/end events
     - [X] Test reorder position calculations
     - [X] Test state updates after reordering
   - [X] Implement drag-and-drop based on tests
   - [X] Manual testing to verify behavior
2. **Tag Filtering**
   - [X] Identify tag filtering requirements
   - [X] Write tests for tag filtering
   - [X] Implement tag filtering based on tests
   - [X] Manual testing to verify behavior
   - [X] Add partial match filtering
3. **Search Filtering**
   - [X] Update filtering to use prompt names as well as tags
     - [X] Frontend Test Development
       - [X] Write tests for combined name and tag search
         - [X] Test search matches in prompt name only
         - [X] Test search matches in tags only
         - [X] Test search matches in both name and tags
         - [X] Test case-insensitive matching
         - [X] Test partial word matching in both fields
         - [X] Test empty search returns all prompts
         - [X] Test special characters handling
     - [X] Frontend Implementation
       - [X] Update search input placeholder to indicate both name and tag search
       - [X] Modify filter logic to include prompt names
       - [X] Add visual indication of match type (name/tags/both)
       - [X] Update "No prompts found" message to reflect broader search
     - [X] Manual Testing & Documentation
       - [X] Test various search scenarios
       - [X] Update user documentation
4. **Clear Selection Button**
   - [X] Identify clear selection button requirements
   - [X] Write unit tests for clear selection button
   - [X] Implement clear selection button based on tests
   - [X] Manual testing to verify behavior
   - [X] Write integration tests for clear selection button
5. **Expandable Prompt List**
   - [X] Identify expandable prompt list requirements
   - [X] Write unit tests for expandable prompt list
   - [X] Implement expandable prompt list based on tests (then ensure no test failures)
   - [X] Manual testing to verify behavior
   - [X] Write integration tests for expandable prompt list
6. **Repo Integration**
   - [X] Identify repo integration requirements
   - [X] Write unit tests for repo integration
   - [ ] Implement repo integration based on tests (then ensure no test failures)
   - [ ] Manual testing to verify behavior
   - [ ] Write integration tests for repo integration
7. **Prompt History**
   - [ ] Identify prompt history requirements
   - [ ] Write unit tests for prompt history
   - [ ] Implement prompt history based on tests (then ensure no test failures)
   - [ ] Manual testing to verify behavior
   - [ ] Write integration tests for prompt history
8. **Display Token Count in Prompt List**
   - [ ] Identify token count requirements
   - [ ] Write unit tests for token count
   - [ ] Implement token count based on tests (then ensure no test failures)
   - [ ] Manual testing to verify behavior
   - [ ] Write integration tests for token count

## Documentation
1. **README**
   - [X] Update README with setup instructions
   - [X] Add testing documentation
2. **Documentation**
   - [X] Document code
3. **Testing**
   - [X] Document testing strategy
   - [X] Document test cases