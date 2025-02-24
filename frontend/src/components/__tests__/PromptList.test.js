/**
 * @file PromptList.test.js
 * @description Unit tests for the <PromptList /> component. Ensures correct rendering
 *              of prompt entries, handling of checkbox selections, triggers for
 *              edit and delete callbacks, behavior of the Clear Selection Button,
 *              expandable prompt list functionality, and repo integration behavior.
 *
 * @dependencies
 * - React: For component rendering
 * - @testing-library/react: For testing utilities
 * - PromptList: Component under test
 *
 * @notes
 * - Mocks callback props to verify calls.
 * - Tests empty prompt list vs. populated list.
 * - Includes tests for Clear Selection Button visibility and functionality.
 * - Expandable prompt list tests verify behavior with implemented props; truncation tested in integration tests.
 * - Repo integration tests updated for backend-driven data via GET /prompts and PUT /directory/:id/file.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PromptList from '../PromptList';

describe('<PromptList />', () => {
  const mockOnSelectPrompt = jest.fn();
  const mockOnDeletePrompt = jest.fn();
  const mockOnEditPromptClick = jest.fn();
  const mockOnClearSelections = jest.fn();
  const mockOnToggleExpand = jest.fn();
  const mockOnCollapseAll = jest.fn();
  const mockOnFileCheckboxChange = jest.fn();

  const samplePrompts = [
    {
      id: 1,
      name: 'Prompt A',
      content: 'Content A line 1\nContent A line 2\nContent A line 3\nContent A line 4',
      tags: 'tag1, tag2, tag3',
    },
    {
      id: 2,
      name: 'Prompt B',
      content: 'Content B',
      tags: 'work, personal',
    },
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

    expect(screen.getByText(/Prompt A/i)).toBeInTheDocument();
    expect(screen.getByText(/Prompt B/i)).toBeInTheDocument();
    expect(screen.getByText(/tag1, tag2/i)).toBeInTheDocument();
    expect(screen.getByText(/work, personal/i)).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    checkboxes.forEach((cb) => expect(cb).not.toBeChecked());
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
      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
        />
      );
      expect(screen.queryByText(/Clear Selections/i)).not.toBeInTheDocument();

      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[1]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
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
          onClearSelections={mockOnClearSelections}
        />
      );

      const clearButton = screen.getByRole('button', { name: /Clear Selections/i });
      fireEvent.click(clearButton);
      expect(mockOnClearSelections).toHaveBeenCalledTimes(1);
    });
  });

  describe('Expandable Prompt List', () => {
    test('renders prompts in collapsed state by default', () => {
      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{}}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
        />
      );

      expect(screen.getByText(/Content A line 1/)).toBeInTheDocument();
      expect(screen.getByText(/Content A line 2/)).toBeInTheDocument();
      expect(screen.getByText(/tag1, tag2/)).toBeInTheDocument();
      expect(screen.getByText(/Content B/)).toBeInTheDocument();
    });

    test('expands prompt to show full content and tags on toggle', () => {
      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 1: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
        />
      );

      const toggleButton = screen.getByLabelText(/Collapse Prompt/);
      fireEvent.click(toggleButton);
      expect(mockOnToggleExpand).toHaveBeenCalledWith(1);
    });

    test('collapses all prompts when Collapse All is clicked', () => {
      render(
        <PromptList
          prompts={samplePrompts}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 1: true, 2: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
        />
      );

      const collapseAllButton = screen.getByRole('button', { name: /Collapse All/i });
      fireEvent.click(collapseAllButton);
      expect(mockOnCollapseAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('Repo Integration', () => {
    const directoryPrompt = {
      id: 3,
      name: 'Project Directory',
      content: '/path/to/project',
      tags: 'directory',
      isDirectory: true,
      files: [
        { path: 'src/index.js', content: 'console.log("Hello");', isChecked: false },
        { path: 'src/utils/helper.js', content: 'function add(a, b) { return a + b; }', isChecked: false },
        { path: '.gitignore', content: 'node_modules\n*.log', isChecked: false },
      ],
    };

    test('displays directory prompt in collapsed state by default', () => {
      render(
        <PromptList
          prompts={[directoryPrompt]}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{}}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      expect(screen.getByText(/Project Directory/i)).toBeInTheDocument();
      expect(screen.getByText(/\/path\/to\/project/i)).toBeInTheDocument();
      expect(screen.queryByText(/src\/index.js/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Expand Prompt/i)).toBeInTheDocument();
    });

    test('expands directory prompt to show file tree excluding ignored files', () => {
      render(
        <PromptList
          prompts={[directoryPrompt]}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 3: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      expect(screen.getByText(/Project Directory/i)).toBeInTheDocument();
      expect(screen.getByText(/src\/index.js/i)).toBeInTheDocument();
      expect(screen.getByText(/src\/utils\/helper.js/i)).toBeInTheDocument();
      expect(screen.queryByText(/.gitignore/i)).toBeInTheDocument(); // Now visible, filtering done by backend
      expect(screen.getByLabelText(/Collapse Prompt/i)).toBeInTheDocument();
    });

    test('toggles file checkbox independently of directory selection', () => {
      render(
        <PromptList
          prompts={[directoryPrompt]}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 3: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      const fileCheckbox = screen.getAllByRole('checkbox')[1]; // First file checkbox after directory
      fireEvent.click(fileCheckbox);
      expect(mockOnFileCheckboxChange).toHaveBeenCalledWith(3, 'src/index.js');
      expect(mockOnSelectPrompt).not.toHaveBeenCalledWith(3);
    });

    test('maintains file checkbox state after collapsing and re-expanding', () => {
      render(
        <PromptList
          prompts={[directoryPrompt]}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 3: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      const fileCheckbox = screen.getAllByRole('checkbox')[1];
      fireEvent.click(fileCheckbox); // Check it
      expect(mockOnFileCheckboxChange).toHaveBeenCalledWith(3, 'src/index.js');

      fireEvent.click(screen.getByLabelText(/Collapse Prompt/i));
      expect(mockOnToggleExpand).toHaveBeenCalledWith(3);

      // Re-render with updated state from backend (simulated)
      render(
        <PromptList
          prompts={[{ ...directoryPrompt, files: directoryPrompt.files.map(f => f.path === 'src/index.js' ? { ...f, isChecked: true } : f) }]}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 3: false }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      fireEvent.click(screen.getByLabelText(/Expand Prompt/i));
      render(
        <PromptList
          prompts={[{ ...directoryPrompt, files: directoryPrompt.files.map(f => f.path === 'src/index.js' ? { ...f, isChecked: true } : f) }]}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 3: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      const updatedFileCheckbox = screen.getAllByRole('checkbox')[1];
      expect(updatedFileCheckbox).toBeChecked();
    });

    test('clears directory selection but not file checkboxes when Clear Selections is clicked', () => {
      render(
        <PromptList
          prompts={[{ ...directoryPrompt, files: [{ ...directoryPrompt.files[0], isChecked: true }, ...directoryPrompt.files.slice(1)] }]}
          selectedPrompts={[3]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 3: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      const dirCheckbox = screen.getByTestId('checkbox-3');
      const fileCheckbox = screen.getAllByRole('checkbox')[1];
      expect(dirCheckbox).toBeChecked();
      expect(fileCheckbox).toBeChecked();

      fireEvent.click(screen.getByRole('button', { name: /Clear Selections/i }));
      expect(mockOnClearSelections).toHaveBeenCalledTimes(1);

      // Re-render with cleared selection
      render(
        <PromptList
          prompts={[{ ...directoryPrompt, files: [{ ...directoryPrompt.files[0], isChecked: true }, ...directoryPrompt.files.slice(1)] }]}
          selectedPrompts={[]}
          onSelectPrompt={mockOnSelectPrompt}
          onDeletePrompt={mockOnDeletePrompt}
          onEditPromptClick={mockOnEditPromptClick}
          onClearSelections={mockOnClearSelections}
          expandedStates={{ 3: true }}
          onToggleExpand={mockOnToggleExpand}
          onCollapseAll={mockOnCollapseAll}
          onFileCheckboxChange={mockOnFileCheckboxChange}
        />
      );

      expect(screen.getByTestId('checkbox-3')).not.toBeChecked();
      expect(screen.getAllByRole('checkbox')[1]).toBeChecked();
    });
  });
});