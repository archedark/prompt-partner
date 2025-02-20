/**
 * @file promptWorkflows.spec.js
 * @description Cypress integration tests for the Prompt Partner application.
 *              Implements all test cases from TESTING.md under "3.3 Integration Testing",
 *              verifying end-to-end workflows, API response handling, and state management
 *              between frontend and backend.
 *
 * @dependencies
 * - Cypress: For end-to-end testing in a browser environment
 *
 * @notes
 * - Assumes frontend runs on http://localhost:3001 and backend on http://localhost:5001
 * - Uses in-memory SQLite database (assumed configured in backend for testing)
 * - Clears existing prompts individually since no reset endpoint exists
 * - No TypeScript used, per project rules favoring JavaScript for speed
 * - Handles DOM interactions, API verification, and clipboard checks
 */

describe('Prompt Partner Integration - Prompt Workflows', () => {
  // Reset state before each test to ensure a clean slate
  beforeEach(() => {
    // Fetch all prompts and delete each one to clear the database
    cy.request('GET', 'http://localhost:5001/prompts').then((response) => {
      const prompts = response.body;
      prompts.forEach((prompt) => {
        cy.request('DELETE', `http://localhost:5001/prompts/${prompt.id}`);
      });
    });
  });

  it('Test Case 1: Full Prompt Creation Workflow', () => {
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
      expect(prompts).to.have.length(1);
      expect(prompts[0]).to.include({
        name: 'Test Prompt',
        content: 'Test Content',
        tags: 'tag1',
      });
      expect(prompts[0].id).to.be.a('number');
      expect(prompts[0].created_at).to.be.a('string');
    });
  });

  it('Test Case 2: Prompt Editing Workflow', () => {
    // Precondition: Seed a prompt to edit
    cy.request('POST', 'http://localhost:5001/prompts', {
      name: 'Old Name',
      content: 'Old Content',
      tags: 'oldtag',
    }).then((response) => {
      expect(response.status).to.eq(201);
      const promptId = response.body.id;

      // Step 1: Launch the application with the pre-existing prompt
      cy.visit('http://localhost:3001');

      // Step 2: Click the "Edit" button next to the prompt
      cy.get('[data-testid="prompt-list"]')
        .contains('Old Name')
        .parent()
        .parent()
        .find('button[aria-label="Edit Prompt"]')
        .click();

      // Step 3: Update the form fields in PromptEditor
      cy.get('input[placeholder="Enter prompt name"]')
        .clear()
        .type('New Name');
      cy.get('textarea[placeholder="Enter prompt content"]')
        .clear()
        .type('New Content');
      cy.get('input[placeholder="Tags (comma-separated)"]')
        .clear()
        .type('newtag');

      // Step 4: Click the "Update" button
      cy.get('button').contains('Update').click();

      // Step 5: Wait for the PromptList to refresh
      cy.get('[data-testid="prompt-list"]')
        .should('contain', 'New Name')
        .and('contain', 'New Content')
        .and('contain', 'newtag')
        .and('not.contain', 'Old Name')
        .and('not.contain', 'Old Content')
        .and('not.contain', 'oldtag');

      // Step 6: Verify the backend database reflects the updated prompt
      cy.request('GET', 'http://localhost:5001/prompts').then((resp) => {
        expect(resp.status).to.eq(200);
        const prompts = resp.body;
        expect(prompts).to.have.length(1);
        expect(prompts[0]).to.include({
          id: promptId,
          name: 'New Name',
          content: 'New Content',
          tags: 'newtag',
        });
      });
    });
  });

  it('Test Case 3: Prompt Deletion Workflow', () => {
    // Precondition: Seed a prompt to delete
    cy.request('POST', 'http://localhost:5001/prompts', {
      name: 'Test Prompt',
      content: 'Test Content',
      tags: 'tag1',
    }).then((response) => {
      expect(response.status).to.eq(201);
      const promptId = response.body.id;

      // Step 1: Launch the application with the pre-existing prompt
      cy.visit('http://localhost:3001');

      // Step 2: Click the "Delete" button next to the prompt
      cy.get('[data-testid="prompt-list"]')
        .contains('Test Prompt')
        .parent()
        .parent()
        .find('button[aria-label="Delete Prompt"]')
        .click();

      // Step 3: Wait for the PromptList to refresh
      cy.get('[data-testid="prompt-list"]')
        .should('not.contain', 'Test Prompt')
        .and('contain', 'No prompts found');

      // Step 4: Verify the prompt is no longer in the backend database
      cy.request('GET', 'http://localhost:5001/prompts').then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body).to.have.length(0);
      });
    });
  });

  it('Test Case 4: Master Prompt Generation and Copy', () => {
    // Precondition: Seed multiple prompts
    cy.request('POST', 'http://localhost:5001/prompts', {
      name: 'Prompt A',
      content: 'Content A',
      tags: 'tagA',
    }).then((responseA) => {
      expect(responseA.status).to.eq(201);
      const idA = responseA.body.id;

      cy.request('POST', 'http://localhost:5001/prompts', {
        name: 'Prompt B',
        content: 'Content B',
        tags: 'tagB',
      }).then((responseB) => {
        expect(responseB.status).to.eq(201);
        const idB = responseB.body.id;

        // Step 1: Launch the application with prompts visible
        cy.visit('http://localhost:3001');

        // Step 2: Check the boxes for "Prompt A" and "Prompt B"
        cy.get('[data-testid="prompt-list"]')
          .contains('Prompt A')
          .parent()
          .parent()
          .find('input[type="checkbox"]')
          .check();
        cy.get('[data-testid="prompt-list"]')
          .contains('Prompt B')
          .parent()
          .parent()
          .find('input[type="checkbox"]')
          .check();

        // Step 3: In SelectedPromptList, drag "Prompt B" above "Prompt A"
        cy.get('div:contains("Prompt B")').drag('div:contains("Prompt A")', {
          target: { position: 'top' },
        });

        // Step 4: Verify the MasterPrompt textarea shows "Content B\nContent A"
        cy.get('textarea[placeholder="Selected prompts will appear here..."]')
          .should('have.value', 'Content B\nContent A');

        // Step 5: Click the "Copy to Clipboard" button
        cy.get('button').contains('Copy to Clipboard').click();

        // Step 6: Check the clipboard contents
        cy.window().then((win) => {
          win.navigator.clipboard.readText().then((text) => {
            expect(text).to.eq('Content B\nContent A');
          });
        });
      });
    });
  });

  it('Test Case 5: API Error Handling - Invalid Creation', () => {
    // Step 1: Launch the application with an empty PromptList
    cy.visit('http://localhost:3001');

    // Step 2: Navigate to PromptEditor (implicit)
    // Step 3: Enter "Test Prompt" in name field, leave content empty, add "tag1"
    cy.get('input[placeholder="Enter prompt name"]').type('Test Prompt');
    cy.get('input[placeholder="Tags (comma-separated)"]').type('tag1');

    // Step 4: Click the "Add" button
    cy.get('button').contains('Add').click();

    // Step 5: Observe the frontend response (no new prompt added)
    cy.get('[data-testid="prompt-list"]').should('contain', 'No prompts found');

    // Step 6: Verify the backend database remains unchanged
    cy.request('GET', 'http://localhost:5001/prompts').then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.have.length(0);
    });
  });

  it('Test Case 6: API Error Handling - Database Failure', () => {
    // Precondition: Intercept GET /prompts to simulate a 500 error
    cy.intercept('GET', 'http://localhost:5001/prompts', {
      statusCode: 500,
      body: { error: 'Database failure' },
    }).as('getPromptsFailure');

    // Step 1: Launch the application with the backend set to fail
    cy.visit('http://localhost:3001');

    // Step 2: Observe the PromptList section on page load
    cy.get('[data-testid="prompt-list"]').should('contain', 'No prompts found');

    // Step 3: Verify no prompts are displayed or an error state is shown
    cy.get('[data-testid="prompt-list"]')
      .find('div:contains("Prompt")')
      .should('not.exist');
  });

  it('Test Case 7: State Sync After Reordering', () => {
    // Precondition: Seed multiple prompts
    cy.request('POST', 'http://localhost:5001/prompts', {
      name: 'Prompt A',
      content: 'Content A',
      tags: 'tagA',
    }).then((responseA) => {
      expect(responseA.status).to.eq(201);
      const idA = responseA.body.id;

      cy.request('POST', 'http://localhost:5001/prompts', {
        name: 'Prompt B',
        content: 'Content B',
        tags: 'tagB',
      }).then((responseB) => {
        expect(responseB.status).to.eq(201);
        const idB = responseB.body.id;

        // Step 1: Launch the application with prompts
        cy.visit('http://localhost:3001');

        // Step 2: Check the boxes for both prompts
        cy.get('[data-testid="prompt-list"]')
          .contains('Prompt A')
          .parent()
          .parent()
          .find('input[type="checkbox"]')
          .check();
        cy.get('[data-testid="prompt-list"]')
          .contains('Prompt B')
          .parent()
          .parent()
          .find('input[type="checkbox"]')
          .check();

        // Step 3: Verify MasterPrompt initially shows "Content A\nContent B"
        cy.get('textarea[placeholder="Selected prompts will appear here..."]')
          .should('have.value', 'Content A\nContent B');

        // Step 4: In SelectedPromptList, drag "Prompt B" above "Prompt A"
        cy.get('div:contains("Prompt B")').drag('div:contains("Prompt A")', {
          target: { position: 'top' },
        });

        // Step 5: Check the MasterPrompt textarea after reordering
        cy.get('textarea[placeholder="Selected prompts will appear here..."]')
          .should('have.value', 'Content B\nContent A');
      });
    });
  });
});