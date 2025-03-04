import React, { lazy, Suspense } from 'react';
import TaskColumn from './TaskColumn';
import { useTaskBoard } from '../../hooks/useTaskBoard';

// Lazy load components that aren't needed for initial render
const TaskFiltering = lazy(() => import('../TaskFiltering/TaskFiltering'));
const TaskModal = lazy(() => import('../TaskModal'));

const TaskBoard = () => {
  const {
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
  } = useTaskBoard();

  return (
    <div className="task-board-container">
      <div className="task-board-header">
        <h2>Project Tasks</h2>
        <div className="header-actions">
          <button 
            className="btn secondary" 
            onClick={toggleFilters}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
            data-cy="toggle-filters-button"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button 
            className="btn primary" 
            onClick={handleAddTask}
            aria-label="Add new task"
            data-cy="add-task-button"
          >
            Add Task
          </button>
        </div>
      </div>
      
      {/* Filters section - conditionally rendered with lazy loading */}
      {showFilters && (
        <div className="task-board-filters">
          <Suspense fallback={<div className="loading-filters">Loading filters...</div>}>
            <TaskFiltering 
              onFilterChange={handleFilterChange} 
              initialFilters={filters}
            />
          </Suspense>
          
          {filters.priority !== 'all' || 
           filters.tag !== 'all' || 
           filters.status !== 'all' || 
           filters.searchTerm || 
           filters.dueDateFrom || 
           filters.dueDateTo ? (
            <div className="filter-stats">
              <p>Showing {filteredTasks.length} of {tasks.length} tasks</p>
              <button 
                className="btn-link"
                onClick={resetFilters}
                data-cy="clear-filters-link"
              >
                Clear all filters
              </button>
            </div>
          ) : null}
        </div>
      )}
      
      <div className="task-board">
        {columnData.map(column => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={getFilteredTasksByStatus(column.status)}
            onEditTask={handleEditTask}
            data-cy={`column-${column.status}`}
          />
        ))}
      </div>
      
      {/* Modal with lazy loading */}
      {isModalOpen && (
        <Suspense fallback={<div className="loading-modal">Loading form...</div>}>
          <TaskModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            initialTask={currentTask}
            data-cy="task-modal"
          />
        </Suspense>
      )}
    </div>
  );
};

export default TaskBoard;