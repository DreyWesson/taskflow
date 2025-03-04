import { useState, useMemo } from 'react';
import { useTasks } from './useTasks';

export const useFilteredTaskList = () => {
  const { tasks } = useTasks();
  
  const [filters, setFilters] = useState({
    priority: 'all',
    tag: 'all',
    status: 'all',
    searchTerm: '',
    dueDateFrom: '',
    dueDateTo: ''
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {

      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      
      if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) {
        return false;
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const titleMatch = task.title && task.title.toLowerCase().includes(searchLower);
        const descMatch = task.description && task.description.toLowerCase().includes(searchLower);
        
        if (!titleMatch && !descMatch) {
          return false;
        }
      }
      
      // Due date range filter
      if (filters.dueDateFrom && task.dueDate) {
        const fromDate = new Date(filters.dueDateFrom);
        const taskDate = new Date(task.dueDate);
        
        if (taskDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dueDateTo && task.dueDate) {
        const toDate = new Date(filters.dueDateTo);
        const taskDate = new Date(task.dueDate);
        
        toDate.setHours(23, 59, 59, 999);
        
        if (taskDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [tasks, filters]);
  
  const handleEditTask = (task) => {
    console.log('Edit task:', task);
  };

  return {
    // State
    tasks,
    filters,
    filteredTasks,
    
    // Methods
    handleFilterChange,
    handleEditTask
  };
};