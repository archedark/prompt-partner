/**
 * @file setupTests.js
 * @description Jest configuration file that sets up a testing environment
 * with custom mocks for React components and a ChakraProvider wrapper.
 *
 * The key change here is adding a custom render function that wraps components with ChakraProvider
 * to prevent "undefined component" errors during testing. Also includes a mock for useBreakpointValue
 * from @chakra-ui/react, TextDecoder/TextEncoder polyfills, and clipboard API mocks.
 *
 * @dependencies
 * - @testing-library/jest-dom: Extends Jest with DOM assertions
 * - React: Required for JSX rendering
 * - @chakra-ui/react: Mocked for component and hook usage + ChakraProvider
 * - @chakra-ui/icons: Mocked for icon components
 * - @testing-library/react: For rendering utilities
 * - util: Node.js module for TextDecoder/TextEncoder polyfills
 *
 * @notes
 * - Provides a custom renderWithChakra function for consistent Chakra UI context
 * - Mocks all Chakra UI components and hooks used in the app
 * - Ensures clipboard API is available for MasterPrompt tests
 * - Polyfills TextDecoder and TextEncoder for gpt-tokenizer compatibility in Jest
 */

import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';

// Polyfill TextDecoder and TextEncoder for gpt-tokenizer in Jest environment
const { TextDecoder, TextEncoder } = require('util');
global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;

// Create a no-op mock function
const mockFunction = () => () => {};

// Mock Chakra UI hooks and components
jest.mock('@chakra-ui/react', () => ({
  ChakraProvider: ({ children }) => children,
  useToast: () => mockFunction,
  useBreakpointValue: (values) => values.md || values.base || 'row',
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Button: ({ children, isDisabled, ...props }) => (
    <button {...props} disabled={isDisabled}>{children}</button>
  ),
  Heading: ({ children, ...props }) => <h2 {...props}>{children}</h2>,
  Textarea: ({ children, ...props }) => <textarea {...props}>{children}</textarea>,
  Text: ({ children, ...props }) => <p {...props}>{children}</p>,
  VStack: ({ children, ...props }) => <div {...props}>{children}</div>,
  HStack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Checkbox: ({ children, isChecked, onChange, ...props }) => (
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      {...props}
    >{children}</input>
  ),
  IconButton: ({ children, isDisabled, ...props }) => (
    <button {...props} disabled={isDisabled}>{children}</button>
  ),
  Stack: ({ children, ...props }) => <div {...props}>{children}</div>,
  Flex: ({ children, ...props }) => <div {...props}>{children}</div>,
  Input: ({ children, ...props }) => <input {...props}>{children}</input>,
  Modal: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalOverlay: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalContent: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalHeader: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalCloseButton: (props) => <button {...props}>X</button>,
  ModalBody: ({ children, ...props }) => <div {...props}>{children}</div>,
  ModalFooter: ({ children, ...props }) => <div {...props}>{children}</div>,
  Tooltip: ({ children, ...props }) => <div {...props}>{children}</div>,
  Badge: ({ children, ...props }) => <span {...props}>{children}</span>,
  Spinner: (props) => <div {...props}>Spinner</div>,
  useCheckboxGroup: () => ({
    value: [],
    onChange: mockFunction,
  }),
  createIcon: () => () => null,
}));

// Mock Chakra UI icons
jest.mock('@chakra-ui/icons', () => ({
  DeleteIcon: (props) => <svg {...props}><title>DeleteIcon Mock</title></svg>,
  EditIcon: (props) => <svg {...props}><title>EditIcon Mock</title></svg>,
  DragHandleIcon: (props) => <svg {...props}><title>DragHandleIcon Mock</title></svg>,
  ChevronDownIcon: (props) => <svg {...props}><title>ChevronDownIcon Mock</title></svg>,
  ChevronUpIcon: (props) => <svg {...props}><title>ChevronUpIcon Mock</title></svg>,
  ChevronRightIcon: (props) => <svg {...props}><title>ChevronRightIcon Mock</title></svg>,
  CopyIcon: (props) => <svg {...props}><title>CopyIcon Mock</title></svg>,
}));

// Mock the global clipboard API
if (!global.navigator) {
  global.navigator = {};
}
global.navigator.clipboard = {
  writeText: jest.fn().mockResolvedValue(),
};

// Custom render function to wrap components with ChakraProvider
const renderWithChakra = (ui, options = {}) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>, options);
};

// Export the custom render function for use in tests
export { renderWithChakra };
