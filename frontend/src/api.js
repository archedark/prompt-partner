/**
 * @file api.js
 * @description API interaction functions for Promptner frontend to communicate with the backend.
 *
 * @dependencies
 * - None (uses native fetch API)
 *
 * @notes
 * - Uses REACT_APP_API_URL from .env for the base URL.
 * - Enhanced error handling in createPrompt to catch and report failures, especially for large prompts.
 * - All functions are async and return promises.
 */

const API_URL = process.env.REACT_APP_API_URL;

export const getPrompts = async () => {
  const response = await fetch(`${API_URL}/prompts`);
  return response.json();
};

export const createPrompt = async (name, content, tags) => {
  try {
    const response = await fetch(`${API_URL}/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, tags }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create prompt');
    }
    const { id } = await response.json();
    return id;
  } catch (error) {
    console.error('API error:', error.message);
    throw error; // Propagate error to caller for UI feedback
  }
};

export const updatePrompt = async (id, name, content, tags) => {
  await fetch(`${API_URL}/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content, tags }),
  });
};

export const deletePrompt = async (id) => {
  await fetch(`${API_URL}/prompts/${id}`, {
    method: 'DELETE',
  });
};