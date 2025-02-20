/**
 * @file PromptList.test.js
 * @description Unit tests for the <PromptList /> component. Ensures correct rendering
 *              of prompt entries, handling of checkbox selections, and triggers for
 *              edit and delete callbacks.
 *
 * @dependencies
 * - React
 * - @testing-library/react
 * - PromptList (component under test)
 *
 * @notes
 * - Mocks callback props (onSelectPrompt, onDeletePrompt, onEditPromptClick) to verify calls
 * - Tests empty prompt list vs. populated list
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
});