import { useState, useEffect } from 'react';
import { useTasks } from './useTasks';

export const useTaskColumn = (title, status) => {
  const { moveTask } = useTasks();
  const [isDragOver, setIsDragOver] = useState(false);
  
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    
    // Add a dragging class to the task element
    e.currentTarget.classList.add('dragging');
    
    // Announce to screen readers
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      announcer.textContent = `Started dragging task. Use arrow keys to navigate between columns.`;
    }
  };


  const handleDragEnd = (e) => {
    // Remove the dragging class
    e.currentTarget.classList.remove('dragging');
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    moveTask(taskId, status);
    
    // Announce success to screen readers
    const announcer = document.getElementById('a11y-announcer');
    if (announcer) {
      announcer.textContent = `Task moved to ${title} column.`;
    }
  };

  // Listen for custom keyboard navigation events
  useEffect(() => {
    const handleTaskMove = (e) => {
      if (e.detail.newStatus === status) {
        moveTask(e.detail.taskId, status);
      }
    };
    
    document.addEventListener('task-move', handleTaskMove);
    return () => {
      document.removeEventListener('task-move', handleTaskMove);
    };
  }, [moveTask, status, title]);

  return {
    // State
    isDragOver,
    
    // Methods
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
};