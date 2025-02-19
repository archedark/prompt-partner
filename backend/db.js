const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./prompts.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const createPrompt = (content, tags, callback) => {
  db.run('INSERT INTO prompts (content, tags) VALUES (?, ?)', [content, tags], function(err) {
    callback(err, this.lastID);
  });
};

const getPrompts = (callback) => {
  db.all('SELECT * FROM prompts ORDER BY created_at DESC', [], callback);
};

const updatePrompt = (id, content, tags, callback) => {
  db.run('UPDATE prompts SET content = ?, tags = ? WHERE id = ?', [content, tags, id], callback);
};

const deletePrompt = (id, callback) => {
  db.run('DELETE FROM prompts WHERE id = ?', [id], callback);
};

module.exports = { createPrompt, getPrompts, updatePrompt, deletePrompt };