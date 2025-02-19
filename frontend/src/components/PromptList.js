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

export default PromptList;