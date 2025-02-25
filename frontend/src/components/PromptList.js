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
 * - onClearSelections: Function to clear all selections
 * - expandedStates: Object mapping prompt IDs to boolean (expanded state)
 * - onToggleExpand: Function to toggle prompt expansion state
 * - onCollapseAll: Function to collapse all prompts
 * - onFileCheckboxChange: Function to toggle file checkbox state in directory prompts
 *
 * @notes
 * - Added recursive file tree rendering with collapsible states via FileTree component.
 * - Maintains separate expanded states for prompts and file tree nodes.
 */
import React, { useState } from 'react';
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
} from '@chakra-ui/react';
import { 
  DeleteIcon, 
  EditIcon, 
  ChevronDownIcon, 
  ChevronUpIcon,
  CopyIcon,
} from '@chakra-ui/icons';
import { countTokens, getTokenColorScheme } from '../utils/tokenizer';
import FileTree from './FileTree';

const PromptList = ({
  prompts,
  selectedPrompts,
  onSelectPrompt,
  onDeletePrompt,
  onEditPromptClick,
  onClearSelections,
  expandedStates = {},
  onToggleExpand,
  onCollapseAll,
  onFileCheckboxChange,
}) => {
  const toast = useToast();
  const [expandedFileStates, setExpandedFileStates] = useState({});

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

  return (
    <Box>
      <Heading as="h2" size="md" mb={3}>
        Prompts
      </Heading>
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