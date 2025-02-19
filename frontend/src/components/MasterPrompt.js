import React from 'react';

const MasterPrompt = ({ selectedPromptsText }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(selectedPromptsText);
    alert('Master Prompt copied to clipboard!');
  };

  return (
    <div>
      <h2>Master Prompt</h2>
      <textarea value={selectedPromptsText} readOnly />
      <button onClick={handleCopy}>Copy to Clipboard</button>
    </div>
  );
};

export default MasterPrompt;