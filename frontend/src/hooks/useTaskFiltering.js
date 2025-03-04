import { useState, useEffect } from 'react';
import { useTasks } from './useTasks';

export const useTaskFiltering = (onFilterChange, initialFilters) => {
  // Status constants - using the correct values from your application
  const STATUS = {
    TODO: "todo",
    IN_PROGRESS: "inProgress",
    REVIEW: "review",
    DONE: "done",
  };

  // Filter state
  const [filters, setFilters] = useState(initialFilters || {
    priority: 'all',
    tag: 'all',
    status: 'all',
    searchTerm: '',
    dueDateFrom: '',
    dueDateTo: ''
  });

  // Get all tasks to extract available tags
  const { tasks } = useTasks();
  const [availableTags, setAvailableTags] = useState([]);

  // Extract unique tags from all tasks
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const allTags = tasks
        .flatMap(task => task.tags || [])
        .filter((tag, index, self) => self.indexOf(tag) === index)
        .sort();
      
      setAvailableTags(allTags);
    }
  }, [tasks]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    const newFilters = {
      ...filters,
      [name]: value
    };
    
    setFilters(newFilters);
    
    // Notify parent component about filter changes
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    const resetFilters = {
      priority: 'all',
      tag: 'all',
      status: 'all',
      searchTerm: '',
      dueDateFrom: '',
      dueDateTo: ''
    };
    
    setFilters(resetFilters);
    
    // Notify parent component about filter reset
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
  };

  return {
    // Constants
    STATUS,
    
    // State
    filters,
    availableTags,
    
    // Methods
    handleFilterChange,
    handleResetFilters
  };
};