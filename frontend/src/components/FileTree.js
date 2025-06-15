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
 * - onFileExcludeToggle: Function to toggle file exclusion
 *
 * @notes
 * - Builds a tree from flat file paths by splitting and nesting.
 * - Supports recursive expansion/collapse of directories.
 * - Assumes backend excludes `.gitignore` contents; displays only provided files.
 * - Fixed bug where folders were rendered as files by ensuring directory structure is preserved.
 * - Added select/deselect all functionality with an icon button for better UX.
 * - Added folder-level select/deselect all buttons for each directory.
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
  SmallCloseIcon,
  ViewIcon,
  ViewOffIcon,
} from '@chakra-ui/icons';

const FileTree = ({ 
  files, 
  promptId, 
  onFileCheckboxChange, 
  onBulkFileCheckboxChange,
  expandedStates, 
  onToggleExpand,
  onFileExcludeToggle,
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

  // Generate a unique key based on the files array to force re-render when files change
  const filesKey = useMemo(() => {
    return files ? `files-${files.length}-${Date.now()}` : 'no-files';
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
   * @function getDirectoryCheckStatus
   * @description Determines if all, some, or none of the files in a directory are checked
   * @param {Object} node - Directory node
   * @returns {string} 'all', 'some', or 'none'
   */
  const getDirectoryCheckStatus = (node) => {
    // Collect all files in this directory and its subdirectories
    const allFiles = [];
    
    // Add files directly in this directory
    allFiles.push(...node.files);
    
    // Recursively add files from subdirectories
    const addFilesFromChildren = (childNode) => {
      allFiles.push(...childNode.files);
      Object.values(childNode.children).forEach(addFilesFromChildren);
    };
    
    Object.values(node.children).forEach(addFilesFromChildren);
    
    if (allFiles.length === 0) return 'none';
    
    const checkedCount = allFiles.filter(file => file.isChecked).length;
    if (checkedCount === 0) return 'none';
    if (checkedCount === allFiles.length) return 'all';
    return 'some';
  };

  /**
   * @function handleDirectorySelectAll
   * @description Selects or deselects all files in a specific directory
   * @param {Object} node - Directory node
   * @param {string} path - Directory path
   */
  const handleDirectorySelectAll = (node, path) => {
    const dirCheckStatus = getDirectoryCheckStatus(node);
    const newState = dirCheckStatus === 'none';
    
    // Update all files in this directory
    node.files.forEach(file => {
      if (file.isChecked !== newState) {
        onFileCheckboxChange(promptId, file.path);
      }
    });
    
    // Recursively update files in subdirectories
    const updateFilesInChildren = (childNode) => {
      childNode.files.forEach(file => {
        if (file.isChecked !== newState) {
          onFileCheckboxChange(promptId, file.path);
        }
      });
      Object.values(childNode.children).forEach(updateFilesInChildren);
    };
    
    Object.values(node.children).forEach(updateFilesInChildren);
  };

  /**
   * @function getDirectoryExcludeStatus
   * @description Determines if all, some, or none of the files in a directory are excluded
   * @param {Object} node - Directory node
   * @returns {string} 'all', 'some', or 'none'
   */
  const getDirectoryExcludeStatus = (node) => {
    const allFiles = [];

    // Add files directly in this directory
    allFiles.push(...node.files);

    // Recursively add files from subdirectories
    const addFilesFromChildren = (childNode) => {
      allFiles.push(...childNode.files);
      Object.values(childNode.children).forEach(addFilesFromChildren);
    };

    Object.values(node.children).forEach(addFilesFromChildren);

    if (allFiles.length === 0) return 'none';

    const excludedCount = allFiles.filter(file => file.isExcluded).length;
    if (excludedCount === 0) return 'none';
    if (excludedCount === allFiles.length) return 'all';
    return 'some';
  };

  /**
   * @function handleDirectoryExcludeToggle
   * @description Excludes or includes all files in a specific directory
   * @param {Object} node - Directory node
   * @param {string} path - Directory path
   */
  const handleDirectoryExcludeToggle = (node, path) => {
    const dirExcludeStatus = getDirectoryExcludeStatus(node);
    // If none are excluded, exclude all; otherwise include all
    const newStateShouldBeExcluded = dirExcludeStatus === 'none';

    // Update all files in this directory
    node.files.forEach(file => {
      if ((file.isExcluded || false) !== newStateShouldBeExcluded) {
        onFileExcludeToggle(promptId, file.path);
      }
    });

    // Recursively update subdirectories
    const updateFilesInChildren = (childNode) => {
      childNode.files.forEach(file => {
        if ((file.isExcluded || false) !== newStateShouldBeExcluded) {
          onFileExcludeToggle(promptId, file.path);
        }
      });
      Object.values(childNode.children).forEach(updateFilesInChildren);
    };

    Object.values(node.children).forEach(updateFilesInChildren);
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
    
    // For directories, determine check and exclude statuses
    const dirCheckStatus = isDirectory ? getDirectoryCheckStatus(node) : 'none';
    const dirExcludeStatus = isDirectory ? getDirectoryExcludeStatus(node) : 'none';

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
              
              {/* Directory select/deselect all button */}
              <Tooltip 
                label={dirCheckStatus === 'none' ? 'Select All Files in Folder' : 'Deselect All Files in Folder'}
                placement="top"
                hasArrow
              >
                <IconButton
                  aria-label={dirCheckStatus === 'none' ? 'Select All Files in Folder' : 'Deselect All Files in Folder'}
                  icon={dirCheckStatus === 'none' ? <CheckIcon /> : <SmallCloseIcon />}
                  size="xs"
                  colorScheme={dirCheckStatus === 'all' ? 'blue' : 'gray'}
                  onClick={() => handleDirectorySelectAll(node, fullPath)}
                  variant={dirCheckStatus === 'some' ? 'solid' : 'outline'}
                  mr={2}
                />
              </Tooltip>
              
              {/* Directory exclude/include toggle */}
              <Tooltip 
                label={dirExcludeStatus === 'none' ? 'Exclude Folder from Master Prompt' : dirExcludeStatus === 'all' ? 'Include Folder in Master Prompt' : 'Partially Excluded – Click to Toggle'}
                placement="top"
                hasArrow
              >
                <IconButton
                  aria-label={dirExcludeStatus === 'none' ? 'Exclude Folder from Master Prompt' : 'Include Folder in Master Prompt'}
                  icon={dirExcludeStatus === 'none' ? <ViewIcon /> : <ViewOffIcon />} 
                  size="xs"
                  colorScheme={dirExcludeStatus === 'none' ? 'gray' : dirExcludeStatus === 'all' ? 'red' : 'orange'}
                  onClick={() => handleDirectoryExcludeToggle(node, fullPath)}
                  variant="ghost"
                  mr={2}
                />
              </Tooltip>
              
              <Text fontWeight="bold" color={dirExcludeStatus === 'all' ? 'gray.400' : 'inherit'}>{node.name}/</Text>
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
        <Tooltip
          label={file.isExcluded ? 'Include File in Master Prompt' : 'Exclude File from Master Prompt'}
          placement="top"
          hasArrow
        >
          <IconButton
            aria-label={file.isExcluded ? 'Include File in Master Prompt' : 'Exclude File from Master Prompt'}
            icon={file.isExcluded ? <ViewOffIcon /> : <ViewIcon />}
            size="xs"
            colorScheme={file.isExcluded ? 'red' : 'gray'}
            onClick={() => onFileExcludeToggle(promptId, file.path)}
            variant="ghost"
            mr={2}
          />
        </Tooltip>
        <Text fontSize="sm" noOfLines={1} title={file.path} color={file.isExcluded ? 'gray.400' : 'inherit'}>
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
    <Box p={2} key={filesKey}>
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