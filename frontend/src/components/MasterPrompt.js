/**
 * @file MasterPrompt.js
 * @description Displays the combined text of selected prompts and offers a copy-to-clipboard feature.
 *
 * @dependencies
 * - React
 * - Chakra UI (Box, Heading, Textarea, Button, Badge, HStack, Tooltip, VStack, Text, Spinner)
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

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Textarea,
  Button,
  Badge,
  HStack,
  Tooltip,
  useToast,
  VStack,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { countTokens, getTokenColorScheme, DEFAULT_MAX_TOKENS } from '../utils/tokenizer';

const MasterPrompt = ({ selectedPromptsText }) => {
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  // Track loading state based on whether selectedPromptsText is empty
  useEffect(() => {
    // If selectedPromptsText is empty but we expect content (based on previous state)
    // then we're probably loading content
    setIsLoading(selectedPromptsText === '' && isLoading);
  }, [selectedPromptsText]);
  
  // Combine both texts for token counting and copying
  const combinedText = [selectedPromptsText, additionalInstructions]
    .filter(Boolean)
    .join('\n\n');
  
  const tokenCount = countTokens(combinedText);
  const colorScheme = getTokenColorScheme(tokenCount);

  /**
   * @function handleCopy
   * @description Copies the Master Prompt to the clipboard, then shows a success toast.
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(combinedText).then(
      () => {
        toast({
          title: 'Copied to clipboard',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Failed to copy',
          description: err.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    );
  };

  return (
    <Box bg="white" p={4} borderRadius="md" boxShadow="sm">
      <HStack mb={2} justify="space-between">
        <Heading as="h2" size="md">
          Master Prompt
        </Heading>
        <HStack>
          <Tooltip label={`${tokenCount} tokens out of ${DEFAULT_MAX_TOKENS} max`}>
            <Badge colorScheme={colorScheme} variant="subtle">
              {tokenCount} tokens
            </Badge>
          </Tooltip>
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleCopy}
            isDisabled={!combinedText.trim() || isLoading}
          >
            Copy to Clipboard
          </Button>
        </HStack>
      </HStack>

      <VStack spacing={3} align="stretch">
        <Box position="relative">
          <Textarea
            value={selectedPromptsText}
            readOnly
            height="300px"
            placeholder="Selected prompts will appear here..."
            resize="vertical"
          />
          {isLoading && (
            <Box 
              position="absolute" 
              top="0" 
              left="0" 
              right="0" 
              bottom="0" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
              bg="rgba(255, 255, 255, 0.7)"
            >
              <Spinner size="xl" />
              <Text ml={3}>Loading file contents...</Text>
            </Box>
          )}
        </Box>
        
        <Textarea
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          placeholder="Add additional instructions here..."
          size="sm"
          rows={3}
        />
      </VStack>
    </Box>
  );
};

export default MasterPrompt;
