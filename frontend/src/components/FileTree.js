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
 * - onBulkFileCheckboxChange: Function to update all file checkbox states at once
 * - expandedStates: Object mapping file paths to boolean (expanded state)
 * - onToggleExpand: Function to toggle file/directory expansion state
 *
 * @notes
 * - Builds a tree from flat file paths by splitting and nesting.
 * - Supports recursive expansion/collapse of directories.
 * - Assumes backend excludes `.gitignore` contents; displays only provided files.
 * - Fixed bug where folders were rendered as files by ensuring directory structure is preserved.
 * - Added select/deselect all functionality with an icon button for better UX.
 */
import React, { useMemo } from 'react';
import {
  Box,
  Text,
  Checkbox,
  IconButton,
  VStack,
  Flex,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  CheckIcon, 
  SmallCloseIcon 
} from '@chakra-ui/icons';

const FileTree = ({ 
  files, 
  promptId, 
  onFileCheckboxChange, 
  onBulkFileCheckboxChange,
  expandedStates, 
  onToggleExpand 
}) => {
  /**
   * Calculate if all files are checked, none are checked, or some are checked
   */
  const fileCheckStatus = useMemo(() => {
    if (!files || files.length === 0) return 'none';
    
    const checkedCount = files.filter(file => file.isChecked).length;
    if (checkedCount === 0) return 'none';
    if (checkedCount === files.length) return 'all';
    return 'some';
  }, [files]);

  /**
   * @function handleSelectAll
   * @description Selects or deselects all files based on current state
   */
  const handleSelectAll = () => {
    // If all or some files are checked, deselect all. Otherwise, select all.
    const newState = fileCheckStatus === 'none';
    onBulkFileCheckboxChange(promptId, newState);
  };

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
      // Check if any part of the path is .git or .venv
      return !parts.includes('.git') && !parts.includes('.venv') && 
             // Also check if the path starts with .git/ or .git\
             !file.path.startsWith('.git/') && !file.path.startsWith('.git\\') &&
             // Exclude package-lock.json files
             !file.path.endsWith('package-lock.json') &&
             // Exclude log files
             !file.path.endsWith('.log');
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
            name: part,
            ...file,
          });
        } else {
          // This is a directory, create it if it doesn't exist
          if (!current.children[part]) {
            current.children[part] = {
              name: part,
              children: {},
              files: [],
            };
          }
          current = current.children[part];
        }
      }
    });

    return tree;
  };

  /**
   * @function renderNode
   * @description Recursively renders a node (file or directory) in the tree
   * @param {Object} node - Node to render
   * @param {string} parentPath - Path of parent directory
   * @returns {JSX.Element} Rendered node
   */
  const renderNode = (node, parentPath = '') => {
    const fullPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const isDirectory = Object.keys(node.children).length > 0 || node.files.length > 0;
    const isExpanded = expandedStates[fullPath] || false;

    return (
      <VStack key={fullPath} align="stretch" spacing={1} mt={1}>
        {isDirectory ? (
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
                {/* Render subdirectories */}
                {Object.values(node.children).map(child => 
                  renderNode(child, fullPath)
                )}
                {/* Render files */}
                {node.files.map(file => 
                  renderFileItem(file)
                )}
              </Box>
            )}
          </Box>
        ) : (
          // This is a file (leaf node)
          renderFileItem(node)
        )}
      </VStack>
    );
  };

  /**
   * @function renderFileItem
   * @description Renders a file item with checkbox
   * @param {Object} file - File object with path and isChecked properties
   * @returns {JSX.Element} Rendered file item
   */
  const renderFileItem = (file) => {
    // Display file size if available
    const fileSize = file.size ? ` (${formatFileSize(file.size)})` : '';
    
    return (
      <Flex key={file.path} ml={4} alignItems="center">
        <Checkbox
          isChecked={file.isChecked}
          onChange={() => onFileCheckboxChange(promptId, file.path)}
          mr={2}
        />
        <Text fontSize="sm" noOfLines={1} title={file.path}>
          {file.name}{fileSize}
        </Text>
      </Flex>
    );
  };
  
  /**
   * @function formatFileSize
   * @description Formats file size in bytes to human-readable format
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const tree = buildTree(files);

  return (
    <Box p={2}>
      {/* Select/Deselect All Button */}
      <HStack mb={2} spacing={2}>
        <Tooltip 
          label={fileCheckStatus === 'none' ? 'Select All Files' : 'Deselect All Files'}
          placement="top"
          hasArrow
        >
          <IconButton
            aria-label={fileCheckStatus === 'none' ? 'Select All Files' : 'Deselect All Files'}
            icon={fileCheckStatus === 'none' ? <CheckIcon /> : <SmallCloseIcon />}
            size="sm"
            colorScheme={fileCheckStatus === 'all' ? 'blue' : 'gray'}
            onClick={handleSelectAll}
            variant={fileCheckStatus === 'some' ? 'solid' : 'outline'}
          />
        </Tooltip>
        <Text fontSize="sm" color="gray.600">
          {fileCheckStatus === 'none' 
            ? 'No files selected' 
            : fileCheckStatus === 'all' 
              ? 'All files selected' 
              : 'Some files selected'}
        </Text>
      </HStack>
      
      {/* File Tree */}
      {Object.values(tree.children).map(node => renderNode(node))}
      {tree.files.map(file => renderFileItem(file))}
    </Box>
  );
};

export default FileTree;