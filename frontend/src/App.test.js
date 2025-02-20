/**
 * @file App.test.js
 * @description Updated tests for <App />, focusing on basic app rendering, including
 *              the Prompt Partner header and initial fetch call for prompts.
 *
 * @dependencies
 * - React
 * - @testing-library/react
 * - App component
 *
 * @notes
 * - Removes default "learn react" link test
 * - Mocks getPrompts call from the api
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
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

    // Check for the app header
    expect(screen.getByText(/Prompt Partner/i)).toBeInTheDocument();
  });

  test('fetches and displays prompts on mount', async () => {
    api.getPrompts.mockResolvedValueOnce([
      { id: 101, name: 'Test Prompt', content: 'Test Content' },
    ]);

    render(<App />);
    // Wait for the fetch to resolve and the data to appear
    await waitFor(() => {
      expect(screen.getByText(/Test Prompt/i)).toBeInTheDocument();
    });
    expect(api.getPrompts).toHaveBeenCalledTimes(1);
  });
});