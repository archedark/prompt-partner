/**
 * @file App.js
 * @description Main application component. Sets up the high-level layout using Chakra UI components:
 * - Header at the top
 * - Two-column layout for prompt list & editor on larger screens
 * - Master prompt area displayed below on small screens or to the right on large screens
 *
 * @dependencies
 * - React, useState, useEffect
 * - Chakra UI (Box, Flex, Heading, useBreakpointValue)
 * - Local modules: PromptList, PromptEditor, MasterPrompt, api calls (getPrompts, createPrompt, updatePrompt, deletePrompt)
 *
 * @notes
 * - Uses Chakra's responsive design with 'Flex' and 'Box' to arrange sections.
 * - Manages state for prompts, selected prompts, and editing logic.
 */

import React, { useState, useEffect } from 'react';
import { Box, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import './App.css';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import MasterPrompt from './components/MasterPrompt';
import { getPrompts, createPrompt, updatePrompt, deletePrompt } from './api';

function App() {
  // State: all prompts, list of selected prompt IDs, currently editing prompt (if any)
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);

  // Decide layout direction based on viewport size (e.g., stack on mobile, row on desktop)
  const flexDirection = useBreakpointValue({ base: 'column', md: 'row' });

  // Fetch prompts on component mount
  useEffect(() => {
    (async () => {
      const data = await getPrompts();
      setPrompts(data);
    })();
  }, []);

  /**
   * @function handleAddPrompt
   * @description Create a new prompt in the database, then update local state
   * @param {string} content - The text content of the prompt
   * @param {string} tags - A comma-separated string of tags
   */
  const handleAddPrompt = async (content, tags) => {
    const newPromptId = await createPrompt(content, tags);
    setPrompts([
      {
        id: newPromptId,
        content,
        tags,
        created_at: new Date().toISOString(),
      },
      ...prompts,
    ]);
  };

  /**
   * @function handleEditPrompt
   * @description Update an existing prompt in the database, then update local state
   * @param {number} id - The unique ID of the prompt
   * @param {string} content - The updated prompt content
   * @param {string} tags - Updated tags (comma-separated)
   */
  const handleEditPrompt = async (id, content, tags) => {
    await updatePrompt(id, content, tags);
    setPrompts(
      prompts.map((p) => (p.id === id ? { ...p, content, tags } : p))
    );
    setEditingPrompt(null);
  };

  /**
   * @function handleDeletePrompt
   * @description Delete a prompt in the database, then remove it from local state
   * @param {number} id - The unique ID of the prompt to delete
   */
  const handleDeletePrompt = async (id) => {
    await deletePrompt(id);
    setPrompts(prompts.filter((p) => p.id !== id));
    setSelectedPrompts(selectedPrompts.filter((pid) => pid !== id));
  };

  /**
   * @function handleSelectPrompt
   * @description Toggles selection of a prompt ID in the local state
   * @param {number} id - The unique ID of the prompt
   */
  const handleSelectPrompt = (id) => {
    setSelectedPrompts((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // Combine selected prompts' text
  const selectedPromptsText = prompts
    .filter((p) => selectedPrompts.includes(p.id))
    .map((p) => p.content)
    .join('\n');

  return (
    <Box p={4}>
      {/* Header */}
      <Heading as="h1" size="xl" mb={4} textAlign="center">
        Prompt Partner
      </Heading>

      {/* Layout for PromptList + PromptEditor + MasterPrompt */}
      <Flex direction={flexDirection} gap={6}>
        {/* Left Column: PromptList */}
        <Box flex="1" mb={{ base: 4, md: 0 }}>
          <PromptList
            prompts={prompts}
            selectedPrompts={selectedPrompts}
            onSelectPrompt={handleSelectPrompt}
            onDeletePrompt={handleDeletePrompt}
            onEditPromptClick={setEditingPrompt}
          />
        </Box>

        {/* Right Column: PromptEditor + MasterPrompt in a vertical stack */}
        <Flex direction="column" flex="1" gap={6}>
          <Box>
            <PromptEditor
              onAddPrompt={handleAddPrompt}
              onEditPrompt={handleEditPrompt}
              editingPrompt={editingPrompt}
            />
          </Box>
          <Box>
            <MasterPrompt selectedPromptsText={selectedPromptsText} />
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

export default App;