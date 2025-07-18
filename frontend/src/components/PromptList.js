/**
 * @file PromptList.js
 * @description Displays a scrollable list of prompts with checkboxes, expand/collapse toggles,
 *              plus edit/delete buttons and clear selections/collapse all options.
 *              Supports directory prompts with recursive, collapsible file trees.
 *
 * @dependencies
 * - React: For component rendering
 * - Chakra UI: For UI components
 * - @chakra-ui/icons: For action button icons
 * - gpt-tokenizer: For token counting
 * - FileTree: For rendering recursive directory structures
 *
 * @props
 * - prompts: Array of prompt objects (id, name, content, tags, created_at, isDirectory, files)
 * - selectedPrompts: Array of selected prompt IDs
 * - onSelectPrompt: Function to toggle prompt selection by ID
 * - onDeletePrompt: Function to delete a prompt by ID
 * - onEditPromptClick: Function to set editingPrompt state
 * - onAddPromptClick: Function to add a new prompt
 * - onClearSelections: Function to clear all selections
 * - expandedStates: Object mapping prompt IDs to boolean (expanded state)
 * - onToggleExpand: Function to toggle prompt expansion state
 * - onCollapseAll: Function to collapse all prompts
 * - onFileCheckboxChange: Function to toggle file checkbox state in directory prompts
 * - onBulkFileCheckboxChange: Function to toggle bulk file checkbox state in directory prompts
 * - onFileExcludeToggle: Function to toggle file exclusion state in directory prompts
 * - onBulkFileExcludeToggle: Function to toggle bulk file exclusion state in directory prompts
 * - onRefreshPrompts: Function to refresh prompts after directory refresh
 *
 * @notes
 * - Added recursive file tree rendering with collapsible states via FileTree component.
 * - Maintains separate expanded states for prompts and file tree nodes.
 * - Added refresh button for directory prompts to manually update file list.
 */
import React, { useState, useRef } from 'react';
import {
  Box,
  Text,
  Checkbox,
  IconButton,
  Stack,
  Heading,
  Flex,
  Button,
  useToast,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  EditIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  CopyIcon,
  RepeatIcon,
  AddIcon,
  DownloadIcon,
} from '@chakra-ui/icons';
import { countTokens, getTokenColorScheme } from '../utils/tokenizer';
import FileTree from './FileTree';
import { refreshDirectoryPrompt } from '../api';

const PromptList = ({
  prompts,
  selectedPrompts,
  onSelectPrompt,
  onDeletePrompt,
  onEditPromptClick,
  onAddPromptClick,
  onClearSelections,
  expandedStates = {},
  onToggleExpand,
  onCollapseAll,
  onFileCheckboxChange,
  onBulkFileCheckboxChange,
  onFileExcludeToggle,
  onBulkFileExcludeToggle,
  onRefreshPrompts,
}) => {
  const toast = useToast();
  const [expandedFileStates, setExpandedFileStates] = useState({});
  const [refreshingDirectories, setRefreshingDirectories] = useState({});

  // Ref for hidden file input used for importing backups
  const fileInputRef = useRef(null);

  const handleCopyPrompt = async (content, name) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: `Copied prompt: ${name}`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Failed to copy prompt',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleToggleFileExpand = (path) => {
    setExpandedFileStates(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCollapseAllFiles = () => {
    setExpandedFileStates({});
  };

  const handleRefreshDirectory = async (promptId) => {
    if (refreshingDirectories[promptId]) return; // Prevent multiple refreshes
    
    setRefreshingDirectories(prev => ({ ...prev, [promptId]: true }));
    
    try {
      await refreshDirectoryPrompt(promptId);
      toast({
        title: 'Directory Refreshed',
        description: 'The directory files are being updated.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
      // Fetch updated prompts after a short delay to allow backend processing
      setTimeout(async () => {
        if (onRefreshPrompts) {
          await onRefreshPrompts();
        }
        setRefreshingDirectories(prev => ({ ...prev, [promptId]: false }));
      }, 1000);
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setRefreshingDirectories(prev => ({ ...prev, [promptId]: false }));
    }
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        throw new Error('Invalid JSON in backup file');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      toast({
        title: 'Backup Imported',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      // Refresh prompts list in parent if callback provided
      if (onRefreshPrompts) {
        await onRefreshPrompts();
      }
    } catch (err) {
      toast({
        title: 'Import Failed',
        description: err.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
      <Flex align="center" justify="space-between" mb={3}>
        <Heading as="h2" size="md" m={0}>
          Prompts
        </Heading>
        <Flex gap={2}>
          <Tooltip label="Add Prompt" hasArrow>
            <IconButton
              aria-label="Add Prompt"
              icon={<AddIcon />}
              colorScheme="green"
              variant="solid"
              size="sm"
              borderRadius="md"
              onClick={onAddPromptClick}
            />
          </Tooltip>
          <Tooltip label="Export Prompts" hasArrow>
            <IconButton
              aria-label="Export Prompts"
              icon={<DownloadIcon />}
              colorScheme="blue"
              variant="solid"
              size="sm"
              borderRadius="md"
              onClick={async () => {
                try {
                  const response = await fetch(`${process.env.REACT_APP_API_URL}/backup`);
                  if (!response.ok) throw new Error('Failed to download backup');
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  const dateStr = new Date().toISOString().split('T')[0];
                  link.href = url;
                  link.setAttribute('download', `prompt-backup-${dateStr}.json`);
                  document.body.appendChild(link);
                  link.click();
                  link.parentNode.removeChild(link);
                  window.URL.revokeObjectURL(url);
                  toast({
                    title: 'Backup Downloaded',
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                  });
                } catch (err) {
                  toast({
                    title: 'Download Failed',
                    description: err.message,
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            />
          </Tooltip>
          <Tooltip label="Import Prompts" hasArrow>
            <IconButton
              aria-label="Import Prompts"
              icon={<DownloadIcon transform="rotate(180deg)" />}
              colorScheme="purple"
              variant="solid"
              size="sm"
              borderRadius="md"
              onClick={handleImportClick}
            />
          </Tooltip>
          {/* Hidden file input */}
          <input
            type="file"
            accept="application/json"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileSelected}
          />
        </Flex>
      </Flex>
      <Stack spacing={4} maxH="400px" overflowY="auto" pr={2} data-testid="prompt-list">
        {prompts.length === 0 && (
          <Text fontStyle="italic" color="gray.500">
            No prompts found. Add a new prompt or directory.
          </Text>
        )}
        {prompts.map(prompt => {
          const isExpanded = expandedStates[prompt.id] || false;
          return (
            <Box
              key={prompt.id}
              borderWidth="1px"
              borderRadius="md"
              position="relative"
            >
              <Flex
                p={3}
                pb={2}
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={isExpanded ? '1px' : '0'}
                borderBottomColor="gray.200"
                bg="white"
                borderTopRadius="md"
                position="sticky"
                top={0}
                zIndex={1}
              >
                <Flex alignItems="center" flex="1">
                  <Box mr={3}>
                    <Checkbox
                      data-testid={`checkbox-${prompt.id}`}
                      isChecked={selectedPrompts.includes(prompt.id)}
                      onChange={() => onSelectPrompt(prompt.id)}
                    />
                  </Box>
                  <Text fontWeight="bold" noOfLines={1}>
                    {prompt.name}
                  </Text>
                </Flex>
                <Flex gap={2} alignItems="center">
                  {!prompt.isDirectory && (
                    <Badge
                      colorScheme={getTokenColorScheme(countTokens(prompt.content))}
                      variant="subtle"
                    >
                      {countTokens(prompt.content)} tokens
                    </Badge>
                  )}
                  {prompt.isDirectory && (
                    <IconButton
                      aria-label="Refresh Directory"
                      icon={<RepeatIcon />}
                      size="sm"
                      isLoading={refreshingDirectories[prompt.id]}
                      onClick={() => handleRefreshDirectory(prompt.id)}
                      title="Refresh directory files"
                    />
                  )}
                  <IconButton
                    aria-label={isExpanded ? 'Collapse Prompt' : 'Expand Prompt'}
                    icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    size="sm"
                    onClick={() => onToggleExpand(prompt.id)}
                  />
                  <IconButton
                    aria-label="Copy Prompt"
                    icon={<CopyIcon />}
                    size="sm"
                    onClick={() => handleCopyPrompt(prompt.content, prompt.name)}
                  />
                  <IconButton
                    aria-label="Edit Prompt"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() =>
                      onEditPromptClick({
                        id: prompt.id,
                        name: prompt.name,
                        content: prompt.content,
                        tags: prompt.tags,
                      })
                    }
                    isDisabled={prompt.isDirectory} // Disable edit for directories
                  />
                  <IconButton
                    aria-label="Delete Prompt"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => onDeletePrompt(prompt.id)}
                  />
                </Flex>
              </Flex>
              <Box p={3} pt={2}>
                <Box
                  maxH={isExpanded ? '300px' : 'auto'}
                  overflowY={isExpanded ? 'auto' : 'hidden'}
                  pr={isExpanded ? 2 : 0}
                >
                  {prompt.isDirectory && isExpanded ? (
                    <FileTree
                      files={prompt.files}
                      promptId={prompt.id}
                      onFileCheckboxChange={onFileCheckboxChange}
                      onBulkFileCheckboxChange={onBulkFileCheckboxChange}
                      onFileExcludeToggle={onFileExcludeToggle}
                      onBulkFileExcludeToggle={onBulkFileExcludeToggle}
                      expandedStates={expandedFileStates}
                      onToggleExpand={handleToggleFileExpand}
                    />
                  ) : (
                    <Text color="gray.600" noOfLines={isExpanded ? undefined : 2}>
                      {prompt.content}
                    </Text>
                  )}
                  {prompt.tags && (
                    <Text color="gray.600" fontSize="sm" noOfLines={isExpanded ? undefined : 1} mt={2}>
                      Tags: {prompt.tags}
                    </Text>
                  )}
                  {isExpanded && !prompt.isDirectory && (
                    <Text color="gray.500" fontSize="xs" mt={2}>
                      Created: {new Date(prompt.created_at).toLocaleString()}
                    </Text>
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Stack>
      <Stack direction="row" mt={4} spacing={2}>
        <Button
          colorScheme="gray"
          onClick={() => {
            onCollapseAll();
            handleCollapseAllFiles();
          }}
          isDisabled={Object.values(expandedStates).every(state => !state) && 
                      Object.values(expandedFileStates).every(state => !state)}
        >
          Collapse All
        </Button>
        {selectedPrompts.length > 0 && (
          <Button colorScheme="blue" onClick={onClearSelections}>
            Clear Selections
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default PromptList;
