import React from 'react';
import ReactDOM from 'react-dom';
import TaskForm from '../TaskForm';
import { useTaskModal } from '../../hooks/useTaskModal';
import './TaskModal.css';

const TaskModal = ({ isOpen, onClose, initialTask }) => {
  const {
    modalRef,
    handleTabKey,
    handleFormSubmit
  } = useTaskModal(isOpen, onClose);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-cy="task-modal"
    >
      <div 
        className="modal-content"
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabKey}
      >
        <div className="modal-header">
          <h2 id="modal-title">{initialTask ? 'Edit Task' : 'Create New Task'}</h2>
          <button 
            type="button" 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close"
            data-cy="close-modal-button"
          >
            ×
          </button>
        </div>
        <div className="modal-body">
          <TaskForm 
            initialTask={initialTask} 
            onSubmit={handleFormSubmit}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TaskModal;