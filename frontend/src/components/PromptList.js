/**
 * @file PromptList.js
 * @description Displays a scrollable list of prompts with checkboxes, plus edit/delete buttons.
 *
 * @dependencies
 * - React
 * - Chakra UI (Box, Text, Checkbox, IconButton, Stack, Heading, Flex, Button)
 * - @chakra-ui/icons (DeleteIcon, EditIcon) for action buttons
 *
 * @props
 * - prompts: Array of prompt objects (id, content, tags, created_at)
 * - selectedPrompts: Array of selected prompt IDs
 * - onSelectPrompt: Function to toggle prompt selection
 * - onDeletePrompt: Function to delete a prompt by ID
 * - onEditPromptClick: Function to set the editingPrompt state in App
 *
 * @notes
 * - Each prompt includes a checkbox, content, tags, Edit and Delete buttons.
 * - Added import for DeleteIcon and EditIcon from @chakra-ui/icons.
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
import { DeleteIcon, EditIcon } from '@chakra-ui/icons'; // Added import for icons

const PromptList = ({
  prompts,
  selectedPrompts,
  onSelectPrompt,
  onDeletePrompt,
  onEditPromptClick,
}) => {
  return (
    <Box>
      <Heading as="h2" size="md" mb={3}>
        Prompts
      </Heading>
      <Stack spacing={4} maxH="400px" overflowY="auto" pr={2}>
        {prompts.length === 0 && (
          <Text fontStyle="italic" color="gray.500">
            No prompts found. Add a new prompt.
          </Text>
        )}
        {prompts.map((prompt) => (
          <Flex
            key={prompt.id}
            borderWidth="1px"
            borderRadius="md"
            p={3}
            alignItems="center"
            justifyContent="space-between"
          >
            <Checkbox
              isChecked={selectedPrompts.includes(prompt.id)}
              onChange={() => onSelectPrompt(prompt.id)}
              mr={3}
            />
            <Box flex="1">
              <Text fontWeight="bold" noOfLines={1}>
                {prompt.content}
              </Text>
              {prompt.tags && (
                <Text color="gray.600" fontSize="sm">
                  Tags: {prompt.tags}
                </Text>
              )}
            </Box>
            <Flex gap={2}>
              <IconButton
                aria-label="Edit Prompt"
                icon={<EditIcon />}
                size="sm"
                onClick={() =>
                  onEditPromptClick({
                    id: prompt.id,
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
        ))}
      </Stack>
      {/* Optional: Clear Selections Button */}
      {selectedPrompts.length > 0 && (
        <Button
          mt={4}
          colorScheme="blue"
          onClick={() => {
            // If we want a quick way to clear all selected prompts
            // we can pass an empty array to onSelectPrompt
            // but in this setup, clearing is managed in the parent.
            // We'll do it inline here for convenience:
            onSelectPrompt(null); // We'll just do something invalid to indicate no selection
          }}
          isDisabled
        >
          Clear Selections (demo - not active)
        </Button>
      )}
    </Box>
  );
};

export default PromptList;