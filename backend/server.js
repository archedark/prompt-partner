/**
 * @file server.js
 * @description Express server setup for Promptner backend, handling CRUD operations and repo integration.
 *
 * @dependencies
 * - express: Web framework
 * - cors: Cross-origin resource sharing
 * - body-parser: Parse incoming request bodies
 * - fs: Filesystem operations for directory watching
 * - path: Path manipulation utilities
 * - ignore: Parse .gitignore files
 * - db.js: Database operations module
 *
 * @notes
 * - Runs on port 5001 by default (configurable via PORT env var).
 * - CORS configured for http://localhost:3001 (frontend).
 * - Body parser limit increased to 10MB for large prompts.
 * - Implements filesystem watching for repo integration with debounced updates.
 * - Added DELETE /directory/:id endpoint to stop watching and remove directories.
 * - Enhanced watcher management for better state consistency.
 * - Updated readDirectory to exclude files listed in .gitignore contents.
 */
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const ignore = require('ignore');
const { createPrompt, getPrompts, updatePrompt, deletePrompt } = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(bodyParser.json({ limit: '10mb' }));

const watchers = new Map();

const debounce = (func, wait) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * @function readDirectory
 * @description Reads directory contents recursively, excluding files/patterns listed in .gitignore
 * @param {string} dirPath - Directory path to read (absolute or resolvable relative path)
 * @param {boolean} includeContents - Whether to include file contents or just metadata
 * @returns {Promise<Array>} Array of file objects {path, content?, isChecked, size}
 */
const readDirectory = async (dirPath, includeContents = true) => {
  try {
    const ig = ignore();
    const gitignorePath = path.join(dirPath, '.gitignore');
    if (await fs.access(gitignorePath).then(() => true).catch(() => false)) {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
      ig.add(gitignoreContent);
    }

    // Add common binary file types to ignore
    ig.add([
      '*.exe', '*.dll', '*.so', '*.dylib',
      '*.zip', '*.tar', '*.gz', '*.rar',
      '*.jpg', '*.jpeg', '*.png', '*.gif', '*.bmp',
      '*.mp3', '*.mp4', '*.avi', '*.mov',
      '*.pdf', '*.doc', '*.docx', '*.ppt', '*.pptx',
      '*.xls', '*.xlsx', '*.db', '*.sqlite',
      'node_modules', '.venv', 'venv', '.git',
      'dist', 'build', 'coverage',
      'package-lock.json',
      '*.log' // Exclude log files
    ]);

    const files = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(dirPath, fullPath);

      // Explicitly skip .git directories and their contents
      if (entry.name === '.git' || relativePath.startsWith('.git/') || relativePath.startsWith('.git\\')) {
        continue;
      }
      
      // Skip if the file or directory matches a .gitignore pattern
      if (ig.ignores(relativePath)) continue;

      if (entry.isFile()) {
        try {
          // Get file stats for size information
          const stats = await fs.stat(fullPath);
          const fileSize = stats.size;
          
          // Create file object with metadata
          const fileObj = { 
            path: relativePath, 
            size: fileSize,
            isChecked: false 
          };
          
          // Only include content if requested and file is text
          if (includeContents) {
            try {
              const content = await fs.readFile(fullPath, 'utf8');
              fileObj.content = content;
            } catch (readErr) {
              console.error(`Error reading file ${relativePath}:`, readErr);
              fileObj.content = `[Error reading file: ${readErr.message}]`;
            }
          }
          
          files.push(fileObj);
        } catch (fileErr) {
          console.error(`Error processing file ${relativePath}:`, fileErr);
          files.push({ 
            path: relativePath, 
            error: fileErr.message,
            size: 0,
            isChecked: false 
          });
        }
      } else if (entry.isDirectory()) {
        const subFiles = await readDirectory(fullPath, includeContents);
        files.push(...subFiles.map(f => ({
          ...f,
          path: path.join(relativePath, f.path),
        })));
      }
    }
    return files;
  } catch (err) {
    console.error('Error reading directory:', err);
    return [];
  }
};

/**
 * @function updateDirectoryPrompt
 * @description Updates directory prompt in DB when filesystem changes
 * @param {number} id - Prompt ID
 * @param {string} dirPath - Directory path
 */
const updateDirectoryPrompt = debounce(async (id, dirPath) => {
  // Only store metadata in the database, not file contents
  const files = await readDirectory(dirPath, false);
  getPrompts((err, prompts) => {
    if (err) return console.error('Failed to fetch prompts:', err);
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    updatePrompt(id, prompt.name, dirPath, prompt.tags, files, (updateErr) => {
      if (updateErr) console.error('Failed to update directory prompt:', updateErr);
    });
  });
}, 1000);

app.post('/prompts', (req, res) => {
  const { name, content, tags } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  if (!name) return res.status(400).json({ error: 'Name is required' });

  createPrompt(name, content, tags || '', false, [], (err, id) => {
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
    
    // For directory prompts, only send metadata without file contents
    const metadataRows = rows.map(prompt => {
      if (prompt.isDirectory && Array.isArray(prompt.files)) {
        // Remove content field from files to reduce payload size
        const metadataFiles = prompt.files.map(file => {
          const { content, ...metadata } = file;
          return metadata;
        });
        return { ...prompt, files: metadataFiles };
      }
      return prompt;
    });
    
    try {
      res.json(metadataRows);
    } catch (error) {
      console.error('Error stringifying response:', error);
      res.status(500).json({ 
        error: 'Response too large. Please report this issue.' 
      });
    }
  });
});

app.put('/prompts/:id', (req, res) => {
  const { id } = req.params;
  const { name, content, tags } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  if (!name) return res.status(400).json({ error: 'Name is required' });

  updatePrompt(id, name, content, tags || '', undefined, (err) => {
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
    if (watchers.has(parseInt(id))) {
      watchers.get(parseInt(id)).close();
      watchers.delete(parseInt(id));
    }
    res.status(204).send();
  });
});

app.get('/directories', (req, res) => {
  getPrompts((err, prompts) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch directories: ' + err.message });
    }
    const directories = prompts.filter(p => p.isDirectory);
    res.json(directories);
  });
});

app.post('/directory', async (req, res) => {
  const { path: dirPath } = req.body;
  if (!dirPath) return res.status(400).json({ error: 'Directory path is required' });

  try {
    const resolvedPath = path.resolve(dirPath);
    await fs.access(resolvedPath);
    // Only store metadata in the database, not file contents
    const files = await readDirectory(resolvedPath, false);
    const dirName = path.basename(resolvedPath);

    createPrompt(dirName, resolvedPath, 'directory', true, files, (err, id) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ error: 'Failed to create directory prompt: ' + err.message });
      }

      const watcher = fs.watch(resolvedPath, { recursive: true }, () => {
        updateDirectoryPrompt(id, resolvedPath);
      });
      watchers.set(id, watcher);

      res.status(201).json({ id });
    });
  } catch (err) {
    console.error('Filesystem error:', err.message);
    return res.status(400).json({ error: 'Invalid directory path: ' + err.message });
  }
});

app.put('/directory/:id/file', (req, res) => {
  const { id } = req.params;
  const { filePath, isChecked } = req.body;
  if (!filePath || typeof isChecked !== 'boolean') {
    return res.status(400).json({ error: 'File path and isChecked are required' });
  }

  getPrompts((err, prompts) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch prompts: ' + err.message });
    }
    const prompt = prompts.find(p => p.id === parseInt(id));
    if (!prompt || !prompt.isDirectory) {
      return res.status(404).json({ error: 'Directory prompt not found' });
    }

    const updatedFiles = prompt.files.map(file =>
      file.path === filePath ? { ...file, isChecked } : file
    );
    updatePrompt(id, prompt.name, prompt.content, prompt.tags, updatedFiles, (updateErr) => {
      if (updateErr) {
        console.error('Database error:', updateErr.message);
        return res.status(500).json({ error: 'Failed to update file state: ' + updateErr.message });
      }
      res.status(204).send();
    });
  });
});

// Add a new endpoint for bulk file state updates
app.put('/directory/:id/files/bulk', (req, res) => {
  const { id } = req.params;
  const { isChecked } = req.body;
  
  if (typeof isChecked !== 'boolean') {
    return res.status(400).json({ error: 'isChecked boolean is required' });
  }

  getPrompts((err, prompts) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch prompts: ' + err.message });
    }
    
    const prompt = prompts.find(p => p.id === parseInt(id));
    if (!prompt || !prompt.isDirectory) {
      return res.status(404).json({ error: 'Directory prompt not found' });
    }

    // Update all files to the same checked state
    const updatedFiles = prompt.files.map(file => ({ ...file, isChecked }));
    
    updatePrompt(id, prompt.name, prompt.content, prompt.tags, updatedFiles, (updateErr) => {
      if (updateErr) {
        console.error('Database error:', updateErr.message);
        return res.status(500).json({ error: 'Failed to update file states: ' + updateErr.message });
      }
      res.status(204).send();
    });
  });
});

app.delete('/directory/:id', (req, res) => {
  const { id } = req.params;
  const promptId = parseInt(id);

  getPrompts((err, prompts) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch prompts: ' + err.message });
    }
    const prompt = prompts.find(p => p.id === promptId);
    if (!prompt || !prompt.isDirectory) {
      return res.status(404).json({ error: 'Directory prompt not found' });
    }

    deletePrompt(promptId, (deleteErr) => {
      if (deleteErr) {
        console.error('Database error:', deleteErr.message);
        return res.status(500).json({ error: 'Failed to delete directory: ' + deleteErr.message });
      }

      if (watchers.has(promptId)) {
        try {
          watchers.get(promptId).close();
          watchers.delete(promptId);
        } catch (watchErr) {
          console.error('Error closing watcher:', watchErr.message);
        }
      }

      res.status(204).send();
    });
  });
});

// Add a new endpoint to fetch file content on demand
app.get('/directory/:id/file', (req, res) => {
  const { id } = req.params;
  const { filePath } = req.query;
  
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }
  
  getPrompts((err, prompts) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: 'Failed to fetch prompts: ' + err.message });
    }
    
    const prompt = prompts.find(p => p.id === parseInt(id));
    if (!prompt || !prompt.isDirectory) {
      return res.status(404).json({ error: 'Directory prompt not found' });
    }
    
    // Read the file content directly from disk
    const fullPath = path.join(prompt.content, filePath);
    fs.readFile(fullPath, 'utf8')
      .then(content => {
        res.json({ content });
      })
      .catch(fileErr => {
        console.error(`Error reading file ${filePath}:`, fileErr);
        res.status(500).json({ error: `Failed to read file: ${fileErr.message}` });
      });
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));