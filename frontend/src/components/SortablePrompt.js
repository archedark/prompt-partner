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
      <DragHandleIcon mr={3} color="gray.400" />
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