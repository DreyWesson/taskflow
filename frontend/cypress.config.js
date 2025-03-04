import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173', // Updated to match Vite's default port
    viewportWidth: 1280,
    viewportHeight: 720,
    // Folders and files
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    // Screenshots and videos
    screenshotOnRunFailure: true,
    video: false,
    
    setupNodeEvents(on, config) {
      // Event listeners for various Cypress events
      on('task', {
        // Log to console
        log(message) {
          console.log(message);
          return null;
        },
        
        // Clear database (simplified example)
        clearDatabase() {
          console.log('Clearing database (mock implementation)');
          // In a real implementation, you would connect to your database
          // and clear the necessary collections
          return null;
        },
        
        // Create test user (simplified example)
        createTestUser({ email, password, name }) {
          console.log(`Creating test user: ${email}`);
          // In a real implementation, you would connect to your database
          // and create a user
          return { id: 'mock-user-id', email, name };
        }
      });
      
      return config;
    },
  },
});