const swaggerUi = require('swagger-ui-express');
const createFramework = require('./utils/frameworkFactory');
const authMiddleware = require('./middleware/auth');
const taskController = require('./controllers/taskController');
const userController = require('./controllers/userController');
const { setupSwagger } = require('./utils/swagger');
const { createCustomSwaggerUI } = require('./utils/custom-swagger-ui');

const createApp = (port) => {
  const framework = createFramework();
  const app = framework.createApp();
  const swaggerDocs = setupSwagger(port);

  // Configure middleware
  app.use(framework.cors());
  app.use(framework.json());
  app.use(framework.urlencoded({ extended: true }));

  // Log all requests
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path || req.url} - ${req.ip}`);
    next();
  });

  // Swagger UI setup - different handling based on framework
  if (framework.isCustom) {
    const customSwaggerUI = createCustomSwaggerUI(swaggerDocs);
    app.use('/api-docs', customSwaggerUI.serve, customSwaggerUI.setup);
  } else {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  }

  
  // Health check route
  app.get('/api/health', userController.healthCheck);

  // User routes
  app.post('/api/users/register', userController.register);
  app.post('/api/users/login', userController.login);
  app.get('/api/users/me', authMiddleware, userController.getProfile);
  app.patch('/api/users/me', authMiddleware, userController.updateProfile);
  app.patch('/api/users/change-password', authMiddleware, userController.changePassword);

  // Task routes
  app.get('/api/tasks', authMiddleware, taskController.getAllTasks);
  app.post('/api/tasks', authMiddleware, taskController.createTask);
  app.get('/api/tasks/:id', authMiddleware, taskController.getTaskById);
  app.patch('/api/tasks/:id', authMiddleware, taskController.updateTask);
  app.delete('/api/tasks/:id', authMiddleware, taskController.deleteTask);
  app.patch('/api/tasks/:id/move', authMiddleware, taskController.moveTask);

  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: err.message || 'Something went wrong on the server'
    });
  });

  return app;
};

module.exports = createApp;