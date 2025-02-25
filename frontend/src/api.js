/**
 * @file api.js
 * @description API interaction functions for Promptner frontend to communicate with the backend.
 *
 * @dependencies
 * - None (uses native fetch API)
 *
 * @notes
 * - Uses REACT_APP_API_URL from .env for the base URL.
 * - Enhanced error handling for all endpoints.
 * - Added setDirectory and updateDirectoryFileState for repo integration.
 */

const API_URL = process.env.REACT_APP_API_URL;

/**
 * @function getPrompts
 * @description Fetches all prompts from the backend
 * @returns {Promise<Array>} Array of prompt objects
 */
export const getPrompts = async () => {
  try {
    const response = await fetch(`${API_URL}/prompts`);
    if (!response.ok) throw new Error('Failed to fetch prompts');
    return await response.json();
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};

/**
 * @function createPrompt
 * @description Creates a new regular prompt
 * @param {string} name - Prompt name
 * @param {string} content - Prompt content
 * @param {string} tags - Comma-separated tags
 * @returns {Promise<number>} New prompt ID
 */
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
    throw error;
  }
};

/**
 * @function updatePrompt
 * @description Updates an existing prompt
 * @param {number} id - Prompt ID
 * @param {string} name - Updated name
 * @param {string} content - Updated content
 * @param {string} tags - Updated tags
 * @returns {Promise<void>}
 */
export const updatePrompt = async (id, name, content, tags) => {
  try {
    const response = await fetch(`${API_URL}/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, content, tags }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update prompt');
    }
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};

/**
 * @function deletePrompt
 * @description Deletes a prompt by ID
 * @param {number} id - Prompt ID
 * @returns {Promise<void>}
 */
export const deletePrompt = async (id) => {
  try {
    const response = await fetch(`${API_URL}/prompts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete prompt');
    }
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};

/**
 * @function setDirectory
 * @description Sends a directory path to the backend to start watching
 * @param {string} path - Directory path
 * @returns {Promise<number>} New directory prompt ID
 */
export const setDirectory = async (path) => {
  try {
    const response = await fetch(`${API_URL}/directory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to set directory');
    }
    const { id } = await response.json();
    return id;
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};

/**
 * @function updateDirectoryFileState
 * @description Updates the checkbox state of a file in a directory prompt
 * @param {number} id - Directory prompt ID
 * @param {string} filePath - File path within directory
 * @param {boolean} isChecked - New checkbox state
 * @returns {Promise<void>}
 */
export const updateDirectoryFileState = async (id, filePath, isChecked) => {
  try {
    const response = await fetch(`${API_URL}/directory/${id}/file`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath, isChecked }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update file state');
    }
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};

/**
 * @function getFileContent
 * @description Fetches the content of a specific file from a directory prompt
 * @param {number} directoryId - Directory prompt ID
 * @param {string} filePath - Path of the file within the directory
 * @returns {Promise<string>} File content
 */
export const getFileContent = async (directoryId, filePath) => {
  try {
    const response = await fetch(
      `${API_URL}/directory/${directoryId}/file?filePath=${encodeURIComponent(filePath)}`
    );
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch file content');
    }
    const data = await response.json();
    return data.content;
  } catch (error) {
    console.error('API error:', error.message);
    throw error;
  }
};