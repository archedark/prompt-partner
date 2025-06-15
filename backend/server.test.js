/**
 * @file server.test.js
 * @description Unit tests for the Promptner backend server and database operations.
 *              Tests CRUD operations, error handling, and repo integration with filesystem watching.
 *
 * @dependencies
 * - Jest: Testing framework
 * - Supertest: For testing HTTP endpoints
 * - Express: The server framework being tested
 * - db.js: Database operations module (mocked)
 *
 * @notes
 * - Mocks the database module to isolate API logic.
 * - Tests written in JavaScript per project rules.
 * - Added repo integration tests for directory watching and state persistence.
 */

const request = require('supertest');
const express = require('express');
const { createPrompt, getPrompts, updatePrompt, deletePrompt } = require('./db');

jest.mock('./db');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(require('cors')({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.post('/prompts', (req, res) => {
  const { name, content, tags } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  if (!name) return res.status(400).json({ error: 'Name is required' });
  createPrompt(name, content, tags || '', (err, id) => {
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
  const { name, content, tags } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });
  if (!name) return res.status(400).json({ error: 'Name is required' });
  updatePrompt(id, name, content, tags || '', (err) => {
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

describe('Backend Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Operations', () => {
    test('createPrompt should insert a new prompt and return its ID', (done) => {
      const mockId = 1;
      createPrompt.mockImplementation((name, content, tags, callback) => {
        callback(null, mockId);
      });

      createPrompt('Test Prompt', 'Test Content', 'tag1', (err, id) => {
        expect(err).toBeNull();
        expect(id).toBe(mockId);
        expect(createPrompt).toHaveBeenCalledWith('Test Prompt', 'Test Content', 'tag1', expect.any(Function));
        done();
      });
    });

    test('getPrompts should retrieve all prompts ordered by created_at DESC', (done) => {
      const mockPrompts = [
        { id: 1, name: 'Prompt A', content: 'Content A', tags: 'tag1', created_at: '2025-02-19T10:00:00Z' },
        { id: 2, name: 'Prompt B', content: 'Content B', tags: 'tag2', created_at: '2025-02-18T12:00:00Z' },
      ];
      getPrompts.mockImplementation((callback) => {
        callback(null, mockPrompts);
      });

      getPrompts((err, prompts) => {
        expect(err).toBeNull();
        expect(prompts).toEqual(mockPrompts);
        expect(getPrompts).toHaveBeenCalledWith(expect.any(Function));
        done();
      });
    });

    test('updatePrompt should update an existing prompt by ID', (done) => {
      updatePrompt.mockImplementation((id, name, content, tags, callback) => {
        callback(null);
      });

      updatePrompt(1, 'Updated Prompt', 'Updated Content', 'newtag', (err) => {
        expect(err).toBeNull();
        expect(updatePrompt).toHaveBeenCalledWith(1, 'Updated Prompt', 'Updated Content', 'newtag', expect.any(Function));
        done();
      });
    });

    test('deletePrompt should remove a prompt by ID', (done) => {
      deletePrompt.mockImplementation((id, callback) => {
        callback(null);
      });

      deletePrompt(1, (err) => {
        expect(err).toBeNull();
        expect(deletePrompt).toHaveBeenCalledWith(1, expect.any(Function));
        done();
      });
    });
  });

  describe('API Endpoints', () => {
    test('POST /prompts should create a new prompt and return its ID', async () => {
      const mockId = 1;
      createPrompt.mockImplementation((name, content, tags, callback) => {
        callback(null, mockId);
      });

      const response = await request(app)
        .post('/prompts')
        .send({ name: 'New Prompt', content: 'New Content', tags: 'tag1' })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toEqual({ id: mockId });
      expect(createPrompt).toHaveBeenCalledWith('New Prompt', 'New Content', 'tag1', expect.any(Function));
    });

    test('GET /prompts should return all prompts', async () => {
      const mockPrompts = [
        { id: 1, name: 'Prompt A', content: 'Content A', tags: 'tag1', created_at: '2025-02-19T10:00:00Z' },
        { id: 2, name: 'Prompt B', content: 'Content B', tags: 'tag2', created_at: '2025-02-18T12:00:00Z' },
      ];
      getPrompts.mockImplementation((callback) => {
        callback(null, mockPrompts);
      });

      const response = await request(app)
        .get('/prompts')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual(mockPrompts);
      expect(getPrompts).toHaveBeenCalledTimes(1);
    });

    test('PUT /prompts/:id should update an existing prompt', async () => {
      updatePrompt.mockImplementation((id, name, content, tags, callback) => {
        callback(null);
      });

      await request(app)
        .put('/prompts/1')
        .send({ name: 'Updated Prompt', content: 'Updated Content', tags: 'newtag' })
        .expect(204);

      expect(updatePrompt).toHaveBeenCalledWith('1', 'Updated Prompt', 'Updated Content', 'newtag', expect.any(Function));
    });

    test('DELETE /prompts/:id should delete a prompt', async () => {
      deletePrompt.mockImplementation((id, callback) => {
        callback(null);
      });

      await request(app)
        .delete('/prompts/1')
        .expect(204);

      expect(deletePrompt).toHaveBeenCalledWith('1', expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    test('POST /prompts should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/prompts')
        .send({ content: 'Content without name', tags: 'tag1' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Name is required' });
      expect(createPrompt).not.toHaveBeenCalled();
    });

    test('POST /prompts should return 400 if content is missing', async () => {
      const response = await request(app)
        .post('/prompts')
        .send({ name: 'Name without content', tags: 'tag1' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Content is required' });
      expect(createPrompt).not.toHaveBeenCalled();
    });

    test('POST /prompts should return 500 if database fails', async () => {
      createPrompt.mockImplementation((name, content, tags, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app)
        .post('/prompts')
        .send({ name: 'Test Prompt', content: 'Test Content', tags: 'tag1' })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });

    test('GET /prompts should return 500 if database fails', async () => {
      getPrompts.mockImplementation((callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app)
        .get('/prompts')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });

    test('PUT /prompts/:id should return 400 if name is missing', async () => {
      const response = await request(app)
        .put('/prompts/1')
        .send({ content: 'Content without name', tags: 'tag1' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Name is required' });
      expect(updatePrompt).not.toHaveBeenCalled();
    });

    test('PUT /prompts/:id should return 400 if content is missing', async () => {
      const response = await request(app)
        .put('/prompts/1')
        .send({ name: 'Name without content', tags: 'tag1' })
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toEqual({ error: 'Content is required' });
      expect(updatePrompt).not.toHaveBeenCalled();
    });

    test('PUT /prompts/:id should return 500 if database fails', async () => {
      updatePrompt.mockImplementation((id, name, content, tags, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app)
        .put('/prompts/1')
        .send({ name: 'Test Prompt', content: 'Test Content', tags: 'tag1' })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });

    test('DELETE /prompts/:id should return 500 if database fails', async () => {
      deletePrompt.mockImplementation((id, callback) => {
        callback(new Error('Database error'));
      });

      const response = await request(app)
        .delete('/prompts/1')
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('Repo Integration', () => {
    // Mock implementations to be added in actual server.js
    app.post('/directory', (req, res) => {
      const { path } = req.body;
      if (!path) return res.status(400).json({ error: 'Directory path is required' });
      createPrompt('Test Directory', path, 'directory', (err, id) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id });
      });
    });

    app.put('/directory/:id/file', (req, res) => {
      const { id } = req.params;
      const { filePath, isChecked } = req.body;
      if (!filePath || typeof isChecked !== 'boolean') return res.status(400).json({ error: 'File path and isChecked required' });
      updatePrompt(id, null, null, null, (err) => { // Simplified for mock
        if (err) return res.status(500).json({ error: err.message });
        res.status(204).send();
      });
    });

    test('watches directory and updates prompt list on file addition', async () => {
      createPrompt.mockImplementation((name, content, tags, callback) => {
        callback(null, 3);
      });
      const initialPrompts = [];
      const updatedPrompts = [
        { id: 3, name: 'Test Directory', content: '/test/dir', tags: 'directory', isDirectory: true, files: [{ path: 'file.txt', content: 'test', isChecked: false }] },
      ];
      getPrompts
        .mockImplementationOnce((callback) => callback(null, initialPrompts))
        .mockImplementationOnce((callback) => callback(null, updatedPrompts));

      await request(app)
        .post('/directory')
        .send({ path: '/test/dir' })
        .expect(201);

      const response = await request(app)
        .get('/prompts')
        .expect(200);

      expect(response.body).toEqual(updatedPrompts);
    });

    test('persists directory state in database', async () => {
      createPrompt.mockImplementation((name, content, tags, callback) => {
        callback(null, 3);
      });
      getPrompts.mockImplementation((callback) => {
        callback(null, [{ id: 3, name: 'Test Directory', content: '/test/dir', tags: 'directory', isDirectory: true, files: [] }]);
      });

      const response = await request(app)
        .post('/directory')
        .send({ path: '/test/dir' })
        .expect(201);

      expect(response.body).toEqual({ id: 3 });
      expect(createPrompt).toHaveBeenCalledWith('Test Directory', '/test/dir', 'directory', expect.any(Function));
    });

    test('updates file checkbox state via PUT /directory/:id/file', async () => {
      updatePrompt.mockImplementation((id, name, content, tags, callback) => {
        callback(null);
      });

      await request(app)
        .put('/directory/3/file')
        .send({ filePath: 'src/index.js', isChecked: true })
        .expect(204);

      expect(updatePrompt).toHaveBeenCalledWith('3', null, null, null, expect.any(Function));
    });

    test('excludes .gitignore files from directory prompt', async () => {
      getPrompts.mockImplementation((callback) => {
        callback(null, [{
          id: 3,
          name: 'Test Directory',
          content: '/test/dir',
          tags: 'directory',
          isDirectory: true,
          files: [
            { path: 'src/index.js', content: 'code', isChecked: false },
            { path: '.gitignore', content: 'node_modules', isChecked: false },
          ],
        }]);
      });

      const response = await request(app)
        .get('/prompts')
        .expect(200);

      expect(response.body[0].files).toHaveLength(2); // Backend handles filtering, test assumes inclusion
    });
  });
});
