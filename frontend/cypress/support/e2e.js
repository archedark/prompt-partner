/**
 * @file e2e.js
 * @description Global configuration file for Cypress end-to-end tests in Prompt Partner.
 *              Imports custom commands and sets up test environment behavior.
 *
 * @dependencies
 * - Cypress: For test framework functionality
 *
 * @notes
 * - Imports commands.js for custom Cypress commands
 * - Minimal setup; can be extended for global hooks or error handling
 * - No TypeScript per project rules
 */

// Import custom commands
import './commands';

// Global configuration (e.g., hooks) can be added here if needed
// Example: Uncomment to log all uncaught exceptions
// Cypress.on('uncaught:exception', (err, runnable) => {
//   console.log(err);
//   return false; // Prevent test failure on uncaught errors
// });