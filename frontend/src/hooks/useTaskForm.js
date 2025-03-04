import { useState, useEffect, useRef } from 'react';
import { useTasks } from './useTasks';
import { TASK_STATUS } from '../contexts/TaskContext';

const useTaskForm = (initialTask, onSubmit, onCancel) => {
  const { addTask, updateTask, isLoading, error: apiError } = useTasks();
  const [task, setTask] = useState(
    initialTask || {
      title: '',
      description: '',
      priority: 'medium',
      status: TASK_STATUS.TODO,
      dueDate: '',
      tags: []
    }
  );
  
  // State for tag input and validation
  const [tagInput, setTagInput] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  // Refs for focus management
  const titleInputRef = useRef(null);
  const firstErrorRef = useRef(null);
  const formRef = useRef(null);
  
  // Update form when initialTask changes (e.g., when editing a different task)
  useEffect(() => {
    if (initialTask) {
      setTask(initialTask);
    }
  }, [initialTask]);

  // Focus management after validation errors
  useEffect(() => {
    // If we have validation errors and submission was attempted, focus the first error
    if (Object.keys(validationErrors).length > 0 && submitAttempted) {
      // Get the first error field's input element
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      
      if (errorElement) {
        errorElement.focus();
      } else if (firstErrorRef.current) {
        firstErrorRef.current.focus();
      }
    }
  }, [validationErrors, submitAttempted]);

  // Utility function to announce messages to screen readers
  const announceToScreenReader = (message) => {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = message;
    } else {
      // Create announcer if it doesn't exist
      const newAnnouncer = document.createElement('div');
      newAnnouncer.id = 'sr-announcer';
      newAnnouncer.className = 'sr-only';
      newAnnouncer.setAttribute('aria-live', 'assertive');
      newAnnouncer.textContent = message;
      document.body.appendChild(newAnnouncer);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prevTask => ({ ...prevTask, [name]: value }));
    
    // Clear validation error for this field when user changes it
    if (submitAttempted && validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle tag input
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
    
    // Clear tag-related validation errors when the input changes
    if (validationErrors.tagInput || validationErrors.tags) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.tagInput;
        delete newErrors.tags;
        return newErrors;
      });
    }
  };

  // Add tag to task
  const handleTagAdd = () => {
    // Prevent duplicate tags and sanitize input
    const sanitizedTag = tagInput.trim();
    
    if (!sanitizedTag) return;
    
    // Prevent duplicate tags (case insensitive)
    const isDuplicate = task.tags.some(tag => 
      tag.toLowerCase() === sanitizedTag.toLowerCase()
    );
    
    if (isDuplicate) {
      setValidationErrors(prev => ({
        ...prev,
        tagInput: 'This tag already exists'
      }));
      
      // Announce the error to screen readers
      announceToScreenReader('Error: This tag already exists');
      return;
    }
    
    // Limit number of tags
    if (task.tags.length >= 10) {
      setValidationErrors(prev => ({
        ...prev,
        tagInput: 'Maximum 10 tags allowed'
      }));
      
      // Announce the error to screen readers
      announceToScreenReader('Error: Maximum 10 tags allowed');
      return;
    }
    
    setTask(prevTask => ({
      ...prevTask,
      tags: [...prevTask.tags, sanitizedTag]
    }));
    setTagInput('');
    
    // Announce tag added to screen readers
    announceToScreenReader(`Tag ${sanitizedTag} added`);
    
    // Clear validation error
    if (validationErrors.tagInput) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.tagInput;
        return newErrors;
      });
    }
  };

  // Handle Enter key in tag input
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      handleTagAdd();
    }
  };

  // Remove tag from task
  const handleTagRemove = (tagToRemove) => {
    setTask(prevTask => ({
      ...prevTask,
      tags: prevTask.tags.filter(tag => tag !== tagToRemove)
    }));
    
    // Announce tag removed to screen readers
    announceToScreenReader(`Tag ${tagToRemove} removed`);
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    // Title validation
    if (!task.title) {
      errors.title = 'Title is required';
    } else if (task.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Description validation (optional field)
    if (task.description && task.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    // Due date validation (optional field)
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      if (isNaN(dueDate.getTime())) {
        errors.dueDate = 'Invalid date format';
      }
    }
    
    // Tags validation
    if (task.tags && task.tags.length > 10) {
      errors.tags = 'Maximum 10 tags allowed';
    }
    
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitAttempted(true);
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Announce validation errors to screen readers
      const errorCount = Object.keys(errors).length;
      const errorMessage = `Form has ${errorCount} error${errorCount > 1 ? 's' : ''}. Please correct and try again.`;
      announceToScreenReader(errorMessage);
      
      return;
    }
    
    try {
      // Call appropriate function based on whether we're creating or updating
      if (task.id) {
        await updateTask(task);
        announceToScreenReader('Task updated successfully');
      } else {
        await addTask(task);
        announceToScreenReader('New task created successfully');
      }
      
      // Reset form if successful and call onSubmit callback
      if (!apiError) {
        if (!task.id) {
          // Only reset for new tasks, not updates
          setTask({
            title: '',
            description: '',
            priority: 'medium',
            status: TASK_STATUS.TODO,
            dueDate: '',
            tags: []
          });
        }
        setValidationErrors({});
        // Ensure onSubmit callback is called immediately
        if (onSubmit) {
          // Add a small delay to ensure API operations complete
          setTimeout(() => {
            onSubmit();
          }, 100);
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Error handling is already done in the useTasks hook
      announceToScreenReader('Error submitting form. Please try again.');
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    // Reset validation state
    setValidationErrors({});
    setSubmitAttempted(false);
    
    // Call onCancel callback
    if (onCancel) {
      onCancel();
    }
    
    // Announce cancellation to screen readers
    announceToScreenReader('Form canceled');
  };

  return {
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
    handleCancel,
    
    // Utilities
    announceToScreenReader
  };
};

export default useTaskForm;