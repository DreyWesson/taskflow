import React from 'react';
import { TASK_STATUS } from '../../contexts/TaskContext';
import LoadingIndicator from '../LoadingIndicator';
import useTaskForm from '../../hooks/useTaskForm';
import Input from '../common/Input';

const TaskForm = ({ initialTask, onSubmit, onCancel }) => {
  const {
    // State
    task,
    tagInput,
    validationErrors,
    isLoading,
    apiError,
    
    // Refs
    titleInputRef,
    firstErrorRef,
    formRef,
    
    // Handlers
    handleChange,
    handleTagInputChange,
    handleTagAdd,
    handleTagKeyDown,
    handleTagRemove,
    handleSubmit,
    handleCancel
  } = useTaskForm(initialTask, onSubmit, onCancel);

  return (
    <form 
      ref={formRef}
      className="task-form" 
      onSubmit={handleSubmit}
      aria-labelledby="form-title"
      noValidate  // We're handling validation ourselves
    >
      <h2 id="form-title">{task.id ? 'Edit Task' : 'Create New Task'}</h2>
      
      {/* Show API errors at the top */}
      {apiError && (
        <div 
          className="form-error" 
          role="alert"
          aria-live="assertive"
        >
          <p>{apiError}</p>
        </div>
      )}
      
      <fieldset>
        <legend>Task Information</legend>
        
        {/* Title field */}
        <Input
          ref={titleInputRef}
          id="title"
          name="title"
          label="Title:"
          value={task.title}
          onChange={handleChange}
          placeholder="Enter task title"
          error={validationErrors.title}
          disabled={isLoading}
          required={true}
          maxLength="100"
          dataCy="task-title-input"
          aria-required="true"
          aria-describedby={validationErrors.title ? `title-error title-desc` : `title-desc`}
        />
        <div id="title-desc" className="sr-only">Enter a descriptive title for your task, maximum 100 characters</div>
        
        {/* Description field */}
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            className={`form-control ${validationErrors.description ? 'is-invalid' : ''}`}
            aria-describedby={validationErrors.description ? 'description-error description-desc' : 'description-desc'}
            aria-invalid={validationErrors.description ? 'true' : 'false'}
            rows="3"
            disabled={isLoading}
            maxLength="500"
            placeholder="Describe your task (optional)"
            data-cy="task-description-input"
          />
          <div id="description-desc" className="sr-only">Optional task description, maximum 500 characters</div>
          {validationErrors.description && (
            <div 
              id="description-error" 
              className="error-message"
              role="alert"
            >
              {validationErrors.description}
            </div>
          )}
          <div className="char-count" aria-hidden="true">
            {task.description ? task.description.length : 0}/500
          </div>
        </div>
      </fieldset>
      
      <fieldset>
        <legend>Task Status and Priority</legend>
        
        {/* Priority field */}
        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={task.priority}
            onChange={handleChange}
            className="form-control"
            disabled={isLoading}
            aria-describedby="priority-desc"
            data-cy="task-priority-select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div id="priority-desc" className="sr-only">Select the priority level for this task</div>
        </div>
        
        {/* Status field */}
        <div className="form-group">
          <label htmlFor="status">Status:</label>
          <select
            id="status"
            name="status"
            value={task.status}
            onChange={handleChange}
            className="form-control"
            disabled={isLoading}
            aria-describedby="status-desc"
          >
            <option value={TASK_STATUS.TODO}>To Do</option>
            <option value={TASK_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={TASK_STATUS.REVIEW}>Review</option>
            <option value={TASK_STATUS.DONE}>Done</option>
          </select>
          <div id="status-desc" className="sr-only">Select the current status of this task</div>
        </div>
        
        {/* Due date field */}
        <Input
          type="date"
          id="dueDate"
          name="dueDate"
          label="Due Date:"
          value={task.dueDate}
          onChange={handleChange}
          error={validationErrors.dueDate}
          disabled={isLoading}
          aria-describedby={validationErrors.dueDate ? 'dueDate-error dueDate-desc' : 'dueDate-desc'}
        />
        <div id="dueDate-desc" className="sr-only">Optional date when this task is due</div>
      </fieldset>
      
      <fieldset>
        <legend>Task Tags</legend>
        
        {/* Tags field */}
        <div className="form-group">
          <label htmlFor="tagInput">Add Tags:</label>
          <div 
            className="tag-input" 
            role="group" 
            aria-labelledby="tag-instructions"
          >
            <Input
              type="text"
              id="tagInput"
              name="tagInput"
              label=""
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagKeyDown}
              error={validationErrors.tagInput}
              disabled={isLoading}
              placeholder="Add tags (press Enter or click Add)"
              dataCy="tag-input"
              aria-describedby={validationErrors.tagInput ? 'tagInput-error tag-instructions' : 'tag-instructions'}
              className="mb-0"
            />
            <button 
              type="button" 
              onClick={handleTagAdd}
              className="btn-small"
              disabled={isLoading || !tagInput.trim()}
              aria-label="Add tag"
              data-cy="add-tag-button"
            >
              Add
            </button>
          </div>
          
          <div id="tag-instructions" className="tag-help">
            You can add up to 10 tags to categorize your task
          </div>
          
          {validationErrors.tags && (
            <div 
              className="error-message"
              role="alert"
            >
              {validationErrors.tags}
            </div>
          )}
          
          <div 
            className="tag-list" 
            aria-label="Current tags" 
            role="list"
          >
            {task.tags.map((tag, index) => (
              <span key={index} className="tag" role="listitem">
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="tag-remove"
                  aria-label={`Remove tag ${tag}`}
                  disabled={isLoading}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </span>
            ))}
            {task.tags.length === 0 && (
              <span className="no-tags" role="status">No tags added</span>
            )}
          </div>
        </div>
      </fieldset>
      
      {/* Form actions */}
      <div className="form-actions">
        <button 
          type="submit" 
          className="btn primary"
          disabled={isLoading}
          data-cy={initialTask ? "update-task-button" : "create-task-button"}
        >
          {isLoading ? 'Processing...' : (task.id ? 'Update Task' : 'Create Task')}
        </button>
        
        {isLoading && <LoadingIndicator />}
        
        {onCancel && (
          <button 
            type="button" 
            onClick={handleCancel}
            className="btn secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
      </div>
      
      {/* Help text */}
      <div className="form-help">
        <small>
          <span className="required" aria-hidden="true">*</span> 
          <span>Required field</span>
        </small>
      </div>
      
      {/* Hidden element for screen reader announcements */}
      <div 
        id="sr-announcer" 
        className="sr-only" 
        aria-live="assertive" 
        aria-atomic="true"
      ></div>
    </form>
  );
};

export default TaskForm;