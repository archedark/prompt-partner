/**
 * @file index.js
 * @description Entry point that renders the React app. Wraps the App component with ChakraProvider 
 * for modern UI styling and responsiveness.
 *
 * @dependencies
 * - React
 * - ReactDOM
 * - Chakra UI (ChakraProvider)
 * - reportWebVitals for performance measuring
 *
 * @notes
 * - Ensure Chakra UI is installed: npm install @chakra-ui/react @emotion/react @emotion/styled framer-motion
 * - This file now wraps <App/> with <ChakraProvider> to enable Chakra's styling across the app.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import ChakraProvider for Chakra UI
import { ChakraProvider } from '@chakra-ui/react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <App />
  </ChakraProvider>
);

reportWebVitals();