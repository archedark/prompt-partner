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
 * - Fixed bug where folders were rendered as files by ensuring directory structure is preserved.
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
    const tree = { name: '', children: {}, files: [] };

    // Filter out .git and .venv folders and their contents
    const filteredFiles = (fileList || []).filter(file => {
      const parts = file.path.split(/[\\/]/).filter(Boolean);
      return !parts.includes('.git') && !parts.includes('.venv');
    });

    filteredFiles.forEach(file => {
      const parts = file.path.split(/[\\/]/).filter(Boolean);
      let current = tree;

      // Build directory structure
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isLastPart = i === parts.length - 1;

        if (isLastPart) {
          // This is a file, add it to the current node's files
          current.files.push({
            ...file,
            name: part,
            isChecked: file.isChecked ?? true,
            isFile: true,
          });
        } else {
          // This is a directory, ensure it exists as a child node
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              children: {},
              files: [],
              isFile: false,
            };
          }
          current = current.children[part];
        }
      }
    });

    // Convert children object to array for consistent rendering
    const convertToArray = (node) => ({
      ...node,
      children: Object.values(node.children).map(child => convertToArray(child)),
    });

    return convertToArray(tree);
  };

  /**
   * @function renderNode
   * @description Recursively renders a tree node (directory or file)
   * @param {Object} node - Tree node with name, children, files, and isFile flag
   * @param {string} path - Cumulative path for tracking expansion state
   * @returns {JSX.Element} Rendered node
   */
  const renderNode = (node, path = '') => {
    if (!node || typeof node !== 'object' || !node.name) return null;

    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isDir = !node.isFile && (node.children.length > 0 || node.files.length > 0);
    const isExpanded = expandedStates[fullPath];

    return (
      <VStack key={fullPath} align="start" spacing={1} pl={node.isFile ? 4 : 0}>
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
              <Text fontWeight="bold">{node.name}/</Text>
            </Flex>
            {isExpanded && (
              <Box pl={4}>
                {node.children.map(child => renderNode(child, fullPath))}
                {node.files.map(file => renderNode(file, fullPath))}
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
            <Text color="gray.600" fontSize="sm">{node.name}</Text>
          </Flex>
        )}
      </VStack>
    );
  };

  const tree = buildTree(files);

  return (
    <VStack align="start" spacing={2}>
      {tree.children.map(child => renderNode(child))}
      {tree.files.map(file => renderNode(file))}
    </VStack>
  );
};

export default FileTree;