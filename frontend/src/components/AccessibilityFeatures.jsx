// import React, { useEffect } from 'react';

// const AccessibilityFeatures = ({ children }) => {
//   useEffect(() => {
//     // Add a screen reader announcer element if it doesn't exist
//     if (!document.getElementById('a11y-announcer')) {
//       const announcer = document.createElement('div');
//       announcer.id = 'a11y-announcer';
//       announcer.className = 'sr-only';
//       announcer.setAttribute('aria-live', 'polite');
//       announcer.setAttribute('aria-atomic', 'true');
//       document.body.appendChild(announcer);
//     }

//     // Function to announce messages to screen readers
//     const announce = (message) => {
//       const announcer = document.getElementById('a11y-announcer');
//       if (announcer) {
//         announcer.textContent = message;
//       }
//     };

//     // Handle keyboard navigation for the task board
//     const handleKeyDown = (e) => {
//       // Task selection mode toggle with Enter key
//       if (e.key === 'Enter' && document.activeElement.classList.contains('task-card')) {
//         const isSelected = document.activeElement.getAttribute('aria-grabbed') === 'true';
        
//         // If not already selected, enter selection mode
//         if (!isSelected) {
//           // Clear any previously selected tasks
//           document.querySelectorAll('[aria-grabbed="true"]').forEach(elem => {
//             elem.setAttribute('aria-grabbed', 'false');
//           });
          
//           // Select this task
//           document.activeElement.setAttribute('aria-grabbed', 'true');
//           announce('Task selected. Use arrow keys to move between columns, or press Escape to cancel.');
//         } 
//         // If already selected, confirm move to current column
//         else {
//           const taskId = document.activeElement.getAttribute('data-id');
//           const currentColumn = document.activeElement.closest('.task-column');
//           const status = currentColumn.getAttribute('data-status');
          
//           document.dispatchEvent(new CustomEvent('task-move', { 
//             detail: { taskId, newStatus: status } 
//           }));
          
//           document.activeElement.setAttribute('aria-grabbed', 'false');
//           announce(`Task moved to ${currentColumn.querySelector('h2').textContent} column.`);
//         }
//       }
      
//       // Navigation between columns when a task is selected
//       if (document.querySelector('[aria-grabbed="true"]')) {
//         const selectedTask = document.querySelector('[aria-grabbed="true"]');
//         const currentColumn = selectedTask.closest('.task-column');
//         const taskId = selectedTask.getAttribute('data-id');
        
//         // Right arrow: move to next column
//         if (e.key === 'ArrowRight') {
//           e.preventDefault(); // Prevent scrolling
//           const nextColumn = currentColumn.nextElementSibling;
//           if (nextColumn && nextColumn.classList.contains('task-column')) {
//             const newStatus = nextColumn.getAttribute('data-status');
//             const columnName = nextColumn.querySelector('h2').textContent;
            
//             // Focus the next column
//             nextColumn.focus();
//             announce(`Task is now over ${columnName} column. Press Enter to confirm move.`);
            
//             // If user presses Enter, this will be handled by the Enter key handler
//           }
//         }
        
//         // Left arrow: move to previous column
//         else if (e.key === 'ArrowLeft') {
//           e.preventDefault(); // Prevent scrolling
//           const prevColumn = currentColumn.previousElementSibling;
//           if (prevColumn && prevColumn.classList.contains('task-column')) {
//             const newStatus = prevColumn.getAttribute('data-status');
//             const columnName = prevColumn.querySelector('h2').textContent;
            
//             // Focus the previous column
//             prevColumn.focus();
//             announce(`Task is now over ${columnName} column. Press Enter to confirm move.`);
//           }
//         }
        
//         // Up arrow: navigate to task above in same column
//         else if (e.key === 'ArrowUp') {
//           e.preventDefault(); // Prevent scrolling
//           const taskElement = selectedTask.closest('[role="listitem"]');
//           const prevTask = taskElement.previousElementSibling;
//           if (prevTask && prevTask.getAttribute('role') === 'listitem') {
//             prevTask.focus();
//             announce('Moved to previous task in column');
//           }
//         }
        
//         // Down arrow: navigate to task below in same column
//         else if (e.key === 'ArrowDown') {
//           e.preventDefault(); // Prevent scrolling
//           const taskElement = selectedTask.closest('[role="listitem"]');
//           const nextTask = taskElement.nextElementSibling;
//           if (nextTask && nextTask.getAttribute('role') === 'listitem') {
//             nextTask.focus();
//             announce('Moved to next task in column');
//           }
//         }
        
//         // Escape key: cancel selection
//         else if (e.key === 'Escape') {
//           selectedTask.setAttribute('aria-grabbed', 'false');
//           announce('Selection canceled');
//         }
//       }
//     };
    
//     // Listen for keyboard events
//     document.addEventListener('keydown', handleKeyDown);
    
//     // Add focus outlines for keyboard users only
//     const handleFirstTab = (e) => {
//       if (e.key === 'Tab') {
//         document.body.classList.add('user-is-tabbing');
//         window.removeEventListener('keydown', handleFirstTab);
//       }
//     };
//     window.addEventListener('keydown', handleFirstTab);
    
//     // Cleanup
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keydown', handleFirstTab);
//     };
//   }, []);

//   // Add CSS for accessibility features
//   useEffect(() => {
//     // Create a style element if it doesn't exist
//     if (!document.getElementById('a11y-styles')) {
//       const style = document.createElement('style');
//       style.id = 'a11y-styles';
//       style.textContent = `
//         .sr-only {
//           position: absolute;
//           width: 1px;
//           height: 1px;
//           padding: 0;
//           margin: -1px;
//           overflow: hidden;
//           clip: rect(0, 0, 0, 0);
//           white-space: nowrap;
//           border-width: 0;
//         }
        
//         body:not(.user-is-tabbing) :focus {
//           outline: none;
//         }
        
//         body.user-is-tabbing :focus {
//           outline: 2px solid #4a6fa5;
//           outline-offset: 2px;
//         }
        
//         [aria-grabbed="true"] {
//           box-shadow: 0 0 0 2px #4a6fa5, 0 0 10px rgba(74, 111, 165, 0.6);
//           position: relative;
//           z-index: 1;
//         }
//       `;
//       document.head.appendChild(style);
//     }
    
//     // Cleanup
//     return () => {
//       const style = document.getElementById('a11y-styles');
//       if (style) {
//         style.remove();
//       }
//     };
//   }, []);

//   return <>{children}</>;
// };

// export default AccessibilityFeatures;


import React, { useEffect } from 'react';

const AccessibilityFeatures = ({ children }) => {
  // Setup screen reader announcer
  useEffect(() => {
    setupScreenReaderAnnouncer();
    const { handleKeyDown } = setupKeyboardNavigation();
    const cleanupTabListener = setupKeyboardFocusIndicators();
    
    // Cleanup event listeners
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cleanupTabListener();
    };
  }, []);

  // Add CSS for accessibility features
  useEffect(() => {
    const cleanup = setupAccessibilityStyles();
    return cleanup;
  }, []);

  return <>{children}</>;
};

// Function to set up the screen reader announcer element
const setupScreenReaderAnnouncer = () => {
  if (!document.getElementById('a11y-announcer')) {
    const announcer = document.createElement('div');
    announcer.id = 'a11y-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  }
};

// Function to announce messages to screen readers
const announce = (message) => {
  const announcer = document.getElementById('a11y-announcer');
  if (announcer) {
    announcer.textContent = message;
  }
};

// Function to set up keyboard navigation
const setupKeyboardNavigation = () => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && document.activeElement.classList.contains('task-card')) {
      handleTaskSelection(e);
    } else if (document.querySelector('[aria-grabbed="true"]')) {
      handleSelectedTaskNavigation(e);
    }
  };
  
  // Listen for keyboard events
  document.addEventListener('keydown', handleKeyDown);
  
  return { handleKeyDown };
};

// Handle task selection logic
const handleTaskSelection = (e) => {
  const isSelected = document.activeElement.getAttribute('aria-grabbed') === 'true';
  
  if (!isSelected) {
    // Clear any previously selected tasks
    document.querySelectorAll('[aria-grabbed="true"]').forEach(elem => {
      elem.setAttribute('aria-grabbed', 'false');
    });
    
    // Select this task
    document.activeElement.setAttribute('aria-grabbed', 'true');
    announce('Task selected. Use arrow keys to move between columns, or press Escape to cancel.');
  } else {
    // If already selected, confirm move to current column
    const taskId = document.activeElement.getAttribute('data-id');
    const currentColumn = document.activeElement.closest('.task-column');
    const status = currentColumn.getAttribute('data-status');
    
    document.dispatchEvent(new CustomEvent('task-move', { 
      detail: { taskId, newStatus: status } 
    }));
    
    document.activeElement.setAttribute('aria-grabbed', 'false');
    announce(`Task moved to ${currentColumn.querySelector('h2').textContent} column.`);
  }
};

// Handle navigation when a task is selected
const handleSelectedTaskNavigation = (e) => {
  const selectedTask = document.querySelector('[aria-grabbed="true"]');
  const currentColumn = selectedTask.closest('.task-column');
  const taskId = selectedTask.getAttribute('data-id');
  
  switch (e.key) {
    case 'ArrowRight':
      handleRightArrowNavigation(e, currentColumn);
      break;
    case 'ArrowLeft':
      handleLeftArrowNavigation(e, currentColumn);
      break;
    case 'ArrowUp':
      handleUpArrowNavigation(e, selectedTask);
      break;
    case 'ArrowDown':
      handleDownArrowNavigation(e, selectedTask);
      break;
    case 'Escape':
      selectedTask.setAttribute('aria-grabbed', 'false');
      announce('Selection canceled');
      break;
  }
};

// Handle right arrow navigation
const handleRightArrowNavigation = (e, currentColumn) => {
  e.preventDefault(); // Prevent scrolling
  const nextColumn = currentColumn.nextElementSibling;
  if (nextColumn && nextColumn.classList.contains('task-column')) {
    const columnName = nextColumn.querySelector('h2').textContent;
    
    // Focus the next column
    nextColumn.focus();
    announce(`Task is now over ${columnName} column. Press Enter to confirm move.`);
  }
};

// Handle left arrow navigation
const handleLeftArrowNavigation = (e, currentColumn) => {
  e.preventDefault(); // Prevent scrolling
  const prevColumn = currentColumn.previousElementSibling;
  if (prevColumn && prevColumn.classList.contains('task-column')) {
    const columnName = prevColumn.querySelector('h2').textContent;
    
    // Focus the previous column
    prevColumn.focus();
    announce(`Task is now over ${columnName} column. Press Enter to confirm move.`);
  }
};

// Handle up arrow navigation
const handleUpArrowNavigation = (e, selectedTask) => {
  e.preventDefault(); // Prevent scrolling
  const taskElement = selectedTask.closest('[role="listitem"]');
  const prevTask = taskElement.previousElementSibling;
  if (prevTask && prevTask.getAttribute('role') === 'listitem') {
    prevTask.focus();
    announce('Moved to previous task in column');
  }
};

// Handle down arrow navigation
const handleDownArrowNavigation = (e, selectedTask) => {
  e.preventDefault(); // Prevent scrolling
  const taskElement = selectedTask.closest('[role="listitem"]');
  const nextTask = taskElement.nextElementSibling;
  if (nextTask && nextTask.getAttribute('role') === 'listitem') {
    nextTask.focus();
    announce('Moved to next task in column');
  }
};

// Function to set up keyboard focus indicators
const setupKeyboardFocusIndicators = () => {
  const handleFirstTab = (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  };
  
  window.addEventListener('keydown', handleFirstTab);
  
  return () => {
    window.removeEventListener('keydown', handleFirstTab);
  };
};

// Function to set up accessibility styles
const setupAccessibilityStyles = () => {
  if (!document.getElementById('a11y-styles')) {
    const style = document.createElement('style');
    style.id = 'a11y-styles';
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      
      body:not(.user-is-tabbing) :focus {
        outline: none;
      }
      
      body.user-is-tabbing :focus {
        outline: 2px solid #4a6fa5;
        outline-offset: 2px;
      }
      
      [aria-grabbed="true"] {
        box-shadow: 0 0 0 2px #4a6fa5, 0 0 10px rgba(74, 111, 165, 0.6);
        position: relative;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }
  
  return () => {
    const style = document.getElementById('a11y-styles');
    if (style) {
      style.remove();
    }
  };
};

export default AccessibilityFeatures;