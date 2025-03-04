import React from 'react';
import { useTaskCard } from '../../hooks/useTaskCard';

const TaskCard = ({ task, onEditTask }) => {
  const {
    priorityColors,
    isTaskOverdue,
    formattedDueDate,
    handleEdit,
    handleDelete
  } = useTaskCard(task, onEditTask);

  return (
    <div 
      className={`task-card ${isTaskOverdue ? 'overdue' : ''}`} 
      draggable="true"
      aria-label={`Task: ${task.title}${isTaskOverdue ? ', Overdue' : ''}`}
      data-cy="task-card"
    >
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <div className="task-actions">
          <button 
            onClick={handleEdit} 
            className="btn-icon"
            aria-label={`Edit task: ${task.title}`}
            data-cy="edit-task-button"
          >
            ✏️
          </button>
          <button 
            onClick={handleDelete} 
            className="btn-icon"
            aria-label={`Delete task: ${task.title}`}
            data-cy="delete-task-button"
          >
            🗑️
          </button>
        </div>
      </div>
      
      <div className="task-content">
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>
      
      <div className="task-footer">
        <div 
          className="task-priority" 
          style={{ backgroundColor: priorityColors[task.priority] }}
          aria-label={`Priority: ${task.priority}`}
        >
          {task.priority}
        </div>
        
        {task.dueDate && (
          <div 
            className={`task-due-date ${isTaskOverdue ? 'overdue' : ''}`}
            aria-label={`Due date: ${formattedDueDate}${isTaskOverdue ? ', Overdue' : ''}`}
          >
            {formattedDueDate}
          </div>
        )}
      </div>
      
      {task.tags.length > 0 && (
        <div className="task-tags" aria-label="Tags">
          {task.tags.map((tag, index) => (
            <span key={index} className="task-tag">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskCard;