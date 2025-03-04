import React from 'react';
import TaskCard from './TaskCard';
import { useTaskColumn } from '../../hooks/useTaskColumn';

const TaskColumn = ({ title, status, tasks, onEditTask }) => {
  const {
    isDragOver,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  } = useTaskColumn(title, status);

  return (
    <div 
      className={`task-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-status={status}
      role="region"
      aria-label={`${title} column with ${tasks.length} tasks`}
      tabIndex="0" // Make column focusable for keyboard navigation
      data-cy={`column-${status}`}
    >
      <div className="column-header">
        <h2 id={`column-${status}`}>{title}</h2>
        <span className="task-count" aria-label={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
      </div>
      
      <div 
        className="task-list"
        role="list"
        aria-labelledby={`column-${status}`}
      >
        {tasks.map(task => (
          <div 
            key={task.id}
            draggable="true"
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragEnd={handleDragEnd}
            data-id={task.id}
            role="listitem"
            tabIndex="0"
            aria-grabbed="false"
            className="task-item"
            data-cy="task-item"
          >
            <TaskCard 
              task={task} 
              onEditTask={onEditTask}
              data-cy="task-card"
            />
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className="empty-state" aria-label="No tasks in this column" data-cy="empty-column">
            <p>No tasks yet</p>
            <p>Drag tasks here or add a new task</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskColumn;