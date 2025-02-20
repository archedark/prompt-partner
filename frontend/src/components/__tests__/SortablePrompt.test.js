/**
 * @file SortablePrompt.test.js
 * @description Minimal test for the <SortablePrompt /> component. Ensures prompt
 *              content is displayed. Full drag-and-drop mechanics are tested in
 *              SelectedPromptList or via integration tests.
 *
 * @dependencies
 * - React
 * - @testing-library/react
 * - SortablePrompt (component under test)
 *
 * @notes
 * - We do not fully test DnD logic here; that usually requires advanced setups.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SortablePrompt } from '../SortablePrompt';

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: jest.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
  })),
}));

describe('<SortablePrompt />', () => {
  test('displays prompt name and content', () => {
    const promptData = { id: 123, name: 'Sortable Name', content: 'Sortable content' };
    render(<SortablePrompt prompt={promptData} />);

    expect(screen.getByText('Sortable Name')).toBeInTheDocument();
    expect(screen.getByText('Sortable content')).toBeInTheDocument();
  });
});