<ai_context>
This file outlines the development plan for the Prompt Partner app, a tool for managing and combining prompts. It is designed to guide the development process efficiently, leveraging AI coding assistants for speed.
</ai_context>

# Prompt Partner App Development Plan

The Prompt Partner app is a single-page web application designed for personal use to manage and combine prompts efficiently. This plan outlines the steps to build a functional Minimum Viable Product (MVP) with a focus on core features: adding, editing, and deleting prompts with tags, selecting multiple prompts to create a "Master Prompt," and copying it to the clipboard. Below are the detailed steps to achieve this.

## Project Setup
1. **Initialize the Project:**
   - [X] Create a new directory named `prompt-partner` (if not already present).
   - [X] Inside it, initialize a Git repository with `git init` to track changes.
2. **Set Up Subdirectories:**
   - [X] Create two subdirectories: `frontend` for the React.js frontend and `backend` for the Node.js backend.

## Backend Development
1. **Initialize Backend:**
   - [X] Navigate to the `backend` directory and run `npm init -y` to create a `package.json`.
2. **Install Dependencies:**
   - [X] Install required packages: `npm install express sqlite3 cors nodemon`.
   - `express` for the server, `sqlite3` for the database, `cors` for frontend-backend communication, and `nodemon` for development convenience.
3. **Set Up SQLite Database:**
   - [ ] Create a `prompts` table in an SQLite database with the following schema:
     - [ ] `id`: Integer (auto-incrementing primary key).
     - [ ] `content`: Text (the prompt text).
     - [ ] `tags`: Text (comma-separated tags, e.g., "coding, AI").
     - [ ] `created_at`: Timestamp (default to current time).
4. **Implement API Routes:**
   - [ ] Set up Express.js with endpoints:
     - [ ] `POST /prompts`: Insert a new prompt into the database.
     - [ ] `GET /prompts`: Retrieve all prompts, ordered by `created_at` descending.
     - [ ] `PUT /prompts/:id`: Update a prompt's content and tags by its ID.
     - [ ] `DELETE /prompts/:id`: Delete a prompt by its ID.
   - [ ] Enable CORS to allow requests from the frontend.
5. **Run the Server:**
   - [ ] Use `nodemon server.js` to start the backend with automatic restarts.

## Frontend Development
1. **Initialize Frontend:**
   - [ ] Navigate to the `frontend` directory and run `npx create-react-app .`
2. **Create Components:**
   - [ ] Create `PromptList.js`: Displays all prompts with checkboxes.
   - [ ] Create `PromptEditor.js`: Form for adding/editing prompts.
   - [ ] Create `MasterPrompt.js`: Shows combined text and copy button.
3. **Set Up Main Layout:**
   - [ ] Structure the single-page layout in `src/App.js`
4. **Manage State:**
   - [ ] Implement `useState` for prompts data and selected prompt IDs.
   - [ ] Implement `useEffect` to fetch prompts on mount.
5. **Connect to Backend:**
   - [ ] Implement `fetch` API calls for CRUD operations.

## Implement Prompt Management
1. **PromptEditor Functionality:**
   - [ ] Implement form submissions for new prompts (`POST /prompts`).
   - [ ] Implement editing functionality (`PUT /prompts/:id`).
2. **PromptList Functionality:**
   - [ ] Display prompts from `GET /prompts` with checkboxes and tags.
   - [ ] Implement delete functionality (`DELETE /prompts/:id`).

## Implement Master Prompt Functionality
1. **Prompt Selection:**
   - [ ] Implement checkbox state management in `PromptList`.
2. **Combine Prompts:**
   - [ ] Implement prompt combination logic in `MasterPrompt`.
3. **Copy to Clipboard:**
   - [ ] Add clipboard copy functionality using `navigator.clipboard.writeText`.

## Styling and UI
1. **Apply Basic Styling:**
   - [ ] Implement basic CSS styling.
2. **Ensure Functional Layout:**
   - [ ] Arrange components in a clean, single-page design.

## Testing
1. **Manual Testing:**
   - [ ] Test CRUD operations via UI.
   - [ ] Test prompt selection and Master Prompt updates.
   - [ ] Test copy-to-clipboard functionality.

## Notes
- **Focus on Core Features:** Prioritize prompt management and Master Prompt generation; defer extras like tag filtering or dark mode.
- **Leverage AI Tools:** Use AI coding assistants (e.g., GitHub Copilot) to generate boilerplate code and speed up development.
- **Keep It Simple:** Since this is for personal use, avoid overcomplicating with extensive error handling or deployment setup for now.