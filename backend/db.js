/**
 * @file db.js
 * @description Database connection and queries for Prompt Partner backend.
 *              Now uses process.env.DB_PATH (default ./prompts.db).
 *              Set DB_PATH=:memory: in test environments to enable in-memory SQLite.
 *
 * @dependencies
 * - sqlite3
 *
 * @notes
 * - By default, uses ./prompts.db.
 * - If DB_PATH=:memory:, will use an in-memory DB (lost on process exit).
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const createPrompt = (name, content, tags, callback) => {
  db.run(
    'INSERT INTO prompts (name, content, tags) VALUES (?, ?, ?)',
    [name, content, tags],
    function (err) {
      callback(err, this.lastID);
    }
  );
};

const getPrompts = (callback) => {
  db.all('SELECT * FROM prompts ORDER BY created_at DESC', [], callback);
};

const updatePrompt = (id, name, content, tags, callback) => {
  db.run(
    'UPDATE prompts SET name = ?, content = ?, tags = ? WHERE id = ?',
    [name, content, tags, id],
    callback
  );
};

const deletePrompt = (id, callback) => {
  db.run('DELETE FROM prompts WHERE id = ?', [id], callback);
};

module.exports = { createPrompt, getPrompts, updatePrompt, deletePrompt };