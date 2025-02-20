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

  test('filters prompts by name or tags', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Coding Guide', content: 'Content 1', tags: 'tutorial, guide' },
      { id: 2, name: 'Writing Tutorial', content: 'Content 2', tags: 'writing' },
      { id: 3, name: 'Python Tips', content: 'Content 3', tags: 'coding, python' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or tag/i);

    // Test name-only match
    fireEvent.change(searchInput, { target: { value: 'writing' } });
    expect(screen.getByText(/Writing Tutorial/i)).toBeInTheDocument();
    expect(screen.queryByText(/Coding Guide/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Python Tips/i)).not.toBeInTheDocument();

    // Test tag-only match
    fireEvent.change(searchInput, { target: { value: 'python' } });
    expect(screen.getByText(/Python Tips/i)).toBeInTheDocument();
    expect(screen.queryByText(/Writing Tutorial/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Coding Guide/i)).not.toBeInTheDocument();

    // Test match in both name and tags
    fireEvent.change(searchInput, { target: { value: 'coding' } });
    expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Python Tips/i)).toBeInTheDocument();
    expect(screen.queryByText(/Writing Tutorial/i)).not.toBeInTheDocument();
  });

  test('search is case-insensitive', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Coding Guide', content: 'Content 1', tags: 'TUTORIAL' },
      { id: 2, name: 'WRITING Tips', content: 'Content 2', tags: 'writing' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or tag/i);

    // Test uppercase search
    fireEvent.change(searchInput, { target: { value: 'WRITING' } });
    expect(screen.getByText(/WRITING Tips/i)).toBeInTheDocument();
    
    // Test mixed case search
    fireEvent.change(searchInput, { target: { value: 'TuToRiAl' } });
    expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
  });

  test('handles partial word matching', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Coding Guide', content: 'Content 1', tags: 'tutorial' },
      { id: 2, name: 'Writing Helper', content: 'Content 2', tags: 'write' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or tag/i);

    // Test partial name match
    fireEvent.change(searchInput, { target: { value: 'cod' } });
    expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    
    // Test partial tag match
    fireEvent.change(searchInput, { target: { value: 'writ' } });
    expect(screen.getByText(/Writing Helper/i)).toBeInTheDocument();
  });

  test('handles special characters in search', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'C++ Guide', content: 'Content 1', tags: 'c++, programming' },
      { id: 2, name: 'Regular Guide', content: 'Content 2', tags: 'reg-ex' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/C\+\+ Guide/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or tag/i);

    // Test special characters in name
    fireEvent.change(searchInput, { target: { value: 'c++' } });
    expect(screen.getByText(/C\+\+ Guide/i)).toBeInTheDocument();
    
    // Test special characters in tags
    fireEvent.change(searchInput, { target: { value: 'reg-ex' } });
    expect(screen.getByText(/Regular Guide/i)).toBeInTheDocument();
  });

  test('shows empty state message when no matches found', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Coding Guide', content: 'Content 1', tags: 'tutorial' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or tag/i);
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
    
    expect(screen.getByText(/No prompts found/i)).toBeInTheDocument();
    expect(screen.queryByText(/Coding Guide/i)).not.toBeInTheDocument();
  });

  test('clears search and shows all prompts', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 1, name: 'Coding Guide', content: 'Content 1', tags: 'tutorial' },
      { id: 2, name: 'Writing Tips', content: 'Content 2', tags: 'writing' },
    ]);
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or tag/i);
    
    // Apply filter
    fireEvent.change(searchInput, { target: { value: 'coding' } });
    expect(screen.queryByText(/Writing Tips/i)).not.toBeInTheDocument();
    
    // Clear filter
    const clearButton = screen.getByText(/Clear/i);
    fireEvent.click(clearButton);
    
    expect(screen.getByText(/Coding Guide/i)).toBeInTheDocument();
    expect(screen.getByText(/Writing Tips/i)).toBeInTheDocument();
    expect(searchInput.value).toBe('');
  });
});