import { useTasks as useTasksContext } from '../contexts/TaskContext';
import { useState, useCallback } from 'react';

export function useTasks() {
  const context = useTasksContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Check if context exists
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  
  const addTaskWithLoading = useCallback(async (task) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));
      context.addTask(task);
      return true;
    } catch (err) {
      setError('Failed to add task. Please try again.');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [context]);
  
  const updateTaskWithLoading = useCallback(async (task) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));
      context.updateTask(task);
      return true;
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [context]);
  
  const deleteTaskWithLoading = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));
      context.deleteTask(id);
      return true;
    } catch (err) {
      setError('Failed to delete task. Please try again.');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [context]);
  
  const moveTaskWithLoading = useCallback(async (id, status) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      context.moveTask(id, status);
      return true;
    } catch (err) {
      setError('Failed to move task. Please try again.');
      console.error(err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [context]);
  
  return {
    ...context,
    addTask: addTaskWithLoading,
    updateTask: updateTaskWithLoading,
    deleteTask: deleteTaskWithLoading,
    moveTask: moveTaskWithLoading,
    isLoading,
    error,
  };
}

export default useTasks;