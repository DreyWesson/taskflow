import { useState } from 'react';
import { useTasks } from './useTasks';
import { useTaskFilters } from './useTaskFilters';
import { TASK_STATUS } from '../contexts/TaskContext';

export const useTaskBoard = () => {
  const { tasks } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    filters,
    updateFilters,
    resetFilters,
    filteredTasks,
  } = useTaskFilters(tasks);

  // Column configuration
  const columnData = [
    { title: 'To Do', status: TASK_STATUS.TODO },
    { title: 'In Progress', status: TASK_STATUS.IN_PROGRESS },
    { title: 'Review', status: TASK_STATUS.REVIEW },
    { title: 'Done', status: TASK_STATUS.DONE }
  ];

  const getFilteredTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  // Handle filter changes from the TaskFiltering component
  const handleFilterChange = (newFilters) => {
    updateFilters(newFilters);
  };

  // Open modal for creating a new task
  const handleAddTask = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  // Open modal for editing an existing task
  const handleEditTask = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setCurrentTask(null), 300);
  };

  // Toggle filter panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return {
    // State
    tasks,
    filteredTasks,
    isModalOpen,
    currentTask,
    showFilters,
    filters,
    columnData,
    
    // Methods
    getFilteredTasksByStatus,
    handleFilterChange,
    handleAddTask,
    handleEditTask,
    handleCloseModal,
    toggleFilters,
    resetFilters
  };
};