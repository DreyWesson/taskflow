# Application Setup Guide

 ![Video Demo](./assets/taskflow.mp4)

This guide provides instruction for setting up and running the application using both local development and Docker environments.

## How the Application Works

The application is a task management system built with Node.js/MyCustomExpress for the backend and React for the frontend. Here's how the backend works:

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) (optional, for containerized setup)

### Server Initialization (server.js)

The backend server uses:
- **MongoDB** for data storage (connected via Mongoose)
- **Express.js** as the web framework
- **Environment variables** for configuration

The server initialization process:
1. Loads environment variables using `dotenv`
2. Sets up the Express application using the app factory
3. Connects to MongoDB using the connection string from environment variables
4. Starts the HTTP server on the specified port
5. Makes Swagger API documentation available

### Application Setup (app.js)

The application factory:
1. Creates a web framework instance (using a factory pattern for flexibility)
2. Configures middleware for CORS, JSON parsing, and URL encoding
3. Sets up request logging
4. Configures Swagger UI for API documentation
5. Defines API routes:
   - Health check: `/api/health`
   - User routes: registration, login, profile management
   - Task routes: CRUD operations and task movement
6. Implements error handling middleware

### Custom Features

This is not to re-event the wheel but to show what happens under the hood of most frameworks

- **Custom Express Framework**: a framework that mimics how express.js works
- **Custom Nodemon**: keeps what of file changes in specified directories
- **Custom Postman**: a versatile command processor that allows to make HTTP requests amongst other things
- **Custom React**: build a minimal react, not fully ready  

### Application Features

- **User Authentication**: Register, login, and profile management with JWT authentication
- **Task Management**: Create, read, update, delete, and move tasks
- **API Documentation**: Swagger UI available at `/api-docs`
- **Framework Abstraction**: Uses a factory pattern to potentially support different web frameworks
- **Security**: Implements authentication middleware to protect routes

## Project Structure

The application consists of two main components:
- **Backend**: Node.js/Express
- **Frontend**: React-based web application

## Environment Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. Set up environment variables:
   - Copy the sample environment file:
     ```
      cp sample.env .env
     ```
   - Edit the `.env` file with appropriate settings for your environment

## Local Development Setup

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the backend server:
   ```
   npm run mynodemon:custom
   ```
   
   The backend server should now be running on the configured port.

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```
   
   The frontend development server should now be running, typically on port 5173 (http://localhost:5173).

## Running Tests

To run Cypress end-to-end tests:

1. Ensure both backend and frontend servers are running
2. From the frontend directory, run:
   ```
   npm run cypress:open
   ```
   This will open the Cypress Test Runner, where you can select and run specific tests.

## Docker Setup

For a containerized setup using Docker:

1. From the project root directory (where docker-compose.yml is located), build and start the containers:
   ```
   docker-compose up --build
   ```
   
   This will build and start both frontend and backend containers.

2. To stop the containers and remove volumes:
   ```
   docker-compose down -v
   ```

## Accessing the Application

- Frontend: http://localhost:5173 (or the port configured in your environment)
- Backend API: http://localhost:5500 (or the port configured in your environment)
- API Documentation: http://localhost:5500/api-docs (if Swagger is configured)

## Development Notes

- Backend hot-reloading is enabled via Custom Nodemon
- Frontend uses Vite for fast development experience
- The application uses environment variables for configuration
- Testing is handled through Cypress for end-to-end tests

## Troubleshooting

- If you encounter port conflicts, check your `.env` files to modify the ports
- Ensure all required environment variables are properly set
- For Docker issues, verify Docker and Docker Compose are correctly installed and running
- Check logs using `docker-compose logs` when using Docker

   
1. Required environment variables:

   **Backend (.env)**:
   ```
   NODE_ENV=development
   PORT=5500
   MONGODB_URI=your_mongodb_connection_string
   MONGO_USER=your_mongodb_username
   MONGO_PASSWORD=your_mongodb_password
   JWT_SECRET=your_jwt_secret_key
   JWT_LIFETIME=30d
   CORS_ORIGIN=http://localhost:5173
   ```

   **Frontend (.env)**:
   ```
   NODE_ENV=development
   VITE_API_URL=http://localhost:5500/
   FRONTEND_PORT=5173
   ```
