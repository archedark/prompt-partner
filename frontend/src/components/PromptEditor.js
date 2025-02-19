import React, { useState } from 'react';

const PromptEditor = ({ onAddPrompt, onEditPrompt, editingPrompt }) => {
  const [content, setContent] = useState(editingPrompt ? editingPrompt.content : '');
  const [tags, setTags] = useState(editingPrompt ? editingPrompt.tags : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPrompt) {
      onEditPrompt(editingPrompt.id, content, tags);
    } else {
      onAddPrompt(content, tags);
    }
    setContent('');
    setTags('');
  };

  return (
    <div>
      <h2>{editingPrompt ? 'Edit Prompt' : 'Add Prompt'}</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Prompt content"
          required
        />
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags (comma-separated)"
        />
        <button type="submit">{editingPrompt ? 'Update' : 'Add'}</button>
      </form>
    </div>
  );
};

export default PromptEditor;