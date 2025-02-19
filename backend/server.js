const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { createPrompt, getPrompts, updatePrompt, deletePrompt } = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post('/prompts', (req, res) => {
  const { content, tags } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  createPrompt(content, tags || '', (err, id) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id });
  });
});

app.get('/prompts', (req, res) => {
  getPrompts((err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.put('/prompts/:id', (req, res) => {
  const { id } = req.params;
  const { content, tags } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  updatePrompt(id, content, tags || '', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

app.delete('/prompts/:id', (req, res) => {
  const { id } = req.params;
  deletePrompt(id, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));