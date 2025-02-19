const API_URL = 'http://localhost:5000';

export const getPrompts = async () => {
  const response = await fetch(`${API_URL}/prompts`);
  return response.json();
};

export const createPrompt = async (content, tags) => {
  const response = await fetch(`${API_URL}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, tags }),
  });
  const { id } = await response.json();
  return id;
};

export const updatePrompt = async (id, content, tags) => {
  await fetch(`${API_URL}/prompts/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, tags }),
  });
};

export const deletePrompt = async (id) => {
  await fetch(`${API_URL}/prompts/${id}`, {
    method: 'DELETE',
  });
};