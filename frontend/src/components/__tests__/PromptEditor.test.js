/**
 * @file PromptEditor.test.js
 * @description Unit tests for the <PromptEditor /> component. Ensures correct form
 *              rendering in "add" vs. "edit" modes, and verifies submissions.
 *
 * @dependencies
 * - React
 * - @testing-library/react
 * - PromptEditor (component under test)
 *
 * @notes
 * - Mocks onAddPrompt and onEditPrompt to verify correct calls
 * - Distinguishes between "Add Prompt" and "Edit Prompt" headings
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptEditor from '../PromptEditor';

describe('<PromptEditor />', () => {
  const mockOnAddPrompt = jest.fn();
  const mockOnEditPrompt = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders add prompt form when editingPrompt is null', () => {
    render(
      <PromptEditor
        onAddPrompt={mockOnAddPrompt}
        onEditPrompt={mockOnEditPrompt}
        editingPrompt={null}
      />
    );

    expect(screen.getByText(/Add Prompt/i)).toBeInTheDocument();
    const nameInput = screen.getByPlaceholderText(/Enter prompt name/i);
    const contentTextarea = screen.getByPlaceholderText(/Enter prompt content/i);

    // Fill out the form
    fireEvent.change(nameInput, { target: { value: 'New Prompt' } });
    fireEvent.change(contentTextarea, { target: { value: 'New content' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Add/i });
    fireEvent.click(submitButton);

    // Expect onAddPrompt to have been called with arguments
    expect(mockOnAddPrompt).toHaveBeenCalledWith('New Prompt', 'New content', '');
  });

  test('renders edit prompt form when editingPrompt is provided', () => {
    const editingData = {
      id: 3,
      name: 'Editing Name',
      content: 'Editing content',
      tags: 'tagX,tagY',
    };

    render(
      <PromptEditor
        onAddPrompt={mockOnAddPrompt}
        onEditPrompt={mockOnEditPrompt}
        editingPrompt={editingData}
      />
    );

    expect(screen.getByText(/Edit Prompt/i)).toBeInTheDocument();
    const nameInput = screen.getByDisplayValue(/Editing Name/i);
    const contentTextarea = screen.getByDisplayValue(/Editing content/i);
    const tagsInput = screen.getByDisplayValue(/tagX,tagY/i);

    // Modify the form
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.change(contentTextarea, { target: { value: 'Updated content' } });
    fireEvent.change(tagsInput, { target: { value: 'tagUpdated' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(submitButton);

    // Expect onEditPrompt to have been called
    expect(mockOnEditPrompt).toHaveBeenCalledWith(
      3,
      'Updated Name',
      'Updated content',
      'tagUpdated'
    );
  });
});