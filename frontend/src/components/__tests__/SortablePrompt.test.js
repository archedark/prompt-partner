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

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
  }),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SortablePrompt } from '../SortablePrompt';

describe('<SortablePrompt />', () => {
  test('displays prompt name and content', () => {
    const promptData = { id: 123, name: 'Sortable Name', content: 'Sortable content' };
    render(<SortablePrompt prompt={promptData} />);

    expect(screen.getByText('Sortable Name')).toBeInTheDocument();
    expect(screen.getByText('Sortable content')).toBeInTheDocument();
  });
});
