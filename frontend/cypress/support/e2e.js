/**
 * @file e2e.js
 * @description Cypress global configuration and custom commands for end-to-end testing.
 *
 * @dependencies
 * - Cypress: For test framework and command API
 *
 * @notes
 * - Imports commands.js for additional custom commands (if any).
 * - Defines a custom dragTo command for @dnd-kit drag-and-drop simulation.
 * - Ensures proper event simulation for React and @dnd-kit compatibility.
 */
import './commands';

// Custom command to simulate drag-and-drop for @dnd-kit/sortable
Cypress.Commands.add('dragTo', { prevSubject: 'element' }, (subject, targetSelector, options = {}) => {
  const { xOffset = 0, yOffset = 0 } = options;

  // Get the source element's coordinates
  cy.wrap(subject).then(($source) => {
    const sourceRect = $source[0].getBoundingClientRect();
    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;

    // Get the target element's coordinates
    cy.get(targetSelector).then(($target) => {
      const targetRect = $target[0].getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2 + xOffset;
      const targetY = targetRect.top + targetRect.height / 2 + yOffset;

      // Simulate drag: mousedown -> mousemove -> mouseup
      cy.wrap($source)
        .trigger('mousedown', { which: 1, pageX: sourceX, pageY: sourceY, force: true })
        .trigger('mousemove', { pageX: sourceX, pageY: sourceY, force: true }) // Start drag
        .trigger('mousemove', { pageX: targetX, pageY: targetY, force: true }) // Move to target
        .trigger('mouseup', { pageX: targetX, pageY: targetY, force: true });
    });
  });
});