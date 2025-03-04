describe('Profile Management', () => {
  const testUser = {
    name: 'Profile Test User',
    email: `profile-user-${Date.now()}@example.com`,
    password: 'Password123',
    newPassword: 'NewPassword456'
  };

  before(() => {
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
    
    // Mock tasks fetch that happens after registration
    cy.intercept('GET', '/api/tasks*', {
      statusCode: 200,
      body: {
        success: true,
        count: 0,
        data: []
      }
    }).as('fetchTasks');
    
    // Register a new user before all tests in this suite
    cy.visit('/register');
    cy.get('[data-cy=name-input]').type(testUser.name);
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=password-confirmation-input]').type(testUser.password);
    cy.get('[data-cy=register-button]').click();
    
    // Wait for the registration API to be called
    cy.wait('@registerUser');
    
    // Ensure we're redirected to dashboard, which means registration succeeded
    cy.url().should('include', '/dashboard');
    
    // Now log out to ensure a clean state
    cy.get('[data-cy=user-menu-button]').click();
    cy.get('[data-cy=logout-button]').click();
  });

  beforeEach(() => {
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
    
    // Explicitly go to login page first
    cy.visit('/login');
    
    // Login with test credentials
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=login-button]').click();
    
    // Wait for login API to be called
    cy.wait('@loginUser');
    
    // Ensure we get redirected to dashboard, which confirms successful login
    cy.url().should('include', '/dashboard');
    
    // Now navigate to profile page
    cy.get('[data-cy=user-menu-button]').click();
    cy.get('[data-cy=profile-link]').click();
    
    // Verify we're on the profile page
    cy.url().should('include', '/profile');
  });

  it('should display user profile information', () => {
    cy.get('[data-cy=name-input]').should('have.value', testUser.name);
    cy.get('[data-cy=email-input]').should('have.value', testUser.email);
  });

  it('should update user profile name', () => {
    const newName = `Updated Name ${Date.now()}`;
    
    // Mock profile update API
    cy.intercept('PATCH', '/api/users/me', {
      statusCode: 200,
      body: {
        success: true,
        data: {
          id: 'user-123',
          name: newName,
          email: testUser.email
        }
      }
    }).as('updateProfile');
    
    // Clear the field and type the new name
    cy.get('[data-cy=name-input]').clear().type(newName);
    
    // Submit the form
    cy.get('[data-cy=update-profile-button]').click();
    
    // Wait for the update API to be called
    cy.wait('@updateProfile');
    
    // Check for success message
    cy.contains('Profile updated successfully').should('be.visible');
    
    // Verify the input field has the updated value
    cy.get('[data-cy=name-input]').should('have.value', newName);
    
    // Update the test user object to keep track of the change
    testUser.name = newName;
  });

  it('should validate profile form fields', () => {
    // Try with empty name
    cy.get('[data-cy=name-input]').clear();
    cy.get('[data-cy=update-profile-button]').click();
    
    // Should show validation error
    cy.contains('Name is required').should('be.visible');
    
    // Try with too long name
    const longName = 'a'.repeat(51);
    cy.get('[data-cy=name-input]').clear().type(longName);
    cy.get('[data-cy=update-profile-button]').click();
    
    // Should show validation error for too long name
    cy.contains('Name must be less than 50 characters').should('be.visible');
    
    // Restore valid name to not affect other tests
    cy.get('[data-cy=name-input]').clear().type(testUser.name);
  });

  it('should change user password', () => {
    // Mock password change API
    cy.intercept('PATCH', '/api/users/change-password', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Password updated successfully'
      }
    }).as('changePassword');
    
    // Fill in the password change form
    cy.get('[data-cy=current-password-input]').type(testUser.password);
    cy.get('[data-cy=new-password-input]').type(testUser.newPassword);
    cy.get('[data-cy=confirm-password-input]').type(testUser.newPassword);
    
    // Submit the form
    cy.get('[data-cy=change-password-button]').click();
    
    // Wait for the password change API to be called
    cy.wait('@changePassword');
    
    // Should show success message
    cy.contains('Password updated successfully').should('be.visible');
    
    // Password form should be reset
    cy.get('[data-cy=current-password-input]').should('have.value', '');
    
    // Update our test user object with the new password
    testUser.password = testUser.newPassword;
  });


  it('should allow login with new password after change', () => {
    // Mock login API for the new password
    cy.intercept('POST', '/api/users/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'fake-jwt-token-new',
        user: {
          id: 'user-123',
          name: testUser.name,
          email: testUser.email
        }
      }
    }).as('loginWithNewPassword');
    
    // Mock tasks fetch that happens after login
    cy.intercept('GET', '/api/tasks*', {
      statusCode: 200,
      body: {
        success: true,
        count: 0,
        data: []
      }
    }).as('fetchTasksAfterNewLogin');
    
    // First logout
    cy.get('[data-cy=logout-button]').click();
    
    // Should be redirected to login
    cy.url().should('include', '/login');
    
    // Log in with new password
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password); // This is now the new password
    cy.get('[data-cy=login-button]').click();
    
    // Wait for login API to be called
    cy.wait('@loginWithNewPassword');
    
    // Should get to dashboard
    cy.url().should('include', '/dashboard');
  });
});
