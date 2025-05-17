/**
 * @file db.js
 * @description Database connection and queries for Promptner backend.
 *              Now supports directory prompts with filesystem data.
 *
 * @dependencies
 * - sqlite3: For SQLite database operations
 *
 * @notes
 * - Uses process.env.DB_PATH (default ./prompts.db).
 * - Set DB_PATH=:memory: in test environments for in-memory SQLite.
 * - Added `is_directory` and `files` columns for repo integration.
 * - `files` stored as JSON string in the database.
 */

const sqlite3 = require('sqlite3').verbose();

// Respect DB_PATH from environment, or default to local prompts.db
const DB_PATH = process.env.DB_PATH || './prompts.db';
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      is_directory BOOLEAN DEFAULT 0,
      files TEXT DEFAULT '[]',  -- JSON string of file objects: [{path, content, isChecked}]
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

/**
 * @function createPrompt
 * @description Inserts a new prompt into the database
 * @param {string} name - Prompt name
 * @param {string} content - Prompt content or directory path
 * @param {string} tags - Comma-separated tags
 * @param {boolean} isDirectory - Whether this is a directory prompt
 * @param {Array} files - Array of file objects for directory prompts
 * @param {function} callback - Callback with (err, id)
 */
const createPrompt = (name, content, tags, isDirectory = false, files = [], callback) => {
  db.run(
    'INSERT INTO prompts (name, content, tags, is_directory, files) VALUES (?, ?, ?, ?, ?)',
    [name, content, tags, isDirectory ? 1 : 0, JSON.stringify(files)],
    function (err) {
      callback(err, this.lastID);
    }
  );
};

/**
 * @function getPrompts
 * @description Retrieves all prompts, parsing JSON files field
 * @param {function} callback - Callback with (err, rows)
 */
const getPrompts = (callback) => {
  db.all('SELECT * FROM prompts ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return callback(err);
    const parsedRows = rows.map(row => ({
      ...row,
      isDirectory: !!row.is_directory,
      files: JSON.parse(row.files || '[]'),
    }));
    callback(null, parsedRows);
  });
};

/**
 * @function updatePrompt
 * @description Updates an existing prompt by ID
 * @param {number} id - Prompt ID
 * @param {string} name - Updated name
 * @param {string} content - Updated content
 * @param {string} tags - Updated tags
 * @param {Array} files - Updated files array for directory prompts (optional)
 * @param {function} callback - Callback with (err)
 */
const updatePrompt = (id, name, content, tags, files, callback) => {
  const params = files !== undefined
    ? [name, content, tags, JSON.stringify(files), id]
    : [name, content, tags, id];
  const sql = files !== undefined
    ? 'UPDATE prompts SET name = ?, content = ?, tags = ?, files = ? WHERE id = ?'
    : 'UPDATE prompts SET name = ?, content = ?, tags = ? WHERE id = ?';
  db.run(sql, params, callback);
};

/**
 * @function deletePrompt
 * @description Deletes a prompt by ID
 * @param {number} id - Prompt ID
 * @param {function} callback - Callback with (err)
 */
const deletePrompt = (id, callback) => {
  db.run('DELETE FROM prompts WHERE id = ?', [id], callback);
};

module.exports = { createPrompt, getPrompts, updatePrompt, deletePrompt };