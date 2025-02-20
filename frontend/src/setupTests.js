/**
 * @file setupTests.js
 * @description Jest configuration file that sets up a testing environment
 * with custom mocks for React components.
 *
 * The key change here is adding a mock for useBreakpointValue from @chakra-ui/react,
 * which is used in App.js for responsive layout direction. This prevents "not a function"
 * errors during testing. All other mocks remain to support existing tests.
 *
 * @dependencies
 * - @testing-library/jest-dom: Extends Jest with DOM assertions
 * - React: Required for JSX rendering
 * - @chakra-ui/react: Mocked for component and hook usage
 * - @chakra-ui/icons: Mocked for icon components
 *
 * @notes
 * - Mocks all Chakra UI components and hooks used in the app
 * - Ensures clipboard API is available for MasterPrompt tests
 * - No actual Chakra UI functionality is tested here; focus is on component logic
 */

import '@testing-library/jest-dom';
import React from 'react';

// Create a no-op mock function
const mockFunction = () => () => {};

// Mock ALL Chakra UI components and hooks used in the app
jest.mock('@chakra-ui/react', () => ({
  // Core provider
  ChakraProvider: ({ children }) => <>{children}</>,
  
  // Hooks
  useToast: () => mockFunction,
  useBreakpointValue: (values) => values.md || values.base || 'row', // Mock for App.js responsiveness
  
  // Basic components
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
  Input: ({ children, ...props }) => <input {...props}>{children}</input>,
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