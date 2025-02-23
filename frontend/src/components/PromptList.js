/**
 * @file PromptList.js
 * @description Displays a scrollable list of prompts with checkboxes, expand/collapse toggles,
 *              plus edit/delete buttons and clear selections/collapse all options.
 *
 * @dependencies
 * - React: For component rendering
 * - Chakra UI (Box, Text, Checkbox, IconButton, Stack, Heading, Flex, Button): UI components
 * - @chakra-ui/icons (DeleteIcon, EditIcon, ChevronDownIcon, ChevronUpIcon): Action button icons
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
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

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
            <Flex
              key={prompt.id}
              borderWidth="1px"
              borderRadius="md"
              p={3}
              alignItems="center"
              justifyContent="space-between"
            >
              {/* Checkbox */}
              <Box position="relative" mr={3}>
                <Checkbox
                  data-testid={`checkbox-${prompt.id}`} // Unique test ID for Cypress
                  isChecked={selectedPrompts.includes(prompt.id)}
                  onChange={() => onSelectPrompt(prompt.id)}
                  alignSelf="center" // Maintain vertical centering
                />
              </Box>
              {/* Prompt Content */}
              <Box flex="1">
                <Text fontWeight="bold" noOfLines={1}>
                  {prompt.name}
                </Text>
                <Text color="gray.600" noOfLines={isExpanded ? undefined : 2}>
                  {prompt.content}
                </Text>
                {prompt.tags && (
                  <Text color="gray.600" fontSize="sm" noOfLines={isExpanded ? undefined : 1}>
                    Tags: {prompt.tags}
                  </Text>
                )}
                {isExpanded && (
                  <Text color="gray.500" fontSize="xs">
                    Created: {new Date(prompt.created_at).toLocaleString()}
                  </Text>
                )}
              </Box>
              {/* Actions */}
              <Flex gap={2}>
                <IconButton
                  aria-label={isExpanded ? 'Collapse Prompt' : 'Expand Prompt'}
                  icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                  size="sm"
                  onClick={() => onToggleExpand(prompt.id)}
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