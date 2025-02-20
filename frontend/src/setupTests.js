/**
 * @file setupTests.js
 * @description Jest configuration file that sets up a testing environment
 * with custom mocks for React components. 
 *
 * The key change here is adding mocks for ALL Chakra UI components used 
 * across the codebase. Previously, only a handful were mocked (Box, Button, etc.).
 * This resulted in tests failing with the error “Element type is invalid,”
 * because references like <Checkbox/> or <IconButton/> were undefined under the mock.
 *
 * By mocking EVERY used component from Chakra UI, we avoid these undefined references,
 * and the tests can successfully render the code under test.
 */

import '@testing-library/jest-dom';
import React from 'react';

// Create a no-op mock function
const mockFunction = () => () => {};

// The core problem: We need to mock out all Chakra UI components 
// that are used in the code. 
// PromptList (and others) uses <Checkbox>, <IconButton>, <Stack>, <Flex>, etc.
// So we add them here to our mock. 
// We also keep the existing mocks for 'useToast' and others.

jest.mock('@chakra-ui/react', () => ({
  // Provide a minimal ChakraProvider
  ChakraProvider: ({ children }) => <>{children}</>,

  // Hooks
  useToast: () => mockFunction,

  // Basic components
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Heading: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  Textarea: ({ children, ...props }) => <textarea {...props}>{children}</textarea>,
  Text: ({ children, ...props }) => <p {...props}>{children}</p>,
  VStack: ({ children, ...props }) => <div {...props}>{children}</div>,
  HStack: ({ children, ...props }) => <div {...props}>{children}</div>,

  // Additional components we use but weren't mocking previously:
  Checkbox: ({ children, ...props }) => <input type="checkbox" {...props}>{children}</input>,
  IconButton: ({ children, ...props }) => <button {...props}>{children}</button>,
  Stack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Flex: ({ children, ...props }) => <div {...props}>{children}</div>,

  // If there are any special components requiring specific mock behavior, 
  // define them here. For now, returning basic placeholders is usually enough 
  // for unit tests that only check rendering/callbacks.

  // Provide anything else your code might rely on from Chakra:
  // e.g. forwardRef, theme, colorMode, etc., if needed by your tests.
}));

// We might also need to mock the Chakra UI icons (like DeleteIcon, EditIcon).
// Because we import them from '@chakra-ui/icons'
jest.mock('@chakra-ui/icons', () => ({
  // For example, returning basic placeholders
  DeleteIcon: (props) => <svg {...props}><title>DeleteIcon Mock</title></svg>,
  EditIcon: (props) => <svg {...props}><title>EditIcon Mock</title></svg>,
  DragHandleIcon: (props) => <svg {...props}><title>DragHandleIcon Mock</title></svg>,
}));

// Mock the global clipboard API if not available
if (!global.navigator) {
  global.navigator = {};
}
global.navigator.clipboard = {
  writeText: jest.fn(),
};