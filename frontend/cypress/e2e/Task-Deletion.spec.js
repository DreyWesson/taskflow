describe('Task Deletion', () => {
  const testUser = {
    name: 'Task User',
    email: `task-user-${Date.now()}@example.com`,
    password: 'Password123'
  };

  const STATUS = {
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    REVIEW: "review",
    DONE: "done",
  };

  before(() => {
    // Register a new user before all tests
    cy.visit('/register');
    cy.get('[data-cy=name-input]').type(testUser.name);
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=password-confirmation-input]').type(testUser.password);
    cy.get('[data-cy=register-button]').click();
    
    // Ensure we're redirected to dashboard
    cy.url().should('include', '/dashboard');
  });

  beforeEach(() => {
    // Set up intercepts for delete API calls without using cy commands inside the callback
    cy.intercept('DELETE', '**/api/tasks/**', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Task deleted successfully'
      }
    }).as('deleteTask');
    
    // Start at login page
    cy.visit('/login');
    
    // Login with test credentials
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=login-button]').click();
    
    // Ensure we get redirected to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should delete a task from the Todo column', () => {
    // Create a new task first
    const taskTitle = `Delete Test Task 1 ${Date.now()}`;
    
    cy.get('[data-cy=add-task-button]').should('be.visible').click();
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('[data-cy=task-title-input]')
      .should('be.visible')
      .type(taskTitle, { delay: 50, force: true });
    cy.get('[data-cy=create-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for modal to disappear
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    cy.wait(1000);
    
    // Verify task was created
    cy.get(`[data-cy=column-${STATUS.TODO}]`)
      .should('contain', taskTitle);
    
    // Delete the task
    cy.contains(taskTitle)
      .closest('.task-card')
      .scrollIntoView() // Scroll the task card into view
      .within(() => {
        cy.get('[data-cy=delete-task-button]')
          .should('exist') // Check existence instead of visibility
          .click({ force: true });
      });
    
    // Handle confirm dialog if it appears
    const stub = cy.stub();
    stub.returns(true);
    cy.on('window:confirm', stub);
    
    // Wait for the delete API request to complete
    cy.wait('@deleteTask');
    
    // Verify the task was deleted
    cy.get(`[data-cy=column-${STATUS.TODO}]`).should('not.contain', taskTitle);
  });

  it('should delete a task from the In Progress column', () => {
    // Create a new task and move it to In Progress
    const taskTitle = `Delete Test Task 2 ${Date.now()}`;
    
    // Create task
    cy.get('[data-cy=add-task-button]').should('be.visible').click();
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('[data-cy=task-title-input]')
      .should('be.visible')
      .type(taskTitle, { delay: 50, force: true });
    cy.get('[data-cy=create-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for modal to disappear
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    cy.wait(1000);
    
    // Move task to In Progress
    cy.contains(taskTitle)
      .closest('.task-card')
      .within(() => {
        cy.get('[data-cy=edit-task-button]')
          .should('be.visible')
          .click({ force: true });
      });
    
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('#status')
      .should('be.visible')
      .select('In Progress', { force: true });
    
    cy.get('[data-cy=update-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for modal to disappear
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    
    // Reload to ensure we see the updated state
    cy.reload();
    cy.get('[data-cy=add-task-button]', { timeout: 10000 }).should('be.visible');
    
    // Verify task is in In Progress column
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`)
      .should('contain', taskTitle);
    
    // Delete the task
    cy.contains(taskTitle)
      .closest('.task-card')
      .within(() => {
        cy.get('[data-cy=delete-task-button]')
          .should('be.visible')
          .click({ force: true });
      });
    
    // Handle confirm dialog if it appears
    cy.on('window:confirm', () => true);
    
    // Wait for the delete API request to complete
    cy.wait('@deleteTask');
    
    // Verify the task was deleted
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).should('not.contain', taskTitle);
  });

  it('should cancel task deletion', () => {
    // Create a new task
    const taskTitle = `Cancel Delete Task ${Date.now()}`;
    
    cy.get('[data-cy=add-task-button]').should('be.visible').click();
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('[data-cy=task-title-input]')
      .should('be.visible')
      .type(taskTitle, { delay: 50, force: true });
    cy.get('[data-cy=create-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for modal to disappear
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    cy.wait(1000);
    
    // Verify task was created
    cy.get(`[data-cy=column-${STATUS.TODO}]`)
      .should('contain', taskTitle);
    
    // Try to delete the task but cancel the confirmation
    cy.contains(taskTitle)
      .closest('.task-card')
      .within(() => {
        cy.get('[data-cy=delete-task-button]')
          .should('be.visible')
          .click({ force: true });
      });
    
    // Handle confirm dialog - cancel the deletion using a stub
    const cancelStub = cy.stub();
    cancelStub.returns(false);
    cy.on('window:confirm', cancelStub);
    
    
    // Verify the task still exists
    cy.get(`[data-cy=column-${STATUS.TODO}]`).should('contain', taskTitle);
  });

  it('should handle server error during task deletion', () => {
    // Override the default intercept with an error response for this test
    cy.intercept('DELETE', '**/api/tasks/**', {
      statusCode: 500,
      body: {
        success: false,
        error: 'Server error occurred'
      }
    }).as('deleteTaskError');
    
    // Create a new task
    const taskTitle = `Error Test Task ${Date.now()}`;
    
    cy.get('[data-cy=add-task-button]').should('be.visible').click();
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('[data-cy=task-title-input]')
      .should('be.visible')
      .type(taskTitle, { delay: 50, force: true });
    cy.get('[data-cy=create-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for modal to disappear
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    cy.wait(1000);
    
    // Delete the task
    cy.contains(taskTitle)
      .closest('.task-card')
      .within(() => {
        cy.get('[data-cy=delete-task-button]')
          .should('be.visible')
          .click({ force: true });
      });
    
    // Handle confirm dialog
    cy.on('window:confirm', () => true);
    
    // Wait for the delete API request to complete
    cy.wait('@deleteTaskError');
    
    // The task should still be visible since deletion failed
    cy.get(`[data-cy=column-${STATUS.TODO}]`).should('contain', taskTitle);
  });

  it('should delete a completed task from the Done column', () => {
    // Create a new task and move it to Done
    const taskTitle = `Delete Done Task ${Date.now()}`;
    
    // Create task
    cy.get('[data-cy=add-task-button]').should('be.visible').click();
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('[data-cy=task-title-input]')
      .should('be.visible')
      .type(taskTitle, { delay: 50, force: true });
    cy.get('[data-cy=create-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for modal to disappear
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    cy.wait(1000);
    
    // Move task directly to Done
    cy.contains(taskTitle)
      .closest('.task-card')
      .within(() => {
        cy.get('[data-cy=edit-task-button]')
          .should('exist') 
          .click({ force: true });
      });
    
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('#status')
      .should('be.visible')
      .select('Done', { force: true });
    
    cy.get('[data-cy=update-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for modal to disappear
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    
    // Reload to ensure we see the updated state
    cy.reload();
    cy.get('[data-cy=add-task-button]', { timeout: 10000 }).should('be.visible');
    
    // Verify task is in Done column
    cy.get(`[data-cy=column-${STATUS.DONE}]`)
      .should('contain', taskTitle);
    
    // Delete the task
    cy.contains(taskTitle)
      .closest('.task-card')
      .within(() => {
        cy.get('[data-cy=delete-task-button]')
          .should('be.visible')
          .click({ force: true });
      });
    
    // Handle confirm dialog if it appears
    cy.on('window:confirm', () => true);
    
    // Wait for the delete API request to complete
    cy.wait('@deleteTask');
    
    // Verify the task was deleted
    cy.get(`[data-cy=column-${STATUS.DONE}]`).should('not.contain', taskTitle);
  });
});
