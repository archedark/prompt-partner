/**
 * @file DirectoryManager.js
 * @description A modal component for managing watched directories in Promptner.
 *              Allows adding new directories via input field and removing existing ones.
 *
 * @dependencies
 * - React: For component state and lifecycle
 * - Chakra UI: For modal UI components
 * - api.js: For API calls to manage directories
 *
 * @props
 * - onClose: Function to close the modal
 * - onPromptsUpdate: Function to update parent App's prompts state after changes
 *
 * @notes
 * - Fetches directories on mount using GET /directories.
 * - Adds directories via POST /directory with user-input paths.
 * - Removes directories via DELETE /directory/:id.
 * - Updates parent state after each operation to reflect changes.
 */

import React, { useState, useEffect } from 'react';
import {
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  HStack,
  VStack,
  Text,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { getPrompts, setDirectory, deletePrompt } from '../api';

const DirectoryManager = ({ onClose, onPromptsUpdate }) => {
  const [directories, setDirectories] = useState([]);
  const [newDirPath, setNewDirPath] = useState('');
  const toast = useToast();

  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        const prompts = await getPrompts();
        const dirPrompts = prompts.filter(p => p.isDirectory);
        setDirectories(dirPrompts);
      } catch (error) {
        toast({
          title: 'Error Fetching Directories',
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchDirectories();
  }, []);

  const handleAddDirectory = async () => {
    if (!newDirPath.trim()) {
      toast({
        title: 'Path Required',
        description: 'Please enter a directory path.',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    try {
      await setDirectory(newDirPath);
      const updatedPrompts = await getPrompts();
      const updatedDirs = updatedPrompts.filter(p => p.isDirectory);
      setDirectories(updatedDirs);
      onPromptsUpdate(updatedPrompts);
      setNewDirPath('');
      toast({
        title: 'Directory Added',
        description: `${newDirPath} is now being watched.`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Adding Directory',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteDirectory = async (id) => {
    try {
      await deletePrompt(id);
      const updatedPrompts = await getPrompts();
      const updatedDirs = updatedPrompts.filter(p => p.isDirectory);
      setDirectories(updatedDirs);
      onPromptsUpdate(updatedPrompts);
      toast({
        title: 'Directory Removed',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Directory',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <ModalContent>
      <ModalHeader>Manage Watched Directories</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <VStack spacing={4} align="stretch">
          <HStack>
            <Input
              placeholder="Enter directory path (e.g., ./my_folder or C:\Docs)"
              value={newDirPath}
              onChange={(e) => setNewDirPath(e.target.value)}
            />
            <Button colorScheme="teal" onClick={handleAddDirectory}>
              Add
            </Button>
          </HStack>
          {directories.length === 0 ? (
            <Text color="gray.500">No directories being watched.</Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              {directories.map(dir => (
                <HStack key={dir.id} justify="space-between">
                  <Text>{dir.name} ({dir.content})</Text>
                  <IconButton
                    aria-label="Delete Directory"
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    size="sm"
                    onClick={() => handleDeleteDirectory(dir.id)}
                  />
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button colorScheme="blue" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </ModalContent>
  );
};

export default DirectoryManager;