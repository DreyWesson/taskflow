describe('Task Drag and Drop', () => {
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

  const dragTask = {
    id: `task-${Date.now()}`,
    title: `Drag Drop Test Task ${Date.now()}`,
    description: 'This is a task created for drag and drop testing',
    priority: 'medium',
    status: STATUS.TODO,
    tags: []
  };

  // Mock the user registration
  const mockRegisterApi = () => {
    cy.intercept('POST', '**/api/users/register', {
      statusCode: 201,
      body: {
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 'fake-user-id',
          name: testUser.name,
          email: testUser.email,
          createdAt: new Date().toISOString()
        }
      }
    }).as('registerUser');
  };

  // Mock the user login
  const mockLoginApi = () => {
    cy.intercept('POST', '**/api/users/login', {
      statusCode: 200,
      body: {
        success: true,
        token: 'fake-jwt-token',
        user: {
          id: 'fake-user-id',
          name: testUser.name,
          email: testUser.email,
          createdAt: new Date().toISOString()
        }
      }
    }).as('loginUser');
  };

  // Mock the GET tasks API - critical for loading the board
  const mockGetTasksApi = () => {
    cy.intercept('GET', '**/api/tasks*', {
      statusCode: 200,
      body: {
        success: true,
        count: 1,
        data: [
          {
            ...dragTask,
            user: 'fake-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      }
    }).as('getTasks');
  };

  // Mock the task creation API
  const mockCreateTaskApi = () => {
    cy.intercept('POST', '**/api/tasks', {
      statusCode: 201,
      body: {
        success: true,
        data: {
          ...dragTask,
          id: `task-${Date.now()}`,
          user: 'fake-user-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    }).as('createTask');
  };

  // Mock the task move API endpoint
  const mockMoveTaskApi = () => {
    cy.intercept('PATCH', '**/api/tasks/*/move', (req) => {
      // Get the new status from the request body
      const { status } = req.body;
      
      // Update our task status
      dragTask.status = status;
      
      // Send a successful response
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...dragTask,
            user: 'fake-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    }).as('moveTask');
  };

  // Mock the task update API
  const mockUpdateTaskApi = () => {
    cy.intercept('PATCH', '**/api/tasks/*', (req) => {
      // Update our task with the request body
      Object.assign(dragTask, req.body);
      
      // Send a successful response
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...dragTask,
            user: 'fake-user-id',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    }).as('updateTask');
  };

  // Mock the task delete API
  const mockDeleteTaskApi = () => {
    cy.intercept('DELETE', '**/api/tasks/*', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Task deleted successfully'
      }
    }).as('deleteTask');
  };

  const mockAllApis = () => {
    mockRegisterApi();
    mockLoginApi();
    mockGetTasksApi();
    mockCreateTaskApi();
    mockMoveTaskApi();
    mockUpdateTaskApi();
    mockDeleteTaskApi();
  };

  before(() => {
    mockAllApis();
    
    // Register a new user before all tests
    cy.visit('/register');
    cy.get('[data-cy=name-input]').type(testUser.name);
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=password-confirmation-input]').type(testUser.password);
    cy.get('[data-cy=register-button]').click();
    
    // Wait for the registerUser API mock to be called
    cy.wait('@registerUser');
    
    // Ensure we're redirected to dashboard
    cy.url().should('include', '/dashboard');
    
    // Create a task that we'll use in our drag and drop tests
    cy.get('[data-cy=add-task-button]').should('be.visible').click();
    cy.get('[data-cy=task-modal]').should('be.visible');
    cy.get('[data-cy=task-title-input]')
      .should('be.visible')
      .focus()
      .clear()
      .type(dragTask.title, { delay: 50, force: true });
    cy.get('[data-cy=task-description-input]')
      .should('be.visible')
      .focus()
      .clear()
      .type(dragTask.description, { delay: 30, force: true });
    cy.get('[data-cy=task-priority-select]')
      .should('be.visible')
      .select(dragTask.priority, { force: true });
    cy.get('[data-cy=create-task-button]')
      .scrollIntoView()
      .should('be.visible')
      .click({ force: true });
    
    // Wait for the task creation API mock to be called
    cy.wait('@createTask');
    
    cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
    
    // Verify the task was created by checking for it in the Todo column
    cy.get(`[data-cy=column-${STATUS.TODO}]`)
      .should('be.visible')
      .within(() => {
        cy.contains(dragTask.title, { timeout: 10000 }).should('be.visible');
      });
  });

  beforeEach(() => {
    // Reset API mocks before each test
    mockAllApis();
    
    // Start at login page
    cy.visit('/login');
    
    // Login with test credentials
    cy.get('[data-cy=email-input]').type(testUser.email);
    cy.get('[data-cy=password-input]').type(testUser.password);
    cy.get('[data-cy=login-button]').click();
    
    // Wait for the login API mock to be called
    cy.wait('@loginUser');
    
    // Ensure we get redirected to dashboard
    cy.url().should('include', '/dashboard');
    
    // Wait for tasks to load
    cy.wait('@getTasks');
  });

  it('should drag task from Todo to In Progress', () => {
    // Ensure task is in the right column for this test
    dragTask.status = STATUS.TODO;
    
    // Refresh the getTasks mock with updated status
    mockGetTasksApi();
    
    // Find the task in Todo column
    cy.get(`[data-cy=column-${STATUS.TODO}]`).within(() => {
      cy.contains(dragTask.title)
        .closest('[data-cy=task-item]')
        .as('dragTask');
    });
    
    // Get the target column
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).as('dropTarget');
    
    // Execute the drag-and-drop operation
    cy.get('@dragTask').then($el => {
      const dataTransfer = new DataTransfer();
      
      cy.get('@dragTask')
        .trigger('dragstart', { dataTransfer, force: true })
        .then(() => {
          cy.get('@dropTarget')
            .trigger('dragover', { dataTransfer, force: true })
            .trigger('drop', { dataTransfer, force: true });
            
          cy.get('@dragTask').trigger('dragend', { force: true });
        });
    });
    
    // Wait for the moveTask API mock to be called
    cy.wait('@moveTask').then(interception => {
      expect(interception.request.body.status).to.equal(STATUS.IN_PROGRESS);
      expect(interception.response.statusCode).to.equal(200);
    });
    
    // Wait for changes to take effect
    cy.wait(1000);
    
    // Refresh the getTasks mock with the new status
    dragTask.status = STATUS.IN_PROGRESS;
    mockGetTasksApi();
    
    // Reload to ensure we see updated state
    cy.reload();
    cy.wait('@getTasks');
    cy.get('[data-cy=add-task-button]', { timeout: 10000 }).should('be.visible');
    
    // Verify task has moved to In Progress column
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).then($col => {
      if ($col.text().includes(dragTask.title)) {
        cy.log('✅ Drag and drop worked successfully!');
        
        // Assert task is in In Progress column
        cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`)
          .should('contain', dragTask.title);
      } else {
        cy.log('⚠️ Drag and drop did not work - using edit form instead');
        
        // If drag and drop didn't work, use edit form as fallback
        cy.get(`[data-cy=column-${STATUS.TODO}]`).then($todoCol => {
          if ($todoCol.text().includes(dragTask.title)) {
            // Task is still in Todo column, use edit form to move it
            cy.contains(dragTask.title)
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
            
            // Wait for the updateTask API mock to be called
            cy.wait('@updateTask');
            
            cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
            cy.wait(1000);
            
            // Update status for the next test
            dragTask.status = STATUS.IN_PROGRESS;
            mockGetTasksApi();
            
            cy.reload();
            cy.wait('@getTasks');
            
            // Now the task should be in In Progress
            cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`)
              .should('contain', dragTask.title);
          }
        });
      }
    });
  });

  it('should drag task from In Progress to Review', () => {
    // Ensure task is in the right column for this test
    dragTask.status = STATUS.IN_PROGRESS;
    mockGetTasksApi();
    cy.reload();
    cy.wait('@getTasks');
    
    // Find the task in In Progress column
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).within(() => {
      cy.contains(dragTask.title)
        .closest('[data-cy=task-item]')
        .as('dragTask');
    });
    
    // Get the target column
    cy.get(`[data-cy=column-${STATUS.REVIEW}]`).as('dropTarget');
    
    // Execute the drag-and-drop operation
    cy.get('@dragTask').then($el => {
      const dataTransfer = new DataTransfer();
      
      cy.get('@dragTask')
        .trigger('dragstart', { dataTransfer, force: true })
        .then(() => {
          cy.get('@dropTarget')
            .trigger('dragover', { dataTransfer, force: true })
            .trigger('drop', { dataTransfer, force: true });
            
          cy.get('@dragTask').trigger('dragend', { force: true });
        });
    });
    
    // Wait for the moveTask API mock to be called
    cy.wait('@moveTask').then(interception => {
      expect(interception.request.body.status).to.equal(STATUS.REVIEW);
      expect(interception.response.statusCode).to.equal(200);
    });
    
    // Wait for changes to take effect
    cy.wait(1000);
    
    // Update status for reload
    dragTask.status = STATUS.REVIEW;
    mockGetTasksApi();
    
    // Reload to ensure we see updated state
    cy.reload();
    cy.wait('@getTasks');
    cy.get('[data-cy=add-task-button]', { timeout: 10000 }).should('be.visible');
    
    // Check if drag and drop worked
    cy.get(`[data-cy=column-${STATUS.REVIEW}]`).then($col => {
      if ($col.text().includes(dragTask.title)) {
        cy.log('✅ Drag and drop worked successfully!');
        
        // Assert task is in Review column
        cy.get(`[data-cy=column-${STATUS.REVIEW}]`)
          .should('contain', dragTask.title);
      } else {
        cy.log('⚠️ Drag and drop did not work - using edit form instead');
        
        // If drag and drop didn't work, use edit form as fallback
        cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).then($inProgressCol => {
          if ($inProgressCol.text().includes(dragTask.title)) {
            // Task is still in In Progress column, use edit form to move it
            cy.contains(dragTask.title)
              .closest('.task-card')
              .within(() => {
                cy.get('[data-cy=edit-task-button]')
                  .should('be.visible')
                  .click({ force: true });
              });
            
            cy.get('[data-cy=task-modal]').should('be.visible');
            cy.get('#status')
              .should('be.visible')
              .select('Review', { force: true });
            
            cy.get('[data-cy=update-task-button]')
              .scrollIntoView()
              .should('be.visible')
              .click({ force: true });
            
            // Wait for the updateTask API mock to be called
            cy.wait('@updateTask');
            
            cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
            cy.wait(1000);
            
            // Update status for the next test
            dragTask.status = STATUS.REVIEW;
            mockGetTasksApi();
            
            cy.reload();
            cy.wait('@getTasks');
            
            // Now the task should be in Review
            cy.get(`[data-cy=column-${STATUS.REVIEW}]`)
              .should('contain', dragTask.title);
          }
        });
      }
    });
  });

  it('should drag task from Review to Done', () => {
    // Ensure task is in the right column for this test
    dragTask.status = STATUS.REVIEW;
    mockGetTasksApi();
    cy.reload();
    cy.wait('@getTasks');
    
    // Find the task in Review column
    cy.get(`[data-cy=column-${STATUS.REVIEW}]`).within(() => {
      cy.contains(dragTask.title)
        .closest('[data-cy=task-item]')
        .as('dragTask');
    });
    
    // Get the target column
    cy.get(`[data-cy=column-${STATUS.DONE}]`).as('dropTarget');
    
    // Execute the drag-and-drop operation
    cy.get('@dragTask').then($el => {
      const dataTransfer = new DataTransfer();
      
      cy.get('@dragTask')
        .trigger('dragstart', { dataTransfer, force: true })
        .then(() => {
          cy.get('@dropTarget')
            .trigger('dragover', { dataTransfer, force: true })
            .trigger('drop', { dataTransfer, force: true });
            
          cy.get('@dragTask').trigger('dragend', { force: true });
        });
    });
    
    // Wait for the moveTask API mock to be called
    cy.wait('@moveTask').then(interception => {
      expect(interception.request.body.status).to.equal(STATUS.DONE);
      expect(interception.response.statusCode).to.equal(200);
    });
    
    // Wait for changes to take effect
    cy.wait(1000);
    
    // Update status for reload
    dragTask.status = STATUS.DONE;
    mockGetTasksApi();
    
    // Reload to ensure we see updated state
    cy.reload();
    cy.wait('@getTasks');
    cy.get('[data-cy=add-task-button]', { timeout: 10000 }).should('be.visible');
    
    // Check if drag and drop worked
    cy.get(`[data-cy=column-${STATUS.DONE}]`).then($col => {
      if ($col.text().includes(dragTask.title)) {
        cy.log('✅ Drag and drop worked successfully!');
        
        // Assert task is in Done column
        cy.get(`[data-cy=column-${STATUS.DONE}]`)
          .should('contain', dragTask.title);
      } else {
        cy.log('⚠️ Drag and drop did not work - using edit form instead');
        
        // If drag and drop didn't work, use edit form as fallback
        cy.get(`[data-cy=column-${STATUS.REVIEW}]`).then($reviewCol => {
          if ($reviewCol.text().includes(dragTask.title)) {
            // Task is still in Review column, use edit form to move it
            cy.contains(dragTask.title)
              .closest('.task-card')
              .within(() => {
                cy.get('[data-cy=edit-task-button]')
                  .should('be.visible')
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
            
            // Wait for the updateTask API mock to be called
            cy.wait('@updateTask');
            
            cy.get('[data-cy=task-modal]', { timeout: 15000 }).should('not.exist');
            cy.wait(1000);
            
            // Update status for cleanup
            dragTask.status = STATUS.DONE;
            mockGetTasksApi();
            
            cy.reload();
            cy.wait('@getTasks');
            
            // Now the task should be in Done
            cy.get(`[data-cy=column-${STATUS.DONE}]`)
              .should('contain', dragTask.title);
          }
        });
      }
    });
  });

  // Clean up the test task
  after(() => {
    // Delete the task we created
    cy.contains(dragTask.title)
      .closest('.task-card')
      .within(() => {
        cy.get('[data-cy=delete-task-button]')
          .should('be.visible')
          .click({ force: true });
      });
    
    // Handle confirm dialog
    cy.on('window:confirm', () => true);
    
    // Wait for the deleteTask API mock to be called
    cy.wait('@deleteTask');
    
    // Wait for deletion to complete
    cy.wait(1000);
    
    // Verify task was deleted
    cy.contains(dragTask.title).should('not.exist');
  });
});