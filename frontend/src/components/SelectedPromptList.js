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

    if (active.id !== over.id) {
      const oldIndex = selectedPrompts.indexOf(active.id);
      const newIndex = selectedPrompts.indexOf(over.id);
      onReorder(arrayMove(selectedPrompts, oldIndex, newIndex));
    }
  };

  const selectedPromptObjects = selectedPrompts
    .map(id => prompts.find(p => p.id === id))
    .filter(Boolean);

  return (
    <Box>
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