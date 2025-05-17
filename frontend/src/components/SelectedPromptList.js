/**
 * @file SelectedPromptList.js
 * @description Displays a list of selected prompts with drag-and-drop reordering functionality.
 *
 * @dependencies
 * - React: For component rendering
 * - @dnd-kit/core: For drag-and-drop context and sensors
 * - @dnd-kit/sortable: For sortable list functionality
 * - Chakra UI (Box, Heading, Text): UI components
 * - SortablePrompt: Child component for individual draggable prompts
 *
 * @props
 * - selectedPrompts: Array of selected prompt IDs
 * - prompts: Array of all prompt objects
 * - onReorder: Function to handle reordering of selected prompts
 *
 * @notes
 * - Uses @dnd-kit for drag-and-drop with Pointer and Keyboard sensors.
 * - Filters prompts to display only selected ones.
 * - Added data-testid for Cypress visibility checks.
 */
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortablePrompt } from './SortablePrompt';
import { Box, Heading, Text } from '@chakra-ui/react';

const SelectedPromptList = ({ selectedPrompts, prompts, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // `over` can be null if the item is dropped outside the list
    if (over && active.id !== over.id) {
      const oldIndex = selectedPrompts.indexOf(active.id);
      const newIndex = selectedPrompts.indexOf(over.id);
      onReorder(arrayMove(selectedPrompts, oldIndex, newIndex));
    }
  };

  const selectedPromptObjects = selectedPrompts
    .map(id => prompts.find(p => p.id === id))
    .filter(Boolean);

  return (
    <Box data-testid="selected-prompts-order">
      <Heading as="h2" size="md" mb={3}>
        Selected Prompts Order
      </Heading>
      {selectedPromptObjects.length === 0 ? (
        <Text fontStyle="italic" color="gray.500">
          No prompts selected. Select prompts from the list above.
        </Text>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedPrompts}
            strategy={verticalListSortingStrategy}
          >
            {selectedPromptObjects.map((prompt) => (
              <SortablePrompt key={prompt.id} prompt={prompt} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </Box>
  );
};

export default SelectedPromptList;