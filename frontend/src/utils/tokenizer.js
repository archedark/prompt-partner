/**
 * @file tokenizer.js
 * @description Provides consistent token counting and color coding functions using GPT-3 tokenizer
 */

import { encode } from 'gpt-tokenizer';

// Default maximum tokens (can be configured via settings later)
export const DEFAULT_MAX_TOKENS = 128 * 1024; // 128k tokens

/**
 * Counts tokens in text using GPT-3's tokenizer
 * @param {string} text - The text to count tokens in
 * @returns {number} The number of tokens
 */
export const countTokens = (text) => {
  if (!text) return 0;
  return encode(text).length;
};

/**
 * Returns the appropriate color scheme based on token count
 * @param {number} tokenCount - Current number of tokens
 * @param {number} maxTokens - Maximum token limit (defaults to 128k)
 * @returns {string} Chakra UI color scheme name
 */
export const getTokenColorScheme = (tokenCount, maxTokens = DEFAULT_MAX_TOKENS) => {
  // Calculate percentage of max tokens
  const percentage = (tokenCount / maxTokens) * 100;

  // Color gradient breakpoints
  if (percentage <= 25) return 'green';     // 0-25%: Safe zone
  if (percentage <= 50) return 'teal';      // 25-50%: Still good
  if (percentage <= 75) return 'yellow';    // 50-75%: Getting there
  if (percentage <= 90) return 'orange';    // 75-90%: Be careful
  return 'red';                             // 90%+: Danger zone
}; 