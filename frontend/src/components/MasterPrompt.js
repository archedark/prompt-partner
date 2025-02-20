/**
 * @file MasterPrompt.js
 * @description Displays the combined text of selected prompts and offers a copy-to-clipboard feature.
 *
 * @dependencies
 * - React
 * - Chakra UI (Box, Heading, Textarea, Button)
 * - @chakra-ui/toast (useToast) for toast notifications
 *
 * @props
 * - selectedPromptsText: String containing the combined content of all selected prompts
 *
 * @notes
 * - Utilizes the Clipboard API for copying.
 * - Shows a toast notification on successful copy.
 */

import React from 'react';
import {
  Box,
  Heading,
  Textarea,
  Button,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';

const MasterPrompt = ({ selectedPromptsText }) => {
  const toast = useToast();

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
      {/*
        Instead of `isDisabled`, use the standard HTML `disabled` attribute
        so that our mocked <Button> in tests actually shows up as disabled.
      */}
      <Button
        colorScheme="blue"
        onClick={handleCopy}
        disabled={!selectedPromptsText}
      >
        Copy to Clipboard
      </Button>
    </Box>
  );
};

export default MasterPrompt;