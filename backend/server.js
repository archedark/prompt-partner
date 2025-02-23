/**
 * @file server.js
 * @description Express server setup for Promptner backend, handling CRUD operations for prompts.
 *
 * @dependencies
 * - express: Web framework
 * - cors: Cross-origin resource sharing
 * - body-parser: Parse incoming request bodies
 * - db.js: Database operations module
 *
 * @notes
 * - Runs on port 5001 by default (configurable via PORT env var).
 * - CORS configured for http://localhost:3001 (frontend).
 * - Body parser limit increased to 10MB to support large prompts (up to ~2M tokens).
 * - Enhanced error handling for better user feedback.
 */

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createPrompt, getPrompts, updatePrompt, deletePrompt } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend
app.use(cors({
    origin: 'http://localhost:3001',  // Update this to match your frontend port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies with a 10MB limit to handle large prompts
app.use(bodyParser.json({ limit: '10mb' }));

app.post('/prompts', (req, res) => {
  const { name, content, tags } = req.body;

  // Validation
  if (!content) return res.status(400).json({ error: 'Content is required' });
  if (!name) return res.status(400).json({ error: 'Name is required' });

  // Create prompt in database
  createPrompt(name, content, tags || '', (err, id) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to create prompt: ' + err.message });
    }
    res.status(201).json({ id });
  });
});

app.get('/prompts', (req, res) => {
  getPrompts((err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch prompts: ' + err.message });
    }
    res.json(rows);
  });
});

app.put('/prompts/:id', (req, res) => {
  const { id } = req.params;
  const { name, content, tags } = req.body;

  // Validation
  if (!content) return res.status(400).json({ error: 'Content is required' });
  if (!name) return res.status(400).json({ error: 'Name is required' });

  updatePrompt(id, name, content, tags || '', (err) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to update prompt: ' + err.message });
    }
    res.status(204).send();
  });
});

app.delete('/prompts/:id', (req, res) => {
  const { id } = req.params;
  deletePrompt(id, (err) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to delete prompt: ' + err.message });
    }
    res.status(204).send();
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));