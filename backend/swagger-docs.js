/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: TaskFlow API
 *   description: API documentation for the TaskFlow task management application
 *   version: 1.0.0
 *   contact:
 *     email: support@taskflow.com
 * 
 * servers:
 *   - url: http://localhost:5500/api
 *     description: Development server
 * 
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *       example:
 *         id: "61234a7b9f72e123456789ab"
 *         name: "John Doe"
 *         email: "john@example.com"
 *         createdAt: "2023-09-01T10:30:00Z"
 * 
 *     UserRegister:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - passwordConfirmation
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (min 6 characters)
 *         passwordConfirmation:
 *           type: string
 *           format: password
 *           description: Password confirmation
 *       example:
 *         name: "drey wesson"
 *         email: "dreywesson@example.com"
 *         password: "password123"
 *         passwordConfirmation: "password123"
 * 
 *     UserLogin:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *       example:
 *         email: "dreywesson@example.com"
 *         password: "password123"
 * 
 *     UserUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: User's full name
 *       example:
 *         name: "John Smith"
 * 
 *     PasswordChange:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           format: password
 *           description: User's current password
 *         newPassword:
 *           type: string
 *           format: password
 *           description: User's new password (min 6 characters)
 *       example:
 *         currentPassword: "password123"
 *         newPassword: "newPassword456"
 * 
 *     Task:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: Auto-generated MongoDB ID
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         status:
 *           type: string
 *           enum: [todo, inProgress, review, done]
 *           description: Current status of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority level
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date for the task
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of task tags
 *         user:
 *           type: string
 *           description: ID of the user who owns the task
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Task creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Task last update timestamp
 *       example:
 *         id: "61234a7b9f72e123456789cd"
 *         title: "Implement API documentation"
 *         description: "Create Swagger documentation for all API endpoints"
 *         status: "inProgress"
 *         priority: "high"
 *         dueDate: "2023-09-15"
 *         tags: ["documentation", "api"]
 *         createdAt: "2023-09-01T11:30:00Z"
 *         updatedAt: "2023-09-01T13:45:00Z"
 * 
 *     TaskCreate:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         status:
 *           type: string
 *           enum: [todo, inProgress, review, done]
 *           description: Current status of the task
 *           default: todo
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority level
 *           default: medium
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date for the task
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of task tags
 *       example:
 *         title: "Implement API documentation"
 *         description: "Create Swagger documentation for all API endpoints"
 *         status: "todo"
 *         priority: "high"
 *         dueDate: "2023-09-15"
 *         tags: ["documentation", "api"]
 * 
 *     TaskUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         status:
 *           type: string
 *           enum: [todo, inProgress, review, done]
 *           description: Current status of the task
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Task priority level
 *         dueDate:
 *           type: string
 *           format: date
 *           description: Due date for the task
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of task tags
 *       example:
 *         title: "Update API documentation"
 *         priority: "medium"
 *         tags: ["documentation", "api", "swagger"]
 * 
 *     TaskMove:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [todo, inProgress, review, done]
 *           description: New status for the task
 *       example:
 *         status: "inProgress"
 * 
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         error:
 *           type: string
 *       example:
 *         success: false
 *         error: "Invalid credentials"
 * 
 *     ValidationError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         errors:
 *           type: object
 *           additionalProperties:
 *             type: string
 *       example:
 *         success: false
 *         errors:
 *           email: "Email is required"
 *           password: "Password must be at least 6 characters"
 * 
 * security:
 *   - bearerAuth: []
 * 
 * paths:
 *   /health:
 *     get:
 *       summary: Health check endpoint
 *       description: Returns the status of the API server
 *       tags:
 *         - Health
 *       security: []
 *       responses:
 *         200:
 *           description: Server is running
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   status:
 *                     type: string
 *                     example: "ok"
 *                   message:
 *                     type: string
 *                     example: "Server is running"
 * 
 *   /users/register:
 *     post:
 *       summary: Register a new user
 *       description: Creates a new user account
 *       tags:
 *         - Authentication
 *       security: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserRegister'
 *       responses:
 *         201:
 *           description: User registered successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   token:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *         400:
 *           description: Bad request or validation error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ValidationError'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *   /users/login:
 *     post:
 *       summary: Login user
 *       description: Authenticates a user and returns a JWT token
 *       tags:
 *         - Authentication
 *       security: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLogin'
 *       responses:
 *         200:
 *           description: User logged in successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   token:
 *                     type: string
 *                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *         401:
 *           description: Invalid credentials
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *   /users/me:
 *     get:
 *       summary: Get current user profile
 *       description: Returns the profile of the currently authenticated user
 *       tags:
 *         - Users
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: User profile retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     $ref: '#/components/schemas/User'
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         404:
 *           description: User not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *     patch:
 *       summary: Update user profile
 *       description: Updates the profile of the currently authenticated user
 *       tags:
 *         - Users
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserUpdate'
 *       responses:
 *         200:
 *           description: User profile updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     $ref: '#/components/schemas/User'
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         404:
 *           description: User not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *   /users/change-password:
 *     patch:
 *       summary: Change user password
 *       description: Changes the password of the currently authenticated user
 *       tags:
 *         - Users
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasswordChange'
 *       responses:
 *         200:
 *           description: Password changed successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Password updated successfully"
 *         400:
 *           description: Bad request
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         401:
 *           description: Not authenticated or incorrect current password
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         404:
 *           description: User not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *   /tasks:
 *     get:
 *       summary: Get all tasks
 *       description: Returns all tasks belonging to the authenticated user with optional filtering
 *       tags:
 *         - Tasks
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: query
 *           name: status
 *           schema:
 *             type: string
 *             enum: [todo, inProgress, review, done]
 *           description: Filter tasks by status
 *         - in: query
 *           name: priority
 *           schema:
 *             type: string
 *             enum: [low, medium, high]
 *           description: Filter tasks by priority
 *         - in: query
 *           name: search
 *           schema:
 *             type: string
 *           description: Search in task title and description
 *         - in: query
 *           name: sort
 *           schema:
 *             type: string
 *             default: createdAt
 *           description: Field to sort by
 *         - in: query
 *           name: order
 *           schema:
 *             type: string
 *             enum: [asc, desc]
 *             default: desc
 *           description: Sort order
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             minimum: 1
 *             default: 1
 *           description: Page number for pagination
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             minimum: 1
 *             maximum: 100
 *             default: 100
 *           description: Number of items per page
 *       responses:
 *         200:
 *           description: List of tasks
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   count:
 *                     type: integer
 *                     example: 10
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Task'
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *     post:
 *       summary: Create a new task
 *       description: Creates a new task for the authenticated user
 *       tags:
 *         - Tasks
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskCreate'
 *       responses:
 *         201:
 *           description: Task created successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     $ref: '#/components/schemas/Task'
 *         400:
 *           description: Bad request or validation error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ValidationError'
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *   /tasks/{id}:
 *     get:
 *       summary: Get task by ID
 *       description: Returns a specific task by ID
 *       tags:
 *         - Tasks
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: Task ID
 *       responses:
 *         200:
 *           description: Task retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     $ref: '#/components/schemas/Task'
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         404:
 *           description: Task not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *     patch:
 *       summary: Update task
 *       description: Updates a specific task by ID
 *       tags:
 *         - Tasks
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: Task ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskUpdate'
 *       responses:
 *         200:
 *           description: Task updated successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     $ref: '#/components/schemas/Task'
 *         400:
 *           description: Bad request or validation error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ValidationError'
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         404:
 *           description: Task not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *     delete:
 *       summary: Delete task
 *       description: Deletes a specific task by ID
 *       tags:
 *         - Tasks
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: Task ID
 *       responses:
 *         200:
 *           description: Task deleted successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: "Task deleted successfully"
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         404:
 *           description: Task not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *   /tasks/{id}/move:
 *     patch:
 *       summary: Move task (update status)
 *       description: Updates the status of a specific task
 *       tags:
 *         - Tasks
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *           description: Task ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskMove'
 *       responses:
 *         200:
 *           description: Task moved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     $ref: '#/components/schemas/Task'
 *         400:
 *           description: Bad request or invalid status
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         404:
 *           description: Task not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 * 
 *   /tasks/stats/summary:
 *     get:
 *       summary: Get task statistics
 *       description: Returns statistics about tasks by status
 *       tags:
 *         - Tasks
 *       security:
 *         - bearerAuth: []
 *       responses:
 *         200:
 *           description: Task statistics retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   data:
 *                     type: object
 *                     properties:
 *                       todo:
 *                         type: integer
 *                         example: 5
 *                       inProgress:
 *                         type: integer
 *                         example: 3
 *                       review:
 *                         type: integer
 *                         example: 2
 *                       done:
 *                         type: integer
 *                         example: 10
 *                       total:
 *                         type: integer
 *                         example: 20
 *         401:
 *           description: Not authenticated
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 *         500:
 *           description: Server error
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Error'
 */