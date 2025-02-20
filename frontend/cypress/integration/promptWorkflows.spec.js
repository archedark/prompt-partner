/**
 * @file promptWorkflows.spec.js
 * @description Cypress integration tests for the Prompt Partner application.
 *              Implements test cases verifying end-to-end workflows, API response handling,
 *              and state management between frontend and backend. Now uses Cypress.env('apiUrl')
 *              so we can override the backend port or DB path for an in-memory approach.
 *
 * @dependencies
 * - Cypress: For end-to-end testing in a browser environment
 *
 * @notes
 * - We replace hardcoded 'http://localhost:5001' with Cypress.env('apiUrl').
 * - Example usage:
 *     cross-env DB_PATH=:memory: PORT=5002 npx cypress run --env apiUrl=http://localhost:5002
 */

describe('Prompt Partner Integration - Prompt Workflows', () => {
  // Make a helper to get the base API URL
  const baseApiUrl = () => Cypress.env('apiUrl') || 'http://localhost:5001';

  // Reset state before each test to ensure a clean slate
  beforeEach(() => {
    // Fetch all prompts and delete each one to clear the database
    cy.request('GET', `${baseApiUrl()}/prompts`).then((response) => {
      const prompts = response.body;
      prompts.forEach((prompt) => {
        cy.request('DELETE', `${baseApiUrl()}/prompts/${prompt.id}`);
      });
    });
  });

  it('Test Case 1: Full Prompt Creation Workflow', () => {
    cy.visit('http://localhost:3001');
    cy.get('input[placeholder="Enter prompt name"]').type('Test Prompt');
    cy.get('textarea[placeholder="Enter prompt content"]').type('Test Content');
    cy.get('input[placeholder="Tags (comma-separated)"]').type('tag1');
    cy.get('button').contains('Add').click();

    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Test Prompt')
      .and('contain', 'Test Content')
      .and('contain', 'tag1');

    cy.request('GET', `${baseApiUrl()}/prompts`).then((response) => {
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
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: 'Old Name',
      content: 'Old Content',
      tags: 'oldtag',
    }).then((response) => {
      expect(response.status).to.eq(201);
      const promptId = response.body.id;

      cy.visit('http://localhost:3001');
      cy.get('[data-testid="prompt-list"]')
        .contains('Old Name')
        .parent()
        .parent()
        .find('button[aria-label="Edit Prompt"]')
        .click();

      cy.get('input[placeholder="Enter prompt name"]').clear().type('New Name');
      cy.get('textarea[placeholder="Enter prompt content"]').clear().type('New Content');
      cy.get('input[placeholder="Tags (comma-separated)"]').clear().type('newtag');
      cy.get('button').contains('Update').click();

      cy.get('[data-testid="prompt-list"]')
        .should('contain', 'New Name')
        .and('contain', 'New Content')
        .and('contain', 'newtag')
        .and('not.contain', 'Old Name')
        .and('not.contain', 'Old Content')
        .and('not.contain', 'oldtag');

      cy.request('GET', `${baseApiUrl()}/prompts`).then((resp) => {
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
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: 'Test Prompt',
      content: 'Test Content',
      tags: 'tag1',
    }).then((response) => {
      expect(response.status).to.eq(201);
      const promptId = response.body.id;

      cy.visit('http://localhost:3001');
      cy.get('[data-testid="prompt-list"]')
        .contains('Test Prompt')
        .parent()
        .parent()
        .find('button[aria-label="Delete Prompt"]')
        .click();

      cy.get('[data-testid="prompt-list"]')
        .should('not.contain', 'Test Prompt')
        .and('contain', 'No prompts found');

      cy.request('GET', `${baseApiUrl()}/prompts`).then((resp) => {
        expect(resp.status).to.eq(200);
        expect(resp.body).to.have.length(0);
      });
    });
  });

  // You can uncomment and adjust the test below once you set up a reliable method
  // for simulating drag-and-drop in your environment. It's partially implemented already.
  /*
  it('Test Case 4: Master Prompt Generation and Copy', () => {
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: 'Prompt A',
      content: 'Content A',
      tags: 'tagA',
    }).then((responseA) => {
      expect(responseA.status).to.eq(201);
      const idA = responseA.body.id;

      cy.request('POST', `${baseApiUrl()}/prompts`, {
        name: 'Prompt B',
        content: 'Content B',
        tags: 'tagB',
      }).then((responseB) => {
        expect(responseB.status).to.eq(201);
        const idB = responseB.body.id;

        cy.visit('http://localhost:3001');
        // Check the boxes, reorder prompts, then copy to clipboard...
        // ...
      });
    });
  });
  */

  it('Test Case 5: API Error Handling - Invalid Creation', () => {
    cy.visit('http://localhost:3001');
    cy.get('input[placeholder="Enter prompt name"]').type('Test Prompt');
    cy.get('input[placeholder="Tags (comma-separated)"]').type('tag1');
    cy.get('button').contains('Add').click();

    cy.get('[data-testid="prompt-list"]').should('contain', 'No prompts found');

    cy.request('GET', `${baseApiUrl()}/prompts`).then((resp) => {
      expect(resp.status).to.eq(200);
      expect(resp.body).to.have.length(0);
    });
  });

  it('Test Case 6: API Error Handling - Database Failure', () => {
    cy.intercept('GET', `${baseApiUrl()}/prompts`, {
      statusCode: 500,
      body: { error: 'Database failure' },
    }).as('getPromptsFailure');

    cy.visit('http://localhost:3001');
    cy.get('[data-testid="prompt-list"]').should('contain', 'No prompts found');
    cy.get('[data-testid="prompt-list"]')
      .find('div:contains("Prompt")')
      .should('not.exist');
  });

  // Similarly, you can uncomment the next test once you have stable drag-and-drop
  /*
  it('Test Case 7: State Sync After Reordering', () => {
    cy.request('POST', `${baseApiUrl()}/prompts`, { ... });
    // ...
  });
  */
});

describe('Prompt Partner Integration - Tag Filtering', () => {
  const baseApiUrl = () => Cypress.env('apiUrl') || 'http://localhost:5001';

  beforeEach(() => {
    // Clear existing prompts
    cy.request('GET', `${baseApiUrl()}/prompts`).then((response) => {
      response.body.forEach((prompt) => {
        cy.request('DELETE', `${baseApiUrl()}/prompts/${prompt.id}`);
      });
    });

    // Create test prompts with different tags
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: 'Coding Prompt',
      content: 'Write a function',
      tags: 'coding, javascript',
    });

    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: 'Writing Prompt',
      content: 'Write a story',
      tags: 'writing, creative',
    });

    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: 'Mixed Prompt',
      content: 'Document your code',
      tags: 'coding, writing',
    });

    cy.visit('http://localhost:3001');
  });

  it('Test Case 1: Basic Tag Filtering', () => {
    // Initial state should show all prompts
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Writing Prompt')
      .and('contain', 'Mixed Prompt');

    // Filter by 'coding' tag
    cy.get('input[placeholder*="Filter by tag"]').type('coding');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Mixed Prompt')
      .and('not.contain', 'Writing Prompt');

    // Clear filter and verify all prompts are shown
    cy.get('button').contains('Clear Filter').click();
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Writing Prompt')
      .and('contain', 'Mixed Prompt');
  });

  it('Test Case 2: Non-existent Tag Handling', () => {
    // Filter by non-existent tag
    cy.get('input[placeholder*="Filter by tag"]').type('nonexistent');
    cy.get('[data-testid="prompt-list"]')
      .should('not.contain', 'Coding Prompt')
      .and('not.contain', 'Writing Prompt')
      .and('not.contain', 'Mixed Prompt')
      .and('contain', 'No prompts found');

    // Clear filter and verify recovery
    cy.get('button').contains('Clear Filter').click();
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Writing Prompt')
      .and('contain', 'Mixed Prompt');
  });

  it('Test Case 3: Filter State Persistence', () => {
    // Set filter to 'coding'
    cy.get('input[placeholder*="Filter by tag"]').type('coding');
    
    // Add new prompt with matching tag
    cy.get('input[placeholder="Enter prompt name"]').type('New Coding Prompt');
    cy.get('textarea[placeholder="Enter prompt content"]').type('New content');
    cy.get('input[placeholder="Tags (comma-separated)"]').type('coding, test');
    cy.get('button').contains('Add').click();

    // Verify filter still works and shows new prompt
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'New Coding Prompt')
      .and('contain', 'Coding Prompt')
      .and('contain', 'Mixed Prompt')
      .and('not.contain', 'Writing Prompt');
  });

  it('Test Case 4: Case-Insensitive Tag Filtering', () => {
    // Test with uppercase filter
    cy.get('input[placeholder*="Filter by tag"]').type('CODING');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Mixed Prompt')
      .and('not.contain', 'Writing Prompt');

    // Test with mixed case filter
    cy.get('input[placeholder*="Filter by tag"]').clear().type('WrItInG');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Writing Prompt')
      .and('contain', 'Mixed Prompt')
      .and('not.contain', 'Coding Prompt');
  });

  it('Test Case 5: Partial Tag Match Filtering', () => {
    // Initial state should show all prompts
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Writing Prompt')
      .and('contain', 'Mixed Prompt');

    // Filter by partial tag 'cod'
    cy.get('input[placeholder*="Filter by tag"]').type('cod');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Mixed Prompt')
      .and('not.contain', 'Writing Prompt');

    // Filter by partial tag 'writ'
    cy.get('input[placeholder*="Filter by tag"]').clear().type('writ');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Writing Prompt')
      .and('contain', 'Mixed Prompt')
      .and('not.contain', 'Coding Prompt');

    // Test very short partial match 'co'
    cy.get('input[placeholder*="Filter by tag"]').clear().type('co');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', 'Coding Prompt')
      .and('contain', 'Mixed Prompt')
      .and('not.contain', 'Writing Prompt');
  });
});