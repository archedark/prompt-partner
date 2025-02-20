/**
 * @file commands.js
 * @description Custom Cypress commands for Prompt Partner integration tests.
 *              Provides reusable commands to simplify test writing.
 *
 * @dependencies
 * - Cypress: For extending command functionality
 *
 * @notes
 * - Initially minimal; can be extended with commands like resetDatabase()
 * - No TypeScript per project rules
 * - Commands can be used in specs like promptCreation.spec.js
 */

// Add custom commands here
// Example: Reset database (uncomment and adjust if backend supports it)
// Cypress.Commands.add('resetDatabase', () => {
//   cy.request('DELETE', `${Cypress.env('apiUrl')}/prompts/reset`);
// });