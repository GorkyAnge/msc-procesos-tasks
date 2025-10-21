const express = require('express');

const createApp = () => {
  const app = express();
  app.use(express.json());

  // In-memory store scoped to a single app instance.
  const tasks = new Map();
  let nextId = 1;

  const parseId = (rawId) => {
    const id = Number.parseInt(rawId, 10);
    return Number.isInteger(id) && id > 0 ? id : null;
  };

  app.get('/tasks', (req, res) => {
    res.json(Array.from(tasks.values()));
  });

  app.get('/tasks/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Task id must be a positive integer.' });
    }

    const task = tasks.get(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(task);
  });

  app.post('/tasks', (req, res) => {
    const { title, description, completed } = req.body || {};

    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ error: 'Task description must be a string when provided.' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Task completed flag must be boolean when provided.' });
    }

    const task = {
      id: nextId++,
      title: title.trim(),
      description: description ? description.trim() : '',
      completed: completed ?? false,
    };

    tasks.set(task.id, task);
    res.status(201).json(task);
  });

  app.put('/tasks/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Task id must be a positive integer.' });
    }

    const existing = tasks.get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const { title, description, completed } = req.body || {};
    const hasUpdatableField =
      title !== undefined || description !== undefined || completed !== undefined;

    if (!hasUpdatableField) {
      return res.status(400).json({ error: 'Provide at least one field to update.' });
    }

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: 'Task title must be a non-empty string.' });
      }
      existing.title = title.trim();
    }

    if (description !== undefined) {
      if (typeof description !== 'string') {
        return res.status(400).json({ error: 'Task description must be a string.' });
      }
      existing.description = description.trim();
    }

    if (completed !== undefined) {
      if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Task completed flag must be boolean.' });
      }
      existing.completed = completed;
    }

    tasks.set(id, existing);
    res.json(existing);
  });

  app.delete('/tasks/:id', (req, res) => {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: 'Task id must be a positive integer.' });
    }

    if (!tasks.has(id)) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    tasks.delete(id);
    res.status(204).send();
  });

  return app;
};

module.exports = { createApp };
