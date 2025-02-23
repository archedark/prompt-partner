/**
 * @file promptWorkflows.spec.js
 * @description Cypress integration tests for the Prompt Partner application.
 *              Tests are designed to be idempotent - using test-specific prefixes
 *              and cleaning up after themselves without affecting user data.
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
  const baseApiUrl = () => Cypress.env('apiUrl') || 'http://localhost:5001';
  const TEST_PREFIX = '[TEST]';

  // Add uncaught exception handler
  Cypress.on('uncaught:exception', (err, runnable) => {
    // Return false to prevent Cypress from failing the test
    return false;
  });

  // Helper to clean up test prompts
  const cleanupTestPrompts = () => {
    cy.request('GET', `${baseApiUrl()}/prompts`).then((response) => {
      const testPrompts = response.body.filter(p => p.name.startsWith(TEST_PREFIX));
      testPrompts.forEach((prompt) => {
        cy.request('DELETE', `${baseApiUrl()}/prompts/${prompt.id}`);
      });
    });
  };

  beforeEach(cleanupTestPrompts);
  afterEach(() => {
    cleanupTestPrompts();
    // Clear only visible, non-readonly text inputs and textareas
    cy.get('input[type="text"]:not([readonly]), textarea:not([readonly]), input:not([type]):not([readonly])').each(($el) => {
      if ($el.is(':visible')) {
        cy.wrap($el).clear();
      }
    });
  });

  it('creates new prompt with name, content and tags', () => {
    cy.visit('http://localhost:3001');
    cy.get('input[placeholder="Enter prompt name"]').type(`${TEST_PREFIX} Test Prompt`);
    cy.get('textarea[placeholder="Enter prompt content"]').type('Test Content');
    cy.get('input[placeholder="Tags (comma-separated)"]').type('test-tag');
    cy.get('button').contains('Add').click();

    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Test Prompt`)
      .and('contain', 'Test Content')
      .and('contain', 'test-tag');

    cy.request('GET', `${baseApiUrl()}/prompts`).then((response) => {
      const testPrompts = response.body.filter(p => p.name.startsWith(TEST_PREFIX));
      expect(testPrompts).to.have.length(1);
      expect(testPrompts[0]).to.include({
        name: `${TEST_PREFIX} Test Prompt`,
        content: 'Test Content',
        tags: 'test-tag',
      });
    });
  });

  it('updates existing prompt with new values', () => {
    // Create initial test prompt
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: `${TEST_PREFIX} Old Name`,
      content: 'Old Content',
      tags: 'test-old',
    }).then((response) => {
      const promptId = response.body.id;

      cy.visit('http://localhost:3001');
      cy.get('[data-testid="prompt-list"]')
        .contains(`${TEST_PREFIX} Old Name`)
        .parent()
        .parent()
        .find('button[aria-label="Edit Prompt"]')
        .click();

      cy.get('input[placeholder="Enter prompt name"]').clear().type(`${TEST_PREFIX} New Name`);
      cy.get('textarea[placeholder="Enter prompt content"]').clear().type('New Content');
      cy.get('input[placeholder="Tags (comma-separated)"]').clear().type('test-new');
      cy.get('button').contains('Update').click();

      cy.get('[data-testid="prompt-list"]')
        .should('contain', `${TEST_PREFIX} New Name`)
        .and('contain', 'New Content')
        .and('contain', 'test-new')
        .and('not.contain', `${TEST_PREFIX} Old Name`);
    });
  });

  it('deletes prompt from the list', () => {
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: `${TEST_PREFIX} Delete Test`,
      content: 'Test Content',
      tags: 'test-delete',
    }).then(() => {
      cy.visit('http://localhost:3001');
      cy.get('[data-testid="prompt-list"]')
        .contains(`${TEST_PREFIX} Delete Test`)
        .parent()
        .parent()
        .find('button[aria-label="Delete Prompt"]')
        .click();

      cy.get('[data-testid="prompt-list"]')
        .should('not.contain', `${TEST_PREFIX} Delete Test`);
    });
  });

  it('clears all selected prompts when clicking Clear Selections', () => {
    // Create two test prompts
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: `${TEST_PREFIX} Prompt 1`,
      content: 'Content 1',
      tags: 'test1',
    }).then((response1) => {
      const id1 = response1.body.id;

      cy.request('POST', `${baseApiUrl()}/prompts`, {
        name: `${TEST_PREFIX} Prompt 2`,
        content: 'Content 2',
        tags: 'test2',
      }).then((response2) => {
        const id2 = response2.body.id;

        cy.visit('http://localhost:3001');

        // Select both prompts and wait for state updates
        cy.get(`[data-testid="checkbox-${id1}"] input[type="checkbox"]`, { timeout: 10000 })
          .click({ force: true })
          .should('be.checked');
        
        cy.get(`[data-testid="checkbox-${id2}"] input[type="checkbox"]`, { timeout: 10000 })
          .click({ force: true })
          .should('be.checked');

        // Verify Master Prompt updates
        cy.get('textarea[placeholder="Selected prompts will appear here..."]')
          .should('have.value', 'Content 1\nContent 2');

        // Verify Clear Selections button appears and click it
        cy.get('button').contains('Clear Selections')
          .should('be.visible')
          .click();

        // Verify all checkboxes are unchecked and Master Prompt is cleared
        cy.get(`[data-testid="checkbox-${id1}"] input[type="checkbox"]`).should('not.be.checked');
        cy.get(`[data-testid="checkbox-${id2}"] input[type="checkbox"]`).should('not.be.checked');
        cy.get('textarea[placeholder="Selected prompts will appear here..."]')
          .should('have.value', '');
      });
    });
  });

  it('handles invalid prompt creation gracefully', () => {
    cy.visit('http://localhost:3001');
    cy.get('input[placeholder="Enter prompt name"]').type(`${TEST_PREFIX} Invalid`);
    cy.get('input[placeholder="Tags (comma-separated)"]').type('test-invalid');
    cy.get('button').contains('Add').click();

    // Verify no test prompts were created
    cy.request('GET', `${baseApiUrl()}/prompts`).then((resp) => {
      const testPrompts = resp.body.filter(p => p.name.startsWith(TEST_PREFIX));
      expect(testPrompts).to.have.length(0);
    });
  });

  it('handles database errors gracefully', () => {
    // Intercept the GET request and return a 500 error
    cy.intercept('GET', `${baseApiUrl()}/prompts`, {
      statusCode: 500,
      body: []
    }).as('getPromptsFailure');

    cy.visit('http://localhost:3001');
    
    // Wait for the failed request
    cy.wait('@getPromptsFailure');
    
    // Verify error state is shown
    cy.get('[data-testid="prompt-list"]').should('contain', 'No prompts found');
  });
});

describe('Prompt Partner Integration - Search and Filter', () => {
  const baseApiUrl = () => Cypress.env('apiUrl') || 'http://localhost:5001';
  const TEST_PREFIX = '[TEST]';

  // Helper to clean up test prompts
  const cleanupTestPrompts = () => {
    cy.request('GET', `${baseApiUrl()}/prompts`).then((response) => {
      const testPrompts = response.body.filter(p => p.name.startsWith(TEST_PREFIX));
      testPrompts.forEach((prompt) => {
        cy.request('DELETE', `${baseApiUrl()}/prompts/${prompt.id}`);
      });
    });
  };

  beforeEach(() => {
    cleanupTestPrompts();
    
    // Create test prompts
    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: `${TEST_PREFIX} Coding Guide`,
      content: 'Write a function',
      tags: 'test-tutorial, test-javascript',
    });

    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: `${TEST_PREFIX} Writing Tutorial`,
      content: 'Write a story',
      tags: 'test-creative, test-guide',
    });

    cy.request('POST', `${baseApiUrl()}/prompts`, {
      name: `${TEST_PREFIX} Python Tips`,
      content: 'Document your code',
      tags: 'test-coding, test-python',
    });

    cy.visit('http://localhost:3001');
  });

  afterEach(() => {
    cleanupTestPrompts();
    // Clear only visible, non-readonly text inputs and textareas
    cy.get('input[type="text"]:not([readonly]), textarea:not([readonly]), input:not([type]):not([readonly])').each(($el) => {
      if ($el.is(':visible')) {
        cy.wrap($el).clear();
      }
    });
  });

  it('searches by prompt name', () => {
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Coding Guide`)
      .and('contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('contain', `${TEST_PREFIX} Python Tips`);

    cy.get('input[placeholder="Search by name or tag"]').type('Writing');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Coding Guide`)
      .and('not.contain', `${TEST_PREFIX} Python Tips`);

    cy.get('button').contains('Clear').click();
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Coding Guide`)
      .and('contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('contain', `${TEST_PREFIX} Python Tips`);
  });

  it('searches by tags', () => {
    cy.get('input[placeholder="Search by name or tag"]').type('test-python');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Python Tips`)
      .and('not.contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Coding Guide`);
  });

  it('finds matches in both name and tags', () => {
    cy.get('input[placeholder="Search by name or tag"]').type('guide');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Coding Guide`)
      .and('contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Python Tips`);
  });

  it('handles non-existent search term', () => {
    cy.get('input[placeholder="Search by name or tag"]').type('nonexistent');
    cy.get('[data-testid="prompt-list"]')
      .should('not.contain', `${TEST_PREFIX} Coding Guide`)
      .and('not.contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Python Tips`)
      .and('contain', 'No prompts found');

    cy.get('button').contains('Clear').click();
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Coding Guide`)
      .and('contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('contain', `${TEST_PREFIX} Python Tips`);
  });

  it('maintains search state when adding new prompts', () => {
    cy.get('input[placeholder="Search by name or tag"]').type('python');
    
    cy.get('input[placeholder="Enter prompt name"]').type(`${TEST_PREFIX} New Python Guide`);
    cy.get('textarea[placeholder="Enter prompt content"]').type('New content');
    cy.get('input[placeholder="Tags (comma-separated)"]').type('test-python, test-new');
    cy.get('button').contains('Add').click();

    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} New Python Guide`)
      .and('contain', `${TEST_PREFIX} Python Tips`)
      .and('not.contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Coding Guide`);
  });

  it('handles case-insensitive search', () => {
    cy.get('input[placeholder="Search by name or tag"]').type('PYTHON');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Python Tips`)
      .and('not.contain', `${TEST_PREFIX} Writing Tutorial`);

    cy.get('button').contains('Clear').click();

    cy.get('input[placeholder="Search by name or tag"]').type('TuToRiAl');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Python Tips`);
  });

  it('handles partial word matches', () => {
    cy.get('input[placeholder="Search by name or tag"]').type('cod');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Coding Guide`)
      .and('not.contain', `${TEST_PREFIX} Writing Tutorial`);

    cy.get('button').contains('Clear').click();
    
    cy.get('input[placeholder="Search by name or tag"]').type('java');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Coding Guide`)
      .and('not.contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Python Tips`);
  });

  it('handles spaces in search terms', () => {
    cy.get('input[placeholder="Search by name or tag"]').type('Writing Tutorial');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Writing Tutorial`)
      .and('not.contain', `${TEST_PREFIX} Python Tips`);

    cy.get('button').contains('Clear').click();

    cy.get('input[placeholder="Search by name or tag"]').type('test-coding');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Python Tips`);

    cy.get('button').contains('Clear').click();
    
    cy.get('input[placeholder="Search by name or tag"]').type('test-python');
    cy.get('[data-testid="prompt-list"]')
      .should('contain', `${TEST_PREFIX} Python Tips`)
      .and('not.contain', `${TEST_PREFIX} Writing Tutorial`);
  });
});