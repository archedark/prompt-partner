/**
 * @file PromptList.js
 * @description Displays a scrollable list of prompts with checkboxes, expand/collapse toggles,
 *              plus edit/delete buttons and clear selections/collapse all options.
 *
 * @dependencies
 * - React: For component rendering
 * - Chakra UI (Box, Text, Checkbox, IconButton, Stack, Heading, Flex, Button, useToast, Badge): UI components
 * - @chakra-ui/icons (DeleteIcon, EditIcon, ChevronDownIcon, ChevronUpIcon, CopyIcon): Action button icons
 * - gpt-tokenizer: For accurate GPT token counting
 *
 * @props
 * - prompts: Array of prompt objects (id, name, content, tags, created_at)
 * - selectedPrompts: Array of selected prompt IDs
 * - onSelectPrompt: Function to toggle prompt selection by ID
 * - onDeletePrompt: Function to delete a prompt by ID
 * - onEditPromptClick: Function to set the editingPrompt state in App
 * - onClearSelections: Function to clear all selected prompts
 * - expandedStates: Object mapping prompt IDs to boolean (true if expanded)
 * - onToggleExpand: Function to toggle expansion state by prompt ID
 * - onCollapseAll: Function to collapse all prompts
 *
 * @notes
 * - Each prompt includes a checkbox, content, tags, expand/collapse toggle, Edit, and Delete buttons.
 * - Checkbox has a data-testid for Cypress targeting, avoiding overlap issues.
 * - Added data-testid to Stack for broader Cypress targeting.
 * - Clear Selections button is enabled when prompts are selected and triggers onClearSelections.
 * - Expandable Prompt List Requirements:
 *   - Display: Checkbox, prompt text, tags, and an expand/collapse toggle button per prompt.
 *   - Collapsed View: Shows first 2-3 lines of prompt text, truncated tag list (with '...' for more), and collapsed state indicator (ChevronDownIcon).
 *   - Expanded View: Full prompt text (scrollable if long), complete tag list, metadata (created_at), and expanded state indicator (ChevronUpIcon).
 *   - State Persistence: Store expanded/collapsed state in local storage (to be implemented later).
 *   - Bulk Collapse: 'Collapse All' button collapses all prompts at once.
 *   - Token Count: Display token count per prompt (overlaps with feature 8; deferred).
 * - Uses GPT-3 tokenizer for accurate token counts.
 */

import React from 'react';
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
}) => {
  const toast = useToast();

  const handleCopyPrompt = async (content, name) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: `Copied prompt: ${name}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy prompt",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Heading as="h2" size="md" mb={3}>
        Prompts
      </Heading>
      <Stack spacing={4} maxH="400px" overflowY="auto" pr={2} data-testid="prompt-list">
        {prompts.length === 0 && (
          <Text fontStyle="italic" color="gray.500">
            No prompts found. Add a new prompt.
          </Text>
        )}
        {prompts.map((prompt) => {
          const isExpanded = expandedStates[prompt.id] || false;
          return (
            <Box
              key={prompt.id}
              borderWidth="1px"
              borderRadius="md"
              position="relative"
            >
              {/* Fixed Header with Actions */}
              <Flex
                p={3}
                pb={2}
                alignItems="center"
                justifyContent="space-between"
                borderBottomWidth={isExpanded ? "1px" : "0"}
                borderBottomColor="gray.200"
                bg="white"
                borderTopRadius="md"
                position="sticky"
                top={0}
                zIndex={1}
              >
                {/* Checkbox and Name */}
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
                {/* Actions */}
                <Flex gap={2} alignItems="center">
                  <Badge 
                    colorScheme={getTokenColorScheme(countTokens(prompt.content))}
                    variant="subtle"
                  >
                    {countTokens(prompt.content)} tokens
                  </Badge>
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
              {/* Scrollable Content */}
              <Box p={3} pt={2}>
                <Box 
                  maxH={isExpanded ? "300px" : "auto"} 
                  overflowY={isExpanded ? "auto" : "hidden"}
                  pr={isExpanded ? 2 : 0} // Add padding for scrollbar
                >
                  <Text color="gray.600" noOfLines={isExpanded ? undefined : 2}>
                    {prompt.content}
                  </Text>
                  {prompt.tags && (
                    <Text color="gray.600" fontSize="sm" noOfLines={isExpanded ? undefined : 1}>
                      Tags: {prompt.tags}
                    </Text>
                  )}
                  {isExpanded && (
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
      {/* Action Buttons */}
      <Stack direction="row" mt={4} spacing={2}>
        <Button
          colorScheme="gray"
          onClick={onCollapseAll}
          isDisabled={Object.values(expandedStates).every(state => !state)}
        >
          Collapse All
        </Button>
        {selectedPrompts.length > 0 && (
          <Button
            colorScheme="blue"
            onClick={onClearSelections}
          >
            Clear Selections
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default PromptList;