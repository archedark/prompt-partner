/**
 * @file promptCreation.spec.js
 * @description Cypress integration test for the Prompt Partner application.
 *              Implements "Test Case 1: Full Prompt Creation Workflow" from TESTING.md,
 *              verifying that adding a prompt via the UI updates the backend and frontend state.
 *
 * @dependencies
 * - Cypress: For end-to-end testing in a browser environment
 *
 * @notes
 * - Assumes frontend runs on http://localhost:3001 and backend on http://localhost:5001
 * - Uses in-memory SQLite database (assumed configured in backend for testing)
 * - Clears existing prompts individually since no reset endpoint exists
 * - No TypeScript used, per project rules favoring JavaScript for speed
 * - Handles basic DOM interactions and API verification
 */

describe('Prompt Partner Integration - Prompt Creation', () => {
  // Reset state before the test to ensure a clean slate
  before(() => {
    // Fetch all prompts and delete each one to clear the database
    cy.request('GET', 'http://localhost:5001/prompts').then((response) => {
      const prompts = response.body;
      prompts.forEach((prompt) => {
        cy.request('DELETE', `http://localhost:5001/prompts/${prompt.id}`);
      });
    });
  });

  it('Full Prompt Creation Workflow', () => {
    // Step 1: Launch the application in a browser
    cy.visit('http://localhost:3001');

    // Step 2: Navigate to the PromptEditor section (implicit, as it’s part of the UI)
    // Step 3: Enter "Test Prompt" in the name field, "Test Content" in the content field, and "tag1" in the tags field
    cy.get('input[placeholder="Enter prompt name"]').type('Test Prompt');
    cy.get('textarea[placeholder="Enter prompt content"]').type('Test Content');
    cy.get('input[placeholder="Tags (comma-separated)"]').type('tag1');

    // Step 4: Click the "Add" button
    cy.get('button').contains('Add').click();

    // Step 5: Wait for the prompt to appear in the PromptList section
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Test Prompt')
      .and('contain', 'Test Content')
      .and('contain', 'tag1');

    // Step 6: Verify the prompt is stored in the backend by checking the database (via API call)
    cy.request('GET', 'http://localhost:5001/prompts').then((response) => {
      expect(response.status).to.eq(200);
      const prompts = response.body;
      expect(prompts).to.have.length(1); // Should now pass with only the new prompt
      expect(prompts[0]).to.include({
        name: 'Test Prompt',
        content: 'Test Content',
        tags: 'tag1',
      });
      expect(prompts[0].id).to.be.a('number'); // Ensure ID is assigned
      expect(prompts[0].created_at).to.be.a('string'); // Ensure timestamp exists
    });
  });
});