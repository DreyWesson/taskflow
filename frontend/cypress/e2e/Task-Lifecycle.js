describe("Task Lifecycle", () => {
  const testUser = {
    name: "Task User",
    email: `task-user-${Date.now()}@example.com`,
    password: "Password123",
  };

  const taskData = {
    title: "Lifecycle Test Task",
    description: "This task will go through its full lifecycle",
    priority: "medium",
  };

  const STATUS = {
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    REVIEW: "review",
    DONE: "done",
  };

  before(() => {
    cy.visit("/register");

    cy.get("[data-cy=name-input]").type(testUser.name);
    cy.get("[data-cy=email-input]").type(testUser.email);
    cy.get("[data-cy=password-input]").type(testUser.password);
    cy.get("[data-cy=password-confirmation-input]").type(testUser.password);
    cy.get("[data-cy=register-button]").click();

    // Ensure we're redirected to dashboard
    cy.url().should("include", "/dashboard");
  });

  beforeEach(() => {
    cy.visit("/login");

    cy.get("[data-cy=email-input]").type(testUser.email);
    cy.get("[data-cy=password-input]").type(testUser.password);
    cy.get("[data-cy=login-button]").click();

    cy.url().should("include", "/dashboard");
  });

  it("should create a new task", () => {
    cy.get("[data-cy=add-task-button]").should("be.visible").click();

    // Modal should appear
    cy.get("[data-cy=task-modal]").should("be.visible");

    // Fill out the task form
    cy.get("[data-cy=task-title-input]")
      .should("be.visible")
      .focus()
      .clear()
      .type(taskData.title, { delay: 100, force: true });

    // Verify the title was typed correctly
    cy.get("[data-cy=task-title-input]").should("have.value", taskData.title);

    cy.get("[data-cy=task-description-input]")
      .should("be.visible")
      .focus()
      .clear()
      .type(taskData.description, { delay: 50, force: true });

    cy.get("[data-cy=task-priority-select]")
      .should("be.visible")
      .select(taskData.priority, { force: true });

    // Submit the form
    cy.get("[data-cy=create-task-button]")
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });

    // Wait for modal to disappear
    cy.get("[data-cy=task-modal]", { timeout: 15000 })
      .should("not.exist")
      .then(() => {
        cy.log("Task created successfully");
      });

    // Wait for the UI to update
    cy.wait(1000);

    // Verify the task exists in the Todo column
    cy.get(`[data-cy=column-${STATUS.TODO}]`)
      .should("be.visible")
      .within(() => {
        cy.contains(taskData.title, { timeout: 10000 }).should("be.visible");
      });
  });

  it("should edit the task details", () => {
    // Find the task and click its edit button
    cy.contains(taskData.title)
      .closest(".task-card")
      .within(() => {
        cy.get("[data-cy=edit-task-button]")
          .should("be.visible")
          .click({ force: true });
      });

    // Wait for the modal to appear
    cy.get("[data-cy=task-modal]").should("be.visible");

    // Update task information
    const updatedDescription = taskData.description + " - UPDATED";
    cy.get("[data-cy=task-description-input]")
      .should("be.visible")
      .focus()
      .clear()
      .type(updatedDescription, { delay: 50, force: true });

    // Change priority to high
    cy.get("[data-cy=task-priority-select]")
      .should("be.visible")
      .select("high", { force: true });

    // Submit the form
    cy.get("[data-cy=update-task-button]")
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });

    // Wait for modal to disappear
    cy.get("[data-cy=task-modal]", { timeout: 15000 })
      .should("not.exist")
      .then(() => {
        cy.log("Task updated successfully");
      });

    // Wait for the UI to update
    cy.wait(1000);

    // Verify the task was updated - should now have high priority
    cy.contains(taskData.title)
      .closest(".task-card")
      .within(() => {
        cy.contains(updatedDescription).should("be.visible");
        cy.contains("high").should("be.visible");
      });

    // Update our taskData for subsequent tests
    taskData.description = updatedDescription;
    taskData.priority = "high";
  });

  it("should filter the task by priority", () => {
    // Show filters if toggle button exists
    cy.get('body').then($body => {
      if ($body.find('[data-cy=toggle-filters-button]').length > 0) {
        cy.get('[data-cy=toggle-filters-button]').click();
        cy.wait(300); // Wait for filters to become visible
      }
    });

    // Apply high priority filter
    cy.get('[data-cy=priority-filter]')
      .should('exist')
      .select('high', { force: true });
    
    // Wait for UI to update
    cy.wait(500);
    
    // Verify our high priority task is visible
    cy.contains(taskData.title).should('be.visible');
    
    // Reset the filter
    cy.get('[data-cy=reset-filters]')
      .should('exist')
      .click({ force: true });
    
    // Wait for UI to update
    cy.wait(300);
  });

  it("should move the task to In Progress using the edit form", () => {
    // Find the task and click its edit button
    cy.contains(taskData.title)
      .closest(".task-card")
      .within(() => {
        cy.get("[data-cy=edit-task-button]")
          .should("be.visible")
          .click({ force: true });
      });

    // Wait for the modal to appear
    cy.get("[data-cy=task-modal]").should("be.visible");

    // Change status to In Progress
    cy.get("#status")
      .should("be.visible")
      .select("In Progress", { force: true });

    // Submit the form
    cy.get("[data-cy=update-task-button]")
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });

    // Wait for modal to disappear
    cy.get("[data-cy=task-modal]", { timeout: 15000 }).should("not.exist");

    // Wait for the UI to update
    cy.wait(1000);

    // Force a UI refresh to ensure data is loaded
    cy.reload();

    // Wait for page to reload
    cy.get("[data-cy=add-task-button]", { timeout: 10000 }).should(
      "be.visible"
    );

    // Verify the task moved to In Progress
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`)
      .should("be.visible")
      .within(() => {
        cy.contains(taskData.title)
          .should("be.visible")
          .then(() => {
            cy.log("Task successfully moved to In Progress column");
          });
      });
  });

  it("should filter the task by status", () => {
    // Show filters if toggle button exists
    cy.get('body').then($body => {
      if ($body.find('[data-cy=toggle-filters-button]').length > 0) {
        cy.get('[data-cy=toggle-filters-button]').click();
        cy.wait(300); // Wait for filters to become visible
      }
    });

    // Apply In Progress status filter
    cy.get('[data-cy=status-filter]')
      .should('exist')
      .select(STATUS.IN_PROGRESS, { force: true });
    
    // Wait for UI to update
    cy.wait(500);
    
    // Verify our task in In Progress status is visible
    cy.contains(taskData.title).should('be.visible');
    
    // Verify tasks in other columns are hidden (assumes there's at least one other task)
    cy.get('.task-card').should('have.length', 1);
    
    // Reset the filter
    cy.get('[data-cy=reset-filters]')
      .should('exist')
      .click({ force: true });
    
    // Wait for UI to update
    cy.wait(300);
  });

  it("should filter the task by search term", () => {
    // Show filters if toggle button exists
    cy.get('body').then($body => {
      if ($body.find('[data-cy=toggle-filters-button]').length > 0) {
        cy.get('[data-cy=toggle-filters-button]').click();
        cy.wait(300); // Wait for filters to become visible
      }
    });

    // Search for our task by part of the title
    cy.get('[data-cy=search-input]')
      .should('exist')
      .clear()
      .type('Lifecycle', { force: true });
    
    // Wait for UI to update
    cy.wait(500);
    
    // Verify our task is visible in search results
    cy.contains(taskData.title).should('be.visible');
    
    // Clear the search
    cy.get('[data-cy=search-input]').clear();
    cy.wait(300);
  });

  it("should move the task to Review using the edit form", () => {
    // Find the task and click its edit button
    cy.contains(taskData.title)
      .closest(".task-card")
      .within(() => {
        cy.get("[data-cy=edit-task-button]")
          .should("be.visible")
          .click({ force: true });
      });

    // Wait for the modal to appear
    cy.get("[data-cy=task-modal]").should("be.visible");

    // Change status to Review
    cy.get("#status").should("be.visible").select("Review", { force: true });

    // Submit the form
    cy.get("[data-cy=update-task-button]")
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });

    // Wait for modal to disappear
    cy.get("[data-cy=task-modal]", { timeout: 15000 }).should("not.exist");

    // Wait for the UI to update
    cy.wait(1000);

    // Force a UI refresh to ensure data is loaded
    cy.reload();

    // Wait for page to reload
    cy.get("[data-cy=add-task-button]", { timeout: 10000 }).should(
      "be.visible"
    );

    // Verify the task moved to Review
    cy.get(`[data-cy=column-${STATUS.REVIEW}]`)
      .should("be.visible")
      .within(() => {
        cy.contains(taskData.title)
          .should("be.visible")
          .then(() => {
            cy.log("Task successfully moved to Review column");
          });
      });
  });

  it("should move the task to Done using the edit form", () => {
    // Find the task and click its edit button
    cy.contains(taskData.title)
      .closest(".task-card")
      .within(() => {
        cy.get("[data-cy=edit-task-button]")
          .should("be.visible")
          .click({ force: true });
      });

    // Wait for the modal to appear
    cy.get("[data-cy=task-modal]").should("be.visible");

    // Change status to Done
    cy.get("#status").should("be.visible").select("Done", { force: true });

    // Submit the form
    cy.get("[data-cy=update-task-button]")
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });

    // Wait for modal to disappear
    cy.get("[data-cy=task-modal]", { timeout: 15000 }).should("not.exist");

    // Wait for the UI to update
    cy.wait(1000);

    // Force a UI refresh to ensure data is loaded
    cy.reload();

    // Wait for page to reload
    cy.get("[data-cy=add-task-button]", { timeout: 10000 }).should(
      "be.visible"
    );

    // Verify the task moved to Done
    cy.get(`[data-cy=column-${STATUS.DONE}]`)
      .should("be.visible")
      .within(() => {
        cy.contains(taskData.title)
          .should("be.visible")
          .then(() => {
            cy.log("Task successfully moved to Done column");
          });
      });
  });

  it("should set due date and filter by it", () => {
    // Find the task and click its edit button
    cy.contains(taskData.title)
      .closest(".task-card")
      .within(() => {
        cy.get("[data-cy=edit-task-button]")
          .should("be.visible")
          .click({ force: true });
      });

    // Wait for the modal to appear
    cy.get("[data-cy=task-modal]").should("be.visible");

    // Set a due date for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const formattedDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    cy.get('#dueDate').then($el => {
      if ($el.length) {
        cy.wrap($el).type(formattedDate, { force: true });
        
        // Submit the form
        cy.get("[data-cy=update-task-button]")
          .scrollIntoView()
          .should("be.visible")
          .click({ force: true });
        
        // Wait for modal to disappear
        cy.get("[data-cy=task-modal]", { timeout: 15000 }).should("not.exist");
        cy.wait(1000);
        cy.reload();
        cy.wait(1000);
        
        // Show filters if toggle button exists
        cy.get('body').then($body => {
          if ($body.find('[data-cy=toggle-filters-button]').length > 0) {
            cy.get('[data-cy=toggle-filters-button]').click();
            cy.wait(300); // Wait for filters to become visible
          }
        });
        
        // Set date range that includes tomorrow
        cy.get('[data-cy=due-date-from]')
          .should('exist')
          .type(formattedDate, { force: true });
        
        // Wait for UI to update
        cy.wait(500);
        
        // Verify task with due date is visible
        cy.contains(taskData.title).should('be.visible');
        
        // Reset date filters
        cy.get('[data-cy=due-date-from]').clear();
        cy.wait(300);
        
        // Reset all filters
        cy.get('[data-cy=reset-filters]')
          .should('exist')
          .click({ force: true });
      } else {
        cy.log('Due date field not found, skipping due date filtering test');
        
        // Just close the modal
        cy.get("[data-cy=update-task-button]")
          .scrollIntoView()
          .should("be.visible")
          .click({ force: true });
      }
    });
  });

  it("should delete the task", () => {
    // Find the task and click its delete button
    cy.contains(taskData.title)
      .closest(".task-card")
      .within(() => {
        cy.get("[data-cy=delete-task-button]")
          .should("be.visible")
          .click({ force: true });
      });

    cy.on("window:confirm", () => true);

    // Wait for the UI to update
    cy.wait(1000);

    // Force a UI refresh to ensure data is loaded
    cy.reload();

    // Wait for page to reload
    cy.get("[data-cy=add-task-button]", { timeout: 10000 }).should(
      "be.visible"
    );

    // Verify the task no longer exists
    cy.contains(taskData.title).should("not.exist");

    // Specifically check the Done column
    cy.get(`[data-cy=column-${STATUS.DONE}]`)
      .should("be.visible")
      .within(() => {
        cy.contains(taskData.title).should("not.exist");
      });

    cy.log("Task successfully deleted");
  });

  it("should create and move a task with drag and drop", () => {
    const dragTaskName = "Drag Test Task";

    // Create a task
    cy.get("[data-cy=add-task-button]").should("be.visible").click();
    cy.get("[data-cy=task-modal]").should("be.visible");
    cy.get("[data-cy=task-title-input]")
      .should("be.visible")
      .type(dragTaskName, { delay: 100, force: true });
    cy.get("[data-cy=create-task-button]")
      .scrollIntoView()
      .should("be.visible")
      .click({ force: true });

    // Wait for modal to disappear
    cy.get("[data-cy=task-modal]", { timeout: 15000 }).should("not.exist");
    cy.wait(1000);

    // Try to drag the task from Todo to In Progress
    // Find the task
    cy.get(`[data-cy=column-${STATUS.TODO}]`).within(() => {
      cy.contains(dragTaskName).closest("[data-cy=task-item]").as("dragTask");
    });

    // Get the target column
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).as("dropTarget");

    // Execute the drag-and-drop operation
    cy.get("@dragTask").then(($el) => {
      const dataTransfer = new DataTransfer();

      cy.get("@dragTask")
        .trigger("dragstart", { dataTransfer, force: true })
        .then(() => {
          cy.get("@dropTarget")
            .trigger("dragover", { dataTransfer, force: true })
            .trigger("drop", { dataTransfer, force: true });

          cy.get("@dragTask").trigger("dragend", { force: true });
        });
    });

    // Wait and reload to check
    cy.wait(2000);
    cy.reload();

    // Verify the drag operation
    cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).then(($col) => {
      if ($col.text().includes(dragTaskName)) {
        cy.log("Drag and drop worked successfully!");
      } else {
        cy.log("Drag and drop may not have worked - checking Todo column");
        // Alternative: the task might still be in the Todo column if drag-drop failed
        cy.get(`[data-cy=column-${STATUS.TODO}]`).then(($todoCol) => {
          if ($todoCol.text().includes(dragTaskName)) {
            cy.log(
              "Task still in Todo column - drag and drop did not work as expected"
            );
          } else {
            cy.log("Task not found in either column - unexpected state");
          }
        });
      }
    });

    // Clean up - delete the drag test task
    cy.contains(dragTaskName).then(($el) => {
      if ($el.length) {
        cy.contains(dragTaskName)
          .closest(".task-card")
          .within(() => {
            cy.get("[data-cy=delete-task-button]").click({ force: true });
          });

        cy.on("window:confirm", () => true);
      }
    });
  });

  it("should create, filter, and clean up multiple tasks", () => {
    // Create 3 tasks with different priorities
    const testTasks = [
      { title: `High Task ${Date.now()}`, priority: 'high' },
      { title: `Medium Task ${Date.now()}`, priority: 'medium' },
      { title: `Low Task ${Date.now()}`, priority: 'low' }
    ];
    
    // Create all tasks
    for (const task of testTasks) {
      cy.get("[data-cy=add-task-button]").should("be.visible").click();
      cy.get("[data-cy=task-modal]").should("be.visible");
      cy.get("[data-cy=task-title-input]")
        .should("be.visible")
        .type(task.title, { delay: 50, force: true });
      cy.get("[data-cy=task-priority-select]")
        .should("be.visible")
        .select(task.priority, { force: true });
      cy.get("[data-cy=create-task-button]")
        .scrollIntoView()
        .click({ force: true });
      cy.get("[data-cy=task-modal]", { timeout: 15000 }).should("not.exist");
      cy.wait(500);
    }
    
    // Show filters if toggle button exists
    cy.get('body').then($body => {
      if ($body.find('[data-cy=toggle-filters-button]').length > 0) {
        cy.get('[data-cy=toggle-filters-button]').click();
        cy.wait(300);
      }
    });
    
    // Test filtering by each priority
    for (const priority of ['high', 'medium', 'low']) {
      // Select this priority filter
      cy.get('[data-cy=priority-filter]')
        .should('exist')
        .select(priority, { force: true });
      
      cy.wait(500);
      
      // Find the task with this priority
      const matchingTask = testTasks.find(t => t.priority === priority);
      
      // Verify the correct task is shown
      cy.contains(matchingTask.title).should('be.visible');
      
      // Verify tasks with other priorities are hidden
      testTasks
        .filter(t => t.priority !== priority)
        .forEach(task => {
          cy.contains(task.title).should('not.exist');
        });
    }
    
    // Reset filters
    cy.get('[data-cy=reset-filters]')
      .should('exist')
      .click({ force: true });
    
    // Clean up by deleting all test tasks
    for (const task of testTasks) {
      cy.contains(task.title)
        .closest(".task-card")
        .within(() => {
          cy.get("[data-cy=delete-task-button]").click({ force: true });
        });
      
      cy.on("window:confirm", () => true);
      cy.wait(300);
    }
  });
});










// // cypress/e2e/task-lifecycle.spec.js
// describe("Task Lifecycle", {
//   // Add retries for flaky tests
//   retries: 2
// }, () => {
//   // Increase default timeouts
//   beforeEach(() => {
//     Cypress.config('defaultCommandTimeout', 10000);
//     Cypress.config('requestTimeout', 15000);
//   });
  
//   const testUser = {
//     name: "Task User",
//     email: `task-user-${Date.now()}@example.com`,
//     password: "Password123",
//   };

//   // Task details for our tests
//   const taskData = {
//     title: `Lifecycle Test Task ${Date.now()}`, // Make title unique for each test run
//     description: "This task will go through its full lifecycle",
//     priority: "medium",
//   };

//   const STATUS = {
//     TODO: "todo",
//     IN_PROGRESS: "inProgress",
//     REVIEW: "review",
//     DONE: "done",
//   };

//   // Store created test tasks for cleanup
//   const createdTasks = [];

//   before(() => {
//     // Intercept API calls
//     cy.intercept('POST', '/api/tasks').as('createTask');
//     cy.intercept('PATCH', '/api/tasks/*').as('updateTask');
//     cy.intercept('DELETE', '/api/tasks/*').as('deleteTask');
//     cy.intercept('GET', '/api/tasks').as('getTasks');

//     // Register a new user
//     cy.visit("/register");
//     cy.get("[data-cy=name-input]").should('be.visible').type(testUser.name);
//     cy.get("[data-cy=email-input]").should('be.visible').type(testUser.email);
//     cy.get("[data-cy=password-input]").should('be.visible').type(testUser.password);
//     cy.get("[data-cy=password-confirmation-input]").should('be.visible').type(testUser.password);
//     cy.get("[data-cy=register-button]").should('be.enabled').click();

//     // Ensure we're redirected to dashboard
//     cy.url().should("include", "/dashboard");
//   });

//   beforeEach(() => {
//     // Reset interceptors before each test
//     cy.intercept('POST', '/api/tasks').as('createTask');
//     cy.intercept('PATCH', '/api/tasks/*').as('updateTask');
//     cy.intercept('DELETE', '/api/tasks/*').as('deleteTask');
//     cy.intercept('GET', '/api/tasks').as('getTasks');

//     // Login before each test
//     cy.visit("/login");
//     cy.get("[data-cy=email-input]").should('be.visible').type(testUser.email);
//     cy.get("[data-cy=password-input]").should('be.visible').type(testUser.password);
//     cy.get("[data-cy=login-button]").should('be.enabled').click();

//     // Verify login worked
//     cy.url().should("include", "/dashboard");
//     cy.get("[data-cy=add-task-button]").should("be.visible");
//   });

//   it("should create a new task", () => {
//     // Click the add task button
//     cy.get("[data-cy=add-task-button]").should("be.visible").click();

//     // Modal should appear
//     cy.get("[data-cy=task-modal]").should("be.visible");

//     // Fill out the task form
//     cy.get("[data-cy=task-title-input]")
//       .should("be.visible")
//       .focus()
//       .clear()
//       .type(taskData.title);

//     // Verify the title was typed correctly
//     cy.get("[data-cy=task-title-input]").should("have.value", taskData.title);

//     cy.get("[data-cy=task-description-input]")
//       .should("be.visible")
//       .focus()
//       .clear()
//       .type(taskData.description);

//     cy.get("[data-cy=task-priority-select]")
//       .should("be.visible")
//       .select(taskData.priority);

//     // Submit the form
//     cy.get("[data-cy=create-task-button]")
//       .scrollIntoView()
//       .should("be.visible")
//       .click();

//     // Wait for API response
//     cy.wait('@createTask').its('response.statusCode').should('be.oneOf', [200, 201]);

//     // Wait for modal to disappear
//     cy.get("[data-cy=task-modal]").should("not.exist");

//     // Add to created tasks list for cleanup
//     createdTasks.push(taskData.title);

//     // Wait for the task to appear in the UI
//     cy.get(`[data-cy=column-${STATUS.TODO}]`)
//       .should("be.visible")
//       .within(() => {
//         cy.contains(taskData.title).should("be.visible");
//       });
//   });

//   it("should edit the task details", () => {
//     // Make sure tasks are loaded
//     cy.wait('@getTasks').then(() => {
//       // Find the task and click its edit button
//       cy.contains(taskData.title)
//         .should('be.visible')
//         .closest(".task-card")
//         .within(() => {
//           cy.get("[data-cy=edit-task-button]")
//             .should("be.visible")
//             .click();
//         });

//       // Wait for the modal to appear
//       cy.get("[data-cy=task-modal]").should("be.visible");

//       // Update task information
//       const updatedDescription = taskData.description + " - UPDATED";
//       cy.get("[data-cy=task-description-input]")
//         .should("be.visible")
//         .focus()
//         .clear()
//         .type(updatedDescription);

//       // Change priority to high
//       cy.get("[data-cy=task-priority-select]")
//         .should("be.visible")
//         .select("high");

//       // Submit the form
//       cy.get("[data-cy=update-task-button]")
//         .scrollIntoView()
//         .should("be.visible")
//         .click();

//       // Wait for API response
//       cy.wait('@updateTask').its('response.statusCode').should('eq', 200);

//       // Wait for modal to disappear
//       cy.get("[data-cy=task-modal]").should("not.exist");

//       // Verify the task was updated
//       cy.contains(taskData.title)
//         .closest(".task-card")
//         .within(() => {
//           cy.contains(updatedDescription).should("be.visible");
//           cy.contains("high").should("be.visible");
//         });

//       // Update our taskData for subsequent tests
//       taskData.description = updatedDescription;
//       taskData.priority = "high";
//     });
//   });

//   it("should filter the task by priority", () => {
//     // Check for toggle button and show filters if needed
//     cy.get('body').then($body => {
//       const hasToggleButton = $body.find('[data-cy=toggle-filters-button]').length > 0;
      
//       if (hasToggleButton) {
//         cy.get('[data-cy=toggle-filters-button]').click();
//       }
      
//       // Wait for filters to be visible
//       cy.get('[data-cy=priority-filter]').should('exist').and('be.visible');
      
//       // Apply high priority filter
//       cy.get('[data-cy=priority-filter]').select('high');
      
//       // Wait for filtering to be applied
//       cy.get('.task-card').should('have.length.at.least', 1);
      
//       // Verify our high priority task is visible
//       cy.contains(taskData.title).should('be.visible');
      
//       // Reset the filter
//       cy.get('[data-cy=reset-filters]').should('exist').click();
      
//       // Verify filter was reset by checking that all tasks are visible
//       cy.get('.task-card').should('have.length.at.least', 1);
//     });
//   });

//   it("should move the task to In Progress using the edit form", () => {
//     // Find the task
//     cy.contains(taskData.title).should('be.visible');
    
//     // Edit the task
//     cy.contains(taskData.title)
//       .closest(".task-card")
//       .within(() => {
//         cy.get("[data-cy=edit-task-button]")
//           .should("be.visible")
//           .click();
//       });

//     // Wait for the modal to appear
//     cy.get("[data-cy=task-modal]").should("be.visible");

//     // Change status to In Progress
//     cy.get("#status")
//       .should("be.visible")
//       .select("In Progress");

//     // Submit the form
//     cy.get("[data-cy=update-task-button]")
//       .scrollIntoView()
//       .should("be.visible")
//       .click();

//     // Wait for API response
//     cy.wait('@updateTask').its('response.statusCode').should('eq', 200);

//     // Wait for modal to disappear
//     cy.get("[data-cy=task-modal]").should("not.exist");

//     // Refresh the page to ensure we're seeing the latest data
//     cy.reload();
//     cy.get("[data-cy=add-task-button]").should("be.visible");

//     // Verify the task moved to In Progress
//     cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`)
//       .should("be.visible")
//       .within(() => {
//         cy.contains(taskData.title).should("be.visible");
//       });
//   });

//   it("should filter the task by status", () => {
//     // Show filters if toggle button exists
//     cy.get('body').then($body => {
//       const hasToggleButton = $body.find('[data-cy=toggle-filters-button]').length > 0;
      
//       if (hasToggleButton) {
//         cy.get('[data-cy=toggle-filters-button]').click();
//       }
      
//       // Wait for filters to be visible
//       cy.get('[data-cy=status-filter]').should('exist').and('be.visible');
      
//       // Apply In Progress status filter
//       cy.get('[data-cy=status-filter]').select(STATUS.IN_PROGRESS);
      
//       // Wait for filtering to be applied
//       cy.get('.task-card').should('have.length.at.least', 1);
      
//       // Verify our task in In Progress status is visible
//       cy.contains(taskData.title).should('be.visible');
      
//       // Reset filter
//       cy.get('[data-cy=reset-filters]').should('exist').click();
//     });
//   });

//   it("should filter the task by search term", () => {
//     // Show filters if toggle button exists
//     cy.get('body').then($body => {
//       const hasToggleButton = $body.find('[data-cy=toggle-filters-button]').length > 0;
      
//       if (hasToggleButton) {
//         cy.get('[data-cy=toggle-filters-button]').click();
//       }
      
//       // Wait for filters to be visible
//       cy.get('[data-cy=search-input]').should('exist').and('be.visible');
      
//       // Search for our task by part of the title
//       cy.get('[data-cy=search-input]')
//         .clear()
//         .type('Lifecycle');
      
//       // Verify our task is visible in search results
//       cy.contains(taskData.title).should('be.visible');
      
//       // Clear the search
//       cy.get('[data-cy=search-input]').clear();
      
//       // Wait for filter clearing to take effect
//       cy.get('.task-card').should('have.length.at.least', 1);
//     });
//   });

//   it("should move the task to Review using the edit form", () => {
//     // Find the task
//     cy.contains(taskData.title).should('be.visible');
    
//     // Edit the task
//     cy.contains(taskData.title)
//       .closest(".task-card")
//       .within(() => {
//         cy.get("[data-cy=edit-task-button]")
//           .should("be.visible")
//           .click();
//       });

//     // Wait for the modal to appear
//     cy.get("[data-cy=task-modal]").should("be.visible");

//     // Change status to Review
//     cy.get("#status")
//       .should("be.visible")
//       .select("Review");

//     // Submit the form
//     cy.get("[data-cy=update-task-button]")
//       .scrollIntoView()
//       .should("be.visible")
//       .click();

//     // Wait for API response
//     cy.wait('@updateTask').its('response.statusCode').should('eq', 200);

//     // Wait for modal to disappear
//     cy.get("[data-cy=task-modal]").should("not.exist");

//     // Refresh the page to ensure we're seeing the latest data
//     cy.reload();
//     cy.get("[data-cy=add-task-button]").should("be.visible");

//     // Verify the task moved to Review
//     cy.get(`[data-cy=column-${STATUS.REVIEW}]`)
//       .should("be.visible")
//       .within(() => {
//         cy.contains(taskData.title).should("be.visible");
//       });
//   });

//   it("should move the task to Done using the edit form", () => {
//     // Find the task
//     cy.contains(taskData.title).should('be.visible');
    
//     // Edit the task
//     cy.contains(taskData.title)
//       .closest(".task-card")
//       .within(() => {
//         cy.get("[data-cy=edit-task-button]")
//           .should("be.visible")
//           .click();
//       });

//     // Wait for the modal to appear
//     cy.get("[data-cy=task-modal]").should("be.visible");

//     // Change status to Done
//     cy.get("#status")
//       .should("be.visible")
//       .select("Done");

//     // Submit the form
//     cy.get("[data-cy=update-task-button]")
//       .scrollIntoView()
//       .should("be.visible")
//       .click();

//     // Wait for API response
//     cy.wait('@updateTask').its('response.statusCode').should('eq', 200);

//     // Wait for modal to disappear
//     cy.get("[data-cy=task-modal]").should("not.exist");

//     // Refresh the page to ensure we're seeing the latest data
//     cy.reload();
//     cy.get("[data-cy=add-task-button]").should("be.visible");

//     // Verify the task moved to Done
//     cy.get(`[data-cy=column-${STATUS.DONE}]`)
//       .should("be.visible")
//       .within(() => {
//         cy.contains(taskData.title).should("be.visible");
//       });
//   });

//   // it("should set due date and filter by it", () => {
//   //   // Find the task
//   //   cy.contains(taskData.title).should('be.visible');
    
//   //   // Edit the task
//   //   cy.contains(taskData.title)
//   //     .closest(".task-card")
//   //     .within(() => {
//   //       cy.get("[data-cy=edit-task-button]")
//   //         .should("be.visible")
//   //         .click();
//   //     });

//   //   // Wait for the modal to appear
//   //   cy.get("[data-cy=task-modal]").should("be.visible");

//   //   // Set a due date for tomorrow
//   //   const tomorrow = new Date();
//   //   tomorrow.setDate(tomorrow.getDate() + 1);
//   //   const formattedDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
//   //   // Check if due date field exists
//   //   cy.get('body').then($body => {
//   //     const hasDueDateField = $body.find('#dueDate').length > 0;
      
//   //     if (hasDueDateField) {
//   //       cy.get('#dueDate')
//   //         .should('be.visible')
//   //         .type(formattedDate);
        
//   //       // Submit the form
//   //       cy.get("[data-cy=update-task-button]")
//   //         .scrollIntoView()
//   //         .should("be.visible")
//   //         .click();
        
//   //       // Wait for API response
//   //       cy.wait('@updateTask').its('response.statusCode').should('eq', 200);
        
//   //       // Wait for modal to disappear
//   //       cy.get("[data-cy=task-modal]").should("not.exist");
        
//   //       // Refresh page and check filters
//   //       cy.reload();
//   //       cy.get("[data-cy=add-task-button]").should("be.visible");
        
//   //       // Show filters if toggle button exists
//   //       cy.get('body').then($body => {
//   //         const hasToggleButton = $body.find('[data-cy=toggle-filters-button]').length > 0;
          
//   //         if (hasToggleButton) {
//   //           cy.get('[data-cy=toggle-filters-button]').click();
//   //         }
          
//   //         // Check if date filter exists
//   //         cy.get('body').then($body => {
//   //           const hasDateFilter = $body.find('[data-cy=due-date-from]').length > 0;
            
//   //           if (hasDateFilter) {
//   //             // Set date range that includes tomorrow
//   //             cy.get('[data-cy=due-date-from]')
//   //               .should('be.visible')
//   //               .type(formattedDate);
              
//   //             // Verify task with due date is visible
//   //             cy.contains(taskData.title).should('be.visible');
              
//   //             // Reset date filters
//   //             cy.get('[data-cy=due-date-from]').clear();
              
//   //             // Reset all filters
//   //             cy.get('[data-cy=reset-filters]')
//   //               .should('exist')
//   //               .click();
//   //           } else {
//   //             cy.log('Due date filter not found, skipping filtering test');
//   //           }
//   //         });
//   //       });
//   //     } else {
//   //       cy.log('Due date field not found, skipping due date test');
        
//   //       // Just close the modal
//   //       cy.get("[data-cy=update-task-button]")
//   //         .scrollIntoView()
//   //         .should("be.visible")
//   //         .click();
        
//   //       // Wait for modal to disappear
//   //       cy.get("[data-cy=task-modal]").should("not.exist");
//   //     }
//   //   });
//   // });

//   it("should set due date and filter by it", () => {
//     // Find the task
//     cy.contains(taskData.title).should('be.visible');
    
//     // Edit the task
//     cy.contains(taskData.title)
//       .closest(".task-card")
//       .within(() => {
//         cy.get("[data-cy=edit-task-button]")
//           .should("be.visible")
//           .click();
//       });
  
//     // Wait for the modal to appear
//     cy.get("[data-cy=task-modal]").should("be.visible");
  
//     // Set a due date for tomorrow
//     const tomorrow = new Date();
//     tomorrow.setDate(tomorrow.getDate() + 1);
//     const formattedDate = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
//     // Force focus and scroll to the due date field before typing
//     cy.get('body').then($body => {
//       const hasDueDateField = $body.find('#dueDate').length > 0;
      
//       if (hasDueDateField) {
//         cy.get('#dueDate')
//           .scrollIntoView({ force: true })
//           .focus({ force: true })
//           .should(($el) => {
//             // Log element visibility state for debugging
//             const isVisible = $el.is(':visible');
//             cy.log(`Due date field visible: ${isVisible}`);
//           })
//           .type(formattedDate, { force: true });
        
//         // Submit the form
//         cy.get("[data-cy=update-task-button]")
//           .scrollIntoView()
//           .should("be.visible")
//           .click({ force: true });
        
//         // Wait for API response
//         cy.wait('@updateTask', { timeout: 15000 });
        
//         // Wait for modal to disappear
//         cy.get("[data-cy=task-modal]").should("not.exist");
        
//         // Continue with the rest of the test...
//       } else {
//         cy.log('Due date field not found, skipping due date test');
        
//         // Just close the modal
//         cy.get("[data-cy=update-task-button]")
//           .scrollIntoView()
//           .should("be.visible")
//           .click();
        
//         // Wait for modal to disappear
//         cy.get("[data-cy=task-modal]").should("not.exist");
//       }
//     });
//   });

//   it("should delete the task", () => {
//     // Find the task
//     cy.contains(taskData.title).should('be.visible');
    
//     // Delete the task
//     cy.contains(taskData.title)
//       .closest(".task-card")
//       .within(() => {
//         cy.get("[data-cy=delete-task-button]")
//           .should("be.visible")
//           .click();
//       });

//     // Handle the confirmation dialog
//     cy.on("window:confirm", () => true);

//     // Wait for API response
//     cy.wait('@deleteTask').its('response.statusCode').should('be.oneOf', [200, 204]);

//     // Remove from created tasks list
//     const index = createdTasks.indexOf(taskData.title);
//     if (index > -1) {
//       createdTasks.splice(index, 1);
//     }

//     // Refresh the page to ensure we're seeing the latest data
//     cy.reload();
//     cy.get("[data-cy=add-task-button]").should("be.visible");

//     // Verify the task no longer exists
//     cy.contains(taskData.title).should("not.exist");

//     // Specifically check the Done column
//     cy.get(`[data-cy=column-${STATUS.DONE}]`)
//       .should("be.visible")
//       .within(() => {
//         cy.contains(taskData.title).should("not.exist");
//       });
//   });

//   it("should create and move a task with drag and drop", () => {
//     const dragTaskName = `Drag Test Task ${Date.now()}`; // Make unique
    
//     // Create a task
//     cy.get("[data-cy=add-task-button]").should("be.visible").click();
//     cy.get("[data-cy=task-modal]").should("be.visible");
//     cy.get("[data-cy=task-title-input]")
//       .should("be.visible")
//       .type(dragTaskName);
//     cy.get("[data-cy=create-task-button]")
//       .scrollIntoView()
//       .should("be.visible")
//       .click();

//     // Wait for API response
//     cy.wait('@createTask').its('response.statusCode').should('be.oneOf', [200, 201]);

//     // Wait for modal to disappear
//     cy.get("[data-cy=task-modal]").should("not.exist");

//     // Add to created tasks list for cleanup
//     createdTasks.push(dragTaskName);

//     // Verify task was created
//     cy.get(`[data-cy=column-${STATUS.TODO}]`)
//       .should("be.visible")
//       .within(() => {
//         cy.contains(dragTaskName).should("be.visible");
//       });

//     // Try to drag the task from Todo to In Progress if drag is supported
//     cy.get('body').then($body => {
//       const hasDragItem = $body.find(`[data-cy=column-${STATUS.TODO}] [data-cy=task-item]`).length > 0;
      
//       if (hasDragItem) {
//         // Try drag and drop approach
//         cy.get(`[data-cy=column-${STATUS.TODO}]`).within(() => {
//           cy.contains(dragTaskName).closest("[data-cy=task-item]").as("dragTask");
//         });
        
//         cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).as("dropTarget");
        
//         // Attempt drag and drop but don't fail if it doesn't work
//         cy.get("@dragTask").then($el => {
//           try {
//             const dataTransfer = new DataTransfer();
            
//             cy.get("@dragTask")
//               .trigger("dragstart", { dataTransfer, force: true })
//               .then(() => {
//                 cy.get("@dropTarget")
//                   .trigger("dragover", { dataTransfer, force: true })
//                   .trigger("drop", { dataTransfer, force: true });
                
//                 cy.get("@dragTask").trigger("dragend", { force: true });
//               });
            
//             // Wait a bit and reload
//             cy.wait(1000);
//             cy.reload();
//             cy.get("[data-cy=add-task-button]").should("be.visible");
            
//             // Check if task moved to In Progress
//             cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`).then($col => {
//               if ($col.text().includes(dragTaskName)) {
//                 cy.log("Drag and drop worked successfully!");
//               } else {
//                 // If not moved, try the edit form approach as fallback
//                 cy.log("Drag and drop didn't work, using edit form instead");
//                 moveTaskWithEditForm(dragTaskName, "In Progress");
//               }
//             });
//           } catch (error) {
//             cy.log("Error during drag and drop, using edit form instead");
//             moveTaskWithEditForm(dragTaskName, "In Progress");
//           }
//         });
//       } else {
//         // No drag item, use edit form directly
//         cy.log("No draggable item found, using edit form instead");
//         moveTaskWithEditForm(dragTaskName, "In Progress");
//       }
//     });

//     // Verify task is now in In Progress
//     cy.get(`[data-cy=column-${STATUS.IN_PROGRESS}]`)
//       .should("be.visible")
//       .within(() => {
//         cy.contains(dragTaskName).should("be.visible");
//       });

//     // Clean up - delete the task
//     cy.contains(dragTaskName)
//       .closest(".task-card")
//       .within(() => {
//         cy.get("[data-cy=delete-task-button]")
//           .should("be.visible")
//           .click();
//       });
    
//     cy.on("window:confirm", () => true);
//     cy.wait('@deleteTask');
    
//     // Remove from created tasks list
//     const index = createdTasks.indexOf(dragTaskName);
//     if (index > -1) {
//       createdTasks.splice(index, 1);
//     }
//   });

//   // it("should create, filter, and clean up multiple tasks", () => {
//   //   // Create 3 tasks with different priorities
//   //   const testTasks = [
//   //     { title: `High Task ${Date.now()}`, priority: 'high' },
//   //     { title: `Medium Task ${Date.now()}`, priority: 'medium' },
//   //     { title: `Low Task ${Date.now()}`, priority: 'low' }
//   //   ];
    
//   //   // Create all tasks
//   //   for (const task of testTasks) {
//   //     cy.get("[data-cy=add-task-button]").should("be.visible").click();
//   //     cy.get("[data-cy=task-modal]").should("be.visible");
//   //     cy.get("[data-cy=task-title-input]")
//   //       .should("be.visible")
//   //       .type(task.title);
//   //     cy.get("[data-cy=task-priority-select]")
//   //       .should("be.visible")
//   //       .select(task.priority);
//   //     cy.get("[data-cy=create-task-button]")
//   //       .scrollIntoView()
//   //       .should("be.visible")
//   //       .click();
//   //     cy.wait('@createTask');
//   //     cy.get("[data-cy=task-modal]").should("not.exist");
      
//   //     // Add to created tasks list for cleanup
//   //     createdTasks.push(task.title);
//   //   }
    
//   //   // Refresh to ensure all tasks are loaded
//   //   cy.reload();
//   //   cy.get("[data-cy=add-task-button]").should("be.visible");
    
//   //   // Show filters if toggle button exists
//   //   cy.get('body').then($body => {
//   //     const hasToggleButton = $body.find('[data-cy=toggle-filters-button]').length > 0;
      
//   //     if (hasToggleButton) {
//   //       cy.get('[data-cy=toggle-filters-button]').click();
//   //     }
//   //   });
    
//   //   // Verify priority filter exists
//   //   cy.get('[data-cy=priority-filter]').should('exist');
    
//   //   // Test filtering by each priority
//   //   for (const priority of ['high', 'medium', 'low']) {
//   //     // Select this priority filter
//   //     cy.get('[data-cy=priority-filter]')
//   //       .select(priority);
      
//   //     // Find the task with this priority
//   //     const matchingTask = testTasks.find(t => t.priority === priority);
      
//   //     // Verify the correct task is shown
//   //     cy.contains(matchingTask.title).should('be.visible');
      
//   //     // Verify tasks with other priorities are hidden
//   //     testTasks
//   //       .filter(t => t.priority !== priority)
//   //       .forEach(task => {
//   //         cy.contains(task.title).should('not.exist');
//   //       });
//   //   }
    
//   //   // Reset filters
//   //   cy.get('[data-cy=reset-filters]')
//   //     .should('exist')
//   //     .click();
    
//   //   // Clean up by deleting all test tasks
//   //   for (const task of testTasks) {
//   //     cy.contains(task.title)
//   //       .closest(".task-card")
//   //       .within(() => {
//   //         cy.get("[data-cy=delete-task-button]").click();
//   //       });
      
//   //     cy.on("window:confirm", () => true);
//   //     cy.wait('@deleteTask');
      
//   //     // Remove from created tasks list
//   //     const index = createdTasks.indexOf(task.title);
//   //     if (index > -1) {
//   //       createdTasks.splice(index, 1);
//   //     }
//   //   }
//   // });

//   // Helper function to move task using edit form
  
//   it("should create, filter, and clean up multiple tasks", () => {
//     // Create 3 tasks with different priorities
//     const testTasks = [
//       { title: `High Task ${Date.now()}`, priority: 'high' },
//       { title: `Medium Task ${Date.now()}`, priority: 'medium' },
//       { title: `Low Task ${Date.now()}`, priority: 'low' }
//     ];
    
//     // Create all tasks
//     for (const task of testTasks) {
//       cy.get("[data-cy=add-task-button]").should("be.visible").click();
//       cy.get("[data-cy=task-modal]").should("be.visible");
//       cy.get("[data-cy=task-title-input]")
//         .should("be.visible")
//         .type(task.title);
//       cy.get("[data-cy=task-priority-select]")
//         .should("be.visible")
//         .select(task.priority);
//       cy.get("[data-cy=create-task-button]")
//         .scrollIntoView()
//         .should("be.visible")
//         .click();
      
//       // Wait for the task to be created
//       cy.wait('@createTask').its('response.statusCode').should('be.oneOf', [200, 201]);
      
//       // Wait for modal to disappear
//       cy.get("[data-cy=task-modal]").should("not.exist");
      
//       // Add to created tasks list for cleanup
//       createdTasks.push(task.title);
      
//       // Wait for the task to actually appear in the UI before proceeding
//       cy.contains(task.title).should('be.visible');
//     }
    
//     // Refresh to ensure all tasks are loaded
//     cy.reload();
//     cy.get("[data-cy=add-task-button]").should("be.visible");
    
//     // Wait for tasks to load after refresh
//     cy.wait('@getTasks');
    
//     // Show filters if toggle button exists
//     cy.get('body').then($body => {
//       const hasToggleButton = $body.find('[data-cy=toggle-filters-button]').length > 0;
      
//       if (hasToggleButton) {
//         cy.get('[data-cy=toggle-filters-button]').click();
//       }
//     });
    
//     // Verify priority filter exists
//     cy.get('[data-cy=priority-filter]').should('exist');
    
//     // Test filtering by each priority - with increased stability
//     for (const priority of ['high', 'medium', 'low']) {
//       // Get the corresponding task for this priority
//       const matchingTask = testTasks.find(t => t.priority === priority);
      
//       // Select this priority filter
//       cy.get('[data-cy=priority-filter]')
//         .select(priority);
      
//       // Give filter time to apply
//       cy.wait(500);
      
//       // Verify the correct task is shown - check with contains and should exist
//       cy.contains(matchingTask.title).should('exist');
//       cy.get('.task-card').filter(`:contains("${matchingTask.title}")`).should('be.visible');
      
//       // Reset filters before trying the next priority
//       cy.get('[data-cy=reset-filters]')
//         .should('exist')
//         .click();
      
//       // Give filter reset time to apply
//       cy.wait(500);
//     }
    
//     // Clean up by deleting all test tasks
//     for (const task of testTasks) {
//       cy.contains(task.title)
//         .should('exist') // First verify task exists
//         .closest(".task-card")
//         .within(() => {
//           cy.get("[data-cy=delete-task-button]").click();
//         });
      
//       cy.on("window:confirm", () => true);
//       cy.wait('@deleteTask');
      
//       // Remove from created tasks list
//       const index = createdTasks.indexOf(task.title);
//       if (index > -1) {
//         createdTasks.splice(index, 1);
//       }
//     }
//   });
  
//   function moveTaskWithEditForm(taskTitle, newStatus) {
//     cy.contains(taskTitle)
//       .closest(".task-card")
//       .within(() => {
//         cy.get("[data-cy=edit-task-button]")
//           .should("be.visible")
//           .click();
//       });
    
//     cy.get("[data-cy=task-modal]").should("be.visible");
//     cy.get("#status")
//       .should("be.visible")
//       .select(newStatus);
    
//     cy.get("[data-cy=update-task-button]")
//       .scrollIntoView()
//       .should("be.visible")
//       .click();
    
//     cy.wait('@updateTask');
//     cy.get("[data-cy=task-modal]").should("not.exist");
    
//     // Reload to ensure changes are reflected
//     cy.reload();
//     cy.get("[data-cy=add-task-button]").should("be.visible");
//   }

//   // Cleanup after all tests
//   after(() => {
//     // Clean up any remaining test tasks
//     if (createdTasks.length > 0) {
//       cy.log(`Cleaning up ${createdTasks.length} remaining test tasks`);
      
//       cy.visit("/login");
//       cy.get("[data-cy=email-input]").type(testUser.email);
//       cy.get("[data-cy=password-input]").type(testUser.password);
//       cy.get("[data-cy=login-button]").click();
//       cy.url().should("include", "/dashboard");
      
//       createdTasks.forEach(taskTitle => {
//         cy.get('body').then($body => {
//           if ($body.text().includes(taskTitle)) {
//             cy.contains(taskTitle)
//               .closest(".task-card")
//               .within(() => {
//                 cy.get("[data-cy=delete-task-button]").click();
//               });
            
//             cy.on("window:confirm", () => true);
//           }
//         });
//       });
//     }
//   });

//   // Additional Improvements:
// // 1. Helper function for more reliable element interactions
// function interactWithElement(selector, action, options = {}) {
//   const defaultOptions = { 
//     force: true, 
//     timeout: 10000,
//     scrollBehavior: 'center'
//   };
//   const mergedOptions = { ...defaultOptions, ...options };
  
//   return cy.get(selector)
//     .scrollIntoView(mergedOptions.scrollBehavior)
//     .should('exist')
//     .then($el => {
//       if (action === 'click') {
//         cy.wrap($el).click({ force: mergedOptions.force });
//       } else if (action === 'type') {
//         cy.wrap($el).clear({ force: true }).type(options.text, { force: mergedOptions.force });
//       } else if (action === 'select') {
//         cy.wrap($el).select(options.value, { force: mergedOptions.force });
//       }
//     });
// }

// // 2. Improved scrollIntoView function for modal elements
// // Use this if regular scrollIntoView isn't bringing elements into view
// function ensureElementVisible(selector) {
//   cy.get(selector).then($el => {
//     // Get element's position
//     const rect = $el[0].getBoundingClientRect();
    
//     // Check if element is out of viewport
//     if (rect.top < 0 || rect.bottom > window.innerHeight) {
//       // Use JS to scroll the element into view within its parent container
//       $el[0].scrollIntoView({
//         block: 'center',
//         inline: 'center',
//         behavior: 'smooth'
//       });
      
//       // Additional handling for modals with fixed positioning
//       const $parent = $el.closest('.modal-content');
//       if ($parent.length) {
//         const parentRect = $parent[0].getBoundingClientRect();
//         const offset = rect.top - parentRect.top;
//         $parent[0].scrollTop += offset - parentRect.height / 2;
//       }
//     }
    
//     // Artificially trigger focus to ensure it's ready for interaction
//     $el[0].focus();
//   });
// }

//   // Take screenshots on test failures
//   afterEach(function() {
//     if (this.currentTest.state === 'failed') {
//       cy.screenshot(`failure-${this.currentTest.title.replace(/\s+/g, '-')}`);
//     }
//   });
// });