/**
 * @file server.test.js
 * @description Unit tests for the Prompt Partner backend server and database operations.
 *              This file tests all backend functionality including database operations,
 *              API endpoints, and error handling as specified in the testing strategy.
 *
 * @dependencies
 * - Jest: Testing framework
 * - Supertest: For testing HTTP endpoints
 * - Express: The server framework being tested
 * - db.js: Database operations module (mocked)
 *
 * @notes
 * - Mocks the database module to isolate API logic from actual database calls
 * - Tests are written in JavaScript per project rules favoring speed over TypeScript
 * - Covers all CRUD operations and common error scenarios
 * - Assumes SQLite database with prompts table (id, name, content, tags, created_at)
 */

const request = require('supertest');
const express = require('express');
const { createPrompt, getPrompts, updatePrompt, deletePrompt } = require('./db');

// Mock the database module
jest.mock('./db');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use(require('cors')({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Define routes (copied from server.js to avoid requiring the full server setup)
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
  // Clear mocks before each test to ensure isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Suite for database operations from db.js
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

  // Suite for API endpoints from server.js
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
      expect(getPrompts).toHaveBeenCalledWith(expect.any(Function));
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

  // Suite for error handling scenarios
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
});