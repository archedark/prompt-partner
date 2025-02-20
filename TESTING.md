# Testing Strategy for Prompt Partner

## Quick Start - Running Tests

### Frontend Tests
```bash
cd frontend

# Install dependencies if not already done
npm install

# Run all tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/components/__tests__/PromptList.test.js

# Run tests in CI mode
npm test -- --ci

# Update snapshots
npm test -- -u
```

### Backend Tests
```bash
cd backend

# Install dependencies if not already done
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- src/__tests__/prompts.test.js
```

### Test Organization

#### Frontend Test Structure
```
frontend/
├── src/
│   ├── __tests__/              # General utility and hook tests
│   ├── components/
│   │   └── __tests__/          # Component-specific tests
│   └── integration/
│       └── __tests__/          # Integration tests
└── cypress/                     # E2E tests
```

#### Backend Test Structure
```
backend/
├── __tests__/                  # Unit tests
├── integration/                # Integration tests
└── test/
    ├── fixtures/              # Test data
    └── helpers/               # Test utilities
```

### Coverage Reports
After running tests with coverage:
- Frontend coverage report: `frontend/coverage/lcov-report/index.html`
- Backend coverage report: `backend/coverage/lcov-report/index.html`

Required coverage thresholds (both frontend and backend):
- 70% branch coverage
- 70% function coverage
- 70% line coverage
- 70% statement coverage

---

## Testing Philosophy

### 1. Overview

The testing strategy is divided into three primary areas:
- **Manual Testing:** Developer-led testing to verify functionality and user interactions.
- **Unit Testing:** Isolated tests for individual components and API functions.
- **Integration & End-to-End Testing:** Testing interactions between components and simulating real user scenarios.

### 2. BDD-Style Test Naming

We follow Behavior-Driven Development (BDD) style test naming conventions:
- Tests are written in plain English describing the behavior
- Names start with verbs (creates, updates, handles, maintains, etc.)
- Focus on what the system does, not how it does it
- Makes tests self-documenting
- Helps identify missing test cases by thinking in terms of behaviors

Example test names:
- "creates new prompt with name, content and tags"
- "updates existing prompt with new values"
- "searches by prompt name"
- "handles case-insensitive search"

### 3. Frontend Testing Strategy

#### Manual Testing
- Verify UI components work as expected
- Confirm prompts are fetched, added, edited, deleted, and combined correctly
- Validate clipboard operations and drag-and-drop reordering

#### Unit Testing
- Test individual React components
- Use Jest and React Testing Library
- Focus on component rendering, state updates, and event handling

#### Integration Testing
- Use Cypress for end-to-end testing
- Test complete user workflows
- Validate frontend-backend integration

### 4. Backend Testing Strategy

#### Manual Testing
- Test API endpoints using Postman or cURL
- Validate HTTP status codes and response formats
- Test error handling

#### Unit Testing
- Test individual API routes
- Verify database operations
- Use Jest and Supertest


### 5. Test Data Management

- Use test-specific prefixes for test data
- Clean up test data after each test
- Ensure integration tests are idempotent
- Maintain test isolation

This testing strategy ensures comprehensive coverage while maintaining readability and maintainability through BDD-style test naming and proper test organization.