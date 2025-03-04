export const validateTaskInput = (task) => {
    const errors = {};
    
    // Title validation
    if (!task.title) {
      errors.title = 'Title is required';
    } else if (task.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Description validation
    if (task.description && task.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    // Tags validation
    if (task.tags) {
      if (task.tags.length > 10) {
        errors.tags = 'Maximum 10 tags allowed';
      }
      
      // Check for inappropriate content in tags
      const inappropriateContent = task.tags.some(tag => 
        /\b(offensive|explicit|harmful)\b/i.test(tag)
      );
      
      if (inappropriateContent) {
        errors.tags = 'Tags contain inappropriate content';
      }
    }
    
    // Due date validation
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      const now = new Date();
      
      if (isNaN(dueDate.getTime())) {
        errors.dueDate = 'Invalid date format';
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };