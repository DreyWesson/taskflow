Cypress.Commands.add('login', (email, password) => {
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=login-button]').click();
    // Wait for navigation
    cy.url().should('include', '/dashboard');
  });
  
  // Register command
  Cypress.Commands.add('register', (name, email, password) => {
    cy.visit('/register');
    cy.get('[data-cy=name-input]').type(name);
    cy.get('[data-cy=email-input]').type(email);
    cy.get('[data-cy=password-input]').type(password);
    cy.get('[data-cy=password-confirmation-input]').type(password);
    cy.get('[data-cy=register-button]').click();
    // Wait for navigation
    cy.url().should('include', '/dashboard');
  });
  
  // Create task command
  Cypress.Commands.add('createTask', (title, description = '', priority = 'medium') => {
    cy.get('[data-cy=add-task-button]').click();
    cy.get('[data-cy=task-title-input]').type(title);
    if (description) {
      cy.get('[data-cy=task-description-input]').type(description);
    }
    cy.get('[data-cy=task-priority-select]').select(priority);
    cy.get('[data-cy=create-task-button]').click();
    // Verify task was created
    cy.contains(title).should('be.visible');
  });
  
  // Logout command
  Cypress.Commands.add('logout', () => {
    cy.get('[data-cy=user-menu-button]').click();
    cy.get('[data-cy=logout-button]').click();
    // Wait for navigation
    cy.url().should('include', '/login');
  });