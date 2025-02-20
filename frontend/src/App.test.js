/**
 * @file App.test.js
 * @description Tests for <App /> component, verifying basic rendering,
 *              prompt fetching, and tag filtering functionality.
 *
 * @dependencies
 * - React: For component rendering
 * - @testing-library/react: For testing utilities
 * - App: Component under test
 * - api.js: Mocked API interactions
 *
 * @notes
 * - Mocks getPrompts API call
 * - Tests tag filtering with sample data
 * - Ensures filter clears correctly
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import App from './App';
import * as api from './api';

jest.mock('./api');

describe('<App />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the main header', async () => {
    api.getPrompts.mockResolvedValueOnce([]);
    render(<App />);
    expect(screen.getByText(/Prompt Partner/i)).toBeInTheDocument();
  });

  test('fetches and displays prompts on mount', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 101, name: 'Test Prompt', content: 'Test Content', tags: 'test' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Test Prompt/i)).toBeInTheDocument();
    });
    expect(api.getPrompts).toHaveBeenCalledTimes(1);
  });

  test('filters prompts by tag', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Prompt 1', content: 'Content 1', tags: 'coding, ai' },
      { id: 2, name: 'Prompt 2', content: 'Content 2', tags: 'writing' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Prompt 1/i)).toBeInTheDocument();
      expect(screen.getByText(/Prompt 2/i)).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText(/Filter by tag/i);
    fireEvent.change(filterInput, { target: { value: 'coding' } });
    expect(screen.getByText(/Prompt 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/Prompt 2/i)).not.toBeInTheDocument();
  });

  test('clears tag filter', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Prompt 1', content: 'Content 1', tags: 'coding' },
      { id: 2, name: 'Prompt 2', content: 'Content 2', tags: 'writing' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Prompt 1/i)).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText(/Filter by tag/i);
    fireEvent.change(filterInput, { target: { value: 'coding' } });
    expect(screen.queryByText(/Prompt 2/i)).not.toBeInTheDocument();

    const clearButton = screen.getByText(/Clear Filter/i);
    fireEvent.click(clearButton);
    await waitFor(() => {
      expect(screen.getByText(/Prompt 2/i)).toBeInTheDocument();
    });
  });

  test('filters prompts by partial tag match', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Prompt 1', content: 'Content 1', tags: 'coding, ai' },
      { id: 2, name: 'Prompt 2', content: 'Content 2', tags: 'writing' },
      { id: 3, name: 'Prompt 3', content: 'Content 3', tags: 'code, testing' },
    ]);
    
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Prompt 1/i)).toBeInTheDocument();
    });

    const filterInput = screen.getByPlaceholderText(/Filter by tag/i);
    fireEvent.change(filterInput, { target: { value: 'cod' } });

    expect(screen.getByText(/Prompt 1/i)).toBeInTheDocument(); // has 'coding'
    expect(screen.getByText(/Prompt 3/i)).toBeInTheDocument(); // has 'code'
    expect(screen.queryByText(/Prompt 2/i)).not.toBeInTheDocument(); // has 'writing'
  });
});