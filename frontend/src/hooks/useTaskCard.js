import { useTasks } from './useTasks';

export const useTaskCard = (task, onEditTask) => {
  const { deleteTask } = useTasks();

  const priorityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336'
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    return dueDate < today && task.status !== 'done';
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEditTask(task);
  };


  const handleDelete = (e) => {
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  return {
    // Data
    priorityColors,
    isTaskOverdue: isOverdue(),
    formattedDueDate: task.dueDate ? formatDate(task.dueDate) : '',
    
    // Methods
    handleEdit,
    handleDelete
  };
};
