describe('Authentication Flows', () => {
  const testUser = {
    name: 'Test User',
    email: `test-user-${Date.now()}@example.com`,
    password: 'Password123'
  };

  beforeEach(() => {
    // Reset the application state before each test
    cy.visit('/');
  });

  it('should redirect unauthenticated user to login page', () => {
    // Try to access a protected route
    cy.visit('/dashboard');
    
    // Should be redirected to login page
    cy.url().should('include', '/login');
  });

  it('should allow user to register', () => {
    // Mock registration API
    cy.intercept('POST', '/api/users/register', {
      statusCode: 201,
      body: {
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 'user-123',
          name: testUser.name,
          email: testUser.email
        }
      }
    }).as('registerUser');
    
    // Mock tasks fetch that happens after login
    cy.intercept('GET', '/api/tasks*', {
      statusCode: 200,
      body: {
        success: true,
        count: 0,
        data: []
      }
    }).as('fetchTasks');
    
    // Visit register page
    cy.visit('/register');
    
    // Fill out the form with user details
    cy.get('[data-cy=name-input]').type(testUser.name);
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=password-confirmation-input]').type(testUser.password);

    // Submit the form
    cy.get('[data-cy=register-button]').click();
    
    // Wait for the registration API to be called
    cy.wait('@registerUser');
    
    // Should redirect to dashboard after successful registration
    cy.url().should('include', '/dashboard');
    
    // Logout for the next test
    cy.get('[data-cy=user-menu-button]').click();
    cy.get('[data-cy=logout-button]').click();
  });

  it('should allow user to login with the registered account', () => {
    // Mock login API
    cy.intercept('POST', '/api/users/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 'user-123',
          name: testUser.name,
          email: testUser.email
        }
      }
    }).as('loginUser');
    
    // Mock user profile fetch
    cy.intercept('GET', '/api/users/me', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 'user-123',
          name: testUser.name,
          email: testUser.email
        }
      }
    }).as('fetchUserProfile');
    
    // Mock tasks fetch
    cy.intercept('GET', '/api/tasks*', {
      statusCode: 200,
      body: {
        success: true,
        count: 0,
        data: []
      }
    }).as('fetchTasks');
    
    // Navigate to login page
    cy.visit('/login');
    
    // Enter the credentials of the previously registered user
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    
    // Submit the form
    cy.get('[data-cy=login-button]').click();
    
    // Wait for login API to be called
    cy.wait('@loginUser');
    
    // Should be redirected to dashboard after successful login
    cy.url().should('include', '/dashboard');
  });

  it('should show error message with invalid credentials', () => {
    // Mock failed login API
    cy.intercept('POST', '/api/users/login', {
      statusCode: 401,
      body: {
        success: false,
        error: 'Invalid credentials'
      }
    }).as('failedLogin');
    
    cy.visit('/login');
    
    // Fill out the form with invalid credentials
    cy.get('[data-cy=email-input]').type('nonexistent@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    
    // Submit the form
    cy.get('[data-cy=login-button]').click();
    
    // Wait for login API to be called
    cy.wait('@failedLogin');
    
    // Should show error message
    cy.contains('Invalid credentials').should('be.visible');
    
    // Should remain on login page
    cy.url().should('include', '/login');
  });

  it('should allow user to logout', () => {
    // Mock login API
    cy.intercept('POST', '/api/users/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 'user-123',
          name: testUser.name,
          email: testUser.email
        }
      }
    }).as('loginUser');
    
    // Mock tasks fetch
    cy.intercept('GET', '/api/tasks*', {
      statusCode: 200,
      body: {
        success: true,
        count: 0,
        data: []
      }
    }).as('fetchTasks');
    
    // Mock logout API if needed
    cy.intercept('POST', '/api/users/logout', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Logged out successfully'
      }
    }).as('logout');
    
    // Login with test user
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=login-button]').click();
    
    // Wait for login API to be called
    cy.wait('@loginUser');
    
    // Verify we're on the dashboard
    cy.url().should('include', '/dashboard');
    
    // Click on user menu and then logout
    cy.get('[data-cy=user-menu-button]').click();
    cy.get('[data-cy=logout-button]').click();
    
    // Should be redirected to login page
    cy.url().should('include', '/login');
    
    // Try to access protected route again
    cy.visit('/dashboard');
    
    // Should be redirected to login page again
    cy.url().should('include', '/login');
  });
});