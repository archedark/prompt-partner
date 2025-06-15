/**
 * @file App.js
 * @description Main application component for Promptner. Manages state for prompts,
 *              handles CRUD operations, renders the UI layout with tag filtering,
 *              and integrates with backend filesystem watching via a modal.
 *
 * @dependencies
 * - React: For component lifecycle and state management
 * - Chakra UI: For UI components and responsive layout
 * - api.js: For API interactions with the backend
 * - PromptList: For displaying available prompts
 * - PromptEditor: For creating/editing prompts
 * - MasterPrompt: For displaying combined selected prompts
 * - SelectedPromptList: For managing selected prompt order
 * - DirectoryManager: For managing watched directories
 *
 * @notes
 * - Fetches prompts on mount and updates state with directory prompts.
 * - Replaced directory picker with a modal for full directory management.
 * - Master Prompt now includes a condensed directory tree and checked file contents.
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
  Modal,
  ModalOverlay,
} from '@chakra-ui/react';
import PromptList from './components/PromptList';
import PromptEditor from './components/PromptEditor';
import MasterPrompt from './components/MasterPrompt';
import SelectedPromptList from './components/SelectedPromptList';
import DirectoryManager from './components/DirectoryManager';
import { getPrompts, createPrompt, updatePrompt, deletePrompt, setDirectory, updateDirectoryFileState, getFileContent, updateAllDirectoryFileStates, refreshDirectoryPrompt } from './api';

function App() {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompts, setSelectedPrompts] = useState([]);
  const [selectedPromptOrder, setSelectedPromptOrder] = useState([]);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [tagFilter, setTagFilter] = useState('');
  const [expandedStates, setExpandedStates] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
  const toast = useToast();

  const flexDirection = useBreakpointValue({ base: 'column', md: 'row' });

  const fetchPrompts = async () => {
    try {
      const data = await getPrompts();
      setPrompts(data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      // Only show toast on initial load, not during background refreshes
      if (!refreshInterval) {
        toast({
          title: 'Error Fetching Prompts',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  
  // Function to refresh prompts that can be called after a directory refresh
  const refreshPrompts = async () => {
    try {
      await fetchPrompts();
    } catch (error) {
      console.error('Error refreshing prompts:', error);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchPrompts();
    
    // Remove the polling mechanism since we're using manual refresh now
    // The polling is no longer needed as users will refresh directories manually
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
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
      
      // If this is a newly selected directory prompt, refresh it
      // TODO: Make directory auto-refresh configurable in settings menu
      if (!prev.includes(id) && newSelection.includes(id)) {
        const prompt = prompts.find(p => p.id === id);
        if (prompt && prompt.isDirectory) {
          refreshDirectoryPrompt(id)
            .then(() => {
              // Fetch updated prompts after a short delay to allow backend processing
              setTimeout(() => refreshPrompts(), 1000);
            })
            .catch(error => {
              console.error('Error refreshing directory:', error);
              toast({
                title: 'Refresh Failed',
                description: error.message,
                status: 'error',
                duration: 3000,
                isClosable: true,
              });
            });
        }
      }
      
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

  const handleFileCheckboxChange = async (promptId, filePath) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt || !prompt.isDirectory) return;

    const file = prompt.files.find(f => f.path === filePath);
    const newCheckedState = !file.isChecked;

    try {
      await updateDirectoryFileState(promptId, filePath, newCheckedState);
      setPrompts(prevPrompts =>
        prevPrompts.map(p =>
          p.id === promptId
            ? { ...p, files: p.files.map(f => f.path === filePath ? { ...f, isChecked: newCheckedState } : f) }
            : p
        )
      );
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

  const handleBulkFileCheckboxChange = async (promptId, isChecked) => {
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt || !prompt.isDirectory) return;

    try {
      await updateAllDirectoryFileStates(promptId, isChecked);
      setPrompts(prevPrompts =>
        prevPrompts.map(p =>
          p.id === promptId
            ? { ...p, files: p.files.map(f => ({ ...f, isChecked })) }
            : p
        )
      );
      toast({
        title: `Files ${isChecked ? 'Selected' : 'Deselected'}`,
        description: `All files in ${prompt.name} have been ${isChecked ? 'selected' : 'deselected'}.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Updating File States',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePromptsUpdate = (updatedPrompts) => {
    setPrompts(updatedPrompts);
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

  // Build a condensed tree structure for directory prompts
  const buildTreeText = (files, indent = '') => {
    // Filter out .git and .venv folders and their contents
    const filteredFiles = files.filter(file => {
      const parts = file.path.split(/[\\/]/).filter(Boolean);
      // Check if any part of the path is .git or .venv
      return !parts.includes('.git') && !parts.includes('.venv') && 
             // Also check if the path starts with .git/ or .git\
             !file.path.startsWith('.git/') && !file.path.startsWith('.git\\') &&
             // Exclude package-lock.json files
             !file.path.endsWith('package-lock.json') &&
             // Exclude log files
             !file.path.endsWith('.log');
    });

    const tree = {};
    filteredFiles.forEach(file => {
      const parts = file.path.split(/[\\/]/).filter(Boolean);
      let current = tree;
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = { children: {}, isFile: index === parts.length - 1, fileData: file };
        }
        current = current[part].children;
      });
    });

    const lines = [];
    const traverse = (node, levelIndent = '') => {
      Object.keys(node).forEach(name => {
        const item = node[name];
        if (item.isFile) {
          lines.push(`${levelIndent}${item.fileData.isChecked ? '[x]' : '[ ]'} ${name}`);
        } else {
          lines.push(`${levelIndent}- ${name}/`);
          traverse(item.children, levelIndent + '  ');
        }
      });
    };
    traverse(tree);
    return lines.join('\n');
  };

  const selectedPromptsText = async () => {
    const textPromises = selectedPromptOrder.map(async (id) => {
      const prompt = prompts.find(p => p.id === id);
      if (!prompt) return '';
      
      if (prompt.isDirectory) {
        // Get checked files (metadata only at this point)
        const checkedFiles = prompt.files.filter(f => 
          f.isChecked && !f.path.endsWith('package-lock.json') && !f.path.endsWith('.log')
        );
        if (!checkedFiles.length && !selectedPrompts.includes(id)) return '';
        
        // Build the tree text
        const treeText = buildTreeText(prompt.files);
        
        // Fetch content for each checked file
        const fileContentsPromises = checkedFiles.map(async (file) => {
          try {
            // Fetch the content from the backend
            const content = await getFileContent(prompt.id, file.path);
            return `\`\`\`${file.path}\n${content}\n\`\`\``;
          } catch (error) {
            console.error(`Error fetching content for ${file.path}:`, error);
            // Skip deleted files (404 errors) instead of showing error message
            if (error.status === 404 || (error.message && error.message.includes('404'))) {
              return null; // Return null for deleted files
            }
            return `\`\`\`${file.path}\n[Error loading content: ${error.message}]\n\`\`\``;
          }
        });
        
        // Wait for all file contents to be fetched
        const fileContents = await Promise.all(fileContentsPromises);
        // Filter out null values (deleted files)
        const validFileContents = fileContents.filter(content => content !== null);
        return `Directory Tree (${prompt.name}):\n${treeText}\n${validFileContents.join('\n')}`.trim();
      }
      
      return prompt.content;
    });
    
    // Wait for all text promises to resolve
    const texts = await Promise.all(textPromises);
    return texts.filter(Boolean).join('\n');
  };

  // State for the master prompt text
  const [masterPromptText, setMasterPromptText] = useState('');
  
  // Update master prompt text when selections change
  useEffect(() => {
    const updateMasterPrompt = async () => {
      const text = await selectedPromptsText();
      setMasterPromptText(text);
    };
    
    updateMasterPrompt();
    // Include prompts in the dependency array to ensure updates when files change
  }, [selectedPrompts, selectedPromptOrder, prompts]);

  return (
    <Box bg="gray.50" minH="100vh" py={6}>
      <Box maxW="1200px" mx="auto" p={4}>
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
        <Button
          onClick={() => setIsModalOpen(true)}
          colorScheme="blue"
          leftIcon={<>📁</>}
        >
          Manage Directories
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
            onBulkFileCheckboxChange={handleBulkFileCheckboxChange}
            onRefreshPrompts={refreshPrompts}
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
            <MasterPrompt selectedPromptsText={masterPromptText} />
          </Box>
        </Flex>
      </Flex>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <DirectoryManager
          onClose={() => setIsModalOpen(false)}
          onPromptsUpdate={handlePromptsUpdate}
        />
      </Modal>
      </Box>
    </Box>
  );
}

export default App;
