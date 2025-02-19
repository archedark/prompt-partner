/**
 * @file PromptEditor.js
 * @description A form for adding or editing a prompt (content + tags).
 *
 * @dependencies
 * - React
 * - Chakra UI (Box, Heading, Textarea, Input, Button, Stack)
 *
 * @props
 * - onAddPrompt: Function to handle creation of a new prompt
 * - onEditPrompt: Function to handle editing of an existing prompt
 * - editingPrompt: The prompt object currently being edited, or null
 *
 * @notes
 * - If editingPrompt is provided, the form is in "edit mode" and calls onEditPrompt.
 * - Otherwise, it calls onAddPrompt.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Textarea,
  Input,
  Button,
  Stack,
} from '@chakra-ui/react';

const PromptEditor = ({ onAddPrompt, onEditPrompt, editingPrompt }) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  /**
   * @function resetForm
   * @description Helper function to clear local state
   */
  const resetForm = () => {
    setName('');
    setContent('');
    setTags('');
  };

  // When editingPrompt changes (to an actual prompt), fill the form
  useEffect(() => {
    if (editingPrompt) {
      setName(editingPrompt.name);
      setContent(editingPrompt.content);
      setTags(editingPrompt.tags);
    } else {
      resetForm();
    }
  }, [editingPrompt]);

  /**
   * @function handleSubmit
   * @description Dispatches either an add or edit action based on whether editingPrompt is set
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPrompt) {
      onEditPrompt(editingPrompt.id, name, content, tags);
    } else {
      onAddPrompt(name, content, tags);
    }
    resetForm();
  };

  return (
    <Box>
      <Heading as="h2" size="md" mb={3}>
        {editingPrompt ? 'Edit Prompt' : 'Add Prompt'}
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter prompt name"
            required
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter prompt content"
            required
          />
          <Input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma-separated)"
          />
          <Button colorScheme="teal" type="submit">
            {editingPrompt ? 'Update' : 'Add'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default PromptEditor;