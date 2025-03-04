import React from 'react';
import TaskFiltering from './TaskFiltering';
import TaskCard from '../TaskBoard/TaskCard';
import { useFilteredTaskList } from '../../hooks/useFilteredTaskList';
import './FilteredTaskList.css';

const FilteredTaskList = () => {
  const {
    filteredTasks,
    handleFilterChange,
    handleEditTask
  } = useFilteredTaskList();

  return (
    <div className="filtered-task-list">
      <h2>Task List</h2>
      
      <TaskFiltering onFilterChange={handleFilterChange} />
      

      <div className="results-summary">
        <p>Found <strong>{filteredTasks.length}</strong> tasks</p>
      </div>
      
      <div className="tasks-container">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks-message">
            <p>No tasks found matching the current filters.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="task-item-wrapper">
              <TaskCard
                task={task}
                onEditTask={() => handleEditTask(task)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FilteredTaskList;