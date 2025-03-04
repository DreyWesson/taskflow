import { useState, useMemo } from 'react';

export const useTaskFilters = (tasks = []) => {
  const [filters, setFilters] = useState({
    priority: 'all',
    tag: 'all',
    status: 'all',
    searchTerm: '',
    dueDateFrom: '',
    dueDateTo: ''
  });

  const updateFilter = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  const updateFilters = (newFilters) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
  };

  const resetFilters = () => {
    setFilters({
      priority: 'all',
      tag: 'all',
      status: 'all',
      searchTerm: '',
      dueDateFrom: '',
      dueDateTo: ''
    });
  };

  // Get available tags from all tasks
  const availableTags = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    return tasks
      .flatMap(task => task.tags || [])
      .filter((tag, index, self) => tag && self.indexOf(tag) === index)
      .sort();
  }, [tasks]);

  // Apply filters to get filtered tasks
  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks.filter(task => {
      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      
      // Tag filter
      if (filters.tag !== 'all' && (!task.tags || !task.tags.includes(filters.tag))) {
        return false;
      }
      
      // Search term filter
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
        
        // Set time to end of day for the "to" date
        toDate.setHours(23, 59, 59, 999);
        
        if (taskDate > toDate) {
          return false;
        }
      }
      
      // Task passed all filters
      return true;
    });
  }, [tasks, filters]);

  return {
    // Current filter state
    filters,
    
    // Methods to update filters
    updateFilter,
    updateFilters,
    resetFilters,
    
    // Filtered data
    filteredTasks,
    availableTags,
    
    // Stats
    totalTasks: tasks.length,
    filteredCount: filteredTasks.length
  };
};

export default useTaskFilters;