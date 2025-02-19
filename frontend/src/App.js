import React, { useState, useEffect } from 'react';
import './App.css';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import MasterPrompt from './components/MasterPrompt';
import { getPrompts, createPrompt, updatePrompt, deletePrompt } from './api';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);

  useEffect(() => {
    getPrompts().then(setPrompts);
  }, []);

  const handleAddPrompt = async (content, tags) => {
    const newPromptId = await createPrompt(content, tags);
    setPrompts([{ id: newPromptId, content, tags, created_at: new Date().toISOString() }, ...prompts]);
  };

  const handleEditPrompt = async (id, content, tags) => {
    await updatePrompt(id, content, tags);
    setPrompts(prompts.map(p => (p.id === id ? { ...p, content, tags } : p)));
    setEditingPrompt(null);
  };

  const handleDeletePrompt = async (id) => {
    await deletePrompt(id);
    setPrompts(prompts.filter(p => p.id !== id));
    setSelectedPrompts(selectedPrompts.filter(pid => pid !== id));
  };

  const handleSelectPrompt = (id) => {
    setSelectedPrompts(prev => 
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const selectedPromptsText = prompts
    .filter(p => selectedPrompts.includes(p.id))
    .map(p => p.content)
    .join('\n');

  return (
    <div className="App">
      <header>
        <h1>Prompt Builder</h1>
      </header>
      <PromptEditor 
        onAddPrompt={handleAddPrompt} 
        onEditPrompt={handleEditPrompt} 
        editingPrompt={editingPrompt} 
      />
      <PromptList 
        prompts={prompts} 
        selectedPrompts={selectedPrompts} 
        onSelectPrompt={handleSelectPrompt} 
        onDeletePrompt={handleDeletePrompt} 
      />
      <MasterPrompt selectedPromptsText={selectedPromptsText} />
    </div>
  );
}

export default App;