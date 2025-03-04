# MyExpress

A lightweight, Express-compatible web framework for Node.js applications that provides familiar routing, middleware, and static file serving capabilities.

## Table of Contents

- [MyExpress](#myexpress)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Features](#features)
  - [Basic Usage](#basic-usage)
  - [Routing](#routing)
  - [Middleware](#middleware)
  - [Static Files](#static-files)
  - [Request \& Response](#request--response)
    - [Request (req)](#request-req)
    - [Response (res)](#response-res)
  - [Error Handling](#error-handling)
  - [API Reference](#api-reference)
    - [MyExpress Class](#myexpress-class)
    - [Static Methods](#static-methods)
  - [Examples](#examples)
    - [Complete Application Example](#complete-application-example)
    - [SPA Support Example](#spa-support-example)

## Installation

```bash
npm install my-express
```

## Features

- Express-compatible API for easy migration
- Routing with path parameters
- Middleware support
- Static file serving
- Built-in body parsing (JSON, URL-encoded)
- CORS support
- Error handling middleware
- SPA fallback support

## Basic Usage

```javascript
const { MyExpress } = require('my-express');
const app = new MyExpress();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

## Routing

MyExpress provides methods for all standard HTTP verbs:

```javascript
// Basic route
app.get('/users', (req, res) => {
  res.json({ users: ['Alice', 'Bob', 'Charlie'] });
});

// Route with parameters
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});

// Route with multiple handlers
app.post('/items', 
  (req, res, next) => {
    // Validate request
    if (!req.body.name) {
      return res.status(400).send('Name is required');
    }
    next();
  },
  (req, res) => {
    // Process request
    res.json({ message: 'Item created' });
  }
);

// Handle all methods for a path
app.all('/api/*', (req, res, next) => {
  console.log(`${req.method} request to ${req.path}`);
  next();
});
```

## Middleware

Middleware functions have access to the request and response objects and the next middleware function in the application's request-response cycle.

```javascript
// Global middleware (applied to all routes)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Path-specific middleware
app.use('/api', (req, res, next) => {
  console.log('API request received');
  next();
});

// Built-in middleware
app.use(MyExpress.json()); // Parse JSON bodies
app.use(MyExpress.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(MyExpress.cors()); // Enable CORS
```

## Static Files

Serve static files from a directory:

```javascript
// Serve files from the 'public' directory
app.static('/static', 'public');

// With options
app.static('/assets', 'assets', { maxAge: 86400 }); // Cache for 1 day
```

## Request & Response

MyExpress enhances the standard Node.js request and response objects with additional properties and methods:

### Request (req)

- `req.pathname` - URL path without query parameters
- `req.query` - Object containing query parameters
- `req.params` - Object containing route parameters
- `req.body` - Parsed request body (when using body parser middleware)
- `req.ip` - Client IP address

### Response (res)

- `res.status(code)` - Set the HTTP status code
- `res.send(data)` - Send a response (auto-detects content type)
- `res.json(data)` - Send a JSON response
- `res.sendFile(path, options)` - Send a file
- `res.set(field, value)` - Set a response header

## Error Handling

MyExpress provides middleware-based error handling:

```javascript
// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// In route handlers, pass errors to next()
app.get('/risky', (req, res, next) => {
  try {
    // Code that might throw
    if (somethingBad) {
      throw new Error('Something went wrong');
    }
    res.send('Success!');
  } catch (err) {
    next(err); // Pass to error handler
  }
});
```

## API Reference

### MyExpress Class

- **Constructor**: `new MyExpress()`
- **HTTP Methods**: `get`, `post`, `put`, `patch`, `delete`, `head`, `options`, `trace`, `connect`, `all`
- **Middleware**: `use(path, ...handlers)`
- **Static Files**: `static(urlPath, dirPath, options)`
- **Server**: `listen(port, callback)`

### Static Methods

- `MyExpress.json(options)` - Returns middleware that parses JSON bodies
- `MyExpress.urlencoded(options)` - Returns middleware that parses URL-encoded bodies
- `MyExpress.cors(options)` - Returns middleware that enables CORS

## Examples

### Complete Application Example

```javascript
const { MyExpress } = require('my-express');
const app = new MyExpress();

// Middleware
app.use(MyExpress.json());
app.use(MyExpress.urlencoded({ extended: true }));
app.use(MyExpress.cors());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ]);
});

app.post('/api/users', (req, res) => {
  const { name } = req.body;
  res.status(201).json({ id: 3, name });
});

app.get('/api/users/:id', (req, res) => {
  const { id } = req.params;
  res.json({ id: parseInt(id), name: `User ${id}` });
});

// Static files
app.static('/', 'public');

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### SPA Support Example

```javascript
const { MyExpress } = require('my-express');
const app = new MyExpress();

// API routes
app.get('/api/data', (req, res) => {
  res.json({ message: 'API data' });
});

// Serve static files from the 'dist' directory
app.static('/', 'dist');

// MyExpress will automatically serve index.html for unmatched routes
// when a static directory is set, enabling SPA support

app.listen(3000, () => {
  console.log('SPA server running on http://localhost:3000');
});
```
