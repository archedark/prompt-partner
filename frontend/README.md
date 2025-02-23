# Promptner Frontend

The React frontend for Promptner - a web application for managing and combining prompts.

## Features

- Modern UI built with Chakra UI
- Drag and drop prompt reordering with @dnd-kit
- Real-time prompt editing and preview
- Master prompt combination with clipboard support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend server running (see root README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
REACT_APP_API_URL=http://localhost:5001
```

### Available Scripts

#### `npm start`

Runs the app in development mode at [http://localhost:3001](http://localhost:3001).

The page will hot-reload when you make changes.

#### `npm test`

Launches the test runner in interactive watch mode. Available test commands:

```bash
# Run all tests in watch mode
npm test

# Run specific test file
npm test -- path/to/test/file.test.js

# Run tests in CI mode (non-interactive)
npm test -- --ci

# Update snapshots
npm test -- -u
```

Test files are located in:
- `src/components/__tests__/` - Component tests
- `cypress/integration/` - Integration tests

## Project Structure

```
src/
  ├── components/           # React components
  │   ├── PromptList.js    # List of all prompts
  │   ├── PromptEditor.js  # Create/edit prompts
  │   ├── MasterPrompt.js  # Combined prompt view
  │   └── ...
  ├── api.js               # API integration
  ├── App.js               # Main app component
  └── index.js             # Entry point
```

## Dependencies

- **@chakra-ui/react** - Component library
- **@dnd-kit/core** - Drag and drop functionality
- **@emotion/react** - Styling solution
- **react** - UI framework
- **react-dom** - React DOM bindings

## Development Notes

- The app expects the backend to be running on port 5001
- Environment variables must be prefixed with `REACT_APP_`
- Uses Chakra UI's theme for consistent styling

For more information about the full application, see the root README.
