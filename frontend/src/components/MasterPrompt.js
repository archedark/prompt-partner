/**
 * @file MasterPrompt.js
 * @description Displays the combined text of selected prompts and offers a copy-to-clipboard feature.
 *
 * @dependencies
 * - React
 * - Chakra UI (Box, Heading, Textarea, Button, Badge, HStack, Tooltip)
 * - @chakra-ui/toast (useToast) for toast notifications
 * - gpt-tokenizer: For accurate GPT token counting
 *
 * @props
 * - selectedPromptsText: String containing the combined content of all selected prompts
 *
 * @notes
 * - Utilizes the Clipboard API for copying.
 * - Shows a toast notification on successful copy.
 * - Uses GPT-3 tokenizer for accurate token counts.
 * - Repo Integration Requirements:
 *   - Content Inclusion: Include full contents of checked files from directory prompts (fetched via backend) in the selectedPromptsText.
 *   - Directory Tree Section: Precede file contents with a formatted directory tree of the watched directory.
 *   - Formatting: Delineate file contents with markdown-style code blocks (e.g., ```filename\ncontent\n```), matching the prompt file's delineation style.
 */

import React from 'react';
import {
  Box,
  Heading,
  Textarea,
  Button,
  Badge,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { countTokens, getTokenColorScheme, DEFAULT_MAX_TOKENS } from '../utils/tokenizer';

const MasterPrompt = ({ selectedPromptsText }) => {
  const toast = useToast();
  const tokenCount = countTokens(selectedPromptsText);
  const colorScheme = getTokenColorScheme(tokenCount);

  /**
   * @function handleCopy
   * @description Copies the Master Prompt to the clipboard, then shows a success toast.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(selectedPromptsText);
    toast({
      title: 'Copied!',
      description: 'Master Prompt copied to clipboard.',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <Heading as="h2" size="md" mb={3}>
        Master Prompt
      </Heading>
      <Textarea
        value={selectedPromptsText}
        placeholder="Selected prompts will appear here..."
        isReadOnly
        mb={2}
      />
      <HStack spacing={2}>
        <Button
          colorScheme="blue"
          onClick={handleCopy}
          disabled={!selectedPromptsText}
        >
          Copy to Clipboard
        </Button>
        <Tooltip 
          label={`${((tokenCount / DEFAULT_MAX_TOKENS) * 100).toFixed(1)}% of maximum ${DEFAULT_MAX_TOKENS.toLocaleString()} tokens`}
          placement="top"
        >
          <Badge 
            colorScheme={colorScheme}
            variant="subtle" 
            fontSize="md"
          >
            {tokenCount.toLocaleString()} tokens
          </Badge>
        </Tooltip>
      </HStack>
    </Box>
  );
};

export default MasterPrompt;