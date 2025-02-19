const API_URL = process.env.REACT_APP_API_URL;

export const getPrompts = async () => {
  const response = await fetch(`${API_URL}/prompts`);
  return response.json();
};

export const createPrompt = async (name, content, tags) => {
  const response = await fetch(`${API_URL}/prompts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, content, tags }),
  });
  const { id } = await response.json();
  return id;
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