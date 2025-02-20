/**
 * @file SortablePrompt.js
 * @description A sortable item representing a selected prompt in the SelectedPromptList.
 *              Provides drag-and-drop functionality using @dnd-kit/sortable.
 *
 * @dependencies
 * - React: For component rendering
 * - @dnd-kit/sortable: For drag-and-drop functionality
 * - @dnd-kit/utilities: For CSS transform utilities
 * - Chakra UI (Box, Text, DragHandleIcon): UI components and icons
 *
 * @props
 * - prompt: Object containing prompt details (id, name, content)
 *
 * @notes
 * - Uses useSortable to enable dragging with a handle (DragHandleIcon).
 * - Added data-testid to DragHandleIcon for Cypress testing reliability.
 */
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Box, Text } from '@chakra-ui/react';
import { DragHandleIcon } from '@chakra-ui/icons';

export function SortablePrompt({ prompt }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      borderWidth="1px"
      borderRadius="md"
      p={3}
      mb={2}
      bg="white"
      display="flex"
      alignItems="center"
      cursor="grab"
      _hover={{ bg: 'gray.50' }}
      {...attributes}
      {...listeners}
    >
      <DragHandleIcon
        mr={3}
        color="gray.400"
        data-testid={`drag-handle-${prompt.id}`} // Unique test ID for Cypress
      />
      <Box flex="1">
        <Text fontWeight="bold" noOfLines={1}>
          {prompt.name}
        </Text>
        <Text color="gray.600" fontSize="sm" noOfLines={2}>
          {prompt.content}
        </Text>
      </Box>
    </Box>
  );
}