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
 * - Default baseUrl is http://localhost:3001 for the frontend.
 * - We'll allow overriding apiUrl via --env for the backend port.
 */

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001', // Frontend URL from README.md
    specPattern: 'cypress/integration/**/*.spec.js', // Match all .spec.js files in integration folder
    supportFile: 'cypress/support/e2e.js', // Custom support file
    env: {
      // Use a default if not overridden: typically http://localhost:5001
      apiUrl: 'http://localhost:5001',
    },
    setupNodeEvents(on, config) {
      // Placeholder for custom event handlers (e.g., task plugins) if needed later
      return config;
    },
  },
  // Disable video recording and screenshots for simplicity
  video: false,
  screenshotOnRunFailure: false,
});