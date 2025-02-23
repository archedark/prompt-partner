/**
 * @file App.js
 * @description Main application component for Promptner. Manages state for prompts,
 *              handles CRUD operations, and renders the UI layout with tag filtering.
 *
 * @dependencies
 * - React: For component lifecycle and state management
 * - Chakra UI: For UI components and responsive layout
 * - api.js: For API interactions with the backend
 * - PromptList: For displaying available prompts
 * - PromptEditor: For creating/editing prompts
 * - MasterPrompt: For displaying combined selected prompts
 * - SelectedPromptList: For managing selected prompt order
 *
 * @notes
 * - Fetches prompts on mount using useEffect
 * - Uses responsive layout with Chakra's useBreakpointValue
 * - Implements tag filtering with real-time updates
 * - Handles edge cases like empty prompt lists
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Flex,
  useBreakpointValue,
  Input,
  Button,
  HStack,
} from '@chakra-ui/react';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import MasterPrompt from './components/MasterPrompt';
import SelectedPromptList from './components/SelectedPromptList';
import { getPrompts, createPrompt, updatePrompt, deletePrompt } from './api';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [selectedPromptOrder, setSelectedPromptOrder] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [tagFilter, setTagFilter] = useState('');

  // Responsive layout: column on mobile, row on desktop
  const flexDirection = useBreakpointValue({ base: 'column', md: 'row' });

  // Fetch prompts on component mount
  useEffect(() => {
    const fetchPrompts = async () => {
      const data = await getPrompts();
      setPrompts(data);
    };
    fetchPrompts();
  }, []);

  /**
   * @function handleAddPrompt
   * @description Creates a new prompt in the database and updates local state
   * @param {string} name - Prompt name
   * @param {string} content - Prompt content
   * @param {string} tags - Comma-separated tags
   */
  const handleAddPrompt = async (name, content, tags) => {
    const newPromptId = await createPrompt(name, content, tags);
    setPrompts([
      {
        id: newPromptId,
        name,
        content,
        tags,
        created_at: new Date().toISOString(),
      },
      ...prompts,
    ]);
  };

  /**
   * @function handleEditPrompt
   * @description Updates an existing prompt and refreshes local state
   * @param {number} id - Prompt ID
   * @param {string} name - Updated name
   * @param {string} content - Updated content
   * @param {string} tags - Updated tags
   */
  const handleEditPrompt = async (id, name, content, tags) => {
    await updatePrompt(id, name, content, tags);
    setPrompts(
      prompts.map((p) => (p.id === id ? { ...p, name, content, tags } : p))
    );
    setEditingPrompt(null);
  };

  /**
   * @function handleDeletePrompt
   * @description Deletes a prompt and updates local state
   * @param {number} id - Prompt ID to delete
   */
  const handleDeletePrompt = async (id) => {
    await deletePrompt(id);
    setPrompts(prompts.filter((p) => p.id !== id));
    setSelectedPrompts(selectedPrompts.filter((pid) => pid !== id));
  };

  /**
   * @function handleSelectPrompt
   * @description Toggles prompt selection
   * @param {number} id - Prompt ID
   */
  const handleSelectPrompt = (id) => {
    setSelectedPrompts((prev) => {
      const newSelection = prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id];
      setSelectedPromptOrder(newSelection);
      return newSelection;
    });
  };

  /**
   * @function handleClearSelections
   * @description Clears all selected prompts by resetting the selection arrays
   */
  const handleClearSelections = () => {
    setSelectedPrompts([]);
    setSelectedPromptOrder([]);
  };

  /**
   * @function handleTagFilterChange
   * @description Updates the tag filter state
   * @param {string} value - Filter input value
   */
  const handleTagFilterChange = (e) => {
    setTagFilter(e.target.value);
  };

  /**
   * @function clearTagFilter
   * @description Resets the tag filter
   */
  const clearTagFilter = () => {
    setTagFilter('');
  };

  // Filter prompts based on tagFilter
  const filteredPrompts = tagFilter
    ? prompts.filter((prompt) => {
        const searchTerm = tagFilter.toLowerCase();
        // Search in name
        if (prompt.name.toLowerCase().includes(searchTerm)) return true;
        // Search in tags
        if (!prompt.tags) return false;
        const tags = prompt.tags.toLowerCase().split(',').map((tag) => tag.trim());
        return tags.some(tag => tag.includes(searchTerm));
      })
    : prompts;

  // Generate combined text based on selected order
  const selectedPromptsText = selectedPromptOrder
    .map((id) => prompts.find((p) => p.id === id)?.content)
    .filter(Boolean)
    .join('\n');

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={4} textAlign="center">
        Promptner
      </Heading>
      
      {/* Tag Filter Input */}
      <HStack mb={4}>
        <Input
          placeholder="Search by name or tag"
          value={tagFilter}
          onChange={handleTagFilterChange}
          maxW="300px"
        />
        <Button
          onClick={clearTagFilter}
          colorScheme="gray"
          isDisabled={!tagFilter}
        >
          Clear Filter
        </Button>
      </HStack>

      <Flex direction={flexDirection} gap={6}>
        {/* Left Column: PromptList */}
        <Box flex="1" mb={{ base: 4, md: 0 }}>
          <PromptList
            prompts={filteredPrompts}
            selectedPrompts={selectedPrompts}
            onSelectPrompt={handleSelectPrompt}
            onDeletePrompt={handleDeletePrompt}
            onEditPromptClick={setEditingPrompt}
            onClearSelections={handleClearSelections}
          />
        </Box>

        {/* Right Column: PromptEditor + SelectedPromptList + MasterPrompt */}
        <Flex direction="column" flex="1" gap={6}>
          <Box>
            <PromptEditor
              onAddPrompt={handleAddPrompt}
              onEditPrompt={handleEditPrompt}
              editingPrompt={editingPrompt}
            />
          </Box>
          <Box>
            <SelectedPromptList
              selectedPrompts={selectedPromptOrder}
              prompts={prompts}
              onReorder={setSelectedPromptOrder}
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