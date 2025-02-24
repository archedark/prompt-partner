/**
 * @file FileTree.js
 * @description Renders a recursive, collapsible file tree for directory prompts in Promptner.
 *              Converts a flat file list into a nested structure for display.
 *
 * @dependencies
 * - React: For component rendering
 * - Chakra UI: For UI components and icons
 *
 * @props
 * - files: Array of file objects ({path, content, isChecked})
 * - promptId: Number, the ID of the directory prompt
 * - onFileCheckboxChange: Function to update file checkbox state
 * - expandedStates: Object mapping file paths to boolean (expanded state)
 * - onToggleExpand: Function to toggle file/directory expansion state
 *
 * @notes
 * - Builds a tree from flat file paths by splitting and nesting.
 * - Supports recursive expansion/collapse of directories.
 * - Assumes backend excludes `.gitignore` contents; displays only provided files.
 */
import React from 'react';
import {
  Box,
  Text,
  Checkbox,
  IconButton,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons';

const FileTree = ({ files, promptId, onFileCheckboxChange, expandedStates, onToggleExpand }) => {
  /**
   * @function buildTree
   * @description Converts a flat list of file paths into a nested tree structure
   * @param {Array} fileList - Flat array of file objects
   * @returns {Object} Nested tree with directories and files
   */
  const buildTree = (fileList) => {
    const tree = { name: '', children: [], files: [] };

    // Filter out .git and .venv folders and their contents
    const filteredFiles = fileList.filter(file => {
      const parts = file.path.split(/[\\/]/).filter(Boolean);
      return !parts.includes('.git') && !parts.includes('.venv');
    });

    filteredFiles.forEach(file => {
      const parts = file.path.split(/[\\/]/).filter(Boolean);
      let current = tree;

      // Build directory structure
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        let dir = current.children.find(child => child.name === part);
        if (!dir) {
          dir = { name: part, children: [], files: [] };
          current.children.push(dir);
        }
        current = dir;
      }

      // Add file to the deepest directory with isChecked defaulting to true
      const fileName = parts[parts.length - 1];
      current.files.push({ ...file, name: fileName, isChecked: file.isChecked ?? true });
    });

    return tree.children.length > 0 || tree.files.length > 0 ? tree : {};
  };

  /**
   * @function renderNode
   * @description Recursively renders a tree node (directory or file)
   * @param {Object} node - Tree node with name, children, and files
   * @param {string} path - Cumulative path for tracking expansion state
   * @returns {JSX.Element} Rendered node
   */
  const renderNode = (node, path = '') => {
    // Return null if node is undefined or doesn't have required properties
    if (!node || typeof node !== 'object') return null;
    
    // Ensure node has required properties with defaults
    const children = node.children || [];
    const files = node.files || [];
    const name = node.name || '';
    
    const fullPath = path ? `${path}/${name}` : name;
    const isDir = children.length > 0;
    const isExpanded = expandedStates[fullPath];

    return (
      <VStack key={fullPath} align="start" spacing={1} pl={isDir ? 0 : 4}>
        {isDir ? (
          <Box>
            <Flex align="center">
              <IconButton
                aria-label={isExpanded ? 'Collapse Directory' : 'Expand Directory'}
                icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                size="xs"
                variant="ghost"
                onClick={() => onToggleExpand(fullPath)}
                mr={1}
              />
              <Text fontWeight="bold">{name}</Text>
            </Flex>
            {isExpanded && (
              <Box pl={4}>
                {children.map(child => renderNode(child, fullPath))}
                {files.map(file => (
                  <Flex key={file.path} align="center">
                    <Checkbox
                      isChecked={file.isChecked}
                      onChange={() => onFileCheckboxChange(promptId, file.path)}
                      mr={2}
                    />
                    <Text color="gray.600" fontSize="sm">{file.name}</Text>
                  </Flex>
                ))}
              </Box>
            )}
          </Box>
        ) : (
          <Flex align="center">
            <Checkbox
              isChecked={node.isChecked}
              onChange={() => onFileCheckboxChange(promptId, node.path)}
              mr={2}
            />
            <Text color="gray.600" fontSize="sm">{name}</Text>
          </Flex>
        )}
      </VStack>
    );
  };

  const tree = buildTree(files || []);  // Ensure files is an array

  return (
    <VStack align="start" spacing={2}>
      {(tree.children || []).map(child => renderNode(child))}
      {(tree.files || []).map(file => renderNode(file))}
    </VStack>
  );
};

export default FileTree;