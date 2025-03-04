const isEmail = (email) => {
    const regex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return regex.test(email);
  };
  
  const validateTaskInput = (data) => {
    const errors = {};
    
    if (!data.title) {
      errors.title = 'Title is required';
    } else if (data.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    if (data.description && data.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    if (data.status && !['todo', 'inProgress', 'review', 'done'].includes(data.status)) {
      errors.status = 'Invalid status value';
    }
    
    if (data.priority && !['low', 'medium', 'high'].includes(data.priority)) {
      errors.priority = 'Invalid priority value';
    }
    
    if (data.dueDate && isNaN(new Date(data.dueDate).getTime())) {
      errors.dueDate = 'Invalid date format';
    }
    
    if (data.tags) {
      if (!Array.isArray(data.tags)) {
        errors.tags = 'Tags must be an array';
      } else if (data.tags.length > 10) {
        errors.tags = 'Maximum 10 tags allowed';
      } else {
        const invalidTags = data.tags.filter(tag => typeof tag !== 'string');
        if (invalidTags.length > 0) {
          errors.tags = 'All tags must be strings';
        }
      }
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  const validateRegisterInput = (data) => {
    const errors = {};
    
    if (!data.name) {
      errors.name = 'Name is required';
    } else if (data.name.length > 50) {
      errors.name = 'Name must be less than 50 characters';
    }
    
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!isEmail(data.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!data.passwordConfirmation) {
      errors.passwordConfirmation = 'Password confirmation is required';
    } else if (data.password !== data.passwordConfirmation) {
      errors.passwordConfirmation = 'Passwords must match';
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  const validateLoginInput = (data) => {
    const errors = {};
    
    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!isEmail(data.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!data.password) {
      errors.password = 'Password is required';
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  };
  
  module.exports = {
    validateTaskInput,
    validateRegisterInput,
    validateLoginInput
  };