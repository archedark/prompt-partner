# Contributor Guide

## Repository Overview
- **backend/** - Express.js API using SQLite for data storage.
- **frontend/** - React application built with Chakra UI and @dnd-kit for drag-and-drop.
- **start.sh / start.bat** - Launch both servers locally.
- **run-tests.sh / run-tests.bat** - Execute frontend and backend test suites.

## Development Tips
- Install dependencies in each package (`npm install` inside `backend` and `frontend`).
- Use `./start.sh` (or `start.bat` on Windows) to run the app.
- Environment variables are defined in `.env` files as shown in `README.md`.

## Testing Instructions
- Run `./run-tests.sh` from the repository root to execute all tests. On Windows use `run-tests.bat`.
- Individual packages can be tested with `npm test` inside `backend` or `frontend`.
- Tests follow BDD style naming ("creates new prompt", "handles errors", etc.).
- Jest is configured with a 70% coverage threshold; ensure new code keeps tests passing.

## PR Instructions
- Title format: `[Promptner] <brief description>`
- Add or update tests for any code changes.
- Verify `run-tests.sh` completes successfully before merging.

