import React from 'react';

const PromptList = ({ prompts, selectedPrompts, onSelectPrompt, onDeletePrompt }) => {
  return (
    <div>
      <h2>Prompts</h2>
      <ul>
        {prompts.map(prompt => (
          <li key={prompt.id}>
            <input
              type="checkbox"
              checked={selectedPrompts.includes(prompt.id)}
              onChange={() => onSelectPrompt(prompt.id)}
            />
            {prompt.content} <em>({prompt.tags})</em>
            <button onClick={() => onDeletePrompt(prompt.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const getPrompts = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/prompts`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching prompts:', error);
        throw error;
    }
};

export default PromptList;