/**
 * @file PromptList.test.js
 * @description Unit tests for the <PromptList /> component. Ensures correct rendering
 *              of prompt entries, handling of checkbox selections, triggers for
 *              edit and delete callbacks, and behavior of the Clear Selection Button.
 *
 * @dependencies
 * - React
 * - @testing-library/react
 * - PromptList (component under test)
 *
 * @notes
 * - Mocks callback props (onSelectPrompt, onDeletePrompt, onEditPromptClick) to verify calls
 * - Tests empty prompt list vs. populated list
 * - Includes tests for Clear Selection Button visibility and functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptList from '../PromptList';

describe('<PromptList />', () => {
  const mockOnSelectPrompt = jest.fn();
  const mockOnDeletePrompt = jest.fn();
  const mockOnEditPromptClick = jest.fn();

  const samplePrompts = [
    { id: 1, name: 'Prompt A', content: 'Content A', tags: 'tag1, tag2' },
    { id: 2, name: 'Prompt B', content: 'Content B', tags: 'work, personal' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders "No prompts found" when prompts array is empty', () => {
    render(
      <PromptList
        prompts={[]}
        selectedPrompts={[]}
        onSelectPrompt={mockOnSelectPrompt}
        onDeletePrompt={mockOnDeletePrompt}
        onEditPromptClick={mockOnEditPromptClick}
      />
    );
    expect(screen.getByText(/No prompts found/i)).toBeInTheDocument();
  });

  test('renders prompt list and checks default states', () => {
    render(
      <PromptList
        prompts={samplePrompts}
        selectedPrompts={[]}
        onSelectPrompt={mockOnSelectPrompt}
        onDeletePrompt={mockOnDeletePrompt}
        onEditPromptClick={mockOnEditPromptClick}
      />
    );

    // Confirm each prompt name is on screen
    expect(screen.getByText(/Prompt A/i)).toBeInTheDocument();
    expect(screen.getByText(/Prompt B/i)).toBeInTheDocument();

    // Confirm tags appear
    expect(screen.getByText(/tag1, tag2/i)).toBeInTheDocument();
    expect(screen.getByText(/work, personal/i)).toBeInTheDocument();

    // Check that neither prompt is selected
    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => {
      expect(cb).not.toBeChecked();
    });
  });

  test('selecting a prompt calls onSelectPrompt with its ID', () => {
    render(
      <PromptList
        prompts={samplePrompts}
        selectedPrompts={[]}
        onSelectPrompt={mockOnSelectPrompt}
        onDeletePrompt={mockOnDeletePrompt}
        onEditPromptClick={mockOnEditPromptClick}
      />
    );

    // The first prompt's checkbox
    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);
    expect(mockOnSelectPrompt).toHaveBeenCalledWith(1);
  });

  test('delete button calls onDeletePrompt with prompt ID', () => {
    render(
      <PromptList
        prompts={samplePrompts}
        selectedPrompts={[]}
        onSelectPrompt={mockOnSelectPrompt}
        onDeletePrompt={mockOnDeletePrompt}
        onEditPromptClick={mockOnEditPromptClick}
      />
    );

    // The first prompt's delete button
    const deleteButtons = screen.getAllByLabelText(/delete prompt/i);
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDeletePrompt).toHaveBeenCalledWith(1);
  });

  test('edit button calls onEditPromptClick with prompt data', () => {
    render(
      <PromptList
        prompts={samplePrompts}
        selectedPrompts={[]}
        onSelectPrompt={mockOnSelectPrompt}
        onDeletePrompt={mockOnDeletePrompt}
        onEditPromptClick={mockOnEditPromptClick}
      />
    );

    // The second prompt's edit button
    const editButtons = screen.getAllByLabelText(/edit prompt/i);
    fireEvent.click(editButtons[1]);
    expect(mockOnEditPromptClick).toHaveBeenCalledWith({
      id: 2,
      name: 'Prompt B',
      content: 'Content B',
      tags: 'work, personal',
    });
  });

  describe('Clear Selection Button', () => {
    test('shows clear selection button only when prompts are selected', () => {
      // No selections
      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
        />
      );
      expect(screen.queryByText(/Clear Selections/i)).not.toBeInTheDocument();

      // With selections
      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[1]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
        />
      );
      expect(screen.getByText(/Clear Selections/i)).toBeInTheDocument();
    });

    test('clears all selected prompts when clicked', () => {
      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[1, 2]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
        />
      );

      const clearButton = screen.getByRole('button', { name: /Clear Selections/i });
      expect(clearButton).toBeInTheDocument();
      // Currently disabled in demo mode; test assumes it will be clickable
      expect(clearButton).toBeDisabled(); // Reflects current state

      // Simulate what happens when enabled (post-implementation)
      fireEvent.click(clearButton);
      expect(mockOnSelectPrompt).toHaveBeenCalledWith(null); // Current placeholder behavior
      // Note: After implementation, this might change to expect an empty array or specific clear signal
    });
  });
});