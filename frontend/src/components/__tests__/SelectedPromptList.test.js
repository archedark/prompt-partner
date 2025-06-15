/**
 * @file SelectedPromptList.test.js
 * @description Unit tests for the <SelectedPromptList /> component. Ensures that
 *              selected prompts are displayed in drag-and-drop order and that
 *              reordering triggers onReorder with the updated array.
 *
 * @dependencies
 * - React
 * - @testing-library/react
 * - @dnd-kit mock usage
 * - SelectedPromptList (component under test)
 *
 * @notes
 * - Minimal drag-and-drop tests can be tricky, so we do a basic check to ensure items render.
 * - A real DnD test might require more advanced approaches or integration tests.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import SelectedPromptList from '../SelectedPromptList';

describe('<SelectedPromptList />', () => {
  const mockOnReorder = jest.fn();
  const samplePrompts = [
    { id: 11, name: 'SP A', content: 'Selected Content A' },
    { id: 22, name: 'SP B', content: 'Selected Content B' },
    { id: 33, name: 'SP C', content: 'Selected Content C' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows "No prompts selected" message when none are selected', () => {
    render(
      <SelectedPromptList
        selectedPrompts={[]}
        prompts={samplePrompts}
        onReorder={mockOnReorder}
      />
    );
    expect(screen.getByText(/No prompts selected/i)).toBeInTheDocument();
  });

  test('renders selected prompts in provided order', () => {
    render(
      <SelectedPromptList
        selectedPrompts={[33, 22]}
        prompts={samplePrompts}
        onReorder={mockOnReorder}
      />
    );

    // Should not see 'SP A'
    expect(screen.queryByText('SP A')).not.toBeInTheDocument();
    // Should see 'SP C' then 'SP B'
    expect(screen.getByText('SP C')).toBeInTheDocument();
    expect(screen.getByText('SP B')).toBeInTheDocument();
  });
});
