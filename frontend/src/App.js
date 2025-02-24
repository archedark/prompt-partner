/**
 * @file App.js
 * @description Main application component for Promptner. Manages state for prompts,
 *              handles CRUD operations, renders the UI layout with tag filtering,
 *              and integrates with backend filesystem watching.
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
 * - Fetches prompts on mount and updates state with directory prompts.
 * - Directory selection sends path to backend via POST /directory.
 * - File checkbox states updated via PUT /directory/:id/file.
 * - Master Prompt includes directory tree and checked file contents.
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
  useToast,
} from '@chakra-ui/react';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import MasterPrompt from './components/MasterPrompt';
import SelectedPromptList from './components/SelectedPromptList';
import { getPrompts, createPrompt, updatePrompt, deletePrompt, setDirectory, updateDirectoryFileState } from './api';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [selectedPromptOrder, setSelectedPromptOrder] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [tagFilter, setTagFilter] = useState('');
  const [expandedStates, setExpandedStates] = useState({});
  const toast = useToast();

  const flexDirection = useBreakpointValue({ base: 'column', md: 'row' });

  // Fetch prompts on mount and when directory changes
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const data = await getPrompts();
        setPrompts(data);
      } catch (error) {
        toast({
          title: 'Error Fetching Prompts',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchPrompts();
  }, []);

  const handleAddPrompt = async (name, content, tags) => {
    try {
      const newPromptId = await createPrompt(name, content, tags);
      const newPrompt = {
        id: newPromptId,
        name,
        content,
        tags,
        created_at: new Date().toISOString(),
        isDirectory: false,
        files: [],
      };
      setPrompts([newPrompt, ...prompts]);
      toast({
        title: 'Prompt Added',
        description: `${name} has been successfully added.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Adding Prompt',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEditPrompt = async (id, name, content, tags) => {
    try {
      await updatePrompt(id, name, content, tags);
      setPrompts(prompts.map(p => (p.id === id ? { ...p, name, content, tags } : p)));
      setEditingPrompt(null);
      toast({
        title: 'Prompt Updated',
        description: `${name} has been updated.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Updating Prompt',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeletePrompt = async (id) => {
    try {
      await deletePrompt(id);
      setPrompts(prompts.filter(p => p.id !== id));
      setSelectedPrompts(selectedPrompts.filter(pid => pid !== id));
      setExpandedStates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast({
        title: 'Prompt Deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Prompt',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSelectPrompt = (id) => {
    setSelectedPrompts(prev => {
      const newSelection = prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id];
      setSelectedPromptOrder(newSelection);
      return newSelection;
    });
  };

  const handleClearSelections = () => {
    setSelectedPrompts([]);
    setSelectedPromptOrder([]);
  };

  const handleTagFilterChange = (e) => setTagFilter(e.target.value);
  const clearTagFilter = () => setTagFilter('');

  const handleToggleExpand = (id) => {
    setExpandedStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCollapseAll = () => setExpandedStates({});

  const handleDirectorySelect = async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const dirPath = files[0].webkitRelativePath.split('/')[0];
    const fullPath = files[0].path || dirPath;

    try {
      const id = await setDirectory(fullPath);
      const updatedPrompts = await getPrompts();
      setPrompts(updatedPrompts);
      toast({
        title: 'Directory Added',
        description: `${dirPath} has been added as a prompt.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Adding Directory',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleFileCheckboxChange = async (promptId, filePath) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt || !prompt.isDirectory) return;

    const file = prompt.files.find(f => f.path === filePath);
    const newCheckedState = !file.isChecked;

    try {
      await updateDirectoryFileState(promptId, filePath, newCheckedState);
      setPrompts(prompts.map(p =>
        p.id === promptId
          ? { ...p, files: p.files.map(f => f.path === filePath ? { ...f, isChecked: newCheckedState } : f) }
          : p
      ));
    } catch (error) {
      toast({
        title: 'Error Updating File State',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const filteredPrompts = tagFilter
    ? prompts.filter(prompt => {
        const searchTerm = tagFilter.toLowerCase();
        if (prompt.name.toLowerCase().includes(searchTerm)) return true;
        if (!prompt.tags) return false;
        const tags = prompt.tags.toLowerCase().split(',').map(tag => tag.trim());
        return tags.some(tag => tag.includes(searchTerm));
      })
    : prompts;

  const selectedPromptsText = selectedPromptOrder
    .map(id => {
      const prompt = prompts.find(p => p.id === id);
      if (!prompt) return '';
      if (prompt.isDirectory) {
        const checkedFiles = prompt.files.filter(f => f.isChecked);
        if (!checkedFiles.length && !selectedPrompts.includes(id)) return '';
        const treeLines = prompt.files.map(file =>
          `${file.isChecked ? '[x]' : '[ ]'} ${file.path}`
        );
        const treeText = `Directory Tree (${prompt.name}):\n${treeLines.join('\n')}\n`;
        const fileContents = checkedFiles
          .map(file => `\`\`\`${file.path}\n${file.content}\n\`\`\``)
          .join('\n');
        return `${treeText}${fileContents}`;
      }
      return prompt.content;
    })
    .filter(Boolean)
    .join('\n');

  return (
    <Box p={4}>
      <Heading as="h1" size="xl" mb={4} textAlign="center">
        Promptner
      </Heading>

      <HStack mb={4} spacing={4}>
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
        <Button as="label" colorScheme="blue" leftIcon={<>📁</>}>
          Watch Directory
          <input
            type="file"
            webkitdirectory="true"
            directory="true"
            style={{ display: 'none' }}
            onChange={handleDirectorySelect}
          />
        </Button>
      </HStack>

      <Flex direction={flexDirection} gap={6}>
        <Box flex="1" mb={{ base: 4, md: 0 }}>
          <PromptList
            prompts={filteredPrompts}
            selectedPrompts={selectedPrompts}
            onSelectPrompt={handleSelectPrompt}
            onDeletePrompt={handleDeletePrompt}
            onEditPromptClick={setEditingPrompt}
            onClearSelections={handleClearSelections}
            expandedStates={expandedStates}
            onToggleExpand={handleToggleExpand}
            onCollapseAll={handleCollapseAll}
            onFileCheckboxChange={handleFileCheckboxChange}
          />
        </Box>

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