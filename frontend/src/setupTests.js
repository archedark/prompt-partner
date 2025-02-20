/**
 * @file setupTests.js
 * @description Jest configuration file that sets up a testing environment
 * with custom mocks for React components.
 *
 * The key change here is ensuring ALL Chakra UI components used across the codebase 
 * (including PromptEditor) are mocked to prevent "Element type is invalid" errors.
 * Added Input component mock explicitly for PromptEditor.
 */

import '@testing-library/jest-dom';
import React from 'react';

// Create a no-op mock function
const mockFunction = () => () => {};

// Mock ALL Chakra UI components used in the app
jest.mock('@chakra-ui/react', () => ({
  ChakraProvider: ({ children }) => <>{children}</>,
  useToast: () => mockFunction,
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Heading: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  Textarea: ({ children, ...props }) => <textarea {...props}>{children}</textarea>,
  Text: ({ children, ...props }) => <p {...props}>{children}</p>,
  VStack: ({ children, ...props }) => <div {...props}>{children}</div>,
  HStack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Checkbox: ({ children, ...props }) => <input type="checkbox" {...props}>{children}</input>,
  IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  Stack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Flex: ({ children, ...props }) => <div {...props}>{children}</div>,
  Input: ({ children, ...props }) => <input {...props}>{children}</input>, // Added for PromptEditor
}));

// Mock Chakra UI icons
jest.mock('@chakra-ui/icons', () => ({
  DeleteIcon: (props) => <svg {...props}><title>DeleteIcon Mock</title></svg>,
  EditIcon: (props) => <svg {...props}><title>EditIcon Mock</title></svg>,
  DragHandleIcon: (props) => <svg {...props}><title>DragHandleIcon Mock</title></svg>,
}));

// Mock the global clipboard API
if (!global.navigator) {
  global.navigator = {};
}
global.navigator.clipboard = {
  writeText: jest.fn(),
};