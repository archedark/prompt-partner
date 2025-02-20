/**
 * @file cypress.config.js
 * @description Cypress configuration file for the Prompt Partner application.
 *              Defines settings for running end-to-end tests, including base URL,
 *              test file patterns, and environment variables.
 *
 * @dependencies
 * - Cypress: End-to-end testing framework
 *
 * @notes
 * - Assumes frontend runs on http://localhost:3001 per README.md
 * - Uses JavaScript per project rules (no TypeScript)
 * - Configures for integration tests in cypress/integration/
 * - Minimal setup for MVP; can be extended for retries, screenshots, etc.
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001', // Frontend URL from README.md
    specPattern: 'cypress/integration/**/*.spec.js', // Match all .spec.js files in integration folder
    supportFile: 'cypress/support/e2e.js', // Custom support file
    env: {
      apiUrl: 'http://localhost:5001', // Backend API URL from README.md for API checks
    },
    setupNodeEvents(on, config) {
      // Placeholder for custom event handlers (e.g., task plugins) if needed later
      return config;
    },
  },
  // Disable video recording and screenshots for MVP simplicity
  video: false,
  screenshotOnRunFailure: false,
});